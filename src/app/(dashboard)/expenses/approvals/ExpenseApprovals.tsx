"use client";

import {
  useApproveExpenseTransferMutation,
  useFetchExpenseTransfersQuery,
  useRejectExpenseTransferMutation,
} from "@/api/expenses/expense-transfers";
import { CustomTable } from "@/components/app/CutomTable";
import TransactionPinDialog from "@/components/app/TransactionPinDialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useExpensePermissions } from "@/hooks/useExpensePermissions";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import type { ExpenseTransfer } from "@/types/expense-governance";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft, Lock, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import RejectTransferDialog from "./RejectTransferDialog";
import { buildTransferColumns } from "./TransferColumns";
import TransferDetailsModal from "./TransferDetailsModal";

/**
 * The approval queue for expense payouts.
 *
 * Opens on everything rather than on the pending slice. Landing on a filtered
 * view made an empty queue ambiguous — nothing waiting and nothing at all look
 * identical — and someone who came to check where their own request got to had
 * to find the filter before they could see it. "Needs approval" is one click
 * away for an approver working through the queue.
 *
 * Rows are a table rather than cards. The queue is a list of like-for-like
 * requests compared on the same handful of fields — amount against amount,
 * requester against requester — and a grid of cards makes that comparison
 * happen by eye across two axes instead of down one column. Everything a card
 * used to carry inline now lives in the details modal, one click away.
 */

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Needs approval", value: "PENDING_APPROVAL" },
  { label: "Awaiting owner", value: "PENDING_OWNER_APPROVAL" },
  { label: "Paid", value: "SUCCESS" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Failed", value: "FAILED" },
] as const;

const ExpenseApprovals = () => {
  const { canApprove, canTransfer, approvalCap } = useExpensePermissions();
  const business_id = useBusinessStore((state) => state.business_id);

  const [status, setStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(search, 500);

  const [viewing, setViewing] = useState<ExpenseTransfer | null>(null);
  const [approving, setApproving] = useState<ExpenseTransfer | null>(null);
  const [rejecting, setRejecting] = useState<ExpenseTransfer | null>(null);

  const { data, isLoading, isFetching } = useFetchExpenseTransfersQuery({
    params: {
      id: business_id,
      status,
      search: debouncedSearch,
      page,
      limit: pageSize,
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

  // Deciding happens from the details modal, so a decision starts by closing
  // it — the PIN and reject dialogs would otherwise stack on top of an open
  // modal and trap focus behind it.
  const startApprove = (transfer: ExpenseTransfer) => {
    setViewing(null);
    setApproving(transfer);
  };

  const startReject = (transfer: ExpenseTransfer) => {
    setViewing(null);
    setRejecting(transfer);
  };

  const columns = useMemo(
    () => buildTransferColumns({ onView: setViewing }),
    [],
  );

  const changeFilter = (value: string) => {
    setStatus(value);
    // A filter change with the old page number lands on an empty page 4.
    setPage(1);
  };

  // Someone who can neither approve nor raise a request has nothing to read
  // here, and the URL is reachable whatever the menu shows.
  if (!canApprove && !canTransfer) {
    return (
      <div className="w-full max-w-md mx-auto rounded-2xl border border-grey-5 bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-grey-6 text-grey-3">
          <Lock className="h-5 w-5" />
        </span>
        <p className="mt-4 text-lg font-extrabold text-grey-1">
          Nothing to see here
        </p>
        <p className="mt-1 text-sm text-grey-3">
          Your account doesn&apos;t handle expense payouts. The business owner
          can grant that from Settings.
        </p>
        <Link
          href="/expenses"
          className="mt-4 inline-block text-sm font-bold text-primary-green-300"
        >
          Back to Expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/expenses"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-grey-5 text-grey-3 hover:text-grey-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xl font-extrabold text-grey-1">
            Transfer approvals
          </p>
          <p className="text-sm text-grey-3">
            {/* Someone who can raise a request but not decide one is here to
                track their own, so the subtitle says what the page is for
                them rather than promising a decision they cannot make. */}
            {canApprove
              ? "Payouts waiting on a decision, and everything already decided."
              : "Where your requests got to. Someone with approval rights decides them."}
          </p>
        </div>
      </div>

      {/* What this person may release, said once at the top rather than
          discovered request by request. `can_current_user_approve` already
          hides the buttons on anything above it; this explains why. */}
      {canApprove && approvalCap !== null && (
        <p className="flex items-center gap-1.5 rounded-xl bg-grey-6 px-3 py-2 text-xs text-grey-3">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-grey-4" />
          You can approve up to {formatToNaira(approvalCap)}. Anything above
          that goes to the business owner.
        </p>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-4" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Reference, beneficiary or narration"
            className="h-11 rounded-xl pl-9"
          />
        </div>
      </div>

      {/* Dimmed while a background refetch is in flight, so a stale list does
          not look interactive mid-update. */}
      <div className={cn("min-w-0", isFetching && !isLoading && "opacity-60")}>
        <CustomTable
          loading={isLoading}
          columns={columns}
          data={transfers}
          showSerialNumber={false}
          onRowClick={(row) => setViewing(row.original)}
          noDataText={
            status === "PENDING_APPROVAL"
              ? "No payouts are waiting on a decision."
              : "No transfers match this filter."
          }
          pagination={{
            currentPage: page,
            totalPages,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              // Page 4 of the old size is usually past the end of the new one.
              setPage(1);
            },
          }}
        />
      </div>

      <TransferDetailsModal
        transfer={viewing}
        onClose={() => setViewing(null)}
        onApprove={startApprove}
        onReject={startReject}
        deciding={approvePending || rejectPending}
      />

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
