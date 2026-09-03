import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationCallbacks,
  QueryConfigType,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/lib/react-query";
import type { ExpenseSettingsUpdate } from "@/types/expense-governance";

/** The business's payout limits and approval policy. Owner-writable. */

export const fetchExpenseSettings = async ({ id }: { id: string }) => {
  const response = await fetch(`/api/expenses/settings/${id}`, {
    method: "GET",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

type QueryFnType = typeof fetchExpenseSettings;

export const useFetchExpenseSettingsQuery = ({
  params,
  ...config
}: QueryConfigType<QueryFnType> & { params: { id: string } }) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getSettings, params],
    queryFn: () => fetchExpenseSettings(params),
    enabled: Boolean(params.id),
    ...config,
  });

const updateExpenseSettings = async ({
  id,
  body,
}: {
  id: string;
  body: ExpenseSettingsUpdate;
}) => {
  const response = await fetch(`/api/expenses/settings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

export const useUpdateExpenseSettingsMutation = (
  config?: MutationCallbacks<typeof updateExpenseSettings>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.expenses.updateSettings],
    mutationFn: updateExpenseSettings,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not save the limits",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Spending controls updated", "success");
      queryClient.invalidateQueries({
        queryKey: [queryKey.expenses.getSettings],
      });
      config?.onSuccess?.(data, variables, context);
    },
  });
};
