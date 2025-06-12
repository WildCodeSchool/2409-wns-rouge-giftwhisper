import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getUserFromContext } from "../auth";
import { SocketMidleWares } from "../socket/midlewares";
import { User } from "../entities/User";
import { Poll } from "../entities/Poll";
import { PollOption } from "../entities/PollOptions";
import { Message } from "../entities/Message";

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

    // Ajouter les autres gestionnaires de sondage (vote-poll, remove-vote-poll, etc.)
    // ... copiez le code depuis socket.ts principal
  });
}
