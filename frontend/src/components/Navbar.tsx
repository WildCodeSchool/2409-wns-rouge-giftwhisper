import { Link } from "react-router-dom";
import { Home, LifeBuoy, User, Users, LogOut, ScrollText } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { logout, isLoggingOut } = useAuth();
  const items = [
    {
      title: "Accueil",
      path: "/dashboard",
      icon: Home,
    },
    {
      title: "A propos",
      path: "/about",
      icon: LifeBuoy,
    },
  ];

  const accountItems = [
    {
      title: "Mon profil",
      path: "/profile",
      icon: User,
    },
    {
      title: "Mes groupes",
      path: "/dashboard",
      icon: Users,
    },
    {
      title: "Ma Wishlist",
      path: "/wishlist",
      icon: ScrollText,
    },
    {
      title: "Déconnexion",
      path: "/logout",
      icon: LogOut,
    },
  ];

  // Composant pour les éléments du menu mobile qui ferment le sidebar au clic
  function MobileMenuItem({
    item,
    logoutButton,
  }: {
    item: (typeof items)[0] | (typeof accountItems)[0];
    logoutButton?: boolean;
  }) {
    const { setOpenMobile } = useSidebar();

    if (logoutButton) {
      return (
        <SidebarMenuItem className="p-0">
          <SidebarMenuButton
            asChild
            className="w-full hover:bg-[#FFFBFF]/10 rounded-lg transition-colors duration-200"
          >
            <button
              onClick={() => {
                logout();
                setOpenMobile(false);
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-4 p-3 w-full bg-transparent text-[#D36567] hover:bg-[#D36567] hover:text-[#FFE5E5] transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-[#FFFBFF]/20 p-2 rounded-lg">
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-xl font-medium">
                {isLoggingOut ? "Déconnexion en cours..." : "Déconnexion"}
              </span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

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
          <Link
            to={items[1].path}
            className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="text-[#FFFBFF] text-xl">{items[1].title}</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
              <span className="text-[#FFFBFF] text-xl">Mon compte</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#D36567] border-[#FFFBFF]/20 text-[#FFFBFF]">
              {accountItems.slice(0, -1).map((item) => (
                <DropdownMenuItem key={item.path} asChild className="group">
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 text-[#FFFBFF] transition-colors group-hover:text-primary" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-[#FFFBFF]/20" />
              <DropdownMenuItem asChild>
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 cursor-pointer bg-[#FFFBFF] text-[#D36567] hover:bg-[#D36567] hover:text-[#FFE5E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full px-2 py-1.5 rounded"
                >
                  <LogOut className="h-4 w-4 hover:text-[#FFE5E5] transition-colors" />
                  <span>
                    {isLoggingOut ? "Déconnexion en cours..." : "Déconnexion"}
                  </span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <div className="h-px bg-gray-700 my-4" />
                {accountItems.slice(0, -1).map((item) => (
                  <MobileMenuItem key={item.path} item={item} />
                ))}
                <div className="h-px bg-gray-700 my-4" />
                {accountItems.slice(-1).map((item) => (
                  <MobileMenuItem key={item.path} item={item} logoutButton />
                ))}
              </SidebarMenu>
            </SidebarContent>
          </SidebarUI>
        </SidebarProvider>
      </div>
    </>
  );
}
