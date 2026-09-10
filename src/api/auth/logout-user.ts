"use client";

import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useUserStore } from "@/lib/store/user-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const logoutUser = async () => {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return response.json();
};

type LogoutOptions = {
  redirectPath?: string;
  successMessage?: string;
  errorMessage?: string;
};

export const useLogoutMutation = (options?: LogoutOptions) => {
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useUserStore((state) => state.logout);

  /**
   * Everything the last session left behind, dropped in one place.
   *
   * `router.refresh()` alone was never enough: it re-runs the server
   * components but leaves the React Query cache and the persisted zustand
   * stores exactly as they were, so the next person to sign in on this
   * browser saw the previous user's business and their cached lists until a
   * hard reload. `clearSession()` also wipes the business-scoped stores.
   */
  const teardown = () => {
    clearSession();
    queryClient.clear();
    router.push(options?.redirectPath || "/login");
    router.refresh();
  };

  return useMutation({
    mutationKey: [queryKey.auth.logout],
    mutationFn: logoutUser,
    onSuccess: () => {
      showToast(options?.successMessage || "You've been logged out", "success");
      teardown();
    },
    /**
     * A failed call must still sign them out locally.
     *
     * Leaving the session up because the server did not answer means someone
     * who pressed Log out — on a shared terminal, most likely — is still
     * signed in. The cookies and caches are ours to clear either way.
     */
    onError: () => {
      showToast(
        options?.errorMessage ||
          "Signed out on this device, but the server could not be reached.",
        "error",
      );
      teardown();
    },
  });
};
