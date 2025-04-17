import "reflect-metadata";
import { datasource } from "./datasource.config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import http from 'http';
import { getSchema } from "./utils/server/schema";
import { seedAll } from "./seeds/index.seed";
import { Server } from "socket.io";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

async function initialize() {
  const dataSource = await datasource.initialize();
  console.log("Datasource is connected");

  await seedAll(dataSource);

  const schema = await getSchema();

  const app = express();
  const httpServer = http.createServer(app);

  const io: Server = new Server(httpServer, {
    path: "api/socker.io"
  });

  io.on('connection', (socket) => {
    console.log("A user is connected");
    socket.emit("Hello to the gift whisper app !")
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  });

  await server.start();

  app.use(
    "/",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res };
      }
    })
  );

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: 5500 }, resolve);
  });

  console.log("Server ready http://localhost:5500");
}

initialize();