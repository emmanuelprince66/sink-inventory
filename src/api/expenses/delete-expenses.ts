import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteExpense = async (id: string) => {
  const response = await fetch(`/api/expenses/${id}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

type QueryFnType = typeof deleteExpense;

interface useDeleteExpenseOptions extends MutationConfig<QueryFnType> {
  // Additional options can be added here if needed
}

export const useDeleteExpenseMutation = (config?: useDeleteExpenseOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.expenses.deleteExpense],
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("expense ID is required");
      }
      return deleteExpense(id);
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error deleting Expense:", error);
      const errorMessage = error?.message || "Error deleting Expense";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Expense deleted successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
