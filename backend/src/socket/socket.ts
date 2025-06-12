import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getUserFromContext } from "../auth";
import { SocketMidleWares } from "../socket/midlewares";

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
    socket.on('get-messages-history', socketMidleWares.getMessages)
    socket.on("more-messages", socketMidleWares.getMessages);
    socket.on("message", socketMidleWares.receiveMessage);
    socket.on("create-poll", socketMidleWares.createPoll);
    socket.on("vote-poll", socketMidleWares.votePoll);
    socket.on("remove-vote-poll", socketMidleWares.removeVotePoll);
    socket.on("remove-all-user-votes-poll", socketMidleWares.removeAllUserPoll);
  });
}
