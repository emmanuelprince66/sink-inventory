"use client";

import { useUserRole } from "@/lib/store/user-store";

/**
 * What the signed-in person may do with expenses.
 *
 * Four screens ask this — the sidebar, the Expenses header, the transfer form
 * and the approvals queue — and they have to agree. A sidebar link to a page
 * whose every button is disabled is worse than no link, and a Transfer button
 * that opens a form the API then refuses is worse still.
 *
 * The owner is uncapped by design, which `hasPermission` already handles by
 * answering true for them regardless of the flags; the ceilings below are
 * skipped for the same reason rather than being read as "no limit set".
 */
export interface ExpensePermissions {
  /** Record money already spent. */
  canLog: boolean;
  /** Ask for a payout. */
  canTransfer: boolean;
  /** Release someone else's request. */
  canApprove: boolean;
  /** Whether the expenses area is worth showing at all. */
  hasAnyAccess: boolean;
  isOwner: boolean;
  /**
   * The most this person may send or approve in one go, or null where no
   * personal ceiling applies — either because they are the owner, or because
   * theirs is unset and the business ceiling governs instead.
   */
  transferCap: number | null;
  approvalCap: number | null;
}

/** A decimal string ceiling as a number, or null when it does not apply. */
const capOf = (value: unknown, isOwner: boolean): number | null => {
  if (isOwner || value === null || value === undefined || value === "") {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

export const useExpensePermissions = (): ExpensePermissions => {
  const { can, permissions, role } = useUserRole();
  const isOwner = role === "OWNER";

  const canLog = can("can_log_expenses");
  const canTransfer = can("can_initiate_expense_transfer");
  const canApprove = can("can_approve_expenses");

  return {
    canLog,
    canTransfer,
    canApprove,
    hasAnyAccess: canLog || canTransfer || canApprove,
    isOwner,
    transferCap: capOf(
      (permissions as any)?.max_expense_transfer_amount,
      isOwner,
    ),
    approvalCap: capOf(
      (permissions as any)?.max_expense_approval_amount,
      isOwner,
    ),
  };
};
