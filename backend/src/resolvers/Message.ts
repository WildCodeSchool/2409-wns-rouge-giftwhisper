import { Arg, Authorized, Ctx, ID, Int, Mutation, Query, Resolver } from "type-graphql";
import { Message } from "../entities/Message";
import { ContextType, ContextUserType, getUserFromContext } from "../auth";
import { CreatePollInput, Poll } from "../entities/Poll";
import { PollOption } from "../entities/PollOptions";
import { User } from "../entities/User";
import { Chat } from "../entities/Chat";
import { ChatLastConnection } from "../entities/ChatLastConnection";
import { MoreThan } from "typeorm";

@Resolver()
export class MessageResolver {

  // Dev Resolvers
  // @Query(() => [Message], { nullable: true })
  // async messages() {
  //   const messages = await Message.find();
  //   if (!messages.length) return null;
  //   return messages;
  // }

  // @Query(() => Message, { nullable: true })
  // async getMessageById(
  //   @Arg('id', () => ID) id: number
  // ) {
  //   return Message.findOneBy({ id });
  // }

  @Query(() => [Message])
  @Authorized(["isPartOfChat"])
  async getMessagesByChatId(
    @Arg('chatId', () => ID) chatId: number,
    @Arg('skip', () => Int, { nullable: true }) skip: number,
    @Arg('take', () => Int, { nullable: true }) take: number,
    @Ctx() context: ContextType
  ) {
    const messages = await Message.find({
      relations: ['poll', 'poll.createdBy', 'poll.options', 'poll.options.votes', 'poll.options.votes.user', 'chat', 'chat.users', 'createdBy'],
      where: {
        chat: {
          id: chatId,
        }
      },
      skip: skip ?? 0,
      take: take ?? 25,
      order: { createdAt: 'DESC' },
    });
    context.data = {entities: [messages[0]?.chat]};
    return messages;
  }

  @Query(() => Number)
  @Authorized(["isPartOfChat"])
  async getUnreadCount(
    @Arg('chatId', () => ID) chatId: number,
    @Ctx() context: ContextType | ContextUserType
  ) {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
    const lastChatConnection = await ChatLastConnection.findOneBy({
      user: { id: user.id },
      chat: { id: chatId }
    });
    if (!lastChatConnection) return 0;
    const lastReadMessage = lastChatConnection.lastConnection;
    const unreadMessagesNumb = await Message.count({
      where: {
        chat: { id: chatId },
        createdAt: MoreThan(lastReadMessage)
      }
    });
    return unreadMessagesNumb;
  }

  @Mutation(() => Message)
  @Authorized(["isPartOfChat"])
  async createMessage(
    @Ctx() context: ContextUserType | ContextType,
    @Arg('content', () => String) content: string,
    @Arg('chatId', () => ID) chatId: number
  ) {
    //TODO: create Authorized decorator iso checking for the user directly in the resolver
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
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

  @Mutation(() => Message)
  @Authorized(["isPartOfChat"])
  async createPollWithMessage(
    @Arg("data") data: CreatePollInput,
    @Ctx() context: ContextType | ContextUserType
  ): Promise<Message> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
    const poll = new Poll();
    poll.question = data.question;
    poll.allowMultipleVotes = data.allowMultipleVotes;
    poll.createdBy = { id: user.id } as User;
    poll.chat = { id: data.chatId } as Chat;
    await poll.save();

    for (const optionText of data.options) {
      const option = new PollOption();
      option.text = optionText;
      option.poll = poll;
      await option.save();
    }
    const updatedPoll = await Poll.findOne({
      where: { id: poll.id },
      relations: ['options', 'options.votes', 'createdBy', 'chat', 'votes']
    });
    if (!updatedPoll) {
      throw new Error('Error while updated the poll');
    }
    const newMessage = new Message();
    newMessage.content = `Sondage: ${data.question}`;
    newMessage.messageType = "poll";
    newMessage.createdBy = { id: user.id } as User;
    newMessage.poll = updatedPoll;
    newMessage.chat = { id: data.chatId } as Chat;
    await newMessage.save();
    return newMessage;
  }
}