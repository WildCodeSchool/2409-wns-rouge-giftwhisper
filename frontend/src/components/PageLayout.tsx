import { Outlet } from "react-router-dom";
import { HeaderPage } from "./HeaderPage";

import { HeaderContent } from "./HeaderContent";

export function PageLayout() {
  return (
    <>
      <main className="h-screen flex flex-col">
        <HeaderPage classname="bg-[#D36567] flex items-center h-[64px] md:h-[120px] px-5 py-2 md:px-11 md:py-4">
          <HeaderContent />
        </HeaderPage>
        <Outlet />
      </main>
    </>
  );
}
