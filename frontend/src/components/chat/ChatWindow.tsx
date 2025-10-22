import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/currentUser";
import { CreatePollModal } from "../CreatePollModal";
import { LoadMoreButton } from "./LoadMoreButton";
import { MessagesList } from "./MessagesList";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { ChatInputForm } from "./ChatInputForm";
import { useParams } from "react-router-dom";
import { elementIsVisibleInViewport } from "@/utils/helpers/helpers";
import { Message } from "@/utils/types/chat";
import { useSocket } from "@/hooks/useSocket";
import { useQuery } from "@apollo/client";
import { GET_CHAT_BY_GROUP_ID } from "@/api/chat";
import { chatColorSchemeGradient } from "@/utils/hardValues/chat";
import { Chat } from "@/utils/types/chat";

function getGradientByName(name: string) {
  let colorSchemeGradientIndex = 0;
  for (const char of name) {
    colorSchemeGradientIndex += char.charCodeAt(0);
  }
  const gradient =
    chatColorSchemeGradient[
      colorSchemeGradientIndex % chatColorSchemeGradient.length
    ];
  return gradient;
}

function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayAutoScrollDown, setDisplayAutoScrollDown] = useState(false);
  const [displayMoreMessage, setDisplayMoreMessage] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useCurrentUser();
  const [showPollModal, setShowPollModal] = useState(false);
  const { chatId, groupId } = useParams<{
    chatId: string | undefined;
    groupId: string | undefined;
  }>();
  const { socketEmitters, socketListeners, getSocket } = useSocket(groupId);

  const { data: chatsData } = useQuery<{ getChatsByGroup: Chat[] }>(
    GET_CHAT_BY_GROUP_ID,
    {
      variables: { groupId },
      skip: !groupId,
    }
  );

  const currentChat = chatsData?.getChatsByGroup?.find(
    (chat: Chat) => String(chat.id) === chatId
  );
  const chatGradient = currentChat ? getGradientByName(currentChat.name) : "";
  const isSecretSanta = currentChat?.group?.is_secret_santa || false;

  // Extraire le nom du receiver pour le mode Secret Santa
  let receiverName = "";
  if (isSecretSanta && currentChat) {
    const [receiver] = currentChat.name.split(" ");
    const [_, receiverId, name] = receiver.split("_");
    const isReceiver = Number(receiverId) === Number(user?.id);
    if (!isReceiver) {
      receiverName = name; // Le nom de la personne à qui on offre
    }
  }

  useEffect(() => {
    if (!user || !groupId || !chatId) return;
    setDisplayAutoScrollDown(false);
    //getSocket => Even if we connect the socket from the previous page (group selection)
    //we need to make sure the connection is established (the user can reach this page using an url)
    getSocket(groupId);
    socketEmitters.joinChatRoom(chatId);
    socketEmitters.getMessageHistory();
    socketListeners.onMessageHistory(setMessages);
    socketListeners.onNewMessage(setMessages);
    socketListeners.onPollUpdated(setMessages);
    socketListeners.onMoreMessageReponse(setMessages);

    return () => {
      socketEmitters.leaveChatRoom(chatId);
      //Remove only listeners that were set on here, otherwise if will disconnect the
      //unreadMessageCount
      socketEmitters.removeListeners([
        "messages-history",
        "new-message",
        "poll-updated",
        "more-messages-response",
      ]);
    };
  }, [user, chatId]);

  useLayoutEffect(() => {
    if (
      !displayAutoScrollDown ||
      !user ||
      messages[messages.length - 1].createdBy.id === user.id
    ) {
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
    if (messages.length && !isLastMessageVisible && !displayAutoScrollDown) {
      setDisplayAutoScrollDown(true);
    } else if (
      messages.length &&
      isLastMessageVisible &&
      displayAutoScrollDown
    ) {
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

  if (!user || !chatId || !groupId) return null;

  const loadMoreMessages = () => {
    socketEmitters.moreMessage(messages?.length);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.length) return;
    const messageData = { content: message };
    socketEmitters.message(messageData);
    setMessage("");
  };

  const handleCreatePoll = (
    question: string,
    options: string[],
    allowMultipleVotes: boolean
  ) => {
    socketEmitters.createPoll({ question, options, allowMultipleVotes });
  };

  const handleVotePoll = (pollId: number, optionId: number) => {
    socketEmitters.votePoll({ pollId, optionId });
  };

  const handleRemoveVotePoll = (pollId: number, optionId: number) => {
    socketEmitters.removeVotePoll({ pollId, optionId });
  };

  const handleRemoveAllUserVotesPoll = (pollId: number) => {
    socketEmitters.removeAllVotePoll(pollId);
  };

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
            messages={messages}
            currentUserId={user.id}
            onScroll={handleScroll}
            lastMessageRef={lastMessageRef}
            firstMessageRef={firstMessageRef}
            onVote={handleVotePoll}
            onRemoveVote={handleRemoveVotePoll}
            onRemoveAllVotes={handleRemoveAllUserVotesPoll}
            chatGradient={chatGradient}
            isSecretSanta={isSecretSanta}
            receiverName={receiverName}
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
