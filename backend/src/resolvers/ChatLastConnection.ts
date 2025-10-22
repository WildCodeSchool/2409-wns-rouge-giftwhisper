import { Arg, Authorized, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { ChatLastConnection } from "../entities/ChatLastConnection";
import { ContextType, ContextUserType, getUserFromContext } from "../auth";

@Resolver()
export class ChatLastConnectionResolver {
  @Query(() => Date, { nullable: true })
  @Authorized(['isPartOfChat'])
  async getLastConnectionDate(
    @Arg('id', () => ID) id: number,
    @Ctx() context: ContextType
  ) {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated');
    const lastConnectionDate = await ChatLastConnection.findOneBy({
      chat: { id },
      user: { id: user.id }
    });
    return lastConnectionDate?.lastConnection
  }

  @Mutation(() => Boolean)
  @Authorized(['isPartOfChat'])
  async saveLastConnection(
    @Arg('chatId', () => ID) chatId: number,
    @Ctx() context: ContextUserType | ContextType,
  ) {
    try {
      const user = await getUserFromContext(context);
      if (!user) throw new Error('You need to be authenticated');
      const previousLastConnection = await ChatLastConnection.findOneBy({
        chat: { id: chatId },
        user: { id: user.id }
      });
      const lastConnection = new Date();
      const newChatLastConnection = previousLastConnection ?? new ChatLastConnection();
      Object.assign(newChatLastConnection, { lastConnection, chat: { id: chatId }, user: { id: user.id } });
      await newChatLastConnection.save();
      return true;
    } catch (error) {
      console.warn(error);
      return error;
    }
  }
}