import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaLocationArrow } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { IoArrowDownCircle } from "react-icons/io5";
import { useSocket } from "@/hooks/socket";
import { useCurrentUser } from "@/hooks/currentUser";

const elementIsVisibleInViewport = (el: Element, partiallyVisible = false) => {
  if (!el) return null;
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
      (bottom > 0 && bottom < innerHeight)) &&
    ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

function ChatWindow() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id?: number, content: string, createdBy: { first_name: string, id: number } }[] | undefined>(undefined);
  const [displayAutoScrollDown, setDisplayAutoScrollDown] = useState(false);
  const [displayMoreMessage, setDisplayMoreMessage] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const { disconnectSocket, getSocket } = useSocket();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.on('messages-history', (messages) => {
      setMessages(messages);
    });
    socket.on('new-message', (message) => {
      setMessages((e) => {
        const clone = e ? structuredClone(e) : [];
        clone.push(message);
        return clone;
      });
    });
    socket.on('more-messages-response', (previousMessages) => {
      setMessages((e) => {
        const copy = structuredClone(e) ?? [];
        const messagesFromDb = previousMessages ?? [];
        const updatedMessages = [...messagesFromDb, ...copy];
        return updatedMessages;
      });
      //TODO: The previous first message should be at the bottom of the container ( not the top )
      //There doesn't appear to be an easy way to do this
      firstMessageRef.current?.scrollIntoView()
    });
    return () => {
      disconnectSocket();
    }
  }, [user]);


  useLayoutEffect(() => {
    if (!displayMoreMessage) {
      lastMessageRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages]);


  const handleScroll = () => {
    const isLastMessageVisible = elementIsVisibleInViewport(lastMessageRef.current!);
    const isFirstMessageVisible = elementIsVisibleInViewport(firstMessageRef.current!)
    if (!isLastMessageVisible && !displayAutoScrollDown) {
      setDisplayAutoScrollDown(true);
    } else if (isLastMessageVisible && displayAutoScrollDown) {
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
    const socket = getSocket();
    socket.emit('more-messages', { skip: messages?.length });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.length) return;
    const socket = getSocket();
    socket.emit("message", message);
    setMessage('');
  };

  //TODO: Create a loading page / component
  if (loading) {
    return <p>Loading ...</p>
  }

  //Route guard should prevent any unauthorized user from reaching this page
  if (!user) {
    return null;
  }
  return (
    <article className=" flex flex-col w-full">
      <div className="flex flex-col flex-1 overflow-hidden">
        <button
          onClick={loadMoreMessages}
          className={`
              ${!displayMoreMessage ? 'hidden' : ''}`}>
          Load more
        </button>
        <section onScroll={handleScroll} className="overflow-y-auto flex flex-col flex-1 overflow-x-auto p-2 space-y-2">
          {messages && messages.map((message, i) => {
            const isLastItem = i === messages.length - 1;
            const currentUserId = Number(user.id);
            return (
              <div
                ref={isLastItem ? lastMessageRef : i === 0 ? firstMessageRef : null}
                key={message.id}
                className={`flex flex-col max-w-[70%] 
                    ${message.createdBy.id !== currentUserId ? '' : 'self-end'}`}
              >
                <div className={`flex items-center gap-1 ${message.createdBy.id !== currentUserId ? '' : 'flex-row-reverse'}`}>
                  <div className="w-3 h-3 bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] rounded-full"></div>
                  <p className={`pb-1 ${message.createdBy.id !== currentUserId ? '' : 'text-right'}`}>{message.createdBy.first_name}</p>
                </div>
                <p className={`bg-gradient-to-r break-words w-fit max-w-[100%] from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] rounded-[19px] px-4 py-2 text-sm text-white ${message.createdBy.id !== currentUserId ? '' : 'self-end'}`}>
                  {message.content}
                </p>
              </div>
            );
          })}
        </section>
        <button
          onClick={() => lastMessageRef.current?.scrollIntoView({ behavior: 'instant' })}
          className={`
              absolute bottom-20 left-1/2 transform -translate-x-1/2
              'translate-y-5 opacity-0 pointer-events-none'
              transition-all duration-300 ease-in-out 
              ${displayAutoScrollDown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}
            `}
        >
          <IoArrowDownCircle size={28} color="#d5d5d5" />
        </button>
        <form className="flex items-center gap-3 justify-between p-4" onSubmit={submit}>
          <div className="flex items-center gap-2 bg-[#F3F3F3] p-0.5 rounded-2xl shadow-md w-[100%]">
            <button className="rounded-full ml-2 p-0 bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB]">
              <IoAdd size={22} color="white" />
            </button>
            <input
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              name="chat-message"
              id="chat-message"
              type="text"
              className="w-full h-9 focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-full p-2 bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] shadow-md">
            <FaLocationArrow color="white" size={16} />
          </button>
        </form>
      </div>
    </article>
  )
}

export default ChatWindow;