import type { Message } from "@/utils/types/chat";
import type { Poll } from "@/utils/types/chat";
import { socketConnection } from "./socket";

type setUnreadMessageData = React.Dispatch<React.SetStateAction<Record<number, number>>>;
type SetMessagesData = React.Dispatch<React.SetStateAction<Message[]>>;
type MessageData = { content: string };
type UpdatePollData = { pollId: number; poll: Poll; };
type CreatePollData = { question: string; options: string[]; allowMultipleVotes: boolean; };
type VotePollData = { pollId: number; optionId: number; };
type RemoveVotePollData = VotePollData;

type SocketCustomEvents = {
  emitters:
  "debugging" |
  "join-room" |
  "leave-room" |
  "get-messages-history" |
  "more-messages" |
  "message" |
  "create-poll" |
  "vote-poll" |
  "remove-vote-poll" |
  "remove-all-user-votes-poll"
  listeners:
  "unread-count" |
  "messages-history" |
  "new-message" |
  "poll-updated" |
  "more-messages-response"
}

export function useSocket(groupId: string) {
  const { getSocket, disconnectSocket } = socketConnection();
  const socket = getSocket(groupId);
  const emitters = {
    /**
     * @deprecated Used for debug purposes, should be remove in prod 
     */
    debugging: () => socket.emit("debugging"),
    joinChatRoom: (chatId: string) => socket.emit<SocketCustomEvents["emitters"]>("join-room", chatId),
    leaveChatRoom: (chatId: string) => socket.emit<SocketCustomEvents["emitters"]>("leave-room", chatId),
    getMessageHistory: () => socket.emit("get-messages-history"),
    moreMessage: (skip: number | undefined) => socket.emit<SocketCustomEvents["emitters"]>("more-messages", { skip }),
    message: (messageData: MessageData) => socket.emit<SocketCustomEvents["emitters"]>("message", messageData),
    createPoll: (pollData: CreatePollData) => socket.emit<SocketCustomEvents["emitters"]>("create-poll", pollData),
    votePoll: (pollData: VotePollData) => socket.emit<SocketCustomEvents["emitters"]>("vote-poll", pollData),
    removeVotePoll: (pollData: RemoveVotePollData) => socket.emit<SocketCustomEvents["emitters"]>("remove-vote-poll", pollData),
    removeAllVotePoll: (pollId: number) => socket.emit<SocketCustomEvents["emitters"]>("remove-all-user-votes-poll", { pollId }),
    removeAllListeners: () => socket.removeAllListeners(),
    removeListeners: (listeners: SocketCustomEvents["listeners"][]) => {
      for (const listener of listeners) {
        socket.removeListener(listener)
      }
    },
  }
  const listeners = {
    onUpdateUnreadCount: (setUnreadMessageCountByChat: setUnreadMessageData, activeChatId: string | undefined) => socket.on<SocketCustomEvents["listeners"]>("unread-count", (chatId) => {
      console.log({activeChatId, chatId})
      if (activeChatId && activeChatId === chatId) return;
      setUnreadMessageCountByChat((current) => {
        const copy = structuredClone(current);
        copy[chatId] += 1;
        return copy;
      });
    }),
    onMessageHistory: (setMessages: SetMessagesData) => socket.on<SocketCustomEvents["listeners"]>("messages-history", (messages: Message[]) => {
      setMessages(messages);
    }),
    onNewMessage: (setMessages: SetMessagesData) => socket.on<SocketCustomEvents["listeners"]>("new-message", (message: Message) => {
      setMessages((e) => {
        const clone = e ? structuredClone(e) : [];
        clone.push(message);
        return clone;
      });
    }),
    onPollUpdated: (setMessages: SetMessagesData) => socket.on<SocketCustomEvents["listeners"]>("poll-updated", (data: UpdatePollData) => {
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
    onMoreMessageReponse: (setMessages: SetMessagesData) => socket.on<SocketCustomEvents["listeners"]>("more-messages-response", (previousMessages) => {
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