import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteSupplierById = async (id: string) => {
  const response = await fetch(`/api/supplier/${id}/delete-supplier`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteSupplierById;

interface UseDeleteSupplierOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteSupplierMutation = (
  config?: UseDeleteSupplierOptions
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.supplier.deleteSupplier],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Supplier ID is required");
      }
      return deleteSupplierById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting supplier:", error);
      const errorMessage = error?.message || "Error deleting supplier";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Supplier deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
