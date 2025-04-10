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
    <Link to={`/chat/${chat.id}`}>
      <ul className="flex items-center w-full gap-4">
        <li className="flex items-center">
          <p
            className={`${chat.gradient} rounded-full w-10 h-10 flex items-center justify-center text-white`}
          >
            {chat.name.charAt(0)}
          </p>
        </li>
        <li className="flex flex-col items-start gap-0 flex-1">
          <p className="text-xl leading-none font-semibold text-primary text-nowrap">
            Pour {chat.name}
          </p>
          <p className="text-xs">{chat.messages} nouveaux messages</p>
        </li>
        <li className="flex items-center justify-end text-right">
          <p className="font-semibold text-xs">{chat.lastMessage}</p>
        </li>
      </ul>
    </Link>
  );
}

export default ChatSelector;
