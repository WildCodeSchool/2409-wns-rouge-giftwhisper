import type { Message } from "@/utils/types/chat";
import type { Poll } from "@/utils/types/chat";
import { socketConnection } from "./socket";

type SetMessagesArgs = Message[] | ((e: Message[]) => void);

export function useSocket(groupId: string) {
  if (!groupId) throw new Error('Group id is required for socket connection');
  const { getSocket, disconnectSocket } = socketConnection(groupId);
  const socket = getSocket();
  const emitters = {
    joinChatRoom: (chatId: string) => socket.emit("join-room", chatId),
    leaveChatRoom: (chatId: string) => socket.emit("leave-room", chatId),
    removeAllListeners: () => socket.removeAllListeners(),
    getMessageHistory: () => socket.emit("get-messages-history"),
  }
  const listeners = {
    onMessageHistory: (setMessages: (messages: SetMessagesArgs) => void) => socket.on("messages-history", (messages) => {
      setMessages(messages);
    }),
    onNewMessage: (setMessages: (messages: SetMessagesArgs) => void) => socket.on("new-message", (message) => {
      setMessages((e) => {
        const clone = e ? structuredClone(e) : [];
        clone.push(message);
        return clone;
      });
    }),
    onPollUpdated: (setMessages: (messages: SetMessagesArgs) => void) => socket.on(
      "poll-updated",
      (data: {
        pollId: number;
        poll: Poll;
      }) => {
        setMessages((prevMessages) => {
          if (!prevMessages) return prevMessages;
          return prevMessages.map((message) => {
            if (
              message.messageType === "poll" &&
              message.poll?.id === data.pollId
            ) {
              return {
                ...message,
                poll: {
                  ...data.poll,
                  createdBy: {
                    first_name: data.poll.createdBy.first_name,
                    id: data.poll.createdBy.id,
                  },
                },
              };
            }
            return message;
          });
        });
      }
    )

  }

  return { emitters, listeners, getSocket, disconnectSocket }
}