import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";

import {
  Wishlist,
  WishlistCreateInput,
  WishlistUpdateInput,
} from "../entities/Wishlist";
import { User } from "../entities/User";

@Resolver()
export class WishlistResolver {
  @Query(() => [Wishlist])
  async wishlists(): Promise<Wishlist[]> {
    return await Wishlist.find({
      relations: ["user"],
    });
  }

  @Mutation(() => Wishlist)
  async createWishlist(
    @Arg("data") data: WishlistCreateInput
  ): Promise<Wishlist> {
    const user = await User.findOneBy({ id: data.userId });

    if (!user) {
      throw new Error("User not found");
    }

    const newWishlist = Wishlist.create({
      text: data.text,
      user,
    });

    await newWishlist.save();
    return newWishlist;
  }

  @Mutation(() => Wishlist)
  async updateWishlist(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => WishlistUpdateInput) data: WishlistUpdateInput
  ): Promise<Wishlist> {
    const wishlist = await Wishlist.findOne({
      where: { id },
      relations: ["user"],
    });
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
