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

    if (group.created_by_id !== user.id) {
      throw new Error(
        "Unauthorized - only the creator of the group can update it"
      );
    }

    if (data.name) {
      group.name = data.name;
    } 

    if (data.end_date)
    {
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
  async deleteGroup(
    @Arg("id", () => ID) id: number,
    @Ctx() context: ContextType
  ): Promise<boolean> {
    const user = await getUserFromContext(context);
    if (!user) throw new Error ("Non autorisé - vous devez être connecté pour supprimer un groupe");

    const group = await Group.findOneBy({ id });
    if (!group) throw new Error ("Ce groupe n'existe pas");

    if (group.created_by_id !== user.id) {
      throw new Error ("Non autorisé - seul le créateur du groupe peut le supprimer")
    }
    await group.remove();
    return true;
  }

  //Ajouter des membres à un groupe déjà existant
  @Mutation(() => Group)
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
  async activateGroup(@Arg("id", () => ID) id: number, @Ctx() context: ContextType): Promise<boolean> {

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

    if (group.created_by_id !== user.id) {
      throw new Error ("Unauthorized - only the creator of the group can activate it")
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
}
