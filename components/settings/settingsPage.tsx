"use client";
import React, { useState } from "react";
import {
  useProfile,
  useNotificationSettings,
  useSecuritySettings,
  useIntegrations,
} from "@/lib/query/settings";
import { ProfileForm } from "./profileForm";
import { NotificationsForm } from "./notificationsForm";
import { SecurityForm } from "./securityForm";
import { User, Bell, Shield, Link2 } from "lucide-react";
import IntegrationsPage from "./integrationsPage";
import { SettingsSkeleton } from "@/components/common/skeleton";
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile } = useProfile();
  const { data: notifications } = useNotificationSettings();
  const { data: security } = useSecuritySettings();
  const { data: integrations } = useIntegrations();

  const isLoading = !profile || !notifications || !security || !integrations;

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-white/60 text-sm md:text-base">
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sticky top-24 space-y-1">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Security", icon: Shield },
              { id: "integrations", label: "Integrations", icon: Link2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left cursor-pointer ${
                    activeTab === item.id
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "profile" && profile && (
            <ProfileForm profile={profile} />
          )}
          {activeTab === "notifications" && notifications && (
            <NotificationsForm notifications={notifications} />
          )}
          {activeTab === "security" && security && (
            <SecurityForm security={security} />
          )}
          {activeTab === "integrations" && integrations && <IntegrationsPage />}
        </div>
      </div>
    </div>
  );
}
