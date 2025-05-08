import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateRestockProduct {
  // Define your customer creation payload type here
  [key: string]: any;
}

const addProduct = async ({
  productId,
  payload,
}: {
  productId: any;
  payload: CreateRestockProduct;
}) => {
  const response = await fetch(`/api/restock/${productId}/restock-product`, {
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

type QueryFnType = typeof addProduct;

interface UseAddRestockMutationOptions extends MutationConfig<QueryFnType> {
  productId: string | null;
}

export const useRestockProductMutation = ({
  productId,
  ...config
}: UseAddRestockMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.addRestockItem, productId],
    mutationFn: (payload: CreateRestockProduct) =>
      addProduct({ productId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error restocking:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error restocking Product";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product Restocked successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
