import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UpdateWalletPayload {
  [key: string]: any;
}

const updateWalletBalance = async ({
  walletId,
  payload,
}: {
  walletId: string;
  payload: UpdateWalletPayload;
}) => {
  const response = await fetch(`/api/customers/${walletId}/update-balance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof updateWalletBalance;

// Simplified interface - no need for walletId in config
interface UseUpdateWalletBalanceOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUpdateWalletBalanceMutation = (
  config?: UseUpdateWalletBalanceOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customers.updateWalletBalance],
    mutationFn: ({
      walletId,
      payload,
    }: {
      walletId: string;
      payload: UpdateWalletPayload;
    }) => {
      if (!walletId) {
        throw new Error("Wallet ID is required");
      }
      return updateWalletBalance({ walletId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error updating wallet:", error);
      const errorMessage = error?.message || "Error updating wallet balance";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Wallet balance updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
