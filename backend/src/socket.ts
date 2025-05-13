import { Server as HttpServer, IncomingMessage } from 'http';
import { Server } from "socket.io";
import { getUserFromContext } from './auth';
import { User } from './entities/User';
import { Message } from './entities/Message';

export function socketInit(httpServer: HttpServer) {
  const io: Server = new Server(httpServer, {
    path: "/api/socket.io"
  });

  io.engine.use(async (req: any, res: any, next: () => void) => {
    const isHandShake = req._query.sid === undefined;
    if (isHandShake) {
      const user = await getUserFromContext({ req, res, user: undefined });
      if (!user) return;
      req.user = user;
    }
    next();
  });

  //TODO: Deal with a way to send back new messages to front when new one appears
  io.on('connection', async (socket) => {
    const user = (socket.request as any).user as User;
    //Use query builder for selective field from user, and avoid having to manually remove
    //data like the user password before sending it back
    const messages = await Message.createQueryBuilder("message")
      .leftJoinAndSelect("message.createdBy", "user")
      .select([
        "message.id",
        "message.content",
        "message.createdAt",
        "user.id",
        "user.first_name",
      ])
      .getMany();
    console.log("aled", messages)
    if (messages.length) socket.emit('messages-history', messages);

    socket.on('message', (content) => {
      const newMessage = new Message();
      Object.assign(newMessage, { createdBy: { id: user.id } }, { content });
      console.log("Message received from", user.email, content);
      newMessage.save();
    });

  });
}