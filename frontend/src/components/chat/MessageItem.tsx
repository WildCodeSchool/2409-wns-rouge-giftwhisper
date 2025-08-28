import { PollMessage } from "../PollMessage";
import { Poll } from "@/utils/types/chat";

interface MessageItemProps {
  message: {
    id?: number;
    content: string;
    createdBy: { first_name: string; id: number };
    messageType?: string;
    poll?: Poll;
  };
  currentUserId: number;
  isLastItem: boolean;
  isFirstItem: boolean;
  lastMessageRef?: React.RefObject<HTMLDivElement | null>;
  firstMessageRef?: React.RefObject<HTMLDivElement | null>;
  onVote: (pollId: number, optionId: number) => void;
  onRemoveVote: (pollId: number, optionId: number) => void;
  onRemoveAllVotes: (pollId: number) => void;
  chatGradient: string;
}

export function MessageItem({
  message,
  currentUserId,
  isLastItem,
  isFirstItem,
  lastMessageRef,
  firstMessageRef,
  onVote,
  onRemoveVote,
  onRemoveAllVotes,
  chatGradient,
}: MessageItemProps) {
  const isOwnMessage = message.createdBy.id === currentUserId;

  return (
    <div
      ref={isLastItem ? lastMessageRef : isFirstItem ? firstMessageRef : null}
      key={message.id}
      className={`flex flex-col ${
        message.messageType === "poll"
          ? "w-full max-w-[90%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[40%]"
          : "max-w-[75%]"
      } ${isOwnMessage ? "self-end items-end" : "self-start items-start"}`}
    >
      {/* User Name */}
      <div
        className={`flex items-center gap-2 mb-1 ${
          isOwnMessage ? "flex-row-reverse" : ""
        }`}
      >
        <div className={`w-2 h-2 ${chatGradient} rounded-full`}></div>
        <span className="text-xs text-slate-500 font-medium">
          {message.createdBy.first_name}
        </span>
      </div>

      {/* Message Content */}
      {message.messageType === "poll" && message.poll ? (
        <PollMessage
          poll={message.poll}
          currentUserId={currentUserId}
          onVote={onVote}
          onRemoveVote={onRemoveVote}
          onRemoveAllVotes={onRemoveAllVotes}
        />
      ) : (
        <div
          className={`px-4 py-2.5 rounded-2xl text-white text-sm leading-relaxed shadow-sm ${
            chatGradient
              ? chatGradient
              : "bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB]"
          } ${isOwnMessage ? "rounded-br-sm" : "rounded-bl-sm"}`}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}
