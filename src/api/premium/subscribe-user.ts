import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const SubscribeUser = async (body: any) => {
  const response = await fetch(`/api/premium/sub/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Crucial: tell the server it's JSON
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

type QueryFnType = typeof SubscribeUser;

interface SubscribeUserMutationOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useSubscribeUserMutation = (
  config?: SubscribeUserMutationOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.premium.subscribeUser],
    mutationFn: SubscribeUser,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error subscribing user:", error);

      // Extract the most specific error message available
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error logging in";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast(" Sucessfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
