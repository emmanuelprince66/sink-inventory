"use client";

import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useMutation } from "@tanstack/react-query";
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

  return useMutation({
    mutationKey: [queryKey.auth.logout],
    mutationFn: logoutUser,
    onSuccess: () => {
      showToast(options?.successMessage || "You've been logged out", "success");
      router.push(options?.redirectPath || "/login");
      router.refresh(); // Important to clear client-side cache
    },
    onError: () => {
      showToast(
        options?.errorMessage || "Logout failed. Please try again.",
        "error"
      );
    },
  });
};
