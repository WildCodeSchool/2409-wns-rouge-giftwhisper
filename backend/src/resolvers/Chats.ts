import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { Chat, ChatCreateInput } from "../entities/Chat";
import { In } from "typeorm";
import { User } from "../entities/User";
import { Group } from "../entities/Group";
import { chatService } from "../services/Chat";

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
