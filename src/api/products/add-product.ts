import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface AddProductVariables {
  businessId: string;
  payload: FormData;
}
const addProduct = async ({ businessId, payload }: AddProductVariables) => {
  const response = await fetch(`/api/products/${businessId}/add-product`, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof addProduct;

interface UseAddProductMutationOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useAddProductMutation = (
  businessId: any,
  config: UseAddProductMutationOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.inventory.addService, businessId],
    mutationFn: addProduct,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating product:", error);
      const errorMessage =
        error?.message || error?.error || "Error creating Product";
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
