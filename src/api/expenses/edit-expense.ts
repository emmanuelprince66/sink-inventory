import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface UpdateExpensePayload {
  [key: string]: any;
}

const editExpense = async ({
  expenseId,
  payload,
}: {
  expenseId: any;
  payload: UpdateExpensePayload;
}) => {
  const response = await fetch(`/api/expenses/${expenseId}/edit-expense`, {
    method: "POST",
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

type QueryFnType = typeof editExpense;

// Simplified interface - no need for expenseId in config
interface editExpenseOptions extends MutationConfig<QueryFnType> {
  // Add any additional options here if needed
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useEditExpenseMutation = (config?: editExpenseOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.expenses.editExpense],
    mutationFn: ({
      expenseId,
      payload,
    }: {
      expenseId: string;
      payload: UpdateExpensePayload;
    }) => {
      if (!expenseId) {
        throw new Error("Wallet ID is required");
      }
      return editExpense({ expenseId, payload });
    },
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error editing Expense:", error);
      const errorMessage = error?.message || "Error editing Expense";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Expense updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
