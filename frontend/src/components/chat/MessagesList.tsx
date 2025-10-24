import { MessageItem } from "./MessageItem";
import { Message } from "@/utils/types/chat";

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
  onScroll: () => void;
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  firstMessageRef: React.RefObject<HTMLDivElement | null>;
  onVote: (pollId: number, optionId: number) => void;
  onRemoveVote: (pollId: number, optionId: number) => void;
  onRemoveAllVotes: (pollId: number) => void;
  chatGradient: string;
  isSecretSanta?: boolean;
  receiverName?: string;
}

export function MessagesList({
  messages,
  currentUserId,
  onScroll,
  lastMessageRef,
  firstMessageRef,
  onVote,
  onRemoveVote,
  onRemoveAllVotes,
  chatGradient,
  isSecretSanta = false,
  receiverName = "",
}: MessagesListProps) {
  return (
    <section onScroll={onScroll} className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
      <div className="flex flex-col space-y-3 min-h-full justify-end">
        {messages &&
          messages.map((message, i) => {
            const isLastItem = i === messages.length - 1;
            const isFirstItem = i === 0;

            return (
              <MessageItem
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                isLastItem={isLastItem}
                isFirstItem={isFirstItem}
                lastMessageRef={isLastItem ? lastMessageRef : undefined}
                firstMessageRef={isFirstItem ? firstMessageRef : undefined}
                onVote={onVote}
                onRemoveVote={onRemoveVote}
                onRemoveAllVotes={onRemoveAllVotes}
                chatGradient={chatGradient}
                isSecretSanta={isSecretSanta}
                receiverName={receiverName}
              />
            );
          })}
      </div>
    </section>
  );
}
