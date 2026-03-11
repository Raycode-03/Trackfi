"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Utensils,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Menu as MenuIcon,
  Clock,
  Bell,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/store/useSidebarStore";
// -------------------- MENUS --------------------

export const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Menu Management", url: "/admin/menu", icon: Utensils },
  { title: "Staff Management", url: "/admin/staff", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export const staffItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Active Orders", url: "/staff/orders", icon: ShoppingCart },
  { title: "Menu", url: "/staff/menu", icon: MenuIcon },
  { title: "My Shifts", url: "/staff/shifts", icon: Clock },
  { title: "Notifications", url: "/staff/notifications", icon: Bell },
  { title: "Settings", url: "/staff/settings", icon: Settings },
];

export const userItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Menu", url: "/menu", icon: Utensils },
  { title: "My Orders", url: "/orders", icon: ShoppingCart },
  { title: "Reservations", url: "/reservations", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

// -------------------- SIDEBAR --------------------

export function AppSidebar({ userRole }) {
  const { isOpen } = useSidebarStore()
  const { setOpen } = useSidebar();

  // Sync shadcn with Zustand
  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const menuItems =
    userRole === "admin"
      ? adminItems
      : userRole === "staff"
        ? staffItems
        : userItems;

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen shadow-xl transition-all duration-200
  bg-[#16A34A]/90 dark:bg-[#16A33D]/95 border-r border-white/10"
    >
      {/* ---------- HEADER ---------- */}
      <div className={`flex  items-center justify-center ${!isOpen ? 'pt-10' : 'p-0'}`}>
        {isOpen && (
          <Link href="/">
            <Image
              src="/logos/savory_icon.png"
              alt="Savory & co logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </Link>
        )}
      </div>
      {/* ---------- NAVIGATION ---------- */}
      <SidebarContent className="flex-1">
        <SidebarGroup>
          {isOpen && (
            <SidebarGroupLabel className="text-xs font-semibold text-white/70 uppercase tracking-wider px-3">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <Link
                            href={item.url}
                            className={`group flex items-center gap-3 p-3 rounded-lg
                            text-white transition-colors
                            hover:bg-white/10
                            ${!isOpen ? "justify-center" : ""}`}
                          >
                            <item.icon size={20} className="text-white" />

                            {isOpen && (
                              <span className="font-medium">
                                {item.title}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>

                      {!isOpen && (
                        <TooltipContent side="right" className="text-sm">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
