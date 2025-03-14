import type { TestArgsType } from "../index.test";
import { Group } from "../../../entities/Group";
import { mutationCreateGroup, mutationUpdateGroup } from "../../api/group";
import { User } from "../../../entities/User";
import { assert } from "../index.test";
import { mutationCreateUser } from "../../api/user";

export function groupResolverTest(testArgs: TestArgsType) {
  describe("Group Resolver Tests", () => {
    it("Should create a group with valid data", async () => {
      const mockGroupData = {
        name: "The very third groupe, yay !",
        end_date: new Date(),
        is_secret_santa: true,
      };
      const response = await testArgs.server?.executeOperation<{
        createGroup: Group;
      }>({
        query: mutationCreateGroup,
        variables: {
          data: {
            name: mockGroupData.name,
            end_date: mockGroupData.end_date,
            is_secret_santa: mockGroupData.is_secret_santa,
          },
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
      const createdGroupId = response.body.singleResult.data?.createGroup.id;
      const groupFromDb = await Group.findOneBy({ id: createdGroupId });
      expect(mockGroupData.name).toBe(groupFromDb?.name);
      testArgs.data.groupId = [];
      testArgs.data.groupId.push(createdGroupId);
    });

    it("Should add all registered users to the group", async () => {      
      // On ajoute les utilisateurs créés au groupe
      const mockUpdateGroupData = {
        userIds: testArgs.data.userIds,
      }
      
      const response = await testArgs.server?.executeOperation<{
        updateGroup: Group;
      }>({
        query: mutationUpdateGroup,
        variables: {
          id:  testArgs.data.groupId[0],
          data: mockUpdateGroupData,
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
      const updatedGroupId = response.body.singleResult.data?.updateGroup.id;
      
      // Récupération du groupe avec les relations 
      const groupFromDb = await Group.findOne({ 
        where: { id: updatedGroupId },
        relations: { userGroups: true }
      });
      

      // Vérification que tous les utilisateurs ont bien été ajoutés au groupe
      const userIdsInGroup = groupFromDb?.userGroups.map(userGroup => userGroup.user) || [];

      // Convertir tous les IDs en chaînes de caractères pour la comparaison
      const stringUserIdsInGroup = userIdsInGroup.map(id => String(id));
      const stringCreatedUserIds = testArgs.data.userIds.map((id: string | number) => String(id));

      expect(stringUserIdsInGroup.sort()).toEqual(stringCreatedUserIds.sort());
    });
  });
}
