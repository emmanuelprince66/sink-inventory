import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface EditProductPropType {
  // Define your customer creation payload type here
  [key: string]: any;
}

const editProduct = async ({
  productId,
  payload,
}: {
  productId: any;
  payload: EditProductPropType;
}) => {
  const response = await fetch(`/api/products/${productId}/edit-product`, {
    method: "PATCH",
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

type QueryFnType = typeof editProduct;

interface UseEditProductMutationOptions extends MutationConfig<QueryFnType> {
  productId: any;
}

export const useEditProductMutation = ({
  productId,
  ...config
}: UseEditProductMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.editProduct, productId],
    mutationFn: (payload: EditProductPropType) =>
      editProduct({ productId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing product:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error editing Product";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
