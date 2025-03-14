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
      //testArgs.data.group = {};
      //testArgs.data.group.id = createdGroupId;
    });

    it("Should add all registered users to the group", async () => {
      // Générer un timestamp unique pour éviter les conflits d'emails
      const timestamp = new Date().getTime();
      
      // Créer d'abord un groupe de test
      const mockGroup = {
        name: `Test Group ${timestamp}`,
        end_date: new Date(),
        is_secret_santa: true
      };
      
      const createGroupResponse = await testArgs.server?.executeOperation<{
        createGroup: Group;
      }>({
        query: mutationCreateGroup,
        variables: {
          data: mockGroup,
        },
      });
      
      assert(createGroupResponse?.body.kind === "single");
      expect(createGroupResponse.body.singleResult.errors).toBeUndefined();
      const createdGroupId = createGroupResponse.body.singleResult.data?.createGroup.id;
      
      // Créer des utilisateurs de test avec des emails uniques
      const mockUsers = [
        {
          email: `test-user1-${timestamp}@example.com`,
          password: "Password123!",
          first_name: "Test1",
          last_name: "User1",
          date_of_birth: new Date("1990/01/01"),
          is_verified: true,
        },
        {
          email: `test-user2-${timestamp}@example.com`,
          password: "Password123!",
          first_name: "Test2",
          last_name: "User2",
          date_of_birth: new Date("1990/01/02"),
          is_verified: true,
        }
      ];
      
      const createdUserIds = [];
      
      for (const mockUser of mockUsers) {
        const createUserResponse = await testArgs.server?.executeOperation<{
          createUser: User;
        }>({
          query: mutationCreateUser,
          variables: {
            data: mockUser,
          },
        });
        
        assert(createUserResponse?.body.kind === "single");
        expect(createUserResponse.body.singleResult.errors).toBeUndefined();
        const userId = createUserResponse.body.singleResult.data?.createUser.id;
        createdUserIds.push(userId);
      }
      
      // Maintenant, ajouter ces utilisateurs au groupe
      const mockUpdateGroupData = {
        userIds: createdUserIds,
      }
      
      const response = await testArgs.server?.executeOperation<{
        updateGroup: Group;
      }>({
        query: mutationUpdateGroup,
        variables: {
          id: createdGroupId,
          data: mockUpdateGroupData,
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
      const updatedGroupId = response.body.singleResult.data?.updateGroup.id;
      
      // Récupérer le groupe avec ses relations
      const groupFromDb = await Group.findOne({ 
        where: { id: updatedGroupId },
        relations: { userGroups: true }
      });
      

      // Vérifier que tous les utilisateurs ont été ajoutés au groupe
      const userIdsInGroup = groupFromDb?.userGroups.map(userGroup => userGroup.user) || [];

      // Convertir tous les IDs en chaînes de caractères pour la comparaison
      const stringUserIdsInGroup = userIdsInGroup.map(id => String(id));
      const stringCreatedUserIds = createdUserIds.map(id => String(id));

      expect(stringUserIdsInGroup.sort()).toEqual(stringCreatedUserIds.sort());
    });
  });
}
