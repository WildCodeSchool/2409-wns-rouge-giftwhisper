import type { TestArgsType } from "../index.test";
import { Group } from "../../../entities/Group";
import { mutationCreateGroup, mutationUpdateGroup } from "../../api/group";
import { User } from "../../../entities/User";
import { assert } from "../index.test";

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
      testArgs.data.group = {};
      testArgs.data.group.id = createdGroupId;
    });

    it("Should add all registered users to the group", async () => {});
  });
}
