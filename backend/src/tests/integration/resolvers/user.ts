import { User } from "../../../entities/User";
import { mutationCreateUser } from "../../api/user";
import { TestArgsType } from "../index.test";
import { mockUserData } from "../mock_data";
import { assert } from "../index.test";

export function usersResolverTest(testArgs: TestArgsType) {
  describe("User Resolver Tests", () => {
    it("Should create a verified user with valid data", async () => {
      const mockUser = {
        email: `jean-claude-${Date.now()}@gmail.com`,
        password: "Whisky-Lover@44!",
        first_name: "Jean-Claude22",
        last_name: "Whisky22",
        date_of_birth: new Date("12/12/1973"),
        is_verified: true,
      };
      const response = await testArgs.server?.executeOperation<{
        createUser: User;
      }>({
        query: mutationCreateUser,
        variables: {
          data: {
            email: mockUser.email,
            password: mockUser.password,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            date_of_birth: mockUser.date_of_birth,
            is_verified: mockUser.is_verified,
          },
        },
      });

      assert(response?.body.kind === "single");
      expect(response.body.singleResult.errors).toBeUndefined();
      const createdUserId = response.body.singleResult.data?.createUser.id;
      expect(createdUserId).toBeDefined();
      const userFromDb = await User.findOneBy({ id: createdUserId });
      expect(userFromDb?.email).toBe(mockUser.email);
    })

    it("Should create multiple users with valid data", async () => {
      const mockUsersList = mockUserData.slice(0, 10);
      testArgs.data.userIds = [];
      for (const user of mockUsersList) {
        const response = await testArgs.server?.executeOperation<{
          createUser: User;
        }>({
          query: mutationCreateUser,
          variables: {
            data: {
              email: user.email,
              password: user.password,
              first_name: user.first_name,
              last_name: user.last_name,
              date_of_birth: user.date_of_birth,
              is_verified: user.is_verified,
            },
          },
        });

        assert(response?.body.kind === "single");
        expect(response.body.singleResult.errors).toBeUndefined();
        const createdUserId = response.body.singleResult.data?.createUser.id;
        expect(createdUserId).toBeDefined();
        const userFromDb = await User.findOneBy({ id: createdUserId });
        expect(userFromDb?.email).toBe(user.email);
        testArgs.data.userIds.push(userFromDb?.id)
      };
    });
  })
}
