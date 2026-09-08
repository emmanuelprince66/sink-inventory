"use client";

import {
  useApproveExpenseMutation,
  useRejectExpenseMutation,
} from "@/api/expenses/expense-decisions";
import { useFetchExpensesQuery } from "@/api/expenses/fetch-expenses";
import CustomPagination from "@/components/app/CustomPagination";
import { SearchInput } from "@/components/app/SearchInput";
import TransactionPinDialog from "@/components/app/TransactionPinDialog";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenseCategoryOptions } from "@/hooks/useExpenseAccountsHook";
import { useDebounce } from "@/hooks/useDebounce";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { Check, ChevronRight, Copy, FilterX, Inbox, X } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import RejectTransferDialog from "../approvals/RejectTransferDialog";
import {
  getCategoryMeta,
  getDecidedBy,
  getExpenseReference,
  getRefLabel,
  getStatusMeta,
  unwrapPaginated,
} from "./expense-ui-meta";

interface ExpenseTransactionsViewProps {
  onSelectTransaction: (txn: any) => void;
  /** Optional pre-applied category filter (e.g. from a category card link). */
  initialCategory?: string;
  /** Same range as the page-level date picker. Controlled from the parent —
   * this tab doesn't get its own independent date filter, it just follows
   * whatever's selected up top (same as the overview cards / category grid). */
  dateRange?: DateRange;
}

const PAGE_SIZE = 10;
const ALL = "__all__";

// Powered by /expenses/business/{id}/ — the confirmed, working expenses
// endpoint (same one behind the "Total Expenses" overview card). Each item
// already carries `category: {id, name}`, which is what drives the
// category grid + budget lookups elsewhere on this page.
const ExpenseTransactionsView = ({
  onSelectTransaction,
  initialCategory,
  dateRange,
}: ExpenseTransactionsViewProps) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(initialCategory || ALL);
  // The row a decision is being taken on. Held as the row rather than a
  // boolean so the dialogs can name what is being decided.
  const [approving, setApproving] = useState<any | null>(null);
  const [rejecting, setRejecting] = useState<any | null>(null);

  const { mutate: approve, isPending: approvePending } =
    useApproveExpenseMutation({ onSuccess: () => setApproving(null) });

  const { mutate: reject, isPending: rejectPending } = useRejectExpenseMutation(
    { onSuccess: () => setRejecting(null) },
  );

  /**
   * Whether this row can be decided by the person looking at it.
   *
   * The backend's own answer, which already accounts for role, permission,
   * the approval cap and the rule that nobody approves what they raised.
   * Re-deriving any of that here could only disagree with it.
   */
  const canDecide = (row: any) => row?.can_current_user_approve === true;

  const deciding = (row: any) =>
    (approvePending && approving?.id === row.id) ||
    (rejectPending && rejecting?.id === row.id);

  // Which row was just copied, so the tick shows on that row alone.
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyReference = (row: any) => {
    const reference = getExpenseReference(row);
    if (!reference || reference === "—") return;

    // Fire and forget: a clipboard the browser refuses is not worth an error
    // dialog over, and the reference is on screen to read either way.
    navigator.clipboard?.writeText(reference).then(
      () => {
        setCopiedId(row.id);
        setTimeout(() => setCopiedId(null), 1500);
      },
      () => {},
    );
  };
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setPage(1);
    }
  }, [initialCategory]);

  const debouncedSearch = useDebounce(search, 500);

  const { categoryOptions: categories } = useExpenseCategoryOptions();

  const { data: ExpensesData, isLoading, isFetching } = useFetchExpensesQuery({
    params: {
      id: business_id as string,
      search: debouncedSearch,
      page,
      limit: PAGE_SIZE,
      category: category !== ALL ? category : undefined,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
  });

  const raw = ExpensesData?.data;
  const { items, total, pages } = unwrapPaginated(raw);

  const filtersActive = !!search || category !== ALL;

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL);
    setPage(1);
  };

  return (
    <div className="w-full space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-grey-5 bg-white p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-full md:w-72 md:shrink-0">
            <SearchInput
              placeholder="Search by expense name..."
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 min-h-0 font-bold text-grey-2 md:w-[190px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="min-w-[220px]">
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-grey-3">
            {total} {total === 1 ? "result" : "results"}
          </span>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs font-bold text-grey-2 hover:bg-secondary-6 hover:text-primary-green-300"
            >
              <FilterX className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-grey-5 bg-white overflow-hidden">
        {isLoading ? (
          <TableSkeleton
            rows={6}
            columns={[
              { flex: true, thumbnail: true },
              { width: "w-24", hiddenOnMobile: true },
              { width: "w-20", hiddenOnMobile: true },
              { width: "w-20", hiddenOnMobile: true },
              { width: "w-16", alignRight: true },
              { width: "w-20", hiddenOnMobile: true },
              { width: "w-20", hiddenOnMobile: true, alignRight: true },
              { width: "w-24", hiddenOnMobile: true, alignRight: true },
            ]}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-grey-6 border-b border-grey-5">
                  <tr className="text-left">
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Reference
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Category
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Initiated By
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Approved By
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Amount
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Status
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Date
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={cn(isFetching && "opacity-50")}>
                  {items.map((t: any) => {
                    const categoryLabel = getRefLabel(
                      t.category,
                      "Uncategorised",
                    );
                    const catMeta = getCategoryMeta(categoryLabel);
                    const CatIcon = catMeta.icon;
                    const decidedBy = getDecidedBy(t);
                    const statusMeta = getStatusMeta(t.status);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => onSelectTransaction(t)}
                        className="border-b border-grey-5 hover:bg-secondary-6/40 cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-grey-1">
                              {getExpenseReference(t)}
                            </span>
                            <button
                              type="button"
                              aria-label="Copy reference"
                              title="Copy reference"
                              // The row opens the detail panel, so a click on
                              // the copy button must not also navigate.
                              onClick={(e) => {
                                e.stopPropagation();
                                copyReference(t);
                              }}
                              className="shrink-0 rounded p-0.5 text-grey-4 hover:bg-grey-6 hover:text-grey-2 cursor-pointer"
                            >
                              {copiedId === t.id ? (
                                <Check className="w-3 h-3 text-primary-green-300" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "w-6 h-6 rounded-md flex items-center justify-center border",
                                catMeta.tone,
                              )}
                            >
                              <CatIcon className="w-3 h-3" />
                            </span>
                            <span className="text-sm text-grey-2">
                              {categoryLabel}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-grey-2">
                          {getRefLabel(t.added_by)}
                        </td>
                        {/* Rejections read in red: the same column carries
                            whoever decided it, and the name of someone who
                            turned an expense down should not sit there
                            looking like an approval. */}
                        <td
                          className={cn(
                            "py-3 px-4 text-sm whitespace-nowrap",
                            decidedBy.decision === "rejected"
                              ? "text-error-1"
                              : decidedBy.decision === "approved"
                                ? "text-grey-2"
                                : "text-grey-4",
                          )}
                        >
                          {decidedBy.name}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-error-1 text-right whitespace-nowrap">
                          {formatToNaira(t.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
                              statusMeta.pill,
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                statusMeta.dot,
                              )}
                            />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-grey-3 text-right whitespace-nowrap">
                          {t.date ? moment(t.date).format("MMM D, YYYY") : "—"}
                        </td>
                        {/* The row opens the details panel, so every control
                            in here stops the click travelling — otherwise
                            approving also navigates. */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {canDecide(t) ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={deciding(t)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejecting(t);
                                }}
                                className="rounded-lg border border-error-1/30 px-2 py-1 text-[11px] font-bold text-error-1 hover:bg-error-2 disabled:opacity-50 cursor-pointer"
                              >
                                <X className="mr-1 inline h-3 w-3" />
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={deciding(t)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setApproving(t);
                                }}
                                className="rounded-lg bg-primary-green-300 px-2 py-1 text-[11px] font-bold text-white hover:bg-primary-green-300/90 disabled:opacity-50 cursor-pointer"
                              >
                                <Check className="mr-1 inline h-3 w-3" />
                                Approve
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-grey-4">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul
              className={cn(
                "md:hidden divide-y divide-grey-5",
                isFetching && "opacity-50",
              )}
            >
              {items.map((t: any) => {
                const categoryLabel = getRefLabel(t.category, "Uncategorised");
                const catMeta = getCategoryMeta(categoryLabel);
                const CatIcon = catMeta.icon;
                const decidedBy = getDecidedBy(t);
                const statusMeta = getStatusMeta(t.status);
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => onSelectTransaction(t)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-secondary-6/40 transition-colors text-left cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                          catMeta.tone,
                        )}
                      >
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-grey-1 truncate block">
                          {getExpenseReference(t)}
                        </span>
                        <p className="text-[11px] text-grey-3 truncate mt-0.5">
                          {categoryLabel} · {getRefLabel(t.added_by)}
                        </p>
                        <p className="text-[11px] text-grey-3 mt-0.5">
                          {t.date ? moment(t.date).format("MMM D, YYYY") : "—"}
                          {decidedBy.decision !== "pending" &&
                            ` · ${decidedBy.decision === "rejected" ? "Rejected" : "Approved"} by ${decidedBy.name}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-error-1">
                          {formatToNaira(t.amount)}
                        </p>
                        <span
                          className={cn(
                            "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap",
                            statusMeta.pill,
                          )}
                        >
                          <span
                            className={cn(
                              "h-1 w-1 rounded-full",
                              statusMeta.dot,
                            )}
                          />
                          {statusMeta.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-grey-4 shrink-0" />
                    </button>

                    {/* Outside the row button rather than inside it — a
                        button within a button is invalid markup and taps
                        land on whichever the browser decides. */}
                    {canDecide(t) && (
                      <div className="flex items-center gap-2 px-3 pb-3">
                        <button
                          type="button"
                          disabled={deciding(t)}
                          onClick={() => setRejecting(t)}
                          className="flex-1 rounded-lg border border-error-1/30 py-1.5 text-[11px] font-bold text-error-1 disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={deciding(t)}
                          onClick={() => setApproving(t)}
                          className="flex-1 rounded-lg bg-primary-green-300 py-1.5 text-[11px] font-bold text-white disabled:opacity-50 cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {items.length === 0 && (
              <div className="py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-grey-6 mx-auto flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-grey-4" />
                </div>
                <p className="text-sm font-bold text-grey-1">
                  No expenses found
                </p>
                <p className="text-xs text-grey-3 mt-1">
                  {filtersActive
                    ? "Try clearing the filters above."
                    : "Expenses will show up here as your team logs them."}
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div className="px-3 py-2 border-t border-grey-5">
                <CustomPagination
                  currentPage={page}
                  totalPages={pages}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Approving records it in the books — same PIN gate as a payout, and
          the dialog creates one first if this person has none. */}
      <TransactionPinDialog
        open={Boolean(approving)}
        onClose={() => setApproving(null)}
        onSubmit={(pin) => approving && approve({ id: approving.id, pin })}
        title="Approve this expense"
        description={
          approving
            ? `${formatToNaira(approving.amount)} — ${getExpenseReference(
                approving,
              )}. This signs it off; no money moves.`
            : undefined
        }
        actionLabel="Approve"
        loading={approvePending}
      />

      <RejectTransferDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        onConfirm={(rejection_reason) =>
          rejecting && reject({ id: rejecting.id, rejection_reason })
        }
        loading={rejectPending}
        reference={rejecting ? getExpenseReference(rejecting) : undefined}
      />
    </div>
  );
};

export default ExpenseTransactionsView;
