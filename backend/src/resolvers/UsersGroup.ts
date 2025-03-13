import { Resolver, Query, Mutation, Arg, Ctx, ID } from "type-graphql";
import { UserGroup } from "../entities/UserGroup";

@Resolver()
export class UsersGroupResolver {
  //Create
  @Mutation(() => UserGroup)
  async createUsersGroup(@Arg("data") data: any) {}

  // //Read an user
  // @Query(() => User, { nullable: true })
  // async getUserById(@Arg("id", () => ID) id: number) {}

  // //Read all users
  // @Query(() => [User])
  // async getUsers() {}

  // //Update an user
  // @Mutation(() => User)
  // async updateUser(
  //   @Arg("id", () => ID) id: number,
  //   @Arg("data", () => UserUpdateInput) data: UserUpdateInput
  // ) {
  // }

  // @Mutation(() => Boolean)
  // async deleteUser(@Arg("id", () => ID) id: number) {

  // }
}
