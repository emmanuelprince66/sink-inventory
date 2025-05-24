import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const ResetInvitePassword = async (body: any) => {
  const response = await fetch(`/api/reset-invite-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Throw the entire error object to access details later
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof ResetInvitePassword;

export const useResetInvitePasswordMutation = (
  config?: MutationConfig<QueryFnType>
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.auth.resetInvitePassword],
    mutationFn: ResetInvitePassword,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error changing password:", error);

      // Extract the most specific error message available
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error resetting password";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Password Changed Sucessfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
