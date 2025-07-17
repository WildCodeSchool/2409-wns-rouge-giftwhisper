import { Arg, ID, Int, Mutation, Query, Resolver } from "type-graphql";
import { Invitation, InvitationCreateInput } from "../entities/Invitation";
import { Group } from "../entities/Group";
import { User } from "../entities/User";
import { invitationService } from "../services/Invitation";
import { InvitationAcceptInput } from "../entities/Invitation";

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

    console.log("validateInvitationToken", token);
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
  @Arg("data", () => InvitationAcceptInput) data: InvitationAcceptInput
  ): Promise<boolean> {
    // 1. On récupère l'invitation
    const invitation = await Invitation.findOne({
      where: { token: data.token },
      relations: ["group"],
    });

    if (!invitation) {
      throw new Error("Invitation invalide ou expirée");
    }

    const user = await User.findOneBy({ id: data.userId }); 

    if (!user)
      throw new Error("Aucun utilisateur trouvé pour cette invitation");

    // 2. On vérifie si l'utilisateur est déjà membre du groupe
    const groupWithUsers = await Group.findOne({
      where: { id: invitation.group.id },
      relations: { users: true },
    });
    
    if (!groupWithUsers) {
      throw new Error("Groupe non trouvé");
    }
    
    const isUserAlreadyMember = groupWithUsers.users.some(u => u.id === data.userId);

    if (isUserAlreadyMember) {
      // L'utilisateur est déjà membre, on supprime quand même l'invitation
      await Invitation.remove(invitation);
      return true;
    } else {

      const group = await Group.findOne({
        where: { id: invitation.group.id },
        relations: { users: true },
      });

      if (!group) {
        throw new Error("Groupe non trouvé");
      }
  
      // 3. On ajoute l'utilisateur au groupe 
      try {
        // On vérifie si l'utilisateur existe déjà dans le groupe
        const userExists = group.users.some(u => u.id === user.id);
        
        if (!userExists) {
          group.users.push(user);
          await group.save();
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur au groupe:", error);
        throw new Error("Erreur lors de l'ajout de l'utilisateur au groupe");
      }

    }
    
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

  @Query(() => [Invitation])
  async getInvitationsByGroup(@Arg("groupId", () => ID) groupId: number): Promise<Invitation[]> {
    return await Invitation.find({
      where: { group: { id: groupId } },
      relations: ["group"],
      order: { created_at: "DESC" },
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
