import { ApolloServer, BaseContext } from "@apollo/server";
import { getSchema } from "../../utils/server/schema";
import { usersResolverTest } from "./resolvers/user";
import { groupResolverTest } from "./resolvers/group";
import { chatResolverTest } from "./resolvers/chat";
import { datasource } from "../../datasource.config";
import { databaseTests } from "./database/database";

export type TestArgsType = {
  server: ApolloServer<BaseContext> | null;
  data: {};
};

const testArgs: TestArgsType = {
  server: null,
  data: {},
};

export function assert(expr: unknown, msg?: string): asserts expr {
  if (!expr) throw new Error(msg);
}

// Initialisation de la base de données et du serveur Apollo avant tous les tests
beforeAll(async () => {
  // Initialisation de la connexion à la base de données de test
  await datasource.initialize();
  
  // Initialisation du serveur Apollo
  const schema = await getSchema();
  const testServer = new ApolloServer({ schema });
  testArgs.server = testServer;
});

describe("Database", () => {
  databaseTests();
});

describe("User resolver", () => {
  usersResolverTest(testArgs);
});

describe("Group resolver", () => {
  groupResolverTest(testArgs);
});

describe("Chat resolver", () => {
  chatResolverTest(testArgs);
});

// Fermeture de la connexion après tous les tests
afterAll(async () => {
  if (datasource && datasource.isInitialized) {
    await datasource.destroy();
  }
});
