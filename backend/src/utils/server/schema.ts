import { buildSchema } from "type-graphql";
//import { GiftsResolver } from "../../resolvers/Gifts";
import { UsersResolver } from "../../resolvers/Users";
import { GroupsResolver } from "../../resolvers/Groups";
import { ChatsResolver } from "../../resolvers/Chats";
import { InvitationResolver } from "../../resolvers/Invitation";
import { MessageResolver } from "../../resolvers/Message";
import { PasswordResetResolver } from "../../resolvers/PasswordReset";
import { PollResolver } from "../../resolvers/Poll";
import { WishlistResolver } from "../../resolvers/Wishlist";
import { WishlistItemResolver } from "../../resolvers/WishlistItem";

export async function getSchema() {
  const schema = await buildSchema({
    resolvers: [
      UsersResolver,
      GroupsResolver,
      ChatsResolver,
      MessageResolver,
      InvitationResolver,
      PasswordResetResolver,
      PollResolver,
      WishlistResolver,
      WishlistItemResolver,
    ],
  });
  return schema;
}
