"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import Image from "next/image";
import MediaDisplay from "@/components/common/mediaDisplay";
import { userItems } from "@/lib/constants/sidebar";


export function AppSidebar({ user }) {
  const { isOpen } = useSidebarStore();
  const { setOpen } = useSidebar();
  const isMobile = useIsMobile();
  const showText = isMobile ? true : isOpen;
  const shortDisplayName =
  user?.name?.length > 12
    ? `${user?.name.slice(0, 12)}...`
    : user?.name;

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        toast.error("Couldn't logout");
      } else {
        toast.success("Logout Successful!");
        window.location.href = "/login";
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen bg-[#131313] border-r border-white/5 flex flex-col"
    >
      {/* LOGO */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b h-20 border-white/10 ${!showText ? "justify-center px-0" : ""}`}
      >
        <div className="flex items-center justify-center shrink-0">
          <Image
            src="/logos/trackfi.svg"
            alt="Trackfi Logo"
            width={56}
            height={56}
          />
        </div>
        {showText && (
          <div>
            <h1 className="text-white font-bold text-base leading-none mb-2">
              Trackfi
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Luminescent Ledger
            </p>
          </div>
        )}
      </div>

      {/* NAV ITEMS */}
      <SidebarContent className="flex-1 py-4">
        <SidebarMenu className="space-y-1 px-2">
          {userItems.map((item) => (
            <SidebarMenuItem key={item.title}>
    <SidebarMenuButton
      asChild
      tooltip={!showText ? item.title : undefined}
              >
              <Link
                href={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-colors ${!showText ? "justify-center" : ""}`}
               >
               <item.icon size={18} />
               {showText && (
                 <span className="text-sm font-medium">{item.title}</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* BOTTOM SECTION */}
      <div className="mt-auto border-t border-white/10 px-2 py-4 space-y-1">
        {/* Support */}
        <Link
          href="/support"
          className={`flex items-center gap-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-colors ${!showText ? "justify-center py-2" : "px-3 py-3"} mb-4`}
        >
          <HelpCircle size={18}/>
          {showText && <span className="text-sm font-medium">Support</span>}
        </Link>


        {/* User row */}
        <div
          className={`flex items-center gap-3 px-3 py-5.5 rounded-lg ${!showText ? "justify-center" : "justify-between bg-form"} `}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 p-2">
                  <MediaDisplay image_url={user.image} name={user?.name ||  user?.email.split("@")[0]} />
            </div>
            {showText && (
              <div>
                <p className="text-sm text-white font-medium leading-none">
                  {shortDisplayName?.toUpperCase() || user?.email.split("@")[0].toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{user.package_type.charAt(0).toUpperCase() + user.package_type.slice(1)} Plan</p>
              </div>
            )}
          </div>
          {showText && (
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
