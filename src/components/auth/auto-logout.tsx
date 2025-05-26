// components/auth/auto-logout.tsx
"use client";

import { useUserStore } from "@/lib/store/user-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoLogout() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  useEffect(() => {
    if (!user?.tokens?.access) return;

    const checkTokenExpiration = () => {
      try {
        const tokenParts = user.tokens?.access?.split(".");
        if (tokenParts.length !== 3) {
          logout();
          router.push("/login");
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const expiresAt = payload.exp * 1000;

        if (Date.now() > expiresAt) {
          logout();
          router.push("/login");
        }
      } catch (error) {
        logout();
        router.push("/login");
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [user, logout, router]);

  return null;
}
