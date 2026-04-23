import { mockSettings } from "@/lib/mock/settings";
import {
  UpdateProfileInput,
  UpdateNotificationSettingsInput,
  UpdateSecuritySettingsInput,
} from "@/types/settings";

export async function fetchSettings() {
  // const res = await fetch('/api/settings')
  // if (!res.ok) throw new Error('Failed to fetch settings')
  // return res.json()
  return mockSettings;
}

export async function fetchProfile() {
  // const res = await fetch('/api/settings/profile')
  // if (!res.ok) throw new Error('Failed to fetch profile')
  // return res.json()
  return mockSettings.profile;
}

export async function updateProfile(data: UpdateProfileInput) {
  // TODO: wire to /api/settings/profile when backend is ready
  console.warn("updateProfile: not implemented", data);
  return mockSettings.profile;
}

export async function fetchNotificationSettings() {
  // const res = await fetch('/api/settings/notifications')
  // if (!res.ok) throw new Error('Failed to fetch notification settings')
  // return res.json()
  return mockSettings.notifications;
}

export async function updateNotificationSettings(
  data: UpdateNotificationSettingsInput,
) {
  // TODO: wire to /api/settings/notifications when backend is ready
  console.warn("updateNotificationSettings: not implemented", data);
  return mockSettings.notifications;
}

export async function fetchSecuritySettings() {
  // const res = await fetch('/api/settings/security')
  // if (!res.ok) throw new Error('Failed to fetch security settings')
  // return res.json()
  return mockSettings.security;
}

export async function updateSecuritySettings(
  data: UpdateSecuritySettingsInput,
) {
  // TODO: wire to /api/settings/security when backend is ready
  console.warn("updateSecuritySettings: not implemented", data);
  return mockSettings.security;
}

export async function fetchIntegrations() {
  const res = await fetch('/api/settings/integrations')
  if (!res.ok) throw new Error('Failed to fetch integrations')
  return res.json()
}

export async function connectIntegration(
  provider: string,
  credentials: unknown,
) {
  const res = await fetch('/api/settings/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, credentials }),
  });
  if (!res.ok) throw new Error('Failed to connect integration');
  return res.json();
}

export async function disconnectIntegration(integrationId: string) {
  const res = await fetch(`/api/settings/disconnect?integrationId=${integrationId}`);
  if (!res.ok) throw new Error('Failed to disconnect integration');
  return res.json();
}

export async function syncIntegration(integrationId: string) {
  // TODO: wire to /api/settings/integrations/[id]/sync when backend is ready
  console.warn("syncIntegration: not implemented", integrationId);
  return null;
}

export async function setPrimaryIntegration(integrationId: string) {
  // TODO: wire to /api/settings/integrations/[id]/primary when backend is ready
  console.warn("setPrimaryIntegration: not implemented", integrationId);
  return null;
}
