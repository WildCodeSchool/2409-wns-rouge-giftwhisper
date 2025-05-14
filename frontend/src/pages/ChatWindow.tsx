import { FormEvent, useEffect, useRef, useState } from "react";
import { FaLocationArrow } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { IoArrowDownCircle } from "react-icons/io5";
import ChatSelect from "./ChatSelect";
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
  //TODO: Deal with color per user instead of hardcoded colors
  // const giftReceiver = 'Fabriceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id?: number, content: string, createdBy: { first_name: string } }[]>([]);
  const [displayAutoScrollDown, setDisplayAutoScrollDown] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { disconnectSocket, getSocket } = useSocket();
  const user = useCurrentUser();

  useEffect(() => {
    const socket = getSocket();
    socket.on('messages-history', (messages) => {
      setMessages(messages);
    });
    socket.on('new-message', (message) => {
      setMessages((e) => {
        const clone = structuredClone(e);
        clone.push(message);
        //We have to setTimeout before scrolling because sometimes the scroll happens before the dom is refreshed
        //with the new message, thus scrolling only to the top of the message
        setTimeout(() => {
          lastMessageRef.current?.scrollIntoView({ behavior: 'instant' });
        }, 0);
        return clone;
      });
    });
    return () => {
      disconnectSocket();
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const isLastMessageVisible = elementIsVisibleInViewport(lastMessageRef.current!);
      if (!isLastMessageVisible) lastMessageRef.current?.scrollIntoView({ behavior: 'instant' });
    }, 0);
    return () => clearTimeout(timeout);
  }, [messages]);


  const handleScroll = () => {
    const isLastMessageVisible = elementIsVisibleInViewport(lastMessageRef.current!);
    if (!isLastMessageVisible && !displayAutoScrollDown) {
      setDisplayAutoScrollDown(true);
    } else if (isLastMessageVisible && displayAutoScrollDown) {
      setDisplayAutoScrollDown(false);
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.length) return;
    const socket = getSocket();
    socket.emit("message", message);
    setMessage('');
  };

  //TODO: Create a complete page (if not connected) and route guards
  if (!user) {
    return <p>You must be logged in to chat !</p>
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <aside className="bg-[#FAFAFA] px-4 hidden md:flex md:flex-col">
          <ChatSelect />
        </aside>
        <article className=" flex flex-col w-full">
          <div className="flex flex-col flex-1 overflow-hidden">
            <section onScroll={handleScroll} className="overflow-y-auto flex flex-col flex-1 overflow-x-auto p-2 space-y-2">
              {messages.map((message, i) => {
                const isLastItem = i === messages.length - 1;
                return (
                  <div
                    ref={isLastItem ? lastMessageRef : null}
                    key={message.id}
                    className={`flex flex-col max-w-[70%] 
                    ${message.createdBy.first_name !== user.first_name ? '' : 'self-end'}`}
                  >
                    <div className={`flex items-center gap-1 ${message.createdBy.first_name !== user.first_name ? '' : 'flex-row-reverse'}`}>
                      <div className="w-3 h-3 bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] rounded-full"></div>
                      <p className={`pb-1 ${message.createdBy.first_name !== user.first_name ? '' : 'text-right'}`}>{message.createdBy.first_name}</p>
                    </div>
                    <p className={`bg-gradient-to-r break-words w-fit max-w-[100%] from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] rounded-[19px] px-4 py-2 text-sm text-white ${message.createdBy.first_name !== user.first_name ? '' : 'self-end'}`}>
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
      </div>
    </>
  );
}

export default ChatWindow;
