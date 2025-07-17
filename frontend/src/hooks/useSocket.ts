import type { Message } from "@/utils/types/chat";
import type { Poll } from "@/utils/types/chat";
import { socketConnection } from "./socket";

type SetMessagesData = React.Dispatch<React.SetStateAction<Message[]>>;
type MessageData = { content: string };
type UpdatePollData = { pollId: number; poll: Poll; };
type CreatePollData = { question: string; options: string[]; allowMultipleVotes: boolean; };
type VotePollData = { pollId: number; optionId: number; };
type RemoveVotePollData = VotePollData;

export function useSocket(groupId: string) {
  const { getSocket, disconnectSocket } = socketConnection();
  const socket = getSocket(groupId);
  const emitters = {
    joinChatRoom: (chatId: string) => socket.emit("join-room", chatId),
    leaveChatRoom: (chatId: string) => socket.emit("leave-room", chatId),
    removeAllListeners: () => socket.removeAllListeners(),
    getMessageHistory: () => socket.emit("get-messages-history"),
    moreMessage: (skip: number | undefined) => socket.emit("more-messages", { skip }),
    message: (messageData: MessageData) => socket.emit("message", messageData),
    createPoll: (pollData: CreatePollData) => socket.emit("create-poll", pollData),
    votePoll: (pollData: VotePollData) => socket.emit("vote-poll", pollData),
    removeVotePoll: (pollData: RemoveVotePollData) => socket.emit("remove-vote-poll", pollData),
    removeAllVotePoll: (pollId: number) => socket.emit("remove-all-user-votes-poll", { pollId })
  }
  const listeners = {
    onMessageHistory: (setMessages: SetMessagesData) => socket.on("messages-history", (messages: Message[]) => {
      setMessages(messages);
    }),
    onNewMessage: (setMessages: SetMessagesData) => socket.on("new-message", (message: Message) => {
      setMessages((e) => {
        const clone = e ? structuredClone(e) : [];
        clone.push(message);
        return clone;
      });
    }),
    onPollUpdated: (setMessages: SetMessagesData) => socket.on("poll-updated", (data: UpdatePollData) => {
      setMessages((prevMessages) => {
        if (!prevMessages) return prevMessages;
        const updatedPollMessages = prevMessages.map((message) => {
          if (message.messageType === "poll" && message.poll?.id === data.pollId) {
            const createdBy = {
              first_name: data.poll.createdBy.first_name,
              id: data.poll.createdBy.id,
            };
            const poll = { ...data.poll, createdBy };
            const updatedMessage = { ...message, poll };
            return updatedMessage;
          }
          return message;
        });
        return updatedPollMessages;
      });
    }),
    onMoreMessageReponse: (setMessages: SetMessagesData) => socket.on("more-messages-response", (previousMessages) => {
      setMessages((e) => {
        const copy = structuredClone(e) ?? [];
        const messagesFromDb = previousMessages ?? [];
        const updatedMessages = [...messagesFromDb, ...copy];
        return updatedMessages;
      });
    }),

  }

  return { socketEmitters: emitters, socketListeners: listeners, getSocket, disconnectSocket }
}