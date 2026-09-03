"use client";

import {
  useApproveExpenseTransferMutation,
  useFetchExpenseTransfersQuery,
  useRejectExpenseTransferMutation,
} from "@/api/expenses/expense-transfers";
import TransactionPinDialog from "@/components/app/TransactionPinDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import type { ExpenseTransfer } from "@/types/expense-governance";
import { ArrowLeft, Inbox, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import RejectTransferDialog from "./RejectTransferDialog";
import TransferCard from "./TransferCard";

/**
 * The approval queue for expense payouts.
 *
 * Opens on what needs a decision rather than on everything: an approver comes
 * here because something is waiting, and a list led by last month's completed
 * payouts buries it. The other states are a tab away.
 */

const FILTERS = [
  { label: "Needs approval", value: "PENDING_APPROVAL" },
  { label: "Awaiting owner", value: "PENDING_OWNER_APPROVAL" },
  { label: "Paid", value: "SUCCESS" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Failed", value: "FAILED" },
  { label: "All", value: "ALL" },
] as const;

const ExpenseApprovals = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  const [status, setStatus] = useState<string>("PENDING_APPROVAL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  const [approving, setApproving] = useState<ExpenseTransfer | null>(null);
  const [rejecting, setRejecting] = useState<ExpenseTransfer | null>(null);

  const { data, isLoading, isFetching } = useFetchExpenseTransfersQuery({
    params: {
      id: business_id,
      status,
      search: debouncedSearch,
      page,
    },
  });

  const { mutate: approve, isPending: approvePending } =
    useApproveExpenseTransferMutation({
      onSuccess: () => setApproving(null),
    });

  const { mutate: reject, isPending: rejectPending } =
    useRejectExpenseTransferMutation({
      onSuccess: () => setRejecting(null),
    });

  // The list endpoint is paginated; results sit under data.results like the
  // other paginated endpoints in the app.
  const payload = data?.data;
  const transfers: ExpenseTransfer[] = payload?.results ?? [];
  const totalPages = Number(payload?.pages ?? 1);

  const changeFilter = (value: string) => {
    setStatus(value);
    // A filter change with the old page number lands on an empty page 4.
    setPage(1);
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/expenses"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-grey-5 text-grey-3 hover:text-grey-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xl font-extrabold text-grey-1">
            Transfer approvals
          </p>
          <p className="text-sm text-grey-3">
            Payouts waiting on a decision, and everything already decided.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => changeFilter(filter.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
              status === filter.value
                ? "border-primary-green-300 bg-primary-green-300 text-white"
                : "border-grey-5 text-grey-3 hover:text-grey-1",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-4" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Reference, beneficiary, account or narration"
          className="h-11 rounded-xl pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-grey-5 py-16 text-center">
          <Inbox className="h-8 w-8 text-grey-4" />
          <p className="mt-3 text-sm font-bold text-grey-2">
            Nothing here
          </p>
          <p className="mt-1 max-w-xs text-xs text-grey-4">
            {status === "PENDING_APPROVAL"
              ? "No payouts are waiting on a decision."
              : "No transfers match this filter."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3 lg:grid-cols-2",
            // Dimmed while a background refetch is in flight, so a stale list
            // does not look interactive mid-update.
            isFetching && "opacity-60",
          )}
        >
          {transfers.map((transfer) => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              onApprove={setApproving}
              onReject={setRejecting}
              deciding={
                (approvePending && approving?.id === transfer.id) ||
                (rejectPending && rejecting?.id === transfer.id)
              }
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-grey-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <TransactionPinDialog
        open={Boolean(approving)}
        onClose={() => setApproving(null)}
        loading={approvePending}
        title="Approve and send"
        description={
          approving
            ? `${approving.beneficiary_account_name} will be paid. This cannot be undone.`
            : undefined
        }
        actionLabel="Approve & send"
        onSubmit={(pin) => {
          if (approving) approve({ id: approving.id, pin });
        }}
      />

      <RejectTransferDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        loading={rejectPending}
        reference={rejecting?.payment_reference}
        onConfirm={(rejection_reason) => {
          if (rejecting) reject({ id: rejecting.id, rejection_reason });
        }}
      />
    </div>
  );
};

export default ExpenseApprovals;
