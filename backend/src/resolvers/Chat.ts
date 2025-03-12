import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { Chat, ChatCreateInput } from "../entities/Chat";
import { In } from "typeorm";
import { User } from "../entities/User";

@Resolver()
export class ChatResolver {
  @Query(() => [Chat])
  async chats(): Promise<Chat[]> {
    const chats = await Chat.find();
    return chats;
  }

  @Query(() => Chat)
  async chat(@Arg('id', () => ID) id: string): Promise<Chat> {
    const chat = await Chat.findOne({ where: { id: parseInt(id) } });
    if (!chat) {
      throw new Error("Chat not found");
    }
    return chat;
  }

  @Mutation(() => Chat)
  async createChat(@Arg('data') data: ChatCreateInput): Promise<Chat> {
    const users = await User.find({ where: { id: In(data.users.map((user) => user.id)) } });
    
    if (users.length !== data.users.length) {
      throw new Error("Some users not found");
    }
    
    const chat = new Chat();
    chat.name = data.name;
    chat.users = users;
    await chat.save();
    return chat;
  }

  @Mutation(() => Chat)
  async deleteChat(@Arg('id', () => ID) id: string): Promise<boolean> {
    const chat = await Chat.findOne({ where: { id: parseInt(id) } });
    if (!chat) {
      throw new Error("Chat not found");
    }
    await chat.remove();
    return true;
  }
}