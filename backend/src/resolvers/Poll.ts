import { Arg, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { Poll, CreatePollInput } from "../entities/Poll";
import { PollVote } from "../entities/PollVote";
import { PollOption } from "../entities/PollOptions";
import { ContextType } from "../auth";

@Resolver()
export class PollResolver {
  @Mutation(() => Poll)
  async createPoll(
    @Arg("data") data: CreatePollInput,
    @Ctx() context: ContextType
  ): Promise<Poll> {
    const poll = new Poll();
    poll.question = data.question;
    poll.allowMultipleVotes = data.allowMultipleVotes || false;
    poll.endDate = data.endDate;
    poll.createdBy = context.user!;
    poll.chat = { id: data.chatId } as any;

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

  @Mutation(() => Boolean)
  async votePoll(
    @Arg("pollId", () => ID) pollId: number,
    @Arg("optionId", () => ID) optionId: number,
    @Ctx() context: ContextType
  ): Promise<boolean> {
    const vote = new PollVote();
    vote.user = context.user!;
    vote.poll = { id: pollId } as any;
    vote.option = { id: optionId } as any;

    await vote.save();
    return true;
  }

  @Mutation(() => Boolean)
  async removeVotePoll(
    @Arg("pollId", () => ID) pollId: number,
    @Arg("optionId", () => ID) optionId: number,
    @Ctx() context: ContextType
  ): Promise<boolean> {
    try {
      const voteToRemove = await PollVote.findOne({
        where: {
          user: { id: context.user!.id },
          poll: { id: pollId },
          option: { id: optionId },
        },
      });

      if (voteToRemove) {
        await voteToRemove.remove();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la suppression du vote:", error);
      return false;
    }
  }

  @Query(() => Poll)
  async poll(@Arg("id", () => ID) id: number): Promise<Poll> {
    return Poll.findOneOrFail({
      where: { id },
      relations: ["options", "votes", "votes.user", "createdBy"],
    });
  }
}
