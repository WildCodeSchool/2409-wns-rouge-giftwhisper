import { Link } from "react-router-dom";
import { chatColorSchemeGradient } from "@/utils/hardValues/chat";
import { Chat } from "@/utils/types/chat";

function getGradientByName(name: string) {
  let colorSchemeGradient = 0;
  for (const char of name) {
    colorSchemeGradient += char.charCodeAt(0);
  }
  const gardient = chatColorSchemeGradient[colorSchemeGradient % chatColorSchemeGradient.length]
  return gardient;
}

function ChatSelector({ chat }: { chat: Chat }) {
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
            {chat.messages} nouveaux messages
          </p>
        </li>
        <li className="flex items-center justify-end text-right">
          <p className="font-semibold text-xs text-black">{chat.lastMessage}</p>
        </li>
      </ul>
    </Link>
  );
}

export default ChatSelector;
