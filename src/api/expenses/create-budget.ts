import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { MutationConfig, useMutation } from "@/lib/react-query";

export interface CreateBudgetPayload {
  category_id: string;
  year: number;
  total_budget_amount: number;
  duration_months: number;
}

const createBudget = async ({
  businessId,
  payload,
}: {
  businessId: string;
  payload: CreateBudgetPayload;
}) => {
  const response = await fetch(`/api/expenses/${businessId}/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }
  return response.json();
};

// MutationConfig is derived from the public mutate(payload) signature, not
// the internal fetcher (which also needs businessId) — otherwise the
// inherited `mutationFn`/`onError`/`onSuccess` types expect the wrong shape.
type MutateFnType = (payload: CreateBudgetPayload) => ReturnType<typeof createBudget>;

interface UseCreateBudgetMutationOptions extends MutationConfig<MutateFnType> {
  businessId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useCreateBudgetMutation = ({
  businessId,
  ...config
}: UseCreateBudgetMutationOptions) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.expenses.createBudget, businessId],
    mutationFn: (payload: CreateBudgetPayload) =>
      createBudget({ businessId, payload }),
    retry: false,
    onError: (error: any, variables, context) => {
      const errorMessage =
        error?.message || error?.error || "Error creating budget";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Budget created successfully", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
