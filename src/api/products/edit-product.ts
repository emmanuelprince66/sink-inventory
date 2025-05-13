import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface EditProduvtVariables {
  productId: any;
  payload: FormData;
}
const addProduct = async ({ productId, payload }: EditProduvtVariables) => {
  console.log("payload", payload);

  const response = await fetch(`/api/products/${productId}/edit-product`, {
    method: "PATCH",
    body: payload,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof addProduct;

interface UseEditProductMutationOptions {
  productId: any; // Remove null from type
  config?: MutationConfig<QueryFnType>;
}

export const useEditProductMutation = ({
  productId,
  config,
}: UseEditProductMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.editProduct, productId],
    mutationFn: addProduct,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing product:", error);
      const errorMessage =
        error?.message || error?.error || "Error editing Product";
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product Updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
