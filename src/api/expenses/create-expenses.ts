import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

interface createExpensesPayload {
  // Define your bank creation payload type here
  [key: string]: any;
}

const CreateExpenses = async ({
  businessId,
  payload,
}: {
  businessId: any;
  payload: createExpensesPayload;
}) => {
  const response = await fetch(`/api/expenses/${businessId}/create`, {
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

type QueryFnType = typeof CreateExpenses;

interface UseCreateExpensesMutationOptions extends MutationConfig<QueryFnType> {
  businessId: string | null;
}

export const useCreateExpensesMutation = ({
  businessId,
  ...config
}: UseCreateExpensesMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.expenses.createExpense, businessId],
    mutationFn: (payload: createExpensesPayload) =>
      CreateExpenses({ businessId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      console.log("Error creating expenses:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        error?.message ||
        "Error creating bank";

      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Expenses created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
