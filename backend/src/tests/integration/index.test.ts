import { ApolloServer, BaseContext } from "@apollo/server";
import { getSchema } from "../../utils/server/schema";
import { usersResolverTest } from "./resolvers/user";
import { groupResolverTest } from "./resolvers/group";
import { chatResolverTest } from "./resolvers/chat";

export type TestArgsType = {
  server: ApolloServer<BaseContext> | null;
  data: any;
};

const testArgs: TestArgsType = {
  server: null,
  data: {},
};

export function assert(expr: unknown, msg?: string): asserts expr {
  if (!expr) throw new Error(msg);
}

beforeAll(async () => {
  const schema = await getSchema();
  const testServer = new ApolloServer({ schema });
  testArgs.server = testServer;
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
