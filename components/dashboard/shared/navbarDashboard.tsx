"use client"
import { useSidebar } from "@/components/ui/sidebar"
import { Bell, LogOut, User , MenuIcon} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from 'sonner';
import Link from "next/link";
import { useSidebarStore } from "@/store/useSidebarStore"
interface NavbarProps {
    user?: {
        id: string;
        email?: string | null;
        role?: string | 'user';
    }
    pageTitle?: string;
}

export default function NavbarDashboard({ user, pageTitle = "dashboard" }: NavbarProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { state, isMobile } = useSidebar()
    const sidebarWidth = state === "expanded" ? "16rem" : "3rem"
    const userMenuRef = useRef<HTMLDivElement>(null)
    // In NavbarDashboard
    const { toggle } = useSidebarStore()
    const { toggleSidebar } = useSidebar()

    const handleToggle = () => {
        toggle()        // update Zustand (persists)
        toggleSidebar() // update shadcn UI
    }
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showUserMenu]);

    const handleSignOut = async () => {
        try {
            const res = await fetch('/api/admin/logout', { method: 'POST' });
            if (!res.ok) {
                toast.error("Couldn't logout");
            } else {
                toast.success('Logout Successful!');
                window.location.href = "/admin/login";
            }
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error("Logout failed");
        }
    };

    return (
        <div
            className="fixed top-0 z-30 h-20 flex items-center justify-between px-6 bg-[#16A34A] backdrop-blur-md text-white shadow-lg transition-all duration-300"
            style={{
                left: isMobile ? "0" : sidebarWidth,
                width: isMobile ? "100%" : `calc(100% - ${sidebarWidth})`,
            }}
        >
            {/* Left */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={handleToggle}
                    className="text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold capitalize text-white">{pageTitle}</h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <Link href="/admin/notifications" className="relative">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                        <Bell className="w-5 h-5 text-white" />
                        <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </Link>

                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="p-0 transition-colors rounded-full hover:ring-2 hover:ring-white/40"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.email || "Guest"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                    {user?.role === "admin" && "• Admin"}
                                </p>
                            </div>
                            <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors">
                                <User className="w-4 h-4" />
                                Profile
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}