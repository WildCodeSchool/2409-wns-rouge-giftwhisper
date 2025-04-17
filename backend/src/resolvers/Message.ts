import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { CreateMessageInput, Message } from "../entities/Message";

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

  @Mutation(() => Message)
  async createMessage(
    @Arg('data', () => CreateMessageInput) data: CreateMessageInput
  ) {
    const newMessage = new Message();
    Object.assign(newMessage, data);
    await newMessage.save();
    return newMessage;
  }

}