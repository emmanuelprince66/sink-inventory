// components/auth/route-guard.tsx
"use client";

import { UserRole } from "@/lib/store/types";
import { useUserRole, useUserStore } from "@/lib/store/user-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

export function RouteGuard({
  children,
  requiredRole,
  requireVerified = false,
  requireSubscription = false,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireVerified?: boolean;
  requireSubscription?: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isHydrated } = useUserStore();
  const { hasPermission, isVerified, isSubscribed } = useUserRole();
  const [isChecking, setIsChecking] = useState(true);

  console.log("requiredRole", requiredRole);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    console.log("requiredRole", requiredRole);

    setIsChecking(false);

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // if (requiredRole && !hasPermission(requiredRole)) {
    //   console.log("requiredRole", requiredRole);

    //   router.push("/unauthorized");
    //   return;
    // }

    // if (requireVerified && !isVerified) {
    //   router.push("/verify-email");
    //   return;
    // }

    // if (requireSubscription && !isSubscribed) {
    //   router.push("/subscription");
    //   return;
    // }
  }, [
    isAuthenticated,
    isLoading,
    isHydrated,
    requiredRole,
    hasPermission,
    requireVerified,
    isVerified,
    requireSubscription,
    isSubscribed,
    router,
  ]);

  if (!isHydrated || isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
