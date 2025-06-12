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
      }, {
        contextValue: {
          req: { headers: {} },
          res: {},
          user: testArgs.testUser
        }
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
      }, {
        contextValue: {
          req: { headers: {} },
          res: {},
          user: testArgs.testUser
        }
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
      const updatedGroupId = response.body.singleResult.data?.updateGroup.id;
      
      // Récupération du groupe avec les relations 
      const groupFromDb = await Group.findOne({ 
        where: { id: updatedGroupId },
        relations: ["users"] // Utiliser la syntaxe en tableau pour éviter l'erreur de type
      });
      

      // Vérification que tous les utilisateurs ont bien été ajoutés au groupe
      // @ts-ignore - La relation users existe mais TypeScript ne l'a pas encore reconnue
      const userIdsInGroup = groupFromDb?.users?.map((user: User) => user.id) || [];

      // Convertir tous les IDs en chaînes de caractères pour la comparaison
      const stringUserIdsInGroup = userIdsInGroup.map((id: number) => String(id));
      const stringCreatedUserIds = testArgs.data.userIds.map((id: string | number) => String(id));
      
      // Ajouter l'ID du créateur du groupe (testUser) aux utilisateurs attendus
      const expectedUserIds = [...stringCreatedUserIds, String(testArgs.testUser?.id)];

      expect(stringUserIdsInGroup.sort()).toEqual(expectedUserIds.sort());

      //Update du groupe en actif pour simuler le fait que tous les participants ont bien rejoint le groupe (et donc qu'ils sont inscrits sur l'app)
      const update = await testArgs.server?.executeOperation<{
        updateGroup: Group;
      }>({
        query: mutationUpdateGroup,
        variables: {
          id:  testArgs.data.groupId[0],
          data: {
            is_active: true,
          },
        },
      }, {
        contextValue: {
          req: { headers: {} },
          res: {},
          user: testArgs.testUser
        }
      });
      
      assert(update?.body.kind === "single");
      expect(update.body.singleResult.errors).toBeUndefined();
    });
  });
}
