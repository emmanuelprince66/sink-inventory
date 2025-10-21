import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const CreatePin = async ({
  body,
  businessId,
}: {
  body: any;
  businessId: any;
}) => {
  const response = await fetch(`/api/transactions/${businessId}/set-pin`, {
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

type QueryFnType = typeof CreatePin;
interface UseCreatePinOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreatePinMutation = (config?: UseCreatePinOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.setPin],
    mutationFn: CreatePin,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating pin:", error);
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error creating pin";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Pin Created Successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
