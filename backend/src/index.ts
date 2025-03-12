import "reflect-metadata";
import { datasource } from "./datasource.config";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GiftResolver } from "./resolvers/Gift";
import { UsersResolver } from "./resolvers/Users";
import { ChatResolver } from "./resolvers/Chat";
import { GroupsResolver } from "./resolvers/Groups";

async function initialize() {
  await datasource.initialize();
  console.log("Datasource is connected");

  const schema = await buildSchema({
    resolvers: [GiftResolver, UsersResolver, GroupsResolver, ChatResolver], // Un resolver placeholder, il en faut au moins un pour le schema
    //Il faudra rajouter l'authchecker ici
  });

  const server = new ApolloServer({ schema, introspection: true });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 5500 },
  });
  console.log(`GraphQL server ready at ${url}`);
}

initialize();
