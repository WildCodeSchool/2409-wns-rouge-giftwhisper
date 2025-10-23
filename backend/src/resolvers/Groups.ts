import { Resolver, Query, Arg, ID, Mutation, Ctx, Authorized } from "type-graphql";
import { Group, GroupCreateInput, GroupUpdateInput } from "../entities/Group";
import { validate } from "class-validator";
import { User } from "../entities/User";
import { invitationService } from "../services/Invitation";
import { getUserFromContext, ContextType } from "../auth";
import { chatService } from "../services/Chat";

@Resolver(() => Group)
export class GroupsResolver {

  // Used for dev purposes
  // Get all groups
  // @Query(() => [Group])
  // async groups(): Promise<Group[]> {
  //   const groups = await Group.find({
  //     relations: {
  //       users: true,
  //     },
  //   });
  //   return groups;
  // }


  @Query(() => Group, { nullable: true })
  @Authorized(["isPartOfGroup"])
  async group(
    @Arg("id", () => ID) id: number,
  ): Promise<Group | null> {
    const group = await Group.findOneBy({ id });
    if (group) {
      return group;
    } else {
      return null;
    }
  }

  @Query(() => Group, { nullable: true })
  @Authorized(["isGroupAdmin"])
  async groupDetails(
    @Arg("id", () => ID) id: number,
    @Ctx() context: ContextType
  ): Promise<Group | null> {
    const group = await Group.findOne({
      where: { id },
      relations: {
        users: true,
        invitations: true,
      },
    });
    context.data = { entities: [group] };
    if (group) {
      return group;
    } else {
      return null;
    }
  }

  // Get groups for a specific user
  @Query(() => [Group])
  @Authorized(["user"])
  async getUserGroups(
    @Ctx() context: ContextType
  ): Promise<Group[]> {
    const userFromContext = await getUserFromContext(context);
    if (!userFromContext) throw new Error("User not found");
    const user = await User.findOne({
      where: { id: userFromContext.id },
      relations: {
        groups: {
          users: true,
        },
      },
    });
    context.data = { entities: user?.groups }
    if (user) {
      return user.groups;
    } else {
      return [];
    }
  }



  // Create a new group
  @Mutation(() => Group)
  @Authorized(["user"])
  async createGroup(
    @Arg("data", () => GroupCreateInput) data: GroupCreateInput,
    @Ctx() context: ContextType
  ): Promise<Group> {
    const user = await getUserFromContext(context);
    if (!user) {
      throw new Error(
        "Non autorisé - vous devez être connecté pour créer un groupe"
      );
    }

    // Refetch user to avoid partial entity issues
    const fullUser = await User.findOneByOrFail({ id: user.id });

    const newGroup = new Group();
    Object.assign(newGroup, data);
    newGroup.created_by_id = fullUser.id;

    // 👇 Ajoute l’admin comme membre dès le départ
    newGroup.users = [fullUser];

    const errors = await validate(newGroup);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    await newGroup.save();

    // Recharge le groupe avec ses relations
    const savedGroup = await Group.findOne({
      where: { id: newGroup.id },
      relations: ["users"],
    });

    if (!savedGroup) throw new Error("Erreur lors de la création du groupe");

    return savedGroup;
  }

  /// Update a group
  @Mutation(() => Group, { nullable: true })
  @Authorized(['isGroupAdmin'])
  async updateGroup(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => GroupUpdateInput) data: GroupUpdateInput,
    @Ctx() context: ContextType
  ): Promise<Group | null> {

    const user = await getUserFromContext(context);
    if (!user) {
      throw new Error(
        "Unauthorized - you must be connected to update a group"
      );
    }

    const group = await Group.findOneBy({ id });
    if (!group) {
      throw new Error("Group not found");
    }

    if (data.name) {
      group.name = data.name;
    }

    if (data.end_date) {
      group.end_date = data.end_date;
    }

    if (data.is_secret_santa && !group.is_active) {
      group.is_secret_santa = data.is_secret_santa;
    }

    // Validate before saving
    const errors = await validate(group);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    await group.save();

    return group;
  }

  // Delete a group
  @Mutation(() => Boolean)
  @Authorized(['isGroupAdmin'])
  async deleteGroup(
    @Arg("id", () => ID) id: number,
    @Ctx() context: ContextType
  ): Promise<boolean> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error("Non autorisé - vous devez être connecté pour supprimer un groupe");

    const group = await Group.findOneBy({ id });
    if (!group) throw new Error("Ce groupe n'existe pas");

    await group.remove();
    return true;
  }

  //Ajouter des membres à un groupe déjà existant
  @Mutation(() => Group)
  @Authorized(['isGroupAdmin'])
  async addUsersToGroupByEmail(
    @Arg("emails", () => [String]) emails: string[],
    @Arg("groupId", () => ID) groupId: number
  ): Promise<Group> {
    // Get the group with its relations
    const group = await Group.findOne({
      where: { id: groupId },
      relations: { users: true, invitations: true },
    });
    if (!group) throw new Error("Group not found");

    // Remove potential duplicates from the list of emails
    const uniqueEmails = [...new Set(emails)];

    const emailPromises = uniqueEmails.map(async (email) => {

      const user = await User.findOneBy({ email });

      // Check if the user is already in the group
      const userAlreadyInGroup = user ? group.users.some((existingUser) => existingUser.id === user.id) : false;

      // If the user is NOT already in the group, send an invitation
      if (!userAlreadyInGroup) {
        try {
          await invitationService.createInvitation(email, groupId);
        } catch (err) {
          console.error(`Error sending invitation to ${email}: ${err}`);
        }
      }
    });

    await Promise.all(emailPromises);

    return group;
  }

  @Mutation(() => Boolean)
  @Authorized(['isGroupAdmin'])
  async activateGroup(
    @Arg("id", () => ID) id: number,
    @Ctx() context: ContextType
  ): Promise<boolean> {

    const user = await getUserFromContext(context);
    if (!user) {
      throw new Error(
        "Unauthorized - you must be connected to activate a group"
      );
    }

    const group = await Group.findOne({ where: { id }, relations: { users: true } });
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.is_active) {
      throw new Error("Group already active");
    }

    if (group.users.length < 3) {
      throw new Error("A group must have at least 3 users to be activated");
    }

    try {

      await chatService.generateChatsForGroup(group);

      group.is_active = true;
      await group.save();

      return true;

    } catch (error) {

      console.error(`Error activating group ${id}: ${error}`);
      return false;
    }
  }

  // Remove a user from a group
  @Mutation(() => Boolean)
  @Authorized(['isGroupAdmin'])
  async removeUserFromGroup(
    @Arg("groupId", () => ID) groupId: number,
    @Arg("userId", () => ID) userId: number,
    @Ctx() context: ContextType
  ): Promise<boolean> {
    const currentUser = await getUserFromContext(context);
    if (!currentUser) {
      throw new Error(
        "Non autorisé - vous devez être connecté pour supprimer un membre d'un groupe"
      );
    }

    const group = await Group.findOne({
      where: { id: groupId },
      relations: ["users"]
    });
    if (!group) {
      throw new Error("Group not found");
    }

    const userToRemove = group.users?.find(user => {
      return user.id === Number(userId);
    });

    if (!userToRemove) {
      throw new Error("Cet utilisateur n'est pas membre de ce groupe");
    }

    if (Number(userId) === group.created_by_id) {
      throw new Error("Impossible de retirer le créateur du groupe");
    }

    try {
      group.users = group.users?.filter(user => user.id !== Number(userId)) || [];
      await group.save();

      return true;
    } catch (error) {
      throw new Error("Erreur lors de la suppression du membre du groupe");
    }
  }
}
