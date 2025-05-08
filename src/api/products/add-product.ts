import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface CreateProductPayload {
  // Define your customer creation payload type here
  [key: string]: any;
}

const addProduct = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: CreateProductPayload;
}) => {
  const response = await fetch(`/api/products/${businessId}/add-product`, {
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

interface UseAddProductMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useAddProductMutation = ({
  businessId,
  ...config
}: UseAddProductMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.inventory.addService, businessId],
    mutationFn: (payload: CreateProductPayload) =>
      addProduct({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating product:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating Product";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
