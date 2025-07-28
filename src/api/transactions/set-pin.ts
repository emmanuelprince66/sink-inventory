import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const createPin = async (body: any) => {
  const response = await fetch(`/api/transactions/set-pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // Ensure proper JSON stringification
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof createPin;

export const useCreatePinMutation = (config?: MutationConfig<QueryFnType>) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.setPin],
    mutationFn: createPin,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating pin:", error);

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
      showToast("Pin Created Sucessfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
