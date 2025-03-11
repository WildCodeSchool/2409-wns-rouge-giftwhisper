import "reflect-metadata";
import { datasource } from "./datasource";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GiftResolver } from "./resolvers/Gift";


async function initialize() {
  await datasource.initialize();
  console.log("Datasource is connected");

  const schema = await buildSchema({
    resolvers: [GiftResolver], // Un resolver placeholder, il en faut au moins un pour le schema
    //Il faudra rajouter l'authchecker ici
  });

  const server = new ApolloServer({ schema });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 5000, host:"0.0.0.0" }
  });
  console.log(`GraphQL server ready at ${url}`);
}

initialize();
