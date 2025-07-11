import { Server, Socket } from "socket.io";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Poll } from "../entities/Poll";
import { PollOption } from "../entities/PollOptions";
import { PollVote } from "../entities/PollVote";

export class SocketMidleWares {
  socket;
  io;
  user;
  constructor(socket: Socket, io: Server) {
    this.socket = socket;
    this.io = io;
    this.user = (this.socket.request as any).user as User;
  }
  //Use query builder for selective field from users, and avoid having to manually remove
  //data like the user password before sending it back
  getMessages = async (options?: { skip?: number; take?: number }) => {
    let messages: Message[] = [];
    const baseQuery = Message.createQueryBuilder("message")
      .leftJoinAndSelect("message.createdBy", "user")
      .leftJoinAndSelect("message.poll", "poll")
      .leftJoinAndSelect("poll.options", "options")
      .leftJoinAndSelect("options.votes", "votes")
      .leftJoinAndSelect("votes.user", "voteUser")
      .leftJoinAndSelect("poll.createdBy", "pollCreator")
      .select([
        "message.id",
        "message.content",
        "message.messageType",
        "message.createdAt",
        "user.id",
        "user.first_name",
        "poll.id",
        "poll.question",
        "poll.allowMultipleVotes",
        "poll.isActive",
        "poll.createdAt",
        "poll.endDate",
        "pollCreator.id",
        "pollCreator.first_name",
        "options.id",
        "options.text",
        "votes.id",
        "voteUser.id",
        "voteUser.first_name",
      ])
      .orderBy("message.createdAt", "DESC");
    if (!options) {
      const messagesHistory = await baseQuery.take(25).getMany();
      return this.socket.emit("messages-history", messagesHistory.reverse());
    } else {
      const { skip, take = 25 } = options;
      if (skip && take) {
        messages = await baseQuery.skip(skip).take(take).getMany();
      } else if (skip) {
        messages = await baseQuery.skip(skip).getMany();
      } else if (take) {
        messages = await baseQuery.take(take).getMany();
      }
      if (messages.length)
        this.socket.emit("more-messages-response", messages.reverse());
    }
  };

  receiveMessage = async (content: string) => {
    const newMessage = new Message();
    Object.assign(
      newMessage,
      { createdBy: { id: this.user.id } },
      { content },
      { messageType: "text" }
    );
    await newMessage.save();
    this.io.emit("new-message", {
      ...newMessage,
      createdBy: { id: this.user.id, first_name: this.user.first_name },
    });
  };

  createPoll = async (pollData: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  }) => {
    try {
      const poll = new Poll();
      poll.question = pollData.question;
      poll.allowMultipleVotes = pollData.allowMultiple;
      poll.createdBy = { id: this.user.id } as User;
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
      newMessage.createdBy = { id: this.user.id } as User;
      newMessage.poll = poll;
      await newMessage.save();

      const messageWithPoll = {
        id: newMessage.id,
        content: newMessage.content,
        messageType: "poll",
        createdBy: { id: this.user.id, first_name: this.user.first_name },
        poll: {
          id: poll.id,
          question: poll.question,
          allowMultipleVotes: poll.allowMultipleVotes,
          isActive: poll.isActive,
          createdBy: { id: this.user.id, first_name: this.user.first_name },
          createdAt: poll.createdAt,
          endDate: poll.endDate,
          options: savedOptions,
        },
      };
      this.io.emit("new-message", messageWithPoll);
    } catch (error) {
      console.error("Erreur lors de la création du sondage:", error);
    }
  };

  votePoll = async (voteData: { pollId: number; optionId: number }) => {
    try {
      const existingVote = await PollVote.findOne({
        where: {
          user: { id: this.user.id },
          poll: { id: voteData.pollId },
        },
      });
      const poll = await Poll.findOne({
        where: { id: voteData.pollId },
      });
      if (!poll) return;
      if (existingVote && !poll.allowMultipleVotes) return;
      const vote = new PollVote();
      vote.user = { id: this.user.id } as User;
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
        this.io.emit("poll-updated", {
          pollId: voteData.pollId,
          poll: updatedPoll,
        });
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  };

  removeVotePoll = async (voteData: { pollId: number; optionId: number }) => {
    try {
      const voteToRemove = await PollVote.findOne({
        where: {
          user: { id: this.user.id },
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
          this.io.emit("poll-updated", {
            pollId: voteData.pollId,
            poll: updatedPoll,
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du vote:", error);
    }
  };

  removeAllUserPoll = async (voteData: { pollId: number }) => {
    try {
      // Supprimer tous les votes de l'utilisateur pour ce sondage
      await PollVote.delete({
        user: { id: this.user.id },
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
        this.io.emit("poll-updated", {
          pollId: voteData.pollId,
          poll: updatedPoll,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des votes:", error);
    }
  };
}
