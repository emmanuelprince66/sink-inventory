import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

// Payload can be empty or contain additional data
interface AcceptProductPayload {
  [key: string]: any;
}

// Variables passed to the mutate function - ONLY what's needed
interface AcceptProductVariables {
  move_id: string;
  payload?: AcceptProductPayload;
}

const acceptProduct = async (variables: AcceptProductVariables) => {
  const { move_id, payload = {} } = variables;

  // API only needs move_id in URL
  const response = await fetch(`/api/products/${move_id}/accept-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof acceptProduct;

interface UseAcceptProductMutationOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (
    data: any,
    variables: AcceptProductVariables,
    context: any,
  ) => void;
  onError?: (
    error: any,
    variables: AcceptProductVariables,
    context: any,
  ) => void;
}

export const useAcceptProductMutation = (
  config: UseAcceptProductMutationOptions = {},
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.acceptProduct],
    mutationFn: acceptProduct,
    retry: false,
    onError: (error: any, variables: AcceptProductVariables, context: any) => {
      console.log("Error accepting product:", error);
      const errorMessage =
        error?.message || error?.error || "Error accepting product";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: AcceptProductVariables, context: any) => {
      const successMessage = data?.message || "Product accepted successfully";
      showToast(successMessage, "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
