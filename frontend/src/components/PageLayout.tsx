import { Outlet, useLocation } from "react-router-dom";
import { HeaderPage } from "./HeaderPage";
import { HeaderContent } from "./HeaderContent";
import { Footer } from "./Footer";

export function PageLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.includes("/chat-window");

  return (
    <>
      <main className="h-screen flex flex-col">
        <HeaderPage classname="bg-[#D36567] flex items-center h-[64px] md:h-[120px] px-5 py-2 md:px-11 md:py-4">
          <HeaderContent />
        </HeaderPage>
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
        {!isChatPage && <Footer />}
      </main>
    </>
  );
}
