import { Link, useParams } from "react-router-dom";
import { chatColorSchemeGradient } from "@/utils/hardValues/chat";
import { Chat } from "@/utils/types/chat";
import { useEffect } from "react";

type ChatSelectorProps = {
  chat: Chat;
  unreadMessageCountByChat: Record<number, number>;
  setUnreadMessageCountByChat: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}

function getGradientByName(name: string) {
  let colorSchemeGradientIndex = 0;
  for (const char of name) {
    colorSchemeGradientIndex += char.charCodeAt(0);
  }
  const gardient = chatColorSchemeGradient[colorSchemeGradientIndex % chatColorSchemeGradient.length]
  return gardient;
}
function ChatSelector({ chat, unreadMessageCountByChat, setUnreadMessageCountByChat }: ChatSelectorProps) {
  const { chatId } = useParams();
  const lastMessageDate = chat.lastMessageDate
    ? new Date(chat.lastMessageDate).toLocaleDateString()
    : null;

  useEffect(() => {
    if (chatId && Number(chat.id) === Number(chatId)) {
      setUnreadMessageCountByChat((current) => {
        const copy = structuredClone(current);
        copy[chat.id] = 0;
        return copy;
      });
    }
  }, [chatId]);

  return (
    <Link to={`${chat.id}`} className="block w-full">
      <ul className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-gray-50/50 transition-colors duration-200">
        <li className="flex items-center">
          <p
            className={`${getGradientByName(chat.name)} rounded-full w-11 h-11 flex items-center justify-center text-white font-medium transition-transform duration-200 hover:scale-105`}
          >
            {chat.name.charAt(0).toUpperCase()}
          </p>
        </li>
        <li className="flex flex-col items-start gap-0 flex-1">
          <p className="text-xl leading-none font-semibold text-primary text-nowrap">
            Pour {chat.name}
          </p>
          <p className="text-xs text-black mt-0.5">
            {unreadMessageCountByChat[chat.id] > 0 ? `${unreadMessageCountByChat[chat.id]} nouveaux messages` : "Pas de nouveaux messages"}
          </p>
        </li>
        <li className="flex items-center justify-end text-right">
          <p className="font-semibold text-xs text-black">{lastMessageDate}</p>
        </li>
      </ul>
    </Link>
  );
}

export default ChatSelector;
