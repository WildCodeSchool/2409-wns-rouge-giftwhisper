import { FormEvent } from "react";
import { ChatActionsDropdown } from "./ChatActionsDropdown";
import { SendButton } from "./SendButton";

interface ChatInputFormProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCreatePoll: () => void;
}

export function ChatInputForm({
  message,
  onMessageChange,
  onSubmit,
  onCreatePoll,
}: ChatInputFormProps) {
  return (
    <div className="border-t border-slate-100 bg-white p-4">
      <form className="flex items-center gap-3" onSubmit={onSubmit}>
        <div className="flex items-center gap-2 bg-slate-50 rounded-full px-2 py-1.5 flex-1 focus-within:ring-2 focus-within:ring-[#A18CD1]/50 transition-all duration-200">
          <ChatActionsDropdown onCreatePoll={onCreatePoll} />

          <input
            placeholder="Tapez votre message..."
            value={message}
            onChange={(e) => onMessageChange(e.currentTarget.value)}
            name="chat-message"
            id="chat-message"
            type="text"
            className="flex-1 py-2 px-3 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-sm"
          />
        </div>

        <SendButton
          disabled={!message.trim()}
        />
      </form>
    </div>
  );
}
