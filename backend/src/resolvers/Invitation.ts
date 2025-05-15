import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Invitation, InvitationCreateInput } from "../entities/Invitation";
import { Group } from "../entities/Group";
import { UserGroup } from "../entities/UserGroup";
import { User } from "../entities/User";
import { invitationService } from "../services/Invitation";

@Resolver()
export class InvitationResolver {
  @Mutation(() => Invitation)
  async createInvitation(
    @Arg("data", () => InvitationCreateInput) data: InvitationCreateInput
  ): Promise<Invitation> {
    return invitationService.createInvitation(data.email, data.groupId);
  }

  @Query(() => Group, { nullable: true })
  async validateInvitationToken(
    @Arg("token") token: string
  ): Promise<Group | null> {
    // 1. On récupère l'invitation par son token
    const invitation = await Invitation.findOne({
      where: { token },
      relations: ["group"],
    });

    // 2. On vérifie si l'invitation existe
    if (!invitation) {
      throw new Error("Invitation invalide ou expirée");
    }

    // 3. On renvoie le groupe associé à l'invitation
    return invitation.group;
  }

  @Mutation(() => Boolean)
  async acceptInvitation(
    @Arg("token") token: string,
    @Arg("userId") userId: number
  ): Promise<boolean> {
    // 1. On récupère l'invitation
    const invitation = await Invitation.findOne({
      where: { token },
      relations: ["group"],
    });

    if (!invitation) {
      throw new Error("Invitation invalide ou expirée");
    }

    const user = await User.findOneBy({ id: userId }); //potentiellement user n'a pas encore d'id?

    if (!user)
      throw new Error("Aucun utilisateur trouvé pour cette invitation");

    // 2. On vérifie si l'utilisateur est déjà membre du groupe
    const existingMembership = await UserGroup.findOne({
      where: {
        user: { id: userId },
        group: { id: invitation.group.id },
      },
    });

    if (existingMembership) {
      // L'utilisateur est déjà membre, on supprime quand même l'invitation
      await Invitation.remove(invitation);
      return true;
    }

    // 3. On ajoute l'utilisateur au groupe
    const userGroup = new UserGroup();
    userGroup.user = user; //on peut ne pas avoir d'id encore à ce moment là?
    userGroup.group = invitation.group;

    await userGroup.save();

    // 4. On supprime l'invitation
    await Invitation.remove(invitation);

    return true;
  }

  @Query(() => [Invitation])
  async getAllInvitations(): Promise<Invitation[]> {
    return await Invitation.find({
      relations: ["group"], // inclure le groupe si besoin
    });
  }

  @Mutation(() => Boolean)
  async deleteInvitation(
    @Arg("invitationId") invitationId: number
  ): Promise<boolean> {
    const invitation = await Invitation.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error("Invitation non trouvée.");
    }

    await Invitation.remove(invitation);
    return true;
  }
}
