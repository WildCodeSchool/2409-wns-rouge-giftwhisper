import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";

import { WishlistItem } from "../entities/WishlistItem";
import { Wishlist } from "../entities/Wishlist";
import {
  WishlistItemCreateInput,
  WishlistItemUpdateInput,
} from "../entities/WishlistItem";

@Resolver(() => WishlistItem)
export class WishlistItemResolver {
  @Query(() => [WishlistItem])
  async getItemsByWishlist(
    @Arg("wishlistId", () => ID) wishlistId: number
  ): Promise<WishlistItem[]> {
    return await WishlistItem.find({
      where: { wishlist: { id: wishlistId } },
      relations: ["wishlist"],
    });
  }

  @Mutation(() => WishlistItem)
  async createWishlistItem(
    @Arg("wishlistId", () => ID) wishlistId: number,
    @Arg("data") data: WishlistItemCreateInput
  ): Promise<WishlistItem> {
    const wishlist = await Wishlist.findOne({ where: { id: wishlistId } });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const item = WishlistItem.create({
      label: data.label,
      description: data.description,
      link: data.link,
      wishlist,
    });

    await item.save();
    return item;
  }

  @Mutation(() => WishlistItem)
  async updateWishlistItem(
    @Arg("id", () => ID) id: number,
    @Arg("data") data: WishlistItemUpdateInput
  ): Promise<WishlistItem> {
    const item = await WishlistItem.findOne({
      where: { id },
      relations: ["wishlist"],
    });
    if (!item) {
      throw new Error("Item not found");
    }

    if (data.label !== undefined) item.label = data.label;
    if (data.description !== undefined) item.description = data.description;
    if (data.link !== undefined) item.link = data.link;

    await item.save();
    return item;
  }

  @Mutation(() => Boolean)
  async deleteWishlistItem(@Arg("id", () => ID) id: number): Promise<boolean> {
    const item = await WishlistItem.findOneBy({ id });
    if (!item) {
      throw new Error("Item not found");
    }

    await item.remove();
    return true;
  }
}
