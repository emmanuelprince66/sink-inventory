// api/business/delete-business.ts
import { queryKey } from "@/constants/query-key";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLogoutMutation } from "../auth/logout-user";

// ─── API call ────────────────────────────────────────────────────────────────

export const deleteBusinessById = async (id: string): Promise<void> => {
  const response = await fetch(`/api/business/${id}/delete-business`, {
    method: "DELETE",
  });

  if (response.status === 401) {
    const error: any = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete business");
  }
};

// ─── Mutation hook ───────────────────────────────────────────────────────────

interface UseDeleteBusinessMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteBusinessMutation = ({
  onSuccess,
  onError,
}: UseDeleteBusinessMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { mutate: logout } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useMutation({
    mutationFn: (id: string) => deleteBusinessById(id),
    onSuccess: () => {
      // Invalidate list so the table refreshes
      queryClient.invalidateQueries({
        queryKey: [queryKey.business.getAllBusiness],
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      if (error?.status === 401) {
        logout();
        return;
      }
      onError?.(error);
    },
  });
};
