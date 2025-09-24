import type { TestArgsType } from "../index.test";
import { Group } from "../../../entities/Group";
import {
  mutationCreateGroup,
  mutationUpdateGroup,
  mutationAddUsersToGroupByEmail,
} from "../../api/group";
import { User } from "../../../entities/User";
import { assert } from "../index.test";
import { mutationCreateUser } from "../../api/user";

export function groupResolverTest(testArgs: TestArgsType) {
  describe("Group Resolver Tests", () => {
    // Création du groupe : seul le créateur est membre
    it("Should create a group with valid data", async () => {
      const mockGroupData = {
        name: "The very third groupe, yay !",
        end_date: new Date(),
        is_secret_santa: true,
      };
      const response = await testArgs.server?.executeOperation<{
        createGroup: Group;
      }>(
        {
          query: mutationCreateGroup,
          variables: {
            data: {
              name: mockGroupData.name,
              end_date: mockGroupData.end_date,
              is_secret_santa: mockGroupData.is_secret_santa,
            },
          },
        },
        {
          contextValue: {
            req: { headers: {} },
            res: {},
            user: testArgs.testUser,
          },
        }
      );

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
      const createdGroupId = response.body.singleResult.data?.createGroup.id;
      const groupFromDb = await Group.findOne({
        where: { id: createdGroupId },
        relations: ["users"],
      });
      expect(groupFromDb?.users.map((u) => u.id)).toEqual([
        testArgs.testUser?.id,
      ]);
      testArgs.data.groupId = [];
      testArgs.data.groupId.push(createdGroupId);

      // Ajout des utilisateurs au groupe
      await testArgs.server?.executeOperation(
        {
          query: mutationAddUsersToGroupByEmail,
          variables: {
            emails: testArgs.data.userEmails,
            groupId: createdGroupId,
          },
        },
        {
          contextValue: {
            req: { headers: {} },
            res: {},
            user: testArgs.testUser,
          },
        }
      );
    });

    // Invitation par email
    it("Should invite users to the group by email", async () => {
      // Initialisation manuelle si besoin
      if (!testArgs.data.userEmails) {
        testArgs.data.userEmails = [
          "john.doe@example.com",
          "jane.smith@example.com",
        ];
      }

      const mockEmails = testArgs.data.userEmails;
      expect(Array.isArray(mockEmails)).toBe(true);
      expect(mockEmails.length).toBeGreaterThan(0);

      const response = await testArgs.server?.executeOperation<{
        addUsersToGroupByEmail: Group;
      }>(
        {
          query: mutationAddUsersToGroupByEmail,
          variables: {
            emails: mockEmails,
            groupId: testArgs.data.groupId[0],
          },
        },
        {
          contextValue: {
            req: { headers: {} },
            res: {},
            user: testArgs.testUser,
          },
        }
      );

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();

      const updatedGroup =
        response.body.singleResult.data?.addUsersToGroupByEmail;
      const groupUserEmails = updatedGroup?.users.map((u) => u.email);

      // Le créateur doit être membre
      expect(groupUserEmails).toContain(testArgs?.testUser?.email);

      // Les invités (même s'ils existent déjà en base) NE DOIVENT PAS être dans users
      for (const email of mockEmails) {
        expect(groupUserEmails).not.toContain(email);
        // à voir: vérifier qu'une invitation a bien été créée
      }
    });
  });
}
