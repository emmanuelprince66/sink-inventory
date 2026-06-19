"use client";

import CustomPagination from "@/components/app/CustomPagination";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronRight, FilterX, Inbox, Paperclip } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import {
  EXPENSE_CATEGORIES,
  ExpenseTransaction,
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  MOCK_USERS,
  STATUS_META,
  TransactionStatus,
  getAccountById,
  getUserById,
} from "./mock-data";

interface ExpenseTransactionsViewProps {
  onSelectTransaction: (txn: ExpenseTransaction) => void;
}

const PAGE_SIZE = 8;
const ALL = "__all__";

const ExpenseTransactionsView = ({
  onSelectTransaction,
}: ExpenseTransactionsViewProps) => {
  const [search, setSearch] = useState("");
  const [accountId, setAccountId] = useState<string>(ALL);
  const [userId, setUserId] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<TransactionStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((t) => {
      if (search.trim().length >= 2) {
        const q = search.toLowerCase();
        const matches =
          t.reference.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.narration.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (
        accountId !== ALL &&
        t.sourceAccountId !== accountId &&
        t.destinationAccountId !== accountId
      ) {
        return false;
      }
      if (userId !== ALL && t.initiatedById !== userId) return false;
      if (category !== ALL && t.category !== category) return false;
      if (status !== ALL && t.status !== status) return false;
      return true;
    });
  }, [search, accountId, userId, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filtersActive =
    !!search ||
    accountId !== ALL ||
    userId !== ALL ||
    category !== ALL ||
    status !== ALL;

  const resetFilters = () => {
    setSearch("");
    setAccountId(ALL);
    setUserId(ALL);
    setCategory(ALL);
    setStatus(ALL);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Search by reference, category, or narration..."
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-3">
            <Select
              value={accountId}
              onValueChange={(v) => {
                setAccountId(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[170px]">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All accounts</SelectItem>
                {MOCK_ACCOUNTS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={userId}
              onValueChange={(v) => {
                setUserId(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[160px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All users</SelectItem>
                {MOCK_USERS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as TransactionStatus | typeof ALL);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtersActive && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-slate-600 hover:bg-slate-100"
            >
              <FilterX className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left">
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Reference
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Account
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Initiated By
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Approved By
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Category
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600 text-right">
                  Amount
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Status
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600 text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => {
                const status = STATUS_META[t.status];
                const initiator = getUserById(t.initiatedById);
                const approver = t.approvedById
                  ? getUserById(t.approvedById)
                  : null;
                const source = getAccountById(t.sourceAccountId);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTransaction(t)}
                    className="border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {t.reference}
                        </span>
                        {t.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {source?.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {initiator?.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {approver?.name || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {t.category}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 text-right">
                      {formatToNaira(t.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          status.pill,
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            status.dot,
                          )}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 text-right whitespace-nowrap">
                      {moment(t.createdAt).format("MMM D")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="md:hidden divide-y divide-slate-100">
          {pageItems.map((t) => {
            const status = STATUS_META[t.status];
            const initiator = getUserById(t.initiatedById);
            const source = getAccountById(t.sourceAccountId);
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelectTransaction(t)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initiator?.initials || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {t.reference}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          status.pill,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {source?.name || "—"} · {t.category}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {moment(t.createdAt).format("MMM D, YYYY · h:mm A")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatToNaira(t.amount)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>

        {pageItems.length === 0 && (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              No transactions found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {filtersActive
                ? "Try clearing the filters above."
                : "Transactions will show up here as your team spends."}
            </p>
          </div>
        )}

        {pageItems.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-100">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTransactionsView;
