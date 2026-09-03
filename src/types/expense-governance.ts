/**
 * Expense payout governance: spending limits, delegated approval rights, and
 * the approval lifecycle a payout goes through before money moves.
 */

/** Every state a transfer can be in, in the order it travels through them. */
export const TRANSFER_STATUSES = [
  "PENDING_APPROVAL",
  "PENDING_OWNER_APPROVAL",
  "APPROVED",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "REJECTED",
] as const;

export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

/** The two states an approver can still act on. */
export const PENDING_STATUSES: TransferStatus[] = [
  "PENDING_APPROVAL",
  "PENDING_OWNER_APPROVAL",
];

export const isPending = (status?: string | null): boolean =>
  PENDING_STATUSES.includes(status as TransferStatus);

export interface ExpenseSettings {
  id: string;
  /** Decimal strings. "0.00" means no limit is enforced, not "nothing allowed". */
  max_amount_per_transaction: string;
  daily_transfer_limit: string;
  /** Count of transfers per day. 0 means no limit. */
  daily_transaction_limit: number;
  require_approval_for_all: boolean;
  created_at?: string;
  updated_at?: string;
}

/** The subset the owner can write; every field is optional (partial update). */
export interface ExpenseSettingsUpdate {
  max_amount_per_transaction?: string;
  daily_transfer_limit?: string;
  daily_transaction_limit?: number;
  require_approval_for_all?: boolean;
}

export interface AttendantPermissions {
  view_transactions?: boolean;
  view_orders?: boolean;
  can_initiate_expense_transfer?: boolean;
  can_approve_expenses?: boolean;
  /** Above this, an approval escalates to the owner. null means no cap set. */
  max_expense_approval_amount?: string | null;
}

/**
 * Two documented shapes for one response.
 *
 * The integration guide shows `{ role, permissions: {...} }`. The OpenAPI
 * schema's UserPermission is flat — the flags at the top level, no role. The
 * endpoint 500s at the time of writing, so both are treated as possible and
 * the caller reads `permissions ?? the object itself`. Drop the flat half once
 * a real response settles it.
 */
export interface AttendantPermissionsResponse extends AttendantPermissions {
  role?: string;
  permissions?: AttendantPermissions;
}

export interface ExpenseTransfer {
  id: string;
  payment_reference: string;
  amount: string;
  /** Bank charge, worked out by the backend from the amount. */
  charges: string;
  category: string | null;
  category_name: string | null;
  beneficiary_account_number: string;
  beneficiary_account_name: string;
  beneficiary_bank_name: string;
  beneficiary_bank_code: string;
  narration: string | null;
  status: TransferStatus | string;
  initiated_by: string;
  initiated_by_name: string;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_by_name: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  /**
   * Whether the signed-in user may act on this one.
   *
   * Computed per-user by the backend from role, permissions and the approval
   * cap, so the Approve and Reject buttons key off this flag alone rather than
   * the frontend trying to re-derive who is allowed to do what.
   */
  can_current_user_approve: boolean;
  created_at: string;
  updated_at: string;
}

export interface InitiateTransferBody {
  amount: string;
  account_number: string;
  bank_code: string;
  category_id?: string;
  narration?: string;
  /** Sent for instant execution; omitted to submit for approval. */
  pin?: string;
}

/**
 * How each status is worded and coloured.
 *
 * One table so the badge, the filter tabs and the detail sheet cannot drift
 * apart on what "PENDING_OWNER_APPROVAL" is called. Tones are the app's
 * existing semantic colours rather than raw hex.
 */
export const STATUS_PRESENTATION: Record<
  string,
  { label: string; text: string; surface: string; border: string; hint: string }
> = {
  PENDING_APPROVAL: {
    label: "Pending approval",
    text: "text-warning-1",
    surface: "bg-warning-2",
    border: "border-warning-1/30",
    hint: "Waiting for an approver to review it.",
  },
  PENDING_OWNER_APPROVAL: {
    label: "Awaiting owner",
    text: "text-warning-1",
    surface: "bg-warning-2",
    border: "border-warning-1/40",
    hint: "Above the staff approval cap, so only the owner can release it.",
  },
  APPROVED: {
    label: "Approved",
    text: "text-info-1",
    surface: "bg-info-2",
    border: "border-info-1/30",
    hint: "Approved and queued for the bank.",
  },
  PROCESSING: {
    label: "Processing",
    text: "text-info-1",
    surface: "bg-info-2",
    border: "border-info-1/30",
    hint: "With the bank. Nothing to do but wait.",
  },
  SUCCESS: {
    label: "Paid",
    text: "text-success-1",
    surface: "bg-success-2",
    border: "border-success-1/30",
    hint: "Sent, and recorded as an expense.",
  },
  FAILED: {
    label: "Failed",
    text: "text-error-1",
    surface: "bg-error-2",
    border: "border-error-1/30",
    hint: "The bank rejected the payout.",
  },
  REJECTED: {
    label: "Rejected",
    text: "text-grey-3",
    surface: "bg-grey-6",
    border: "border-grey-5",
    hint: "Declined by an approver.",
  },
};

/** Falls back rather than rendering an empty pill for a status we don't know. */
export const presentationFor = (status?: string | null) =>
  STATUS_PRESENTATION[status ?? ""] ?? {
    label: status ? String(status).replace(/_/g, " ").toLowerCase() : "Unknown",
    text: "text-grey-3",
    surface: "bg-grey-6",
    border: "border-grey-5",
    hint: "",
  };

/**
 * The bank charge for an amount, mirroring the backend's bands.
 *
 * Shown before submitting so the initiator knows the wallet is debited for
 * more than the amount typed. The backend recalculates it and its number is
 * the one that counts — this is a preview, never sent up.
 */
export const estimateCharges = (amount: number): number => {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount <= 50_000) return 25;
  if (amount < 500_000) return 50;
  return 100;
};
