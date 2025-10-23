import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateReturnOrDamaged {
  // Define your customer creation payload type here
  [key: string]: any;
}

const createReturnDeleteProduct = async ({
  productId,
  payload,
}: {
  productId: any;
  payload: CreateReturnOrDamaged;
}) => {
  const response = await fetch(`/api/products/${productId}/return-damage`, {
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

type QueryFnType = typeof createReturnDeleteProduct;

interface UseReturnDamagedProductMutationsOptions
  extends MutationConfig<QueryFnType> {
  productId: string | null;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useReturnDamagedProductMutation = ({
  productId,
  ...config
}: UseReturnDamagedProductMutationsOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.returnDamagedProduct, productId],
    mutationFn: (payload: CreateReturnOrDamaged) =>
      createReturnDeleteProduct({ productId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error  :", error);

      const errorMessage =
        error?.message || error?.error || error?.message || "Error  ";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast(" Process successful", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
