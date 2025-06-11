import { Server, Socket } from "socket.io";
import { Message } from "../entities/Message";
import { User } from "../entities/User";

export class SocketMidleWares {
  socket;
  io;
  constructor(socket: Socket, io: Server) {
    this.socket = socket;
    this.io = io;
  }
  //Use query builder for selective field from users, and avoid having to manually remove
  //data like the user password before sending it back
  getMessages = async (options?: { skip?: number, take?: number }) => {
    let messages: Message[] = [];
    const baseQuery = Message.createQueryBuilder("message")
      .leftJoinAndSelect("message.createdBy", "user")
      .select([
        "message.id",
        "message.content",
        "message.createdAt",
        "user.id",
        "user.first_name",
      ])
      .orderBy('message.createdAt', 'DESC');
    if (!options) {
      const messagesHistory = await baseQuery.take(25).getMany();
      return this.socket.emit('messages-history', messagesHistory.reverse())
    } else {
      const { skip, take = 25 } = options;
      if (skip && take) {
        messages = await baseQuery.skip(skip).take(take).getMany();
      } else if (skip) {
        messages = await baseQuery.skip(skip).getMany();
      } else if (take) {
        messages = await baseQuery.take(take).getMany();
      }
      if (messages.length) this.socket.emit('more-messages-response', messages.reverse());
    }
  }

  receiveMessage = async (content: string) => {
    const newMessage = new Message();
    const user = (this.socket.request as any).user as User;
    Object.assign(newMessage, { createdBy: { id: user.id } }, { content });
    await newMessage.save();
    this.io.emit('new-message', { ...newMessage, createdBy: { id: user.id, first_name: user.first_name } });
  }
}