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
import { socketInit } from "./socket";

async function initialize() {

  // Vérification des variables d'environnement SMTP
console.log("Checking SMTP environment variables:");
console.log(`SMTP_HOST: ${process.env.SMTP_HOST || "Not set"}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER || "Not set"}`);

  const dataSource = await datasource.initialize();
  console.log("Datasource is connected");

  await seedAll(dataSource);

  const schema = await getSchema();

  const app = express();
  const httpServer = http.createServer(app);

  socketInit(httpServer);

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