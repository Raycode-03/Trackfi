import {
  LayoutDashboard,
  Star,
  Globe,
  ArrowLeftRight,
  BellRing,
  Settings,
} from "lucide-react";
export const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
   { title: "Markets",      url: "/markets",      icon: Globe },
  { title: "Watchlist", url: "/watchlist", icon: Star },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Alerts", url: "/alerts", icon: BellRing },
  { title: "Settings", url: "/settings", icon: Settings },
];