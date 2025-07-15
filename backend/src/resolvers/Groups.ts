import { Resolver, Query, Arg, ID, Mutation, Ctx } from "type-graphql";
import { Group, GroupCreateInput, GroupUpdateInput } from "../entities/Group";
import { validate } from "class-validator";
import { User } from "../entities/User";
import { In } from "typeorm";
import { invitationService } from "../services/Invitation";
import { getUserFromContext, ContextType } from "../auth";

@Resolver()
export class GroupsResolver {
  // Get all groups
  @Query(() => [Group])
  async groups(): Promise<Group[]> {
    const groups = await Group.find({
      relations: {
        users: true,
      },
    });
    return groups;
  }

  // Get one group by id
  @Query(() => Group, { nullable: true })
  async group(@Arg("id", () => ID) id: number): Promise<Group | null> {
    const group = await Group.findOne({
      where: { id },
      relations: {
        users: true,
        invitations: true,
      },
    });
    if (group) {
      return group;
    } else {
      return null;
    }
  }

  // Get groups for a specific user
  @Query(() => [Group])
  async getUserGroups(
    @Arg("userId", () => ID) userId: number
  ): Promise<Group[]> {
    const user = await User.findOne({
      where: { id: userId },
      relations: {
        groups: {
          users: true,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.groups;
  }

  // Create a new group
  @Mutation(() => Group)
  async createGroup(
    @Arg("data", () => GroupCreateInput) data: GroupCreateInput,
    @Ctx() context: ContextType
  ): Promise<Group> {
    // Retrieve the user from the context
    const user = await getUserFromContext(context);

    if (!user) {
      throw new Error(
        "Non autorisé - vous devez être connecté pour créer un groupe"
      );
    }

    const newGroup = new Group();
    Object.assign(newGroup, data);

    const errors = await validate(newGroup);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    // Save the group with the creator's ID
    newGroup.created_by_id = user.id;
    await newGroup.save();

    // Add the creator to the group
    newGroup.users = [user];

    // Save the updated group with the creator
    await newGroup.save();

    return newGroup;
  }

  // Update a group
  @Mutation(() => Group, { nullable: true })
  async updateGroup(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => GroupUpdateInput) data: GroupUpdateInput,
    @Ctx() context: ContextType
  ): Promise<Group | null> {
    // Check if the group exists
    const group = await Group.findOne({
      where: { id },
      relations: { users: true },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    const user = await getUserFromContext(context);

    if (!user) {
      throw new Error("Unauthorized");
    }
    // Check if the user is the creator of the group
    if (group.created_by_id !== user.id) {
      throw new Error("You are not authorized to update this group");
    }

    //If user IDs are provided, verify and add them if not already in the group
    if (data.userIds && data.userIds.length > 0) {
      //Check if users exist in the database
      const existingUsers = await User.findBy({ id: In(data.userIds) });
      if (existingUsers.length !== data.userIds.length) {
        throw new Error("One or more users do not exist");
      }

      //Retrieve existing user IDs from the group
      const existingUserIds = group.users.map((user) => user.id);

      //Compare and find duplicates
      const usersAlreadyInGroup = data.userIds.filter((userId) =>
        existingUserIds.includes(userId)
      );

      if (usersAlreadyInGroup.length > 0) {
        throw new Error("One or more users already exist in the group");
      }

      const usersToAdd = await User.findBy({ id: In(data.userIds) });

      //Add new users
      for (const user of usersToAdd) {
        group.users.push(user);
      }

      await group.save();
    }

    //Update group fields
    if (data.name !== undefined) {
      group.name = data.name;
    }

    if (data.end_date !== undefined) {
      group.end_date = data.end_date;
    }

    if (data.is_secret_santa !== undefined) {
      group.is_secret_santa = data.is_secret_santa;
    }

    if (data.is_active !== undefined) {
      group.is_active = data.is_active;
    }

    // Validate updated data
    const errors = await validate(group);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    // Save updated group
    await group.save();
    return group;
  }

  // Delete a group
  @Mutation(() => Group, { nullable: true })
  async deleteGroup(@Arg("id", () => ID) id: number): Promise<Group | null> {
    const group = await Group.findOneBy({ id });
    if (group !== null) {
      await group.remove();
      Object.assign(group, { id });
      return group;
    } else {
      return null;
    }
  }

  // Add users to an existing group by email
  @Mutation(() => Group)
  async addUsersToGroupByEmail(
    @Arg("emails", () => [String]) emails: string[],
    @Arg("groupId", () => ID) groupId: number,
    @Ctx() context: ContextType
  ): Promise<Group> {
    // Retrieve group with its relations
    const group = await Group.findOne({
      where: { id: groupId },
      relations: { users: true, invitations: true },
    });
    if (!group) throw new Error("Group not found");

    const user = await getUserFromContext(context);
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (group.created_by_id !== user.id) {
      throw new Error("You are not authorized to add users to this group");
    }

    // Remove duplicate emails
    const uniqueEmails = [...new Set(emails)];

    const emailPromises = uniqueEmails.map(async (email) => {
      const user = await User.findOneBy({ email });

      // Check if user exists
      if (user) {
        // Check if user is not already in the group
        const userAlreadyInGroup = group.users.some(
          (existingUser) => existingUser.id === user.id
        );

        if (!userAlreadyInGroup) {
          // Create invitation via service
          try {
            await invitationService.createInvitation(email, groupId);
          } catch (err) {
            console.error(`Erreur lors de l'invitation de ${email} : ${err}`);
          }
        }
      }
    });

    await Promise.all(emailPromises);

    return group;
  }
}
