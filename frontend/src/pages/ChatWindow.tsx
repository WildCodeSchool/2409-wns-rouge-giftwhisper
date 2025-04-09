import { FormEvent, useState } from "react";

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
  const giftReceiver = 'Fabrice';
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
      <article className="chat-window">
        <h1>⬅️ Pour {giftReceiver}</h1>
        <section className="messages">
          {messages.map((message) => {
            return (
              <div key={message.id} className={`message${message.author !== 'me' ? ' align-right' : ''}`}>
                <p>{message.author} : {message.text}</p>
              </div>
            )
          })}
        </section>
        <form className="message-form" onSubmit={submit}>
          <input value={message} onChange={(e) => setMessage(e.currentTarget.value)} name="chat-message" id="chat-message" type="text" />
          <button type="submit">➡️</button>
        </form>
      </article>
    </>
  )
}

export default ChatWindow;