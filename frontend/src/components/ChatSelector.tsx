import { Link } from "react-router-dom";

interface Chat {
  id: number;
  name: string;
  messages: number;
  lastMessage: string;
  gradient: string;
}

function ChatSelector({ chat }: { chat: Chat }) {
  return (
    <Link to={`${chat.id}`} className="block w-full">
      <ul className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-gray-50/50 transition-colors duration-200">
        <li className="flex items-center">
          <p
            className={`${chat.gradient} rounded-full w-11 h-11 flex items-center justify-center text-white font-medium transition-transform duration-200 hover:scale-105`}
          >
            {chat.name.charAt(0)}
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
