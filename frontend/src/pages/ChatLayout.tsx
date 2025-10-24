import { Outlet, useParams } from "react-router-dom";
import ChatSelect from "./ChatSelect";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useIsMobile } from "@/hooks/use-mobile";

function ChatLayout() {
  const { groupId, chatId } = useParams<{ groupId: string; chatId?: string }>();
  const isMobile = useIsMobile();
  const { disconnectSocket, getSocket } = useSocket(groupId);

  useEffect(() => {
    if (groupId) {
      getSocket(groupId);
      return () => disconnectSocket();
    }
  }, [groupId]);

  //TODO: Redirection page;
  if (!groupId) {
    return null;
  }

  return (
    <>
      <div className="flex h-full overflow-hidden">
        {/* Desktop: Toujours afficher la sidebar */}
        <aside className="bg-[#FAFAFA] hidden md:flex md:flex-col">
          <ChatSelect />
        </aside>

        {/* Mobile: Afficher ChatSelect si pas de chatId, sinon l'Outlet */}
        {isMobile ? (
          <>
            {!chatId ? (
              <div className="flex flex-col w-full md:hidden">
                <ChatSelect />
              </div>
            ) : (
              <div className="flex flex-col w-full md:hidden">
                <Outlet />
              </div>
            )}
          </>
        ) : (
          /* Desktop: Toujours afficher l'Outlet */
          <Outlet />
        )}
      </div>
    </>
  );
}

export default ChatLayout;
