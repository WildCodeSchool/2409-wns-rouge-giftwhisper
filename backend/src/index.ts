import "reflect-metadata";
import { datasource } from "./datasource.config";
import { ApolloServer, BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import http from "http";
import cors from "cors";
import { getSchema } from "./utils/server/schema";
import { seedAll } from "./seeds/index.seed";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { socketInit } from "./socket/socket";

export let initializedApolloServer: ApolloServer<BaseContext> | undefined;
export const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL || "https://092024-rouge-3.wns.wilders.dev"]
    : [
        "http://localhost:8000",
        "https://staging.092024-rouge-3.wns.wilders.dev",
      ];

async function initialize() {
  const dataSource = await datasource.initialize();
  console.log("Datasource is connected");

  await seedAll(dataSource);

  const schema = await getSchema();

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  initializedApolloServer = server;
  await server.start();

  const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
  };

  app.use(
    "/api",
    cors(corsOptions),
    express.json({ limit: "1mb" }),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res };
      },
    })
  );

  socketInit(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: 5500 }, resolve);
  });

  console.log("Server ready http://localhost:5500");
}

initialize();
