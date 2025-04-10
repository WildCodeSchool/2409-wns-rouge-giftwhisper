import { useLocation } from "react-router-dom";
import { LandingPageHeader } from "./LandingPageHeader";
import { ChatRoomHeaderMobile } from "./ChatRoomHeaderMobile";
import { Navbar } from "./Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderContent() {
    const location = useLocation();
    const isMobile = useIsMobile();
    
    if ((location.pathname === '/' ||  location.pathname === '/sign-in' || location.pathname === '/sign-up')) {
        return <LandingPageHeader />;
    }

    if (location.pathname === '/chat-window' && isMobile) {
        return <ChatRoomHeaderMobile />;
    } else {
        return <Navbar />;
    }
  }