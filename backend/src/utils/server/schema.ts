import { buildSchema } from "type-graphql";
//import { GiftsResolver } from "../../resolvers/Gifts";
import { UsersResolver } from "../../resolvers/Users";
import { GroupsResolver } from "../../resolvers/Groups";
import { ChatsResolver } from "../../resolvers/Chats";
import { MessageResolver } from "../../resolvers/Message";

export async function getSchema() {
  const schema = await buildSchema({
    resolvers: [UsersResolver, GroupsResolver, ChatsResolver, MessageResolver],
  });
  return schema;
}
