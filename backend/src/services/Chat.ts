import { validate } from "class-validator";
import { datasource } from "../datasource.config";
import { Chat } from "../entities/Chat";
import { Group } from "../entities/Group";
import { getRandomPairs } from "../utils/secret_santa/helpers";
// import { getNoelChatConfigurations } from "../utils/secret_santa/helpers";

export class ChatService {
  // Automaticly generate chats for a group based on the users in that group
  async generateChatsForGroup(group: Group): Promise<void> {
    const users = group.users;

    if (!users || users.length < 2) {
      throw new Error("Not enough users in the group");
    }

    await datasource.manager.transaction(async (manager) => {
      if (group.is_secret_santa) {
        console.log(
          " 🎅 Mode secret santa détecté — génération des chats par paire"
        );
        //  Format name for the helper function
        const players = users.map(
          (user) => `${user.id}_${user.first_name} ${user.last_name}`
        );

        //  call the helper function to get random pairs
        const pairs = getRandomPairs(players);

        for (const { gifter, receiver } of pairs) {
          // Extract user IDs from the formatted strings
          const gifterId = parseInt(gifter.split("_")[0], 10);
          const receiverId = parseInt(receiver.split("_")[0], 10);

          //  Find the corresponding User objects
          const gifterUser = users.find((u) => u.id === gifterId);
          const receiverUser = users.find((u) => u.id === receiverId);

          if (!gifterUser || !receiverUser) {
            throw new Error("User not found for a generated pair.");
          }

          //  create a new chat for the pair
          const chat = new Chat();
          chat.users = [gifterUser, receiverUser];
          chat.group = group;
          chat.name = `Secret Santa pour ${receiverUser.first_name} ${receiverUser.last_name}`;

          const errors = await validate(chat);
          if (errors.length > 0) {
            throw new Error(`Validation error: ${JSON.stringify(errors)}`);
          }

          await manager.save(chat);
        }
      } else {
        //TODO: Implémenter la logique pour les chats noël normaux
        console.log(
          "🎄 Mode noël détecté — génération des chats par groupe de discussion..."
        );
        for (const excludeUser of users) {
          const chat = new Chat();
          chat.users = users.filter((user) => user.id !== excludeUser.id);
          chat.group = group;
          chat.name = `Pour ${excludeUser.first_name} ${excludeUser.last_name}`;

          const errors = await validate(chat);
          if (errors.length > 0) {
            throw new Error(`Validation error: ${JSON.stringify(errors)}`);
          }

          await manager.save(chat);
        }
      }
    });
  }
}

export const chatService = new ChatService();
