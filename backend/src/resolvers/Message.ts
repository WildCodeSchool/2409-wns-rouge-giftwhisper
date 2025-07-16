import { Arg, Ctx, ID, Int, Mutation, Query, Resolver } from "type-graphql";
import { Message } from "../entities/Message";
import { ContextType, ContextUserType, getUserFromContext } from "../auth";
import { User } from "../entities/User";

@Resolver()
export class MessageResolver {

  @Query(() => [Message], { nullable: true })
  async messages() {
    const messages = await Message.find();
    if (!messages.length) return null;
    return messages;
  }

  @Query(() => Message, { nullable: true })
  async getMessageById(
    @Arg('id', () => ID) id: number
  ) {
    return Message.findOneBy({ id });
  }

  @Query(() => [Message])
  async getMessagesByChatId(
    @Arg('chatId', () => ID) chatId: number,
    @Arg('skip', () => Int, { nullable: true }) skip: number,
    @Arg('take', () => Int, { nullable: true }) take: number
  ) {
    const messages = await Message.find({
      relations: {
        poll: true,
        createdBy: true,
        chat: true
      },
      where: {
        chat: {
          id: chatId
        }
      },
      skip: skip ?? 0,
      take: take ?? 25,
      order: { createdAt: 'DESC' },
    });
    return messages;
  }

  @Mutation(() => Message)
  async createMessage(
    @Ctx() context: ContextUserType | ContextType,
    @Arg('content', () => String) content: string,
    @Arg('chatId', () => ID) chatId: number
  ) {
    //TODO: create Authorized decorator iso checking for the user directly in the resolver
    let user: User | null | undefined;
    if ('req' in context && 'req' in context) {
      user = await getUserFromContext(context)
    } else if (context.user) {
      user = context.user;
    }
    if (!user) {
      throw new Error('You need to be authenticated in order to post a message');
    }
    const newMessage = new Message();
    Object.assign(
      newMessage,
      { createdBy: { id: user.id, first_name: user.first_name } },
      { content },
      { messageType: "text" },
      { chat: { id: chatId } }
    );
    await newMessage.save();
    return newMessage;
  }
}