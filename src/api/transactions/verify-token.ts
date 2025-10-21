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
  const response = await fetch(`/api/transactions/${businessId}/verify-token`, {
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
interface UseVerifyTokenOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}
export const useVerifyPinTokenMutation = (config?: UseVerifyTokenOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.transactions.verifyToken],
    mutationFn: CreatePin,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error verifying token:", error);
      const errorMessage =
        error?.details?.message ||
        error?.error ||
        error?.message ||
        "Error verifying token";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Token Verified Successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
