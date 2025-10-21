import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteCustomerById = async (id: string) => {
  const response = await fetch(`/api/customers/${id}/delete-customer`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteCustomerById;

interface UseDeleteProductOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteCustomerMutation = (config?: UseDeleteProductOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customers.deleteCustomer],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Customer ID is required");
      }
      return deleteCustomerById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Customer:", error);
      const errorMessage = error?.message || "Error deleting Customer";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Customer deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
