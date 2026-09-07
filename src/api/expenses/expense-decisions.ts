import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  MutationCallbacks,
  useMutation,
  useQueryClient,
} from "@/lib/react-query";

/**
 * Signing off a LOGGED expense — not a payout.
 *
 * The money left the business before this ever ran: someone paid cash or used
 * a card and recorded it afterwards. Approving is bookkeeping, so nothing is
 * disbursed and APPROVED is the end of the road, which is why these live apart
 * from the transfer decisions in expense-transfers even though the shapes
 * rhyme. Confusing the two would have an approver believing a payment is on
 * its way when it happened last Tuesday.
 *
 * A PIN is still required to approve. It is the same authorisation gate as a
 * payout — what is being signed is the company's books.
 */

const send = async (path: string, body?: unknown) => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

/**
 * A decision changes the expense list, the totals above it and the budgets it
 * counts against, so all three are dropped together — an approver who still
 * sees the row as pending will try to approve it twice.
 */
const TOUCHED_BY_A_DECISION = [
  queryKey.expenses.getAllExpenses,
  queryKey.expenses.getTransactions,
  queryKey.expenses.getRecentActivity,
  queryKey.expenses.getBudgets,
];

// ─── Approve ──────────────────────────────────────────────────────────────────

const approveExpense = ({ id, pin }: { id: string; pin: string }) =>
  send(`/api/expenses/${id}/approve`, { pin });

export const useApproveExpenseMutation = (
  config?: MutationCallbacks<typeof approveExpense>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.expenses.approveExpense],
    mutationFn: approveExpense,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not approve it",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // "Approved", not "sent" — nothing moves as a result of this.
      showToast("Expense approved", "success");
      TOUCHED_BY_A_DECISION.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      config?.onSuccess?.(data, variables, context);
    },
  });
};

// ─── Reject ───────────────────────────────────────────────────────────────────

const rejectExpense = ({
  id,
  rejection_reason,
}: {
  id: string;
  rejection_reason: string;
}) => send(`/api/expenses/${id}/reject`, { rejection_reason });

export const useRejectExpenseMutation = (
  config?: MutationCallbacks<typeof rejectExpense>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    ...config,
    mutationKey: [queryKey.expenses.rejectExpense],
    mutationFn: rejectExpense,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not reject it",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Expense rejected", "success");
      TOUCHED_BY_A_DECISION.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      config?.onSuccess?.(data, variables, context);
    },
  });
};
