import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { socketConnection } from "@/hooks/socket";
import { useCurrentUser } from "@/hooks/currentUser";
import { CreatePollModal } from "../CreatePollModal";
import { LoadMoreButton } from "./LoadMoreButton";
import { MessagesList } from "./MessagesList";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { ChatInputForm } from "./ChatInputForm";
import { useParams } from "react-router-dom";
import { elementIsVisibleInViewport } from "@/utils/helpers/helpers";
import { Message, Poll } from "@/utils/types/chat";

function ChatWindow() {
  //TODO: Deal with color per user instead of hardcoded colors
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [displayAutoScrollDown, setDisplayAutoScrollDown] = useState(false);
  const [displayMoreMessage, setDisplayMoreMessage] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useCurrentUser();
  const [showPollModal, setShowPollModal] = useState(false);
  const { chatId, groupId } = useParams<{ chatId: string | undefined, groupId: string | undefined }>();

  //Route guard should prevent any unauthorized user from reaching this page
  if (!user || !chatId || !groupId) {
    return null;
  }

  const { getSocket } = socketConnection(groupId);
  const socket = getSocket();

  useEffect(() => {
    if (!user) return;
    socket.emit("join-room", chatId);
    socket.emit("get-messages-history");
    socket.on("messages-history", (messages) => {
      setMessages(messages);
    });
    socket.on("new-message", (message) => {
      setMessages((e) => {
        const clone = e ? structuredClone(e) : [];
        clone.push(message);
        return clone;
      });
    });
    socket.on(
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
    );
    socket.on("more-messages-response", (previousMessages) => {
      setMessages((e) => {
        const copy = structuredClone(e) ?? [];
        const messagesFromDb = previousMessages ?? [];
        const updatedMessages = [...messagesFromDb, ...copy];
        return updatedMessages;
      });
      //TODO: The previous first message should be at the bottom of the container ( not the top )
      //There doesn't appear to be an easy way to do this
      firstMessageRef.current?.scrollIntoView();
    });

    return () => {
      socket.emit("leave-room", chatId);
      socket.removeAllListeners();
    }
  }, [user, chatId]);

  useLayoutEffect(() => {
    if (!displayMoreMessage) {
      lastMessageRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  const handleScroll = () => {
    const isLastMessageVisible = elementIsVisibleInViewport(
      lastMessageRef.current!
    );
    const isFirstMessageVisible = elementIsVisibleInViewport(
      firstMessageRef.current!
    );
    if (!isLastMessageVisible && !displayAutoScrollDown) {
      setDisplayAutoScrollDown(true);
    } else if (isLastMessageVisible && displayAutoScrollDown) {
      setDisplayAutoScrollDown(false);
    }
    //TODO: Add message count to display the message only if there are more messages in DB
    //But we need the messages to be linked to a chatroom before being able to do so
    if (isFirstMessageVisible) {
      setDisplayMoreMessage(true);
    } else if (!isFirstMessageVisible) {
      setDisplayMoreMessage(false);
    }
  };

  const loadMoreMessages = () => {
    socket.emit("more-messages", { skip: messages?.length });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.length) return;
    const socket = getSocket();
    const messageData = { content: message, chatId };
    socket.emit("message", messageData);
    setMessage("");
  };

  const handleCreatePoll = (
    question: string,
    options: string[],
    allowMultiple: boolean
  ) => {
    socket.emit("create-poll", { question, options, allowMultiple });
  };

  const handleVotePoll = (pollId: number, optionId: number) => {
    socket.emit("vote-poll", { pollId, optionId });
  };

  const handleRemoveVotePoll = (pollId: number, optionId: number) => {
    socket.emit("remove-vote-poll", { pollId, optionId });
  };

  const handleRemoveAllUserVotesPoll = (pollId: number) => {
    socket.emit("remove-all-user-votes-poll", { pollId });
  };

  //TODO: Create a loading page / component
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-[#A18CD1] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <article className="flex flex-col w-full h-full bg-white">
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <LoadMoreButton
            onClick={loadMoreMessages}
            isVisible={displayMoreMessage}
          />

          <MessagesList
            messages={messages || []}
            currentUserId={Number(user.id)}
            onScroll={handleScroll}
            lastMessageRef={lastMessageRef}
            firstMessageRef={firstMessageRef}
            onVote={handleVotePoll}
            onRemoveVote={handleRemoveVotePoll}
            onRemoveAllVotes={handleRemoveAllUserVotesPoll}
          />

          <ScrollToBottomButton
            onClick={() =>
              lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            isVisible={displayAutoScrollDown}
          />

          <ChatInputForm
            message={message}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            onCreatePoll={() => setShowPollModal(true)}
          />
        </div>
      </article>

      <CreatePollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />
    </>
  );
}

export default ChatWindow;
