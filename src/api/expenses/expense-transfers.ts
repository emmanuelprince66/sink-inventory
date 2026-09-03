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
import type { InitiateTransferBody } from "@/types/expense-governance";

/** The expense payout lifecycle: initiate, list, read, approve, reject. */

const send = async (path: string, method: "GET" | "POST", body?: unknown) => {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

/**
 * Everything a completed or rejected transfer touches.
 *
 * An approval moves the wallet, writes an expense record and changes what the
 * approver still has waiting, so the lists behind all three have to be dropped
 * together — otherwise an approver sees the transfer they just released still
 * sitting in their queue.
 */
const TOUCHED_BY_A_DECISION = [
  queryKey.expenses.getTransfers,
  queryKey.expenses.getTransfer,
  queryKey.expenses.getAllExpenses,
  queryKey.expenses.getTransactions,
  queryKey.transactions.getAllTransactions,
];

// ─── List ─────────────────────────────────────────────────────────────────────

export type FetchTransfersParams = {
  id: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  user?: string;
  search?: string;
  page?: number;
};

export const fetchExpenseTransfers = async ({
  id,
  ...query
}: FetchTransfersParams) => {
  const url = new URL(
    `/api/expenses/transfers/list/${id}`,
    window.location.origin,
  );
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

type ListFnType = typeof fetchExpenseTransfers;

export const useFetchExpenseTransfersQuery = ({
  params,
  ...config
}: QueryConfigType<ListFnType> & { params: FetchTransfersParams }) =>
  useQuery<ExtractFnReturnType<ListFnType>>({
    queryKey: [queryKey.expenses.getTransfers, params],
    queryFn: () => fetchExpenseTransfers(params),
    enabled: Boolean(params.id),
    ...config,
  });

// ─── Single ───────────────────────────────────────────────────────────────────

export const fetchExpenseTransfer = ({ id }: { id: string }) =>
  send(`/api/expenses/transfers/single/${id}`, "GET");

type SingleFnType = typeof fetchExpenseTransfer;

export const useFetchExpenseTransferQuery = ({
  params,
  ...config
}: QueryConfigType<SingleFnType> & { params: { id: string } }) =>
  useQuery<ExtractFnReturnType<SingleFnType>>({
    queryKey: [queryKey.expenses.getTransfer, params],
    queryFn: () => fetchExpenseTransfer(params),
    enabled: Boolean(params.id),
    ...config,
  });

// ─── Initiate ─────────────────────────────────────────────────────────────────

const initiateTransfer = ({
  id,
  body,
}: {
  id: string;
  body: InitiateTransferBody;
}) => send(`/api/expenses/transfers/initiate/${id}`, "POST", body);

export const useInitiateExpenseTransferMutation = (
  config?: MutationCallbacks<typeof initiateTransfer>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.expenses.initiateTransfer],
    mutationFn: initiateTransfer,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message ||
          error?.error ||
          "Could not submit the transfer",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables, context) => {
      // The same call either moves the money or queues it, so the message has
      // to come from the status rather than from the fact it succeeded.
      const status = data?.data?.data?.status ?? data?.data?.status;
      showToast(
        status === "SUCCESS"
          ? "Transfer sent"
          : "Transfer submitted for approval",
        "success",
      );
      TOUCHED_BY_A_DECISION.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      config?.onSuccess?.(data, variables, context);
    },
  });
};

// ─── Approve ──────────────────────────────────────────────────────────────────

const approveTransfer = ({ id, pin }: { id: string; pin: string }) =>
  send(`/api/expenses/transfers/approve/${id}`, "POST", { pin });

export const useApproveExpenseTransferMutation = (
  config?: MutationCallbacks<typeof approveTransfer>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.expenses.approveTransfer],
    mutationFn: approveTransfer,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not approve it",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Transfer approved and sent", "success");
      TOUCHED_BY_A_DECISION.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      config?.onSuccess?.(data, variables, context);
    },
  });
};

// ─── Reject ───────────────────────────────────────────────────────────────────

const rejectTransfer = ({
  id,
  rejection_reason,
}: {
  id: string;
  rejection_reason: string;
}) =>
  send(`/api/expenses/transfers/reject/${id}`, "POST", { rejection_reason });

export const useRejectExpenseTransferMutation = (
  config?: MutationCallbacks<typeof rejectTransfer>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.expenses.rejectTransfer],
    mutationFn: rejectTransfer,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message || error?.error || "Could not reject it",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Transfer rejected", "success");
      TOUCHED_BY_A_DECISION.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      config?.onSuccess?.(data, variables, context);
    },
  });
};
