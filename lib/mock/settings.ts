// lib/mock/settings.ts
import { AppSettings } from "@/types/settings";

export const mockSettings: AppSettings = {
  profile: {
    id: "user_001",
    firstName: "Samantha",
    lastName: "William",
    email: "sam@email.com",
    emailVerified: true,
    phone: "+1 (555) 123-4567",
    photo: "/images/person1.jpg",
    bio: "Crypto enthusiast and portfolio tracker",
    preferredCurrency: "USD",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2024-05-20T14:22:10Z",
  },
  notifications: {
    emailNotifications: true,
    priceAlerts: true,
    portfolioUpdates: true,
    weeklyReport: true,
    pushNotifications: true,
    notificationChannels: ["email", "push"],
  },
  security: {
    twoFactorEnabled: true,
    twoFactorMethod: "authenticator",
    loginAlerts: true,
    ipWhitelist: false,
    whitelistedIPs: [],
    sessionTimeout: 30,
  },
  integrations: [
    {
      id: "int_001",
      provider: "binance",
      name: "Binance",
      status: "connected",
      connectedAt: "2024-03-10T08:15:00Z",
      lastSyncedAt: "2024-05-20T14:20:00Z",
      description: "Connect your Binance account to sync trades",
      icon: "🔶",
    },
    // {
    //   id: "int_002",
    //   provider: "coinbase",
    //   name: "Coinbase",
    //   status: "connected",
    //   connectedAt: "2024-04-05T12:30:00Z",
    //   lastSyncedAt: "2024-05-20T13:45:00Z",
    //   description: "Connect your Coinbase account for real-time updates",
    //   icon: "🔵",
    // },
    
  ],
};
