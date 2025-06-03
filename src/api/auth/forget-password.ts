import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const forgetPassword = async (body: any) => {
  const response = await fetch(`/api/forget-password`, {
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

type QueryFnType = typeof forgetPassword;

export const useForgetPasswordMutation = (
  config?: MutationConfig<QueryFnType>
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.auth.forgetPassword],
    mutationFn: forgetPassword,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error :", error);

      // Extract the most specific error message available
      const errorMessage =
        error?.details?.message || error?.error || error?.message || "Error ";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Success", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
