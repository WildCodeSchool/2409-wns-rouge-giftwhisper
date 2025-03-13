import type { TestArgsType } from "../index.test";
import { Chat } from "../../../entities/Chat";
import { mutationCreateChat } from "../../api/chat";
import { assert } from "../index.test";

export function chatResolverTest(testArgs: TestArgsType) {
  describe("Chat Resolver Tests", () => {
    it("Should create a chat with valid data", async () => {
      const mockChatData = {
        name: "The very first chat, yay !",
        users: [1, 3],
        groupId: 1,
      };
      const response = await testArgs.server?.executeOperation<{
        createChat: Chat;
      }>({
        query: mutationCreateChat,
        variables: {
          data: {
            name: mockChatData.name,
            users: mockChatData.users,
            groupId: mockChatData.groupId,
          },
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
    });
  });
}
