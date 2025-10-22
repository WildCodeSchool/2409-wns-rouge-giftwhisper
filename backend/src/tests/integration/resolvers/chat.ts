import type { TestArgsType } from "../index.test";
import { Chat } from "../../../entities/Chat";
import { mutationCreateChat } from "../../api/chat";
import { assert } from "../index.test";
import { Group } from "../../../entities/Group";
import { mutationActivateGroup, queryGroup } from "../../api/group";
import { invitationService } from "../../../services/Invitation";
import { User } from "../../../entities/User";
import { mutationAcceptInvitation } from "../../api/invitation";
import * as authUtils from "../../../auth";

export function chatResolverTest(testArgs: TestArgsType) {
  jest.setTimeout(20000);

  describe("Chat Resolver Tests", () => {
    it.skip("Should create a chat with valid data", async () => {
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

    it("In secret santa, should create one chat per group-user", async () => {
      // 1. Create and save an admin user
      const admin = User.create({
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "Tester",
        hashedPassword: "hashedpassword",
        is_verified: true,
        date_of_birth: new Date("1990-01-01"),
      });
      await admin.save();

      // 2. Mock auth context with the admin
      jest.spyOn(authUtils, "getUserFromContext").mockResolvedValue(admin);

      // 3. Create a Secret Santa group
      const groupResp = await testArgs.server?.executeOperation<{
        createGroup: Group;
      }>({
        query: /* GraphQL */ `
          mutation CreateGroup($data: GroupCreateInput!) {
            createGroup(data: $data) {
              id
              users {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: "Secret Santa Group",
            is_secret_santa: true,
            end_date: "2099-12-31T23:59:59.999Z",
          },
        },
      });

      assert(groupResp?.body.kind === "single");
      const groupId = groupResp.body.singleResult.data?.createGroup.id!;
      expect(groupId).toBeDefined();

      // 4. Invite and accept all other users
      for (const userId of testArgs.data.userIds) {
        const user = await User.findOneBy({ id: userId });
        if (!user) continue;

        const invitation = await invitationService.createInvitation(
          user.email,
          groupId
        );

        const acceptResp = await testArgs.server?.executeOperation({
          query: mutationAcceptInvitation,
          variables: {
            data: {
              token: invitation.token,
              userId: user.id,
            },
          },
        });

        assert(acceptResp?.body.kind === "single");
        expect(acceptResp.body.singleResult.errors).toBeUndefined();
      }

      // 5. Activate the group
      const activateResp = await testArgs.server?.executeOperation<{
        activateGroup: boolean;
      }>({
        query: mutationActivateGroup,
        variables: {
          id: groupId,
        },
      });

      assert(activateResp?.body.kind === "single");
      expect(activateResp.body.singleResult.errors).toBeUndefined();

      // 6. Fetch group and verify users
      const groupCheckResp = await testArgs.server?.executeOperation<{
        group: Group;
      }>({
        query: queryGroup,
        variables: { id: groupId },
      });

      assert(groupCheckResp?.body.kind === "single");
      const groupUsers =
        groupCheckResp.body.singleResult.data?.group.users || [];

      // Ensure admin is part of the group
      expect(groupUsers.some((u) => Number(u.id) === admin.id)).toBe(true); //id is a string in GraphQL...

      // 7. Verify the number of chats created
      const chats = await Chat.find({
        where: { group: { id: groupId } },
        relations: ["users", "group"],
      });

      expect(chats.length).toBe(groupUsers.length);
    });
  });
}
