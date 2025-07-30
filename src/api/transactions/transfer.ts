import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const transferFunds = async (body: any) => {
  const response = await fetch(`/api/transactions/transfer`, {
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

type QueryFnType = typeof transferFunds;

export const useTransferFundsMutation = (
  config?: MutationConfig<QueryFnType>
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.transferFunds],
    mutationFn: transferFunds,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error in transfer :", error);

      // Extract the most specific error message available
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error transfer in";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Transfer Sucessfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
