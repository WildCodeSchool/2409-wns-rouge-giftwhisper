import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Gift } from "../entities/Gift";

@Resolver()
export class GiftResolver {
  @Query(() => [Gift])
  async gifts() {
    const gifts = await Gift.find();
    return gifts;
  }

  @Mutation(() => Gift)
  async createGift(@Arg('title') title: string) {
    const newGift = new Gift();
    newGift.title = title;
    await newGift.save();
    return newGift;
  }
}