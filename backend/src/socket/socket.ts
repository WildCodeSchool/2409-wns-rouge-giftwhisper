import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getUserFromContext } from "../auth";
import { SocketMiddleWares } from "../socket/midlewares";

//TODO: NB for later => We connect the socket directly to the group instead of the chatroom
//in order to be able to list the new messages on the left hand side pannel of chat window

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
    const groupId = req.headers.groupid;
    //TODO: For now we only check for the groupId, we will also have to check if the user
    //is part of the group
    if (!groupId) {
      return next(new Error('No group id provided for the socket'))
    }
    req.user = user;
    next();
  });

  io.on("connection", async (socket) => {
    const socketMiddleWares = new SocketMiddleWares(socket, io);
    socket.on('join-room', socketMiddleWares.joinRoom);
    socket.on('leave-room', socketMiddleWares.leaveRoom);
    socket.on('get-messages-history', socketMiddleWares.getMessages);
    socket.on("more-messages", socketMiddleWares.getMessages);
    socket.on("message", socketMiddleWares.receiveMessage);
    socket.on("create-poll", socketMiddleWares.createPoll);
    socket.on("vote-poll", socketMiddleWares.votePoll);
    socket.on("remove-vote-poll", socketMiddleWares.removeVotePoll);
    socket.on("remove-all-user-votes-poll", socketMiddleWares.removeAllUserPoll);
  });
}
