import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteService = async (id: string) => {
  const response = await fetch(`/api/products/${id}/delete-service`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteService;

interface UseDeleteServiceOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteServiceMutation = (config?: UseDeleteServiceOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.products.deleteService],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Product ID is required");
      }
      return deleteService(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting product:", error);
      const errorMessage = error?.message || "Error deleting service";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Service deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
