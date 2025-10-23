import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteBankById = async (id: string) => {
  const response = await fetch(`/api/bank/${id}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteBankById;

interface UseDeleteProductOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteBankMutation = (config?: UseDeleteProductOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.bank.deleteBank],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Bank ID is required");
      }
      return deleteBankById(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Bank:", error);
      const errorMessage = error?.message || "Error deleting Bank";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Bank deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
