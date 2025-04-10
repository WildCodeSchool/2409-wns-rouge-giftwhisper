import { FormEvent, useState } from "react";
// import { Link } from "react-router-dom";
// import { FaArrowLeft } from "react-icons/fa6";
// import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaLocationArrow } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";

const baseMessages = [
  { id: 1, author: 'me', text: 'Hi, our first message on this awesome app :) !' },
  { id: 2, author: 'jean-claude', text: "Pourquoi qu'il parle en anglais lui" },
  { id: 3, author: 'me', text: 'Oooooh, sacré Jean-Claude haha' },
  { id: 4, author: 'murielle', text: "Est ce que c'est ça google ?" },
  { id: 5, author: 'murielle', text: "recette tarte citron meringuée" },
  { id: 6, author: 'me', text: "Seigneur, à l'aide" },
  { id: 7, author: 'jean-claude', text: "Apéro !" },
];

function ChatWindow() {
  //TODO: Deal with a way to scroll down when new messages are posted
  // const giftReceiver = 'Fabriceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(baseMessages);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.length) return;
    setMessages((e) => {
      const messagesCopy = structuredClone(e);
      const nextId = e[e.length - 1].id + 1;
      messagesCopy.push({ id: nextId, author: 'me', text: message });
      return messagesCopy;
    });
    setMessage('');
  };

  return (
    <>
      <article className="h-screen flex flex-col">
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
          <section className="overflow-y-auto flex flex-col flex-1 overflow-x-auto p-2 space-y-2">
            {messages.map((message) => {
              return (
                <div key={message.id} className={`flex flex-col max-w-[70%] ${message.author !== 'me' ? 'self-end' : ''}`}>
                  <div className={`flex items-center gap-1 ${message.author !== 'me' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-3 h-3 bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] rounded-full"></div>
                    <p className={`pb-1 ${message.author !== 'me' ? 'text-right' : ''}`}>{message.author}</p>
                  </div>
                  <p className={`bg-gradient-to-r break-words w-fit max-w-[100%] from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] rounded-[19px] px-4 py-2 text-sm text-white ${message.author !== 'me' ? 'self-end' : ''}`}>
                    {message.text}
                  </p>
                </div>
              );
            })}
          </section>
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
