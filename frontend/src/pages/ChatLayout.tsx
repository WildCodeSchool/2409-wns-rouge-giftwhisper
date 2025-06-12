import { Outlet } from "react-router-dom";
import ChatSelect from "./ChatSelect";
import { socketConnection } from "@/hooks/socket";
import { useEffect } from "react";

function ChatLayout() {
  const { disconnectSocket, getSocket } = socketConnection();

  useEffect(() => {
    getSocket();
    return () => disconnectSocket();
  }, []);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <aside className="bg-[#FAFAFA] px-4 hidden md:flex md:flex-col">
          <ChatSelect />
        </aside>
        <Outlet />
      </div>
    </>
  );
}

export default ChatLayout;
