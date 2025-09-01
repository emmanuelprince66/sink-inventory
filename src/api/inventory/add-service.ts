import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface AddProductVariables {
  businessId: any;
  payload: FormData;
}
const addProduct = async ({ businessId, payload }: AddProductVariables) => {
  const response = await fetch(`/api/inventory/${businessId}/create-service`, {
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

interface UseAddProductMutationOptions {
  businessId: any; // Remove null from type
  config?: MutationConfig<QueryFnType>;
}

export const useAddServiceMutation = ({
  businessId,
  config,
}: UseAddProductMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.inventory.addService, businessId],
    mutationFn: addProduct,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating service:", error);
      const errorMessage =
        error?.message || error?.error || "Error creating service";
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
