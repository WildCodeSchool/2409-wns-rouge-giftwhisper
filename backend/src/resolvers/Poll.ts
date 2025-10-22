import { Arg, Authorized, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { Poll, CreatePollInput } from "../entities/Poll";
import { PollVote } from "../entities/PollVote";
import { PollOption } from "../entities/PollOptions";
import { ContextType, ContextUserType, getUserFromContext } from "../auth";
import { User } from "../entities/User";
import { Chat } from "../entities/Chat";

@Resolver()
export class PollResolver {
  @Mutation(() => Poll)
  @Authorized(['isPartOfChat'])
  async createPoll(
    @Arg("data") data: CreatePollInput,
    @Ctx() context: ContextType
  ): Promise<Poll> {
    const poll = new Poll();
    poll.question = data.question;
    poll.allowMultipleVotes = data.allowMultipleVotes || false;
    poll.endDate = data.endDate;
    poll.createdBy = context.user!;
    poll.chat = { id: data.chatId } as Chat;

    await poll.save();

    // Créer les options
    for (const optionText of data.options) {
      const option = new PollOption();
      option.text = optionText;
      option.poll = poll;
      await option.save();
    }

    return poll;
  }

  @Mutation(() => Poll, { nullable: true })
  @Authorized(['isPollPartOfChat'])
  async votePoll(
    @Arg("pollId", () => ID) pollId: number,
    @Arg("optionId", () => ID) optionId: number,
    @Ctx() context: ContextType | ContextUserType
  ): Promise<Poll | null> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
    const existingVote = await PollVote.findOne({
      where: {
        user: { id: user.id },
        poll: { id: pollId },
      },
    });
    const poll = await Poll.findOne({
      where: { id: pollId }, relations: ['chat', 'chat.users']
    });
    if (!poll) return null;
    if (existingVote && !poll.allowMultipleVotes) return null;
    const vote = new PollVote();
    vote.user = { id: user.id } as User;
    vote.poll = { id: pollId } as Poll;
    vote.option = { id: optionId } as PollOption;
    await vote.save();
    if (poll.chat) context.data = { entities: [poll.chat] };
    const updatedPoll = await Poll.findOne({
      where: { id: pollId },
      relations: [
        "options",
        "options.votes",
        "options.votes.user",
        "createdBy",
      ],
    });
    return updatedPoll;
  }

  @Mutation(() => Boolean, { nullable: true })
  @Authorized(['isPollPartOfChat'])
  async removeVotePoll(
    @Arg("pollId", () => ID) pollId: number,
    @Arg("optionId", () => ID) optionId: number,
    @Ctx() context: ContextType | ContextUserType
  ): Promise<Boolean> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
    const voteToRemove = await PollVote.findOne({
      where: {
        user: { id: user.id },
        poll: { id: pollId },
        option: { id: optionId },
      },
    });
    if (voteToRemove) {
      await voteToRemove.remove();
      return true;
    }
    return false;
  }

  @Mutation(() => Boolean, { nullable: true })
  @Authorized(['isPollPartOfChat'])
  async removeUserVote(
    @Arg("pollId", () => ID) pollId: number,
    @Ctx() context: ContextType | ContextUserType
  ): Promise<Boolean> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error('You need to be authenticated in order to post a message');
    await PollVote.delete({
      user: { id: user.id },
      poll: { id: pollId },
    });
    return true;
  }

  @Query(() => Poll)
  @Authorized(['isPollPartOfChat'])
  async poll(@Arg("id", () => ID) id: number): Promise<Poll> {
    return Poll.findOneOrFail({
      where: { id },
      relations: ["options", "votes", "votes.user", "createdBy"],
    });
  }
}
