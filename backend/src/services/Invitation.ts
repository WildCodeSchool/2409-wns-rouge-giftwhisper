import { Invitation } from "../entities/Invitation";
import { Group } from "../entities/Group";
import { validate } from "class-validator";
import crypto from "crypto";
import { emailService } from "./Email";
import { datasource } from "../datasource.config";

export class InvitationService {
  /**
   * Crée une invitation et envoie un email 
   */
  async createInvitation(email: string, groupId: number): Promise<Invitation> {
    return await datasource.manager.transaction(
      async (transactionalEntityManager) => {
        //1. On récupère le groupe
        const group = await transactionalEntityManager.findOne(Group, {
          where: { id: groupId },
        });

        if (!group) {
          throw new Error("Group not found");
        }

        //2. On crée une invitation
        const newInvitation = new Invitation();
        newInvitation.token = crypto.randomBytes(16).toString("hex");
        newInvitation.group = group;

        //3. On enregistre l'invitation dans la transaction
        const errors = await validate(newInvitation);
        if (errors.length > 0) {
          throw new Error(`Validation error: ${JSON.stringify(errors)}`);
        }

        await transactionalEntityManager.save(newInvitation);

        try {
          //4. On envoie un mail d'invitation
          await emailService.sendInvitationEmail(
            email,
            group.name,
            newInvitation.token
          );
        } catch (error: any) {
          // Si l'envoi d'email échoue, on annule la transaction
          throw new Error(
            `Erreur lors de l'envoi de l'email: ${error.message}`
          );
        }

        return newInvitation;
      }
    );
  }
}

// Singleton instance
export const invitationService = new InvitationService();