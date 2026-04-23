"use client";

import React, { useState } from "react";
import { Integration } from "@/types/settings";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import Image from "next/image";

interface IntegrationCardProps {
  integration: Integration;
  onConnect?: (address: string) => void;
  onSync?: () => void;
  onDisconnect?: () => void;
  isSyncing?: boolean;
}

export function IntegrationCard({
  integration,
  onConnect,
  onSync,
  onDisconnect,
  isSyncing,
}: IntegrationCardProps) {
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConnected = integration.status === "connected";
  const isComingSoon = integration.status === "coming_soon";

  const getStatusColor = () => {
    switch (integration.status) {
      case "connected":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "coming_soon":
        return "text-yellow-400";
      default:
        return "text-white/40";
    }
  };

  const getStatusIcon = () => {
    switch (integration.status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "coming_soon":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (integration.status) {
      case "coming_soon":
        return "Coming Soon";
      default:
        return integration.status;
    }
  };

  const handleConnectClick = () => {
    setShowAddressInput(true);
  };

  const handleSubmitAddress = async () => {
    if (!address.trim()) return;
    setIsSubmitting(true);
    try {
      await onConnect?.(address);
      setAddress("");
      setShowAddressInput(false);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`border rounded-2xl p-6 transition-all ${
        isConnected
          ? "bg-green-500/5 border-green-500/20"
          : integration.status === "error"
            ? "bg-red-500/5 border-red-500/20"
            : isComingSoon
              ? "bg-white/3 border-white/5 opacity-60"
              : "bg-white/5 border-white/10 hover:bg-white/8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            {integration.icon ? (
              <Image
                src={integration.icon}
                alt={integration.name}
                height={32}
                width={32}
                className="w-8 h-8 rounded"
              />
            ) : (
              <span className="text-xl">{integration.name[0]}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{integration.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon()}
              <span
                className={`text-xs uppercase tracking-widest ${getStatusColor()}`}
              >
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-white/60 mb-4">{integration.description}</p>

      {/* Connection Details */}
      {isConnected && (
        <div className="bg-white/5 rounded-lg p-3 mb-4 text-xs text-white/40 space-y-1 border border-white/10">
          {integration.walletAddress && (
            <p>
              <strong>Address:</strong> {integration.walletAddress.slice(0, 6)}
              ...{integration.walletAddress.slice(-4)}
            </p>
          )}
          <p>
            <strong>Connected:</strong>{" "}
            {integration.connectedAt
              ? new Date(integration.connectedAt).toLocaleDateString()
              : "Unknown"}
          </p>
          <p>
            <strong>Last Sync:</strong>{" "}
            {integration.lastSyncedAt
              ? new Date(integration.lastSyncedAt).toLocaleDateString()
              : "Never"}
          </p>
          {integration.isPrimary && (
            <p>
              <span className="text-green-400">✓ Primary integration</span>
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {integration.status === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-xs text-red-400 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Connection failed. Please reconnect your account.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isComingSoon ? (
          <Button
            disabled
            className="flex-1 bg-white/5 text-white/30 font-bold py-2 rounded-lg cursor-not-allowed"
          >
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </Button>
        ) : !isConnected ? (
          showAddressInput ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Paste wallet address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <Button
                onClick={handleSubmitAddress}
                disabled={!address.trim() || isSubmitting}
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnectClick}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-2 rounded-lg"
            >
              Connect
            </Button>
          )
        ) : (
          <>
            <Button
              onClick={onSync}
              disabled={isSyncing}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
            <Button
              onClick={onDisconnect}
              className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
