import { validate } from "class-validator";
import { datasource } from "../datasource.config";
import { Chat } from "../entities/Chat";
import { Group } from "../entities/Group";
import { getRandomPairs } from "../utils/secret_santa/helpers";
// import { getNoelChatConfigurations } from "../utils/secret_santa/helpers";

export class ChatService {
  // Génère des chats automatiquement selon le mode du groupe
  async generateChatsForGroup(group: Group): Promise<void> {
    const users = group.users;

    if (!users || users.length < 2) {
      throw new Error("Not enough users in the group");
    }

    await datasource.manager.transaction(async (manager) => {
      if (group.is_secret_santa) {
        // 1. Formatage des noms pour le helper
        const players = users.map(
          (user) => `${user.id}_${user.first_name} ${user.last_name}`
        );

        // 2. Appel de l'algo secret santa
        const pairs = getRandomPairs(players);

        for (const { gifter, receiver } of pairs) {
          // 3. Extraction des IDs
          const gifterId = parseInt(gifter.split("_")[0], 10);
          const receiverId = parseInt(receiver.split("_")[0], 10);

          // 4. Recherche des objets User correspondants
          const gifterUser = users.find((u) => u.id === gifterId);
          const receiverUser = users.find((u) => u.id === receiverId);

          if (!gifterUser || !receiverUser) {
            throw new Error("User not found for a generated pair.");
          }

          // 5. Création du chat
          const chat = new Chat();
          chat.users = [gifterUser, receiverUser];
          chat.group = group;

          const errors = await validate(chat);
          if (errors.length > 0) {
            throw new Error(`Validation error: ${JSON.stringify(errors)}`);
          }

          await manager.save(chat);
        }
      } else {
        //TODO: Implémenter la logique pour les chats normaux
        console.log("🎄 Mode noël détecté — génération fictive des chats...");
      }
    });
  }
}

export const chatService = new ChatService();
