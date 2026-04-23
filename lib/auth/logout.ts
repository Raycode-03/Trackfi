"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    const toastId = toast.loading("Logging out...");

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success("Logged out successfully!", { id: toastId });
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        toast.error("Failed to logout. Please try again.", { id: toastId });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("An error occurred during logout.", { id: toastId });
    }
  };

  return { logout };
}