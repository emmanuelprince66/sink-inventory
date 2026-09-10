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
  /** Recording an expense that was already paid, e.g. a cash receipt. */
  can_log_expenses?: boolean;
  can_initiate_expense_transfer?: boolean;
  can_approve_expenses?: boolean;
  /**
   * The most this person can move in one go, whether logged or transferred.
   * null falls back to the business ceiling rather than meaning "no limit".
   */
  max_expense_transfer_amount?: string | null;
  /** Their share of a day, across logging and transfers together. */
  daily_expense_transfer_limit?: string | null;
  /** How many expense actions they get in a day, logging and transfers together. */
  daily_expense_transaction_limit?: number | null;
  /**
   * The most they can approve — independent of what they may spend, so an
   * accountant can sign off a million while being unable to send fifty
   * thousand themselves.
   */
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
  /**
   * Also in the URL, deliberately.
   *
   * The deployed endpoint takes the business in the path
   * (`transfers/initiate/<business_id>/`); the newer integration guide moves
   * it into the body against a bare `transfers/initiate/`, which is not live
   * yet — it still 404s while the path form answers. Sending it both ways
   * costs one redundant field today and means only the URL has to change when
   * the new route lands, rather than the payload breaking on the day.
   */
  business_id?: string;
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

/**
 * A day's allowance cannot be smaller than a single transaction's.
 *
 * The backend rejects this on both the business ceiling and a staff member's
 * own caps, so it is checked here first — the API answers with a field-keyed
 * error that never reaches the input it belongs to, and the owner is left
 * looking at a form that appears to have saved.
 *
 * Zero and blank both mean "not enforced" and so can never conflict.
 */
export const dailyBelowPerTransaction = (
  daily: string | number | null | undefined,
  perTransaction: string | number | null | undefined,
): boolean => {
  const dailyValue = Number(daily ?? 0);
  const perValue = Number(perTransaction ?? 0);

  if (!Number.isFinite(dailyValue) || !Number.isFinite(perValue)) return false;
  if (dailyValue <= 0 || perValue <= 0) return false;

  return dailyValue < perValue;
};

export const DAILY_BELOW_PER_TRANSACTION_MESSAGE =
  "The daily limit cannot be lower than the single-transaction limit.";

/**
 * Why the signed-in user cannot act on a transfer they can see.
 *
 * `can_current_user_approve` is one flag covering several different reasons,
 * and "no buttons, no explanation" reads as a broken screen. The commonest
 * reason by far is separation of duties: whoever asked for the money is never
 * the one who releases it.
 */
export const approvalBlockReason = (
  transfer: Pick<
    ExpenseTransfer,
    "can_current_user_approve" | "initiated_by" | "status"
  >,
  currentUserId?: string | null,
): string | null => {
  if (transfer.can_current_user_approve) return null;
  if (!isPending(transfer.status)) return null;

  if (currentUserId && transfer.initiated_by === currentUserId) {
    return "You started this one, so someone else has to approve it.";
  }

  if (transfer.status === "PENDING_OWNER_APPROVAL") {
    return "Above the staff approval cap — only the owner can release it.";
  }

  return "Waiting on someone with approval rights.";
};

/**
 * `can_current_user_approve`, read defensively.
 *
 * The OpenAPI schema types this as a string rather than a boolean — the shape
 * of an untyped SerializerMethodField. If it ever arrives as the string
 * "false", a plain truthiness test would offer Approve and Reject to someone
 * the backend will refuse with a 403, so the string forms are handled
 * explicitly.
 */
export const canCurrentUserApprove = (value: unknown): boolean => {
  if (typeof value === "string") {
    return !["false", "0", "", "null", "none", "undefined"].includes(
      value.toLowerCase().trim(),
    );
  }
  return Boolean(value);
};

/**
 * The PIN-shaped failures the initiate/approve endpoints answer with.
 *
 * All three arrive as a 400 with a human sentence in `message`, so they are
 * told apart by matching that sentence. Worth doing rather than showing the
 * raw text: "you have not set your PIN yet" is not an error the person can do
 * anything about from a toast — it needs the create-PIN flow opened for them —
 * while a wrong PIN just needs the box cleared and focused.
 */
export type TransferPinFault = "missing" | "not-set" | "invalid";

export const classifyPinFault = (error: unknown): TransferPinFault | null => {
  const raw =
    (error as any)?.details?.message ??
    (error as any)?.message ??
    (error as any)?.error ??
    "";
  const text = String(raw).toLowerCase();

  if (!text) return null;
  // Order matters: "have not set your personal transaction PIN" also contains
  // "transaction pin ... required"-ish wording in some phrasings, and the
  // not-set case is the one with a different remedy.
  if (text.includes("not set") || text.includes("have not set")) {
    return "not-set";
  }
  if (text.includes("invalid transaction pin") || text.includes("incorrect")) {
    return "invalid";
  }
  if (text.includes("pin is required") || text.includes("pin required")) {
    return "missing";
  }
  return null;
};

/**
 * Where a payout of this size will land, for the person about to submit it.
 *
 * Mirrors the backend's two-metric routing so the button can say what it will
 * actually do. The backend decides for real — it also knows the day's running
 * total and the business ceiling — so apart from OVER_LIMIT this sets
 * expectations rather than gating the request.
 *
 * - Someone who cannot approve never self-releases, whatever the amount, and
 *   is refused outright above their own cap (OVER_LIMIT).
 * - An approver releases up to their own direct-payment limit.
 * - Above that but within their approval limit, another approver signs it.
 * - Above their approval limit, only the owner can.
 *
 * A null cap means no personal ceiling — the owner, or someone whose limit is
 * unset and governed by the business ceiling instead.
 */
export type TransferRoute =
  | "EXECUTES"
  | "NEEDS_APPROVAL"
  | "NEEDS_OWNER"
  | "OVER_LIMIT";

export const routeForAmount = ({
  amount,
  canApprove,
  transferCap,
  approvalCap,
}: {
  amount: number;
  canApprove: boolean;
  transferCap: number | null;
  approvalCap: number | null;
}): TransferRoute => {
  // The same field means two different things either side of this line, which
  // is why the tiers cannot share a branch. For someone who cannot approve,
  // max_expense_transfer_amount is a hard initiation cap and the backend
  // refuses anything above it with a 400; for an approver it is a direct-payment
  // threshold, and going above it routes for a second signature instead.
  if (!canApprove) {
    if (transferCap !== null && amount > transferCap) return "OVER_LIMIT";
    return "NEEDS_APPROVAL";
  }

  // No personal direct-payment ceiling: nothing here can say it will be
  // stopped, so it is presented as going out.
  if (transferCap === null) return "EXECUTES";
  if (amount <= transferCap) return "EXECUTES";

  if (approvalCap !== null && amount > approvalCap) return "NEEDS_OWNER";
  return "NEEDS_APPROVAL";
};
