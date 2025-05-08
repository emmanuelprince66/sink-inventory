import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteProductById = async (id: string) => {
  const response = await fetch(`/api/products/${id}/delete-product`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteProductById;

interface UseDeleteProductOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
}

export const useDeleteProductMutation = (config?: UseDeleteProductOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.deleteProduct],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Product ID is required");
      }
      return deleteProductById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting product:", error);
      const errorMessage = error?.message || "Error deleting product";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Product deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
