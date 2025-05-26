// components/auth/auth-provider.tsx
"use client";

import { useUserStore } from "@/lib/store/user-store";
import { Spinner } from "../ui/spinner";
import { AuthInitializer } from "./auth-initializer";
import { AuthSync } from "./auth-sync";
import { AutoLogout } from "./auto-logout";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isHydrated } = useUserStore();

  return (
    <>
      <AuthInitializer />
      <AuthSync />
      <AutoLogout />
      {!isHydrated || isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Spinner color="text-primary-green-300" size={"xxl"} />
        </div>
      ) : (
        children
      )}
    </>
  );
}
