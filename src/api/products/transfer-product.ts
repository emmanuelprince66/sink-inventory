import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const transferProduct = async (data: {
  source_product_id: string;
  target_business_id: string;
  target_product_id?: string | null;
  quantity: number;
}) => {
  const response = await fetch("/api/products/products-transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof transferProduct;

interface UseTransferProductOptions extends MutationConfig<QueryFnType> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useTransferProductMutation = (
  config?: UseTransferProductOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.transferProduct],
    mutationFn: (data: Parameters<QueryFnType>[0]) => {
      if (!data.source_product_id || !data.target_business_id) {
        throw new Error(
          "Source product ID and target business ID are required"
        );
      }
      return transferProduct(data);
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
