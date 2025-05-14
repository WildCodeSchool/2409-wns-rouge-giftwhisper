import { Resolver, Query, Arg, ID, Mutation } from "type-graphql";
import { Group, GroupCreateInput, GroupUpdateInput } from "../entities/Group";
import { validate } from "class-validator";
import { User } from "../entities/User";
import { In } from "typeorm";
import { UserGroup } from "../entities/UserGroup";

@Resolver()
export class GroupsResolver {
  // Get all groups
  @Query(() => [Group])
  async groups(): Promise<Group[]> {
    const groups = await Group.find({
      relations: {
        userGroups: true,
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
        userGroups: {
          user: true,
        },
      },
    });
    if (group) {
      return group;
    } else {
      return null;
    }
  }

  // Create a new group
  @Mutation(() => Group)
  async createGroup(
    @Arg("data", () => GroupCreateInput) data: GroupCreateInput
  ): Promise<Group> {
    const newGroup = new Group();
    Object.assign(newGroup, data);

    const errors = await validate(newGroup);
    if (errors.length > 0) {
      throw new Error(`Validation error: ${JSON.stringify(errors)}`);
    } else {
      await newGroup.save();
      return newGroup;
    }
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
      relations: { userGroups: true },
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
      const existingUserIds = group.userGroups.map(
        (userGroup) => userGroup.user.id
      );

      //2.3. Comparaison des utilisateurs existants et des utilisateurs à ajouter
      const usersAlreadyInGroup = data.userIds.filter((userId) =>
        existingUserIds.includes(userId)
      );

      if (usersAlreadyInGroup.length > 0) {
        throw new Error("One or more users already exist in the group");
      }

      const usersToAdd = await User.findBy({ id: In(data.userIds) });

      //2.4 Ajout des nouveaux utilisateur au groupe
      for (const user of usersToAdd) {
        const newUserToAdd = new UserGroup();
        newUserToAdd.group = group;
        newUserToAdd.user = user;
        await newUserToAdd.save();
        // Ajouter à la collection pour la cohérence
        group.userGroups.push(newUserToAdd);
      }
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

  //Ajouter un seul membre à group déjà existant
  @Mutation(() => Group)
  async addUserToGroupByEmail(
    @Arg("email") email: string,
    @Arg("groupId", () => ID) groupId: number
  ): Promise<Group> {
    const group = await Group.findOne({
      where: { id: groupId },
      relations: { userGroups: { user: true } },
    });
    if (!group) throw new Error("Group not found");

    const user = await User.findOneBy({ email });

    if (!user) {
      // TODO: ici créer une invitation ?
      throw new Error("No user with this email. You may want to invite them.");
    }

    const alreadyIn = group.userGroups.some((ug) => ug.user.id === user.id);
    if (alreadyIn) throw new Error("User is already in the group");

    const userGroup = UserGroup.create({ user, group });
    await userGroup.save();

    group.userGroups.push(userGroup);
    return group;
  }
}
