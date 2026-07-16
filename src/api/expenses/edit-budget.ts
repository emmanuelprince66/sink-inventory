import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

export interface EditBudgetPayload {
  category_id?: string;
  year?: number;
  total_budget_amount?: number;
  duration_months?: number;
}

const editBudget = async ({
  businessId,
  budgetId,
  payload,
}: {
  businessId: string;
  budgetId: string;
  payload: EditBudgetPayload;
}) => {
  const response = await fetch(
    `/api/expenses/${businessId}/budgets/${budgetId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }
  return response.json();
};

// MutationConfig is derived from the public mutate({budgetId, payload})
// signature, not the internal fetcher (which also needs businessId).
type MutateFnType = (variables: {
  budgetId: string;
  payload: EditBudgetPayload;
}) => ReturnType<typeof editBudget>;

interface UseEditBudgetMutationOptions extends MutationConfig<MutateFnType> {
  businessId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useEditBudgetMutation = ({
  businessId,
  ...config
}: UseEditBudgetMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.expenses.editBudget, businessId],
    mutationFn: ({
      budgetId,
      payload,
    }: {
      budgetId: string;
      payload: EditBudgetPayload;
    }) => editBudget({ businessId, budgetId, payload }),
    retry: false,
    onError: (error: any, variables, context) => {
      const errorMessage =
        error?.message || error?.error || "Error updating budget";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Budget updated successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
