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
  async getUserGroups(@Arg("userId", () => ID) userId: number): Promise<Group[]> {
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
    // Récupérer l'utilisateur authentifié
    const user = await getUserFromContext(context);
    
    if (!user) {
      throw new Error("Non autorisé - vous devez être connecté pour créer un groupe");
    }

    const newGroup = new Group();
    Object.assign(newGroup, data);

    const errors = await validate(newGroup);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    // Sauvegarder le groupe d'abord
    await newGroup.save();

    // Ensuite, ajouter le créateur comme membre du groupe
    newGroup.users = [user];
    await newGroup.save();

    return newGroup;
  }

  // Update a group
  @Mutation(() => Group, { nullable: true })
  async updateGroup(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => GroupUpdateInput) data: GroupUpdateInput
  ): Promise<Group | null> {
    //1.Vérification si le groupe existe
    const group = await Group.findOne({
      where: { id },
      relations: { users: true },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    //2.Vérification s'il y a des utilisateurs à ajouter et s'ils ne sont pas déjà présents dans le groupe
    if (data.userIds && data.userIds.length > 0) {
      //2.1 Vérification si les utilisateurs existent dans la base de données
      const existingUsers = await User.findBy({ id: In(data.userIds) });
      if (existingUsers.length !== data.userIds.length) {
        throw new Error("One or more users do not exist");
      }

      //2.2.Récupération des utilisateurs existants dans le groupe
      const existingUserIds = group.users.map(user => user.id);

      //2.3. Comparaison des utilisateurs existants et des utilisateurs à ajouter
      const usersAlreadyInGroup = data.userIds.filter((userId) =>
        existingUserIds.includes(userId)
      );

      if (usersAlreadyInGroup.length > 0) {
        throw new Error("One or more users already exist in the group");
      }

      const usersToAdd = await User.findBy({ id: In(data.userIds) });

      //2.4 Ajout des nouveaux utilisateurs au groupe
      for (const user of usersToAdd) {
        group.users.push(user);
      }
      
      // Enregistrer les modifications
      await group.save();
    }

    //3 Mise à jour des champs du groupe
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

    //4. Validation des données mises à jour
    const errors = await validate(group);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    }

    //5. Sauvegarde du groupe
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

  //Ajouter des membres à group déjà existant
  @Mutation(() => Group)
  async addUsersToGroupByEmail(
    @Arg("emails", () => [String]) emails: string[],
    @Arg("groupId", () => ID) groupId: number
  ): Promise<Group> {
    // On récupère le groupe avec ses relations
    const group = await Group.findOne({
      where: { id: groupId },
      relations: { users: true, invitations: true },
    });
    if (!group) throw new Error("Group not found");

    // Suppression des doublons dans la liste d'emails
    const uniqueEmails = [...new Set(emails)];

    const emailPromises = uniqueEmails.map(async (email) => {
      const user = await User.findOneBy({ email });

      // Vérification si l'utilisateur existe
      if (user) {
        // Vérification si l'utilisateur n'est pas déjà dans le groupe
        const userAlreadyInGroup = group.users.some((existingUser) => existingUser.id === user.id);

        if (!userAlreadyInGroup) {

          // Créer l'invitation via le service
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
