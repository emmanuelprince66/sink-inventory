// components/auth/auth-initializer.tsx
"use client";

import { useUserStore } from "@/lib/store/user-store";
import { useEffect } from "react";

export function AuthInitializer() {
  const { user, setLoading } = useUserStore();

  console.log("AuthInitializer: Initializing authentication...", user);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        if (accessToken) {
          // Optionally validate token with backend
        } else {
          setLoading(false);
          console.log("No access token found. Redirecting to login...");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setLoading]);

  useEffect(() => {
    if (user?.tokens?.access) {
      document.cookie = `accessToken=${user.tokens.access}; path=/; secure; samesite=strict`;
      document.cookie = `userRole=${user.role}; path=/; secure; samesite=strict`;
      setLoading(false);
    }
  }, [user, setLoading]);

  return null;
}
