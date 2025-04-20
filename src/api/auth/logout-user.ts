"use client";

// lib/mutations/auth/logout-user.ts
import { useMutation } from "@tanstack/react-query";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
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

export const useLogoutMutation = () => {
  const { showToast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationKey: [queryKey.auth.logout],
    mutationFn: logoutUser,
    onSuccess: () => {
      showToast("You've been logged out", "success");
      router.push("/login");
      router.refresh(); // Important to clear client-side cache
    },
    onError: () => {
      showToast("Logout failed. Please try again.", "error");
    },
  });
};
