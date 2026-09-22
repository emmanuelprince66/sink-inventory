import { cn } from "@/lib/utils";

/**
 * Batch & expiry inventory (FEFO / FIFO). The backend allocates sales across
 * batches itself; the frontend only ever reads them.
 *
 * urgency, per the backend:
 *   EXPIRED        days_until_expiry < 0
 *   CRITICAL       0–7 days
 *   EXPIRING_SOON  8–30 days
 *   NORMAL         more than 30 days
 *   NON_PERISHABLE no expiry_date (days_until_expiry is null)
 */
export type BatchUrgency =
  | "EXPIRED"
  | "CRITICAL"
  | "EXPIRING_SOON"
  | "NORMAL"
  | "NON_PERISHABLE"
  | (string & {});

/**
 * One entry of `batches` on GET /product/single_product/{id}/. Only batches
 * with stock left are sent, earliest expiry first, non-perishables last.
 */
export interface ProductBatch {
  id: string;
  /** The typed batch_number, or a generated "Batch A • Supplier (Date)". */
  batch_name: string;
  /** Decimal units are real (2.5 kg), so never assume an integer. */
  quantity: number | string;
  cost_price?: number | string | null;
  selling_price?: number | string | null;
  expiry_date: string | null;
  days_until_expiry: number | null;
  urgency: BatchUrgency;
  supplier?: string | null;
  date_received?: string | null;
  /**
   * Which variant the batch belongs to. The product's `batches` covers the
   * parent and every variant, so these say them apart; on a product with no
   * variants they simply repeat the product.
   */
  product_id?: string | null;
  product_name?: string | null;
}

/** 40.0 → "40", 2.5 → "2.5". */
export const formatQty = (quantity: number | string | null | undefined) => {
  const n = Number(quantity);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "—";
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days until a "YYYY-MM-DD" date, for rows (restock history) that carry an
 * expiry_date but not the backend's own count. Parsed by hand: `new Date()`
 * reads a bare date as UTC and can land a day early west of Greenwich.
 */
export const daysUntil = (ymd?: string | null) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd ?? "");
  if (!m) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
};

/** The backend's buckets, for when only a day count is at hand. */
export const urgencyFromDays = (days: number | null): BatchUrgency => {
  if (days === null) return "NON_PERISHABLE";
  if (days < 0) return "EXPIRED";
  if (days <= 7) return "CRITICAL";
  if (days <= 30) return "EXPIRING_SOON";
  return "NORMAL";
};

const TONE: Record<string, string> = {
  EXPIRED: "bg-rose-600 text-white",
  CRITICAL: "bg-rose-100 text-rose-700",
  EXPIRING_SOON: "bg-amber-100 text-amber-700",
  NORMAL: "bg-emerald-100 text-emerald-700",
  NON_PERISHABLE: "bg-grey-6 text-grey-3",
};

export const expiryLabel = (days: number | null, urgency?: BatchUrgency) => {
  if (urgency === "NON_PERISHABLE" || days === null) return "No expiry";
  if (days < -1) return `Expired ${-days} days ago`;
  if (days === -1) return "Expired yesterday";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
};

export const UrgencyPill = ({
  days,
  urgency,
  className,
}: {
  days: number | null;
  /** The backend's value when sent; otherwise bucketed from `days`. */
  urgency?: BatchUrgency;
  className?: string;
}) => {
  const level = urgency ?? urgencyFromDays(days);
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-full",
        TONE[level] ?? TONE.NON_PERISHABLE,
        className,
      )}
    >
      {expiryLabel(days, level)}
    </span>
  );
};
