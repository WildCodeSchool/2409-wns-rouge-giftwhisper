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

function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayAutoScrollDown, setDisplayAutoScrollDown] = useState(false);
  const [displayMoreMessage, setDisplayMoreMessage] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useCurrentUser();
  const [showPollModal, setShowPollModal] = useState(false);
  const { chatId, groupId } = useParams<{ chatId: string | undefined, groupId: string | undefined }>();

  if (!user || !chatId || !groupId) {
    return null;
  }

  const { socketEmitters, socketListeners, getSocket } = useSocket(groupId);

  useEffect(() => {
    if (!user) return;
    setDisplayAutoScrollDown(false);
    //getSocket => Even if we connect the socket from the previous page (group selection) 
    //we need to make sure the connection is established (the user can reach this page using an url)
    getSocket(groupId);
    socketEmitters.joinChatRoom(chatId);
    socketEmitters.getMessageHistory();
    socketListeners.onMessageHistory(setMessages)
    socketListeners.onNewMessage(setMessages)
    socketListeners.onPollUpdated(setMessages)
    socketListeners.onMoreMessageReponse(setMessages);

    return () => {
      socketEmitters.leaveChatRoom(chatId);
      //Remove only listeners that were set on here, otherwise if will disconnect the
      //unreadMessageCount
      socketEmitters.removeListeners([
        'messages-history',
        'new-message',
        'poll-updated',
        'more-messages-response'])
    }
  }, [user, chatId]);

  useLayoutEffect(() => {
    if (!displayAutoScrollDown || messages[messages.length - 1].createdBy.id === user.id) {
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
    } else if (messages.length && isLastMessageVisible && displayAutoScrollDown) {
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
    socketEmitters.moreMessage(messages?.length)
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
    socketEmitters.createPoll({ question, options, allowMultipleVotes })
  };

  const handleVotePoll = (pollId: number, optionId: number) => {
    socketEmitters.votePoll({ pollId, optionId })
  };

  const handleRemoveVotePoll = (pollId: number, optionId: number) => {
    socketEmitters.removeVotePoll({ pollId, optionId })
  };

  const handleRemoveAllUserVotesPoll = (pollId: number) => {
    socketEmitters.removeAllVotePoll(pollId)
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

          <button onClick={() => socketEmitters.debugging()}>TEST</button>

          <MessagesList
            messages={messages}
            currentUserId={user.id}
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
