import type { TestArgsType } from "../index.test";
import { Chat } from "../../../entities/Chat";
import { mutationCreateChat } from "../../api/chat";
import { assert } from "../index.test";
import { Group } from "../../../entities/Group";
import { queryGroup } from "../../api/group";
import { getRandomPairs } from "../../../utils/secret_santa/helpers";

export function chatResolverTest(testArgs: TestArgsType) {
  describe("Chat Resolver Tests", () => {
    it("Should create a chat with valid data", async () => {
      const mockChatData = {
        name: "The very first chat, yay !",
        users: [11, 14],
        groupId: 1,
      };
      const response = await testArgs.server?.executeOperation<{
        createChat: Chat;
      }>({
        query: mutationCreateChat,
        variables: {
          data: {
            users: testArgs.data.userIds,
            groupId: testArgs.data.groupId[0],
          },
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
    });

    it("In secret santa, should create 2 anonymous chatroom per user", async () => {
      // Cette action est déclenchée par l'administrateur d'un groupe
      // Le groupe doit etre en mode secret santa
      // Le groupe doit avoir le statut actif => ça veut dire que tous les utilisateurs ont bien rejoint le groupe

      //1. Récupérer les utilisateurs du groupe
      const response = await testArgs.server?.executeOperation<{
        group: Group;
      }>({
        query: queryGroup,
        variables: {
          id: testArgs.data.groupId[0],
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();

      const users = response.body.singleResult.data?.group.userGroups.map(
        (userGroup) => {
          const { first_name, last_name, id } = userGroup.user;
          return `${id}_${first_name} ${last_name}`;
        }
      );

      //2. Création des pairs d'utilisateurs => algo

      assert(users?.length);
      const pairs = getRandomPairs(users);

      //3. Création des Chats pour chaque pair d'utilisateur => même chose que "Should create a chat with valid data"

      for (const pair of pairs) {
        const { receiver, gifter } = pair;
        const receiverId = receiver.split("_")[0];
        const gifterId = gifter.split("_")[0];
        const response = await testArgs.server?.executeOperation<{
          createChat: Chat;
        }>({
          query: mutationCreateChat,
          variables: {
            data: {
              name: `${gifter} donne à ${receiver}`,
              users: [receiverId, gifterId],
              groupId: testArgs.data.groupId[0],
            },
          },
        });

        assert(response?.body.kind === "single");
        expect(response.body.singleResult.errors).toBeUndefined();
      }
    });
  });
}
