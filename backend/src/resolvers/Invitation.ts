import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Invitation, InvitationCreateInput } from "../entities/Invitation";
import { Group } from "../entities/Group";
import { validate } from "class-validator";
import crypto from "crypto";
import { emailService } from "../services/emailService";
import { UserGroup } from "../entities/UserGroup";
import { datasource } from "../datasource.config";
import { User } from "../entities/User";

@Resolver()
export class InvitationResolver {
  static createInvitation(arg0: { email: string; groupId: number }) {
    throw new Error("Method not implemented.");
  }
  //   @Mutation(() => Invitation)
  //   async createInvitation(
  //     @Arg("data", () => InvitationCreateInput) data: InvitationCreateInput
  //   ): Promise<Invitation> {
  //     return await datasource.manager.transaction(
  //       async (transactionalEntityManager) => {
  //         //1. On récupère le groupe
  //         const group = await transactionalEntityManager.findOne(Group, {
  //           where: { id: data.groupId },
  //         });

  //         if (!group) {
  //           throw new Error("Group not found");
  //         }

  //         //on vérifie s'il n'y a pas déjà une invitation pr cet utilisateur
  //         const existing = await Invitation.findOne({
  //           where: { email: data.email, group: { id: data.groupId } },
  //           relations: ["group"],
  //         });
  //         if (existing)
  //           throw new Error("Une invitation existe déjà pour cet email.");

  //         //2. On crée une invitation
  //         const newInvitation = new Invitation();
  //         newInvitation.token = crypto.randomBytes(16).toString("hex");
  //         newInvitation.group = group;
  //         newInvitation.email = data.email; // ajout pr relier le token à un groupe ET à un destinataire.

  //         //3. On enregistre l'invitation dans la transaction
  //         const errors = await validate(newInvitation);
  //         if (errors.length > 0) {
  //           throw new Error(`Validation error: ${JSON.stringify(errors)}`);
  //         }

  //         await transactionalEntityManager.save(newInvitation);

  //         try {
  //           //4. On envoie un mail d'invitation (opération externe à la transaction)
  //           await emailService.sendInvitationEmail(
  //             data.email,
  //             group.name,
  //             newInvitation.token
  //           );
  //         } catch (error: any) {
  //           // Si l'envoi d'email échoue, on annule la transaction
  //           throw new Error(
  //             `Erreur lors de l'envoi de l'email: ${error.message}`
  //           );
  //         }

  //         return newInvitation;
  //       }
  //     );
  //   }

  async createInvitationInternally(
    email: string,
    groupId: number
  ): Promise<Invitation> {
    const group = await Group.findOneBy({ id: groupId });
    if (!group) throw new Error("Group not found");

    const existing = await Invitation.findOne({
      where: { email, group: { id: groupId } },
      relations: ["group"],
    });
    if (existing) throw new Error("Une invitation existe déjà pour cet email.");

    const invitation = new Invitation();
    invitation.token = crypto.randomBytes(16).toString("hex");
    invitation.email = email;
    invitation.group = group;

    const errors = await validate(invitation);
    if (errors.length > 0) throw new Error(JSON.stringify(errors));

    await invitation.save();

    await emailService.sendInvitationEmail(email, group.name, invitation.token);

    return invitation;
  }

  @Mutation(() => Invitation)
  async createInvitation(
    @Arg("data", () => InvitationCreateInput) data: InvitationCreateInput
  ): Promise<Invitation> {
    return this.createInvitationInternally(data.email, data.groupId);
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

    const user = await User.findOneBy({ email: invitation.email }); //potentiellement user n'a pas encore d'id?

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
