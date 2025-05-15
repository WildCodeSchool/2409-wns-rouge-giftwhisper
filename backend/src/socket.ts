import { Server as HttpServer } from 'http';
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
      if (!user) throw new Error('Unauthorized socket connection');
      req.user = user;
    }
    next();
  });

  io.on('connection', async (socket) => {
    //Use query builder for selective field from users, and avoid having to manually remove
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
    if (messages.length) socket.emit('messages-history', messages);

    socket.on('message', async (content) => {
      const newMessage = new Message();
      const user = (socket.request as any).user as User;
      Object.assign(newMessage, { createdBy: { id: user.id } }, { content });
      await newMessage.save();
      io.emit('new-message', { ...newMessage, createdBy: { id: user.id, first_name: user.first_name } });
    });
  });
}