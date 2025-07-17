import { ApolloServer, BaseContext } from "@apollo/server";
import { getSchema } from "../../utils/server/schema";
import { usersResolverTest } from "./resolvers/user";
import { groupResolverTest } from "./resolvers/group";
import { chatResolverTest } from "./resolvers/chat";
import { datasource } from "../../datasource.config";
import { databaseTests } from "./database/database";
import { User } from "../../entities/User";
import { emailService } from "../../services/Email";
import { invitationService } from "../../services/Invitation";
import { Invitation } from "../../entities/Invitation";
import { Group } from "../../entities/Group";

export type TestArgsType = {
  server: ApolloServer<BaseContext> | null;
  data: any;
  testUser: User | null;
};

const testArgs: TestArgsType = {
  server: null,
  data: {},
  testUser: null,
};

export function assert(expr: unknown, msg?: string): asserts expr {
  if (!expr) throw new Error(msg);
}

// Initialisation de la base de données et du serveur Apollo avant tous les tests
beforeAll(async () => {
  jest
    .spyOn(invitationService, "createInvitation")
    .mockImplementation(async (email: string, groupId: number) => {
      const invitation = new Invitation();
      invitation.token = `fake-token-for-${email}`;
      invitation.group = await Group.findOneByOrFail({ id: groupId });
      await invitation.save();
      return invitation;
    });

  jest.spyOn(emailService, "sendInvitationEmail").mockResolvedValue(undefined);

  // Initialisation de la connexion à la base de données de test
  await datasource.initialize();

  // Drop et recréation des tables pour avoir une base de données propre
  await datasource.synchronize(true); // Le paramètre 'true' force la suppression des tables avant de les recréer

  // Créer un utilisateur fictif pour les tests d'authentification
  const testUser = new User();
  testUser.email = "test-auth@example.com";
  testUser.hashedPassword = "hashedpassword";
  testUser.first_name = "Test";
  testUser.last_name = "Auth";
  testUser.date_of_birth = new Date("1990-01-01");
  testUser.is_verified = true;
  await testUser.save();
  testArgs.testUser = testUser;

  // --- AJOUT ICI : création d'autres utilisateurs pour les tests de groupe/chat ---
  const emails = [
    "john.doe@example.com",
    "jane.smith@example.com",
    "mike.boss@example.com",
  ];
  testArgs.data.userEmails = emails;
  testArgs.data.userIds = [];
  for (const email of emails) {
    const user = new User();
    user.email = email;
    user.hashedPassword = "hashedpassword";
    user.first_name = email.split("@")[0];
    user.last_name = "Test";
    user.date_of_birth = new Date("1990-01-01");
    user.is_verified = true;
    await user.save();
    testArgs.data.userIds.push(user.id);
  }

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
