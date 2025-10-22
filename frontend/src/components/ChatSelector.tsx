import { Link, useParams } from "react-router-dom";
import { chatColorSchemeGradient } from "@/utils/hardValues/chat";
import { Chat } from "@/utils/types/chat";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/currentUser";
import { GiftIcon, SnowflakeIcon } from "lucide-react"


type ChatSelectorProps = {
  chat: Chat;
  unreadMessageCountByChat: Record<number, number>;
  setUnreadMessageCountByChat: React.Dispatch<
    React.SetStateAction<Record<number, number>>
  >;
};

function getGradientByName(name: string) {
  let colorSchemeGradientIndex = 0;
  for (const char of name) {
    colorSchemeGradientIndex += char.charCodeAt(0);
  }
  const gardient =
    chatColorSchemeGradient[
    colorSchemeGradientIndex % chatColorSchemeGradient.length
    ];
  return gardient;
}
function ChatSelector({
  chat,
  unreadMessageCountByChat,
  setUnreadMessageCountByChat,
}: ChatSelectorProps) {
  const { chatId } = useParams();
  const { user } = useCurrentUser();
  const lastMessageDate = chat.lastMessageDate
    ? new Date(chat.lastMessageDate).toLocaleDateString()
    : null;

  useEffect(() => {
    if (isSelected) {
      setUnreadMessageCountByChat((current) => {
        const copy = structuredClone(current);
        copy[chat.id] = 0;
        return copy;
      });
    }
  }, [chatId]);

  const isSelected = chatId && Number(chat.id) === Number(chatId);

  let chatName = chat.name;
  let chatIcon = <GiftIcon />;
  if (chat.group.is_secret_santa) {
    const [receiver] = chat.name.split(' ');
    const [_, receiverId, receiverName] = receiver.split('_');
    const isReceiver = Number(receiverId) === Number(user?.id);
    if (isReceiver) {
      chatName = "Je reçois de ?";
    } else {
      chatName = `J'offre à ${receiverName}`;
      chatIcon = <SnowflakeIcon />;
    }
  }

  return (
    <Link
      to={`${chat.id}`}
      className={`block w-full transition-colors duration-200 ${isSelected ? "bg-black/5" : "hover:bg-black/5"
        }`}
    >
      <ul className="flex items-center w-full gap-4 p-3 px-4 ">
        <li className="flex items-center">
          <p
            className={`${getGradientByName(
              chat.name
            )} rounded-full w-11 h-11 flex items-center justify-center text-white font-medium transition-transform duration-200 hover:scale-105`}
          >
            {chat.group.is_secret_santa ? chatIcon : chatName.charAt(0).toUpperCase()}
          </p>
        </li>
        <li className="flex flex-col items-start gap-0 flex-1">
          <p className="text-xl leading-none font-semibold text-primary text-nowrap">
            {chat.group.is_secret_santa ? chatName : `Pour ${chatName}`}
          </p>
          <p className="text-xs text-black mt-0.5">
            {unreadMessageCountByChat[chat.id] > 0
              ? `${unreadMessageCountByChat[chat.id]} nouveaux messages`
              : "Pas de nouveaux messages"}
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
