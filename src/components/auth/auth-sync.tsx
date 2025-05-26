// components/auth/auth-sync.tsx
"use client";

import { UserRole } from "@/lib/store/types";
import { useUserStore } from "@/lib/store/user-store";
import { useEffect } from "react";

export function AuthSync() {
  const { user, isAuthenticated, isHydrated } = useUserStore();

  useEffect(() => {
    if (!isHydrated) return;

    // Sync cookies with state on mount
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userRole="))
      ?.split("=")[1] as UserRole | undefined;

    if (!isAuthenticated && accessToken) {
      // Token exists but state isn't authenticated
      // You might want to validate the token with your backend here
    }
  }, [isHydrated, isAuthenticated, user]);

  return null;
}
