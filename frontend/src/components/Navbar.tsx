import { Link } from "react-router-dom";
import { Home, LifeBuoy, Settings } from "lucide-react";

import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function Navbar() {
  const items = [
    {
      title: "Giftwhisper",
      path: "/dashboard",
      icon: Home,
    },
    {
      title: "A propos",
      path: "/about",
      icon: LifeBuoy,
    },
    {
      title: "Paramètres",
      path: "/settings",
      icon: Settings,
    },
  ];

  // Composant pour les éléments du menu mobile qui ferment le sidebar au clic
  function MobileMenuItem({ item }: { item: (typeof items)[0] }) {
    const { setOpenMobile } = useSidebar();

    return (
      <SidebarMenuItem className="p-0">
        <SidebarMenuButton
          asChild
          className="w-full hover:bg-[#FFFBFF]/10 rounded-lg transition-colors duration-200"
        >
          <Link
            to={item.path}
            className="flex items-center gap-4 p-3"
            onClick={() => setOpenMobile(false)}
          >
            <div className="bg-[#FFFBFF]/20 p-2 rounded-lg">
              <item.icon className="h-6 w-6" />
            </div>
            <span className="text-xl font-medium">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <>
      {/* Version Desktop - Navigation horizontale classique */}
      <nav className="hidden md:flex w-full items-center justify-between">
        {/* Bloc gauche: Logo + Giftwhisper */}
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <img
              src="/giftwhisper-logo.svg"
              alt="Logo"
              className="w-auto h-12 max-w-[65.72px]"
            />
            <span className="text-[#FFFBFF] text-3xl">Giftwhisper</span>
          </Link>
        </div>

        {/* Bloc droite: A propos + Paramètres */}
        <div className="flex items-center gap-8">
          {items.slice(1).map((item) => (
            <Link
              to={item.path}
              key={item.path}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span className="text-[#FFFBFF] text-xl">{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Version Mobile - SidebarProvider doit envelopper tout le contenu y compris le trigger */}
      <div className="md:hidden w-full">
        <SidebarProvider defaultOpen={false} className="w-full">
          <div className="flex items-center w-full justify-between">
            <SidebarTrigger className="text-[#FFFBFF] px-0 pl-0 ml-0" />
            <div className="ml-2">
              <Link to="/dashboard" className="flex items-center gap-2">
                <img
                  src="/giftwhisper-logo.svg"
                  alt="Logo"
                  className="w-[50.9px] h-[47px]"
                />
              </Link>
            </div>
          </div>

          <SidebarUI className="bg-gradient-to-b from-[#D36567] to-[#963B3C] text-[#FFFBFF] border-r-0 shadow-xl">
            <SidebarHeader className="flex justify-between items-center py-6 px-4 border-b border-[#FFFBFF]/20">
              <h2 className="text-2xl font-bold text-[#FFFBFF]">Giftwhisper</h2>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarMenu className="space-y-4">
                {items.map((item) => (
                  <MobileMenuItem key={item.path} item={item} />
                ))}
              </SidebarMenu>
            </SidebarContent>
          </SidebarUI>
        </SidebarProvider>
      </div>
    </>
  );
}
