import { Resolver, Query } from "type-graphql";
import { Gift } from "../entities/Gift";

@Resolver()
export class GiftResolver {
  @Query(() => [Gift])
  async gifts() {
    const gifts = await Gift.find();
    return gifts;
  }
}