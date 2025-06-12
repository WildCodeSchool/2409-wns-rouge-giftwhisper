import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getUserFromContext } from "../auth";
import { SocketMidleWares } from "../socket/midlewares";
import { User } from "../entities/User";
import { Poll } from "../entities/Poll";
import { PollOption } from "../entities/PollOptions";
import { Message } from "../entities/Message";
import { PollVote } from "../entities/PollVote";

export function socketInit(httpServer: HttpServer) {
  const io: Server = new Server(httpServer, {
    path: "/api/socket.io",
  });

  io.engine.use(async (req: any, res: any, next: (error?: Error) => void) => {
    const isHandShake = req._query.sid === undefined;
    if (!isHandShake) {
      return next();
    }
    const user = await getUserFromContext({ req, res, user: undefined });
    if (!user) {
      return next(new Error("Unauthorized user"));
    }
    req.user = user;
    next();
  });

  io.on("connection", async (socket) => {
    const socketMidleWares = new SocketMidleWares(socket, io);
    socketMidleWares.getMessages();
    socket.on("more-messages", socketMidleWares.getMessages);
    socket.on("message", socketMidleWares.receiveMessage);

    // Ajouter la gestion des sondages
    socket.on(
      "create-poll",
      async (pollData: {
        question: string;
        options: string[];
        allowMultiple: boolean;
      }) => {
        const user = (socket.request as any).user as User;

        try {
          const poll = new Poll();
          poll.question = pollData.question;
          poll.allowMultipleVotes = pollData.allowMultiple;
          poll.createdBy = { id: user.id } as User;
          poll.chat = null as any;
          await poll.save();

          const savedOptions = [];
          for (const optionText of pollData.options) {
            const option = new PollOption();
            option.text = optionText;
            option.poll = poll;
            await option.save();
            savedOptions.push({
              id: option.id,
              text: option.text,
              votes: [],
            });
          }

          const newMessage = new Message();
          newMessage.content = `Sondage: ${pollData.question}`;
          newMessage.messageType = "poll";
          newMessage.createdBy = { id: user.id } as User;
          newMessage.poll = poll;
          await newMessage.save();

          const messageWithPoll = {
            id: newMessage.id,
            content: newMessage.content,
            messageType: "poll",
            createdBy: { id: user.id, first_name: user.first_name },
            poll: {
              id: poll.id,
              question: poll.question,
              allowMultipleVotes: poll.allowMultipleVotes,
              isActive: poll.isActive,
              createdBy: { id: user.id, first_name: user.first_name },
              createdAt: poll.createdAt,
              endDate: poll.endDate,
              options: savedOptions,
            },
          };

          io.emit("new-message", messageWithPoll);
        } catch (error) {
          console.error("Erreur lors de la création du sondage:", error);
        }
      }
    );
    socket.on(
      "vote-poll",
      async (voteData: { pollId: number; optionId: number }) => {
        const user = (socket.request as any).user as User;

        try {
          const existingVote = await PollVote.findOne({
            where: {
              user: { id: user.id },
              poll: { id: voteData.pollId },
            },
          });

          const poll = await Poll.findOne({
            where: { id: voteData.pollId },
          });

          if (!poll) {
            return;
          }

          if (existingVote && !poll.allowMultipleVotes) {
            return;
          }

          const vote = new PollVote();
          vote.user = { id: user.id } as User;
          vote.poll = { id: voteData.pollId } as Poll;
          vote.option = { id: voteData.optionId } as PollOption;
          await vote.save();

          const updatedPoll = await Poll.findOne({
            where: { id: voteData.pollId },
            relations: [
              "options",
              "options.votes",
              "options.votes.user",
              "createdBy",
            ],
          });

          if (updatedPoll) {
            io.emit("poll-updated", {
              pollId: voteData.pollId,
              poll: updatedPoll,
            });
          }
        } catch (error) {
          console.error("Erreur lors du vote:", error);
        }
      }
    );

    socket.on(
      "remove-vote-poll",
      async (voteData: { pollId: number; optionId: number }) => {
        const user = (socket.request as any).user as User;

        try {
          const voteToRemove = await PollVote.findOne({
            where: {
              user: { id: user.id },
              poll: { id: voteData.pollId },
              option: { id: voteData.optionId },
            },
          });

          if (voteToRemove) {
            await voteToRemove.remove();

            const updatedPoll = await Poll.findOne({
              where: { id: voteData.pollId },
              relations: [
                "options",
                "options.votes",
                "options.votes.user",
                "createdBy",
              ],
            });

            if (updatedPoll) {
              io.emit("poll-updated", {
                pollId: voteData.pollId,
                poll: updatedPoll,
              });
            }
          }
        } catch (error) {
          console.error("Erreur lors de la suppression du vote:", error);
        }
      }
    );

    socket.on(
      "remove-all-user-votes-poll",
      async (voteData: { pollId: number }) => {
        const user = (socket.request as any).user as User;

        try {
          // Supprimer tous les votes de l'utilisateur pour ce sondage
          await PollVote.delete({
            user: { id: user.id },
            poll: { id: voteData.pollId },
          });

          // Récupérer le sondage mis à jour avec tous les votes
          const updatedPoll = await Poll.findOne({
            where: { id: voteData.pollId },
            relations: [
              "options",
              "options.votes",
              "options.votes.user",
              "createdBy",
            ],
          });

          if (updatedPoll) {
            // Émettre la mise à jour du sondage à tous les clients
            io.emit("poll-updated", {
              pollId: voteData.pollId,
              poll: updatedPoll,
            });
          }
        } catch (error) {
          console.error("Erreur lors de la suppression des votes:", error);
        }
      }
    );
  });
}
