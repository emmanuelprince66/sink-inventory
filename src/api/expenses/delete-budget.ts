import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

const deleteBudget = async ({
  businessId,
  budgetId,
}: {
  businessId: string;
  budgetId: string;
}) => {
  const response = await fetch(
    `/api/expenses/${businessId}/budgets/${budgetId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }
  return response.json();
};

// MutationConfig is derived from the public mutate(budgetId) signature, not
// the internal fetcher (which also needs businessId).
type MutateFnType = (budgetId: string) => ReturnType<typeof deleteBudget>;

interface UseDeleteBudgetMutationOptions extends MutationConfig<MutateFnType> {
  businessId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useDeleteBudgetMutation = ({
  businessId,
  ...config
}: UseDeleteBudgetMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.expenses.deleteBudget, businessId],
    mutationFn: (budgetId: string) => deleteBudget({ businessId, budgetId }),
    retry: false,
    onError: (error: any, variables, context) => {
      const errorMessage =
        error?.message || error?.error || "Error removing budget";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Budget removed successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
