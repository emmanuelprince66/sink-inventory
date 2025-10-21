import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const changePassword = async (body: any) => {
  const response = await fetch(`/api/change-password`, {
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

type QueryFnType = typeof changePassword;

interface ChangePasswordMutationProps extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useChangePasswordMutation = (
  config?: ChangePasswordMutationProps
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.auth.changePassword],
    mutationFn: changePassword,
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
