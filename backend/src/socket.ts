import { Server as HttpServer, IncomingMessage } from 'http';
import { Server } from "socket.io";
import { getUserFromContext } from './auth';
import { User } from './entities/User';

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

  io.on('connection', (socket) => {
    const user = (socket.request as any).user as User;
    console.log("A user is connected");

    socket.on('message', (data) => {
      console.log("Message received from", user.email, data);
    });

  });
}