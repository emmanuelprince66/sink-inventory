import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface MoveProductToProductionPayload {
  // Define your product movement payload type here
  [key: string]: any;
}

const moveProductToProduction = async ({
  productId,
  payload,
}: {
  productId: any;
  payload: MoveProductToProductionPayload;
}) => {
  const response = await fetch(
    `/api/products/${productId}/move-to-production`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof moveProductToProduction;

interface UseMoveProductToProductionMutationOptions extends MutationConfig<QueryFnType> {
  productId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useMoveProductToProductionMutation = ({
  productId,
  ...config
}: UseMoveProductToProductionMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.moveProductToProduction, productId],
    mutationFn: (payload: MoveProductToProductionPayload) =>
      moveProductToProduction({ productId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error moving product to production:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error moving product to production";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product moved to production successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
