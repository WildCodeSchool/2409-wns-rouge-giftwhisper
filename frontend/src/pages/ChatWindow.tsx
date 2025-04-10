import { FormEvent, useEffect, useRef, useState } from "react";
import { FaLocationArrow } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { IoArrowDownCircle } from "react-icons/io5";

const baseMessages = [
  { id: 1, author: 'me', text: 'Hi, our first message on this awesome app :) !' },
  { id: 2, author: 'jean-claude', text: "Pourquoi qu'il parle en anglais lui" },
  { id: 3, author: 'me', text: 'Oooooh, sacré Jean-Claude haha' },
  { id: 4, author: 'murielle', text: "Est ce que c'est ça google ?" },
  { id: 5, author: 'murielle', text: "recette tarte citron meringuée" },
  { id: 6, author: 'me', text: "Seigneur, à l'aide" },
  { id: 7, author: 'jean-claude', text: "Apéro !" },
  { id: 8, author: 'jean-claude', text: "Apéro !" },
];

const elementIsVisibleInViewport = (el: HTMLDivElement, partiallyVisible = false) => {
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
  const [messages, setMessages] = useState<{ id: number, text: string, author: string }[]>(baseMessages);
  const [displayAutoScrollDown, setDisplayAutoScrollDown] = useState(false);
  const bottomChat = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const isLastMessageVisible = elementIsVisibleInViewport(bottomChat.current!);
    if (isLastMessageVisible) bottomChat.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);


  const handleScroll = () => {
    const isLastMessageVisible = elementIsVisibleInViewport(bottomChat.current!);
    if (!isLastMessageVisible && !displayAutoScrollDown) {
      setDisplayAutoScrollDown(true);
    } else if (isLastMessageVisible && displayAutoScrollDown) {
      setDisplayAutoScrollDown(false);
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessages((e) => {
      const messagesCopy = structuredClone(e);
      const nextId = e[e.length - 1].id + 1;
      messagesCopy.push({ id: nextId, author: 'me', text: message });
      return messagesCopy;
    });
    setMessage('');
    //We have to setTimeout before scrolling because sometimes the scroll happens before the dom is refreshed
    //with the new message, thus scrolling only to the top of the message
    setTimeout(() => {
      bottomChat.current?.scrollIntoView({ behavior: 'instant'});
    }, 0);
  };

  return (
    <>
      <article className="h-screen flex flex-col overflow-hidden">
        {/* <header className="bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] h-10 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4 max-w-[90%]">
            <Link to="/">
              <FaArrowLeft color="white" />
            </Link>
            <h1 className="text-white text-lg truncate">{`Pour ${giftReceiver}`}</h1>
          </div>
          <button>
            <IoIosInformationCircleOutline color="white" size={30} />
          </button>
        </header> */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <section onScroll={handleScroll} className="overflow-y-auto flex flex-col flex-1 overflow-x-auto p-2 space-y-2">
            {messages.map((message) => {
              return (
                <div key={message.id} className={`flex flex-col max-w-[70%] ${message.author !== 'me' ? '' : 'self-end'}`}>
                  <div className={`flex items-center gap-1 ${message.author !== 'me' ? '' : 'flex-row-reverse'}`}>
                    <div className="w-3 h-3 bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] rounded-full"></div>
                    <p className={`pb-1 ${message.author !== 'me' ? '' : 'text-right'}`}>{message.author}</p>
                  </div>
                  <p className={`bg-gradient-to-r break-words w-fit max-w-[100%] from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] rounded-[19px] px-4 py-2 text-sm text-white ${message.author !== 'me' ? '' : 'self-end'}`}>
                    {message.text}
                  </p>
                </div>
              );
            })}
            <div ref={bottomChat}></div>
          </section>
          <button
            onClick={() => bottomChat.current?.scrollIntoView({ behavior: 'instant' })}
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
    </>
  );
}

export default ChatWindow;
