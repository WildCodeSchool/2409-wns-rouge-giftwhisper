import "reflect-metadata";
import { datasource } from "./datasource.config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { getSchema } from "./utils/server/schema";

async function initialize() {
  await datasource.initialize();
  console.log("Datasource is connected");

  const schema = await getSchema();
  const server = new ApolloServer({ schema, introspection: true });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => {
      return { req, res }
    },
    listen: { port: 5500 },
  });
  console.log(`GraphQL server ready at ${url}`);
}

initialize();
