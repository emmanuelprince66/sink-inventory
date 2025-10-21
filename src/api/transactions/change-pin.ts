import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const ChangePin = async ({
  body,
  businessId,
}: {
  body: any;
  businessId: any;
}) => {
  const response = await fetch(`/api/transactions/${businessId}/change-pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof ChangePin;
interface UseChnagePinOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useChangePinMutation = (config?: UseChnagePinOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.changePin],
    mutationFn: ChangePin,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error updating pin:", error);
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error updating pin";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Pin Updated Successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
