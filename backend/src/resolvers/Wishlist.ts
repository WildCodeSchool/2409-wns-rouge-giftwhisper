import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";
import { Gift } from "../entities/Gift";
import {
  Wishlist,
  WishlistCreateInput,
  WishlistUpdateInput,
} from "../entities/Wishlist";
import { User } from "../entities/User";
import { Group } from "../entities/Group";

@Resolver()
export class WishlistResolver {
  @Query(() => [Wishlist])
  async wishlists(): Promise<Wishlist[]> {
    return await Wishlist.find({
      relations: ["user", "group"],
    });
  }

  @Mutation(() => Wishlist)
  async createWishlist(
    @Arg("data") data: WishlistCreateInput
  ): Promise<Wishlist> {
    const user = await User.findOneBy({ id: data.userId });
    const group = await Group.findOneBy({ id: data.groupId });

    if (!user || !group) {
      throw new Error("User or Group not found");
    }

    const newWishlist = Wishlist.create({
      text: data.text,
      user,
      group,
    });

    await newWishlist.save();
    return newWishlist;
  }

  @Mutation(() => Wishlist)
  async updateWishlist(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => WishlistUpdateInput) data: WishlistUpdateInput
  ): Promise<Wishlist> {
    const wishlist = await Wishlist.findOneBy({ id });
    if (!wishlist) {
      throw new Error(`Wishlist with ID ${id} not found.`);
    }

    if (data.text !== undefined) {
      wishlist.text = data.text;
    }

    await wishlist.save();
    return wishlist;
  }

  @Mutation(() => Boolean)
  async deleteWishlist(@Arg("id", () => ID) id: number): Promise<boolean> {
    const wishlist = await Wishlist.findOneBy({ id });
    if (!wishlist) {
      throw new Error(`Wishlist with ID ${id} not found.`);
    }

    await wishlist.remove();
    return true;
  }
}
