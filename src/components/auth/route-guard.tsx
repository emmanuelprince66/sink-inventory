// components/auth/route-guard.tsx
"use client";

import { useCheckIsUserSubscribedQuery } from "@/api/premium/check-is-user-subscribed";
import { UserRole } from "@/lib/store/types";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
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
  const { isVerified, isSubscribed } = useUserRole();
  const [isChecking, setIsChecking] = useState(true);

  const { data: userSubData, isLoading: userSubDataLoading } =
    useCheckIsUserSubscribedQuery();

  console.log("userSubData----4", userSubData);
  const setIsSubscribed = useIsUserSubscribeStore(
    (state) => state.setIsSubscribed,
  );

  useEffect(() => {
    if (userSubData) {
      setIsSubscribed(userSubData);
    }
    console.log("userSubData", userSubData);
  }, [userSubData]);

  console.log("requiredRole", requiredRole);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

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
    requireVerified,
    isVerified,
    requireSubscription,
    isSubscribed,
    router,
  ]);

  if (!isHydrated || isLoading || isChecking || userSubDataLoading) {
    console.log("Loading state:", {
      isHydrated,
      isLoading,
      isChecking,
    });
    return (
      <div className="flex w-full items-center justify-center h-screen">
        <Spinner color="text-primary-green-300" size={"xxl"} />
      </div>
    );
  }

  return <>{children}</>;
}
