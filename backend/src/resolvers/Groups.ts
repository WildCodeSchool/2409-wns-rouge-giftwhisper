import { Resolver, Query, Arg, ID, Mutation, Ctx } from "type-graphql";
import { Group, GroupCreateInput, GroupUpdateInput } from "../entities/Group";
import { validate } from "class-validator";
import { User } from "../entities/User";
import { In } from "typeorm";
import { invitationService } from "../services/Invitation";
import { getUserFromContext, ContextType } from "../auth";
import { chatService } from "../services/Chat";
import { getGroupIfUserIsCreator } from "../utils/groupPermissions";

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
    const group = await getGroupIfUserIsCreator(id, context, ["users"]);

    // Handle user additions
    if (data.userIds?.length) {
      const existingUsers = await User.findBy({ id: In(data.userIds) });
      if (existingUsers.length !== data.userIds.length) {
        throw new Error("One or more users do not exist");
      }

      const existingUserIds = group.users.map((user) => user.id);
      const duplicates = data.userIds.filter((id) =>
        existingUserIds.includes(id)
      );
      if (duplicates.length > 0) {
        throw new Error("One or more users already exist in the group");
      }

      const usersToAdd = await User.findBy({ id: In(data.userIds) });
      group.users.push(...usersToAdd);
    }

    // Detect if group is about to become active
    const wasInactive = !group.is_active;

    // Apply updates
    if (data.name !== undefined) group.name = data.name;
    if (data.end_date !== undefined) group.end_date = data.end_date;
    if (data.is_secret_santa !== undefined)
      group.is_secret_santa = data.is_secret_santa;
    if (data.is_active !== undefined) group.is_active = data.is_active;

    // Validate before saving
    const errors = await validate(group);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    await group.save();

    // If the group just became active, generate chats
    if (wasInactive && group.is_active) {
      await chatService.generateChatsForGroup(group);
    }

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
    const group = await getGroupIfUserIsCreator(groupId, context, [
      "users",
      "invitations",
    ]);

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
