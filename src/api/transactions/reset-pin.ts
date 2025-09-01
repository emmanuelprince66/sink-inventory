import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const ResetPin = async ({
  body,
  businessId,
}: {
  body: any;
  businessId: any;
}) => {
  const response = await fetch(`/api/transactions/${businessId}/reset-pin`, {
    method: "PATCH",
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

type QueryFnType = typeof ResetPin;

export const useResetPinMutation = (config?: MutationConfig<QueryFnType>) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.resetPin],
    mutationFn: ResetPin,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error Updating Pin:", error);
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
