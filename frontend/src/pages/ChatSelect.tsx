import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import ChatSelector from "@/components/ChatSelector";

interface Chat {
  id: number;
  name: string;
  messages: number;
  lastMessage: string;
  gradient: string;
}

const chats: Chat[] = [
  {
    id: 1,
    name: "Jean-Claude",
    messages: 8,
    lastMessage: "hier",
    gradient: "bg-gradient-to-r from-pink-500 to-orange-400",
  },
  {
    id: 2,
    name: "Sten",
    messages: 15,
    lastMessage: "aujourd'hui",
    gradient: "bg-gradient-to-r from-green-400 to-blue-500",
  },
  {
    id: 3,
    name: "Priscilla",
    messages: 12,
    lastMessage: "15/06/2024",
    gradient: "bg-gradient-to-r from-purple-500 to-pink-400",
  },
  {
    id: 4,
    name: "Jérémy",
    messages: 5,
    lastMessage: "hier",
    gradient: "bg-gradient-to-r from-yellow-400 to-red-500",
  },
  {
    id: 5,
    name: "Isil",
    messages: 21,
    lastMessage: "10/06/2024",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-500",
  },
  {
    id: 6,
    name: "Axel",
    messages: 9,
    lastMessage: "02/06/2024",
    gradient: "bg-gradient-to-r from-cyan-500 to-blue-400",
  },
];

function ChatSelect() {
  const navigate = useNavigate();
  const groupId = 1; // À remplacer par le vrai ID du groupe
  return (
    <>
      <header className="pt-10 px-4 flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList className="flex flex-col items-start gap-0 leading-none">
            <div className="flex items-center gap-1">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-primary/60 uppercase hover:text-primary/80 transition-colors duration-200">
                  Mes groupes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary/60" />
            </div>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold text-2xl uppercase">
                NomDuGroupe
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <button
          className="bg-primary rounded-full p-2 text-white shadow-lg cursor-pointer hover:scale-110 hover:shadow-md"
          onClick={() => navigate(`/group/${groupId}/settings`)}
        >
          <Settings size={25} className="rounded-full spin-once hover:spin-once" />
        </button>
      </header>
      <section className="px-4 flex flex-col gap-4 pt-10">
        {chats.map((chat) => (
          <ChatSelector key={chat.id} chat={chat} />
        ))}
      </section>
    </>
  );
}

export default ChatSelect;
