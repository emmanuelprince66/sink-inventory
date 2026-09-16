// In-store draft ("self checkout order") models.
//
// A customer builds a basket on the storefront, gets a code like INS-6290 and
// brings it to the till. What the cashier then does depends entirely on
// whether it has been paid for already — see `can_release_items`.

export type InStorePaymentType = "COUNTER" | "ONLINE" | "BNPL";

export type InStoreDraftStatus =
  | "UNPAID"
  | "PENDING_ONLINE_PAYMENT"
  | "PENDING_BNPL_AUTHORIZATION"
  | "BNPL_APPROVED"
  | "BNPL_REJECTED"
  | "PAID"
  | "COLLECTED";

export interface InStoreDraftItem {
  product_id: string;
  name: string;
  quantity: string;
  unit_price: string;
  discount: string;
  line_total: string;
  /** Empty string rather than null when the line has no variation. */
  variation_id?: string | null;
  variation_name?: string | null;
  image?: string | null;
  type?: "PRODUCT" | "COMBO";
}

/** An account the buyer may have transferred into. */
export interface DraftBankAccount {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  /** What the account was opened for — only set on a virtual account. */
  amount?: string;
  charges?: string;
  reference?: string;
}

export interface InStoreDraft {
  business_id: string;
  order_code: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  /** The customer record finalize will charge. Resolved or created from the
   * draft's phone/name/email server-side, so it never has to be sent back. */
  customer_id?: string | null;
  table_or_room?: string | null;
  items: InStoreDraftItem[];
  total_amount: string;
  note?: string | null;
  status: InStoreDraftStatus;
  bnpl_status?: "PENDING" | "APPROVED" | "REJECTED" | null;
  /**
   * The single most important field on this object.
   *
   * True means the money is already collected — BNPL approved, or an online
   * transfer landed — and the backend has ALREADY created the Sale and
   * deducted the stock. Finalizing such a draft records collection only; it
   * must never be re-rung through the normal checkout, which would sell the
   * same goods twice.
   *
   * False means nothing has been paid. For a COUNTER draft that's the normal
   * state, and the cashier takes payment.
   */
  can_release_items: boolean;
  /** True once a cashier has handed the goods over. */
  is_collected?: boolean;
  collected_at?: string | null;
  expires_in_seconds?: number;
  expires_in_ms?: number;
  /** Absolute expiry, server time. */
  expires_at?: string;
  /**
   * Where the buyer was told to send the money, and the crux of whether a
   * transfer can be confirmed automatically at all.
   *
   * A virtual account is per-order and webhooked, so payment verifies itself.
   * When one can't be generated the backend falls back to the business's own
   * static accounts — and those receive NO webhooks, so nothing will ever mark
   * the draft paid no matter how many times the till refreshes. That case has
   * to be settled by a human checking the bank, which is why the two are kept
   * apart here rather than collapsed into one "account" field.
   */
  vfd_virtual_account?: DraftBankAccount | null;
  bank_accounts?: DraftBankAccount[] | null;
  /** Fee and the total the buyer was actually asked to send. */
  charges?: string;
  payable_amount?: string;
  pay_charges?: boolean;
  payment_type: InStorePaymentType;
  created_at: string;
}

/** Mirrors the enum sale/create already uses, so payment UI is shared. */
export type FinalizePaymentMethod =
  | "CASH"
  | "POS"
  | "CARD"
  | "BANK"
  | "BANK-TRANSFER"
  | "PARTIAL"
  | "CREDIT"
  | "MULTIPLE"
  | "BNPL";

export interface FinalizeSplitPayment {
  name: string;
  amount: string;
  bank?: string;
}

/**
 * Body for instore-finalize.
 *
 * Everything except `order_code` is optional: an already-paid draft is
 * collected by posting the code alone. The field names deliberately match
 * sale/create (`method`, `bank`) rather than the aliases the docs use
 * (`payment_method`, `bank_id`) so the POS's existing payload builder can be
 * reused without a translation layer.
 */
export interface FinalizeDraftPayload {
  order_code: string;
  method?: FinalizePaymentMethod;
  amount_paid?: string;
  bank?: string;
  multiple_payments?: FinalizeSplitPayment[];
  partial_method?: "CASH" | "POS" | "CARD" | "BANK";
  due_date?: string;
  loyalty_reward_id?: string;
  attendant?: string;
  customer?: string;
  date?: string;
  description?: string;
  /** Only sent when the cashier adjusted the basket at the counter. */
  items?: {
    product_id: string;
    quantity: string;
    variation_id?: string | null;
    unit_price?: string;
    discount?: string;
  }[];
}

export interface FinalizeDraftResponse {
  message: string;
  id: string;
  sale_id: string;
  order_code: string;
  reference?: string;
  payment_status?: string;
  payment_method?: string;
  total_price?: string;
  balance?: string;
  due_date?: string | null;
  status?: string;
  is_collected?: boolean;
  receipt?: {
    business_name?: string;
    business_phone?: string;
    customer_name?: string;
    customer_phone?: string;
    date?: string;
    items?: {
      name: string;
      quantity: string;
      unit_price: string;
      discount: string;
      line_total: string;
    }[];
    total_amount?: string;
    amount_paid?: string;
    payment_method?: string;
  };
}

/**
 * A decimal as a 2-place money string: "199.0000" → "199.00".
 *
 * Draft totals come back with FOUR decimal places, but finalize's amount
 * fields accept at most two and reject anything longer with a 400 — so a
 * total can't be sent back as-is. Rounded half-up in whole kobo from the
 * string's own digits rather than with toFixed on a float, where 1.005 comes
 * out as 1.00 instead of 1.01. Integer kobo stays exact far beyond any real
 * till total.
 */
export const toMoneyString = (value: string | number): string => {
  const text = typeof value === "number" ? String(value) : value.trim();
  const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(text);
  if (!match) return (Number(value) || 0).toFixed(2);

  const [, sign, whole, fraction = ""] = match;
  const roundsUp = (fraction[2] ?? "0") >= "5";
  const kobo =
    Number((whole || "0") + (fraction + "00").slice(0, 2)) + (roundsUp ? 1 : 0);

  const naira = Math.floor(kobo / 100);
  const rest = String(kobo % 100).padStart(2, "0");
  return `${kobo === 0 ? "" : sign}${naira}.${rest}`;
};

/** Accepts "INS-6290" or a bare "6290", and normalises to what the API wants. */
export const normaliseOrderCode = (raw: string): string => {
  const trimmed = raw.trim().toUpperCase();
  return trimmed.startsWith("INS-") ? trimmed : `INS-${trimmed}`;
};

/**
 * Whether a scanned string looks like a self checkout order, not a barcode.
 *
 * The storefront QR encodes the raw code, so the POS's existing scanner picks
 * it up as ordinary text. Without this check it would be fired at product
 * search, which returns nothing and looks like a broken scanner.
 */
export const isOrderCode = (scanned: string): boolean =>
  /^INS-\w+$/i.test(scanned.trim());

/** What the cashier is told, and whether the release button is live. */
export const describeDraft = (draft: InStoreDraft) => {
  if (draft.is_collected) {
    return {
      tone: "neutral" as const,
      label: "Already collected",
      detail:
        "These goods have been handed over. Check with a supervisor before releasing anything again.",
    };
  }

  if (draft.can_release_items) {
    return {
      tone: "success" as const,
      label:
        draft.payment_type === "BNPL" ? "Paid — BNPL approved" : "Paid online",
      detail:
        "Payment is confirmed. Check the items against the bag, then release them. No payment to collect.",
    };
  }

  if (draft.bnpl_status === "PENDING") {
    return {
      tone: "pending" as const,
      label: "Awaiting Akawopay",
      detail:
        "The customer's installment plan hasn't been approved yet. Refresh in a moment — don't release anything.",
    };
  }

  if (draft.bnpl_status === "REJECTED") {
    return {
      tone: "error" as const,
      label: "BNPL declined",
      detail:
        "Akawopay declined this request. The customer can pay here by cash, card or transfer instead.",
    };
  }

  // The customer chose to transfer and may well have already sent it — the
  // bank simply hasn't confirmed yet. Calling that "payment due" next to a
  // row of payment buttons is how a cashier collects for the same order
  // twice, so it gets its own state.
  if (draft.payment_type === "ONLINE") {
    return {
      tone: "pending" as const,
      label: "Waiting for bank transfer",
      detail:
        "The customer is paying by transfer. Tap Refresh — it checks the bank directly, so a completed transfer clears immediately. Don't release anything until it does, and don't take payment again unless they tell you the transfer failed.",
    };
  }

  return {
    tone: "neutral" as const,
    label: "Payment due",
    detail: "Check the items, then take payment to complete this order.",
  };
};
