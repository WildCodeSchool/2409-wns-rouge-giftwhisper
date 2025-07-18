import { Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import ChatSelector from "@/components/ChatSelector";
import { useQuery } from "@apollo/client";
import { GET_CHAT_BY_GROUP_ID } from "@/api/chat";
import { Chat } from "@/utils/types/chat";

function ChatSelect() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { data, loading } = useQuery<{ getChatsByGroup: Chat[] }>(GET_CHAT_BY_GROUP_ID, {
    variables: { groupId }
  });
  if (!data?.getChatsByGroup) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-[#A18CD1] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  const chats = data.getChatsByGroup;
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
