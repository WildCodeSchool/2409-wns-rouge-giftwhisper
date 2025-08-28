import { Arg, ID, Mutation, Query, Ctx, Resolver } from "type-graphql";
import { Chat, ChatCreateInput } from "../entities/Chat";
import { In, MoreThan } from "typeorm";
import { User } from "../entities/User";
import { Group } from "../entities/Group";
import { chatService } from "../services/Chat";
import { Message } from "../entities/Message";
import { ContextType, getUserFromContext } from "../auth";
import { ChatLastConnection } from "../entities/ChatLastConnection";

@Resolver()
export class ChatsResolver {
  @Query(() => [Chat])
  async chats(): Promise<Chat[]> {
    const chats = await Chat.find({
      relations: {
        users: true,
        group: true,
      },
    });

    return chats;
  }

  @Query(() => [Chat])
  async getChatsByGroup(
    @Arg('groupId', () => ID) groupId: number,
    @Ctx() context: ContextType
  ): Promise<Chat[]> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
    const chats = await Chat.find({
      relations: {
        group: true,
        users: true
      },
      where: {
        group: { id: groupId },
        users: { id: user.id }
      }
    });
    // => We loop in chats in order to get the last message sent by chat
    // This is not great because of complexity n+1 (+ 1 request sent to the db for each chat in the group)
    // IMPROVEMENT : Figure out a way to limit the relation with message when querying chats
    for (const chat of chats) {
      const lastMessageDate = await this.getLastMessageDate(chat.id);
      if (lastMessageDate) chat.lastMessageDate = lastMessageDate;

      const lastChatConnection = await ChatLastConnection.findOneBy({
        user: { id: user.id },
        chat: { id: chat.id }
      });
      const userLastConnection = lastChatConnection?.lastConnection;
      const where: any = { chat: { id: chat.id } };
      if (userLastConnection) where.createdAt = MoreThan(userLastConnection);
      const unreadMessagesCount = await Message.count({ where });
      chat.unreadMessageCount = unreadMessagesCount;
    }
    return chats;
  }

  @Query(() => Date)
  async getLastMessageDate(
    @Arg('chatId', () => ID, { nullable: true }) chatId: number
  ): Promise<Date | null> {
    const lastMessage = await Message.findOne({
      where: {
        chat: {
          id: chatId
        }
      },
      order: {
        "createdAt": "DESC"
      }
    })
    if (!lastMessage) return null;
    return lastMessage.createdAt;
  }

  @Query(() => Chat)
  async chat(@Arg("id", () => ID) id: string): Promise<Chat> {
    const chat = await Chat.findOne({ where: { id: parseInt(id) } });
    if (!chat) {
      throw new Error("Chat not found");
    }
    return chat;
  }

  @Mutation(() => Chat)
  async createChat(@Arg("data") data: ChatCreateInput): Promise<Chat> {
    const users = await User.find({
      where: { id: In(data.users.map((users) => users)) },
    });

    if (users.length !== data.users.length) {
      throw new Error("Some users not found");
    }

    const groupId = await Group.findOne({ where: { id: data.groupId } });

    if (!groupId) {
      throw new Error("Group not found");
    }

    const chat = new Chat();
    if (data.name !== undefined) {
      chat.name = data.name;
    }
    chat.users = users;
    chat.group = groupId;

    await chat.save();
    return chat;
  }

  @Mutation(() => Chat)
  async deleteChat(@Arg("id", () => ID) id: string): Promise<boolean> {
    const chat = await Chat.findOne({ where: { id: parseInt(id) } });
    if (!chat) {
      throw new Error("Chat not found");
    }
    await chat.remove();
    return true;
  }

  @Mutation(() => Boolean)
  async generateGroupChats(
    @Arg("groupId", () => ID) groupId: number
  ): Promise<boolean> {
    const group = await Group.findOne({
      where: { id: groupId },
      relations: { users: true },
    });

    if (!group) throw new Error("Group not found");

    await chatService.generateChatsForGroup(group);
    return true;
  }
}
