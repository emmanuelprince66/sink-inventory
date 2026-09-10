// Presentation-only helpers for the (now real, API-backed) Expense Account
// Management module — icon/tone per category name, and a small status-pill
// map. No mock data lives here; everything else comes from the API.

import {
  type LucideIcon,
  Briefcase,
  CheckCircle2,
  Cog,
  Flame,
  Megaphone,
  ShieldCheck,
  Truck,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

export interface CategoryMeta {
  name: string;
  icon: LucideIcon;
  tone: string;
}

// Best-effort icon/tone per well-known category name. Anything not listed
// here (e.g. a merchant's custom category) falls back to a generic look.
const CATEGORY_META: Record<string, CategoryMeta> = {
  Fuel: { name: "Fuel", icon: Flame, tone: "bg-amber-50 text-amber-700 border-amber-100" },
  Transport: { name: "Transport", icon: Truck, tone: "bg-sky-50 text-sky-700 border-sky-100" },
  Salaries: { name: "Salaries", icon: Wallet, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  Marketing: { name: "Marketing", icon: Megaphone, tone: "bg-violet-50 text-violet-700 border-violet-100" },
  Logistics: { name: "Logistics", icon: Briefcase, tone: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  Operations: { name: "Operations", icon: Cog, tone: "bg-rose-50 text-rose-700 border-rose-100" },
  Utilities: { name: "Utilities", icon: Zap, tone: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  Maintenance: { name: "Maintenance", icon: Wrench, tone: "bg-teal-50 text-teal-700 border-teal-100" },
};

const FALLBACK_CATEGORY_META: Omit<CategoryMeta, "name"> = {
  icon: ShieldCheck,
  tone: "bg-slate-50 text-slate-700 border-slate-200",
};

export const getCategoryMeta = (name: string): CategoryMeta =>
  CATEGORY_META[name] || { ...FALLBACK_CATEGORY_META, name };

/**
 * Statuses for a LOGGED expense — not for an expense transfer.
 *
 * The money here was already spent in the real world, so the approval is
 * internal sign-off and nothing is disbursed afterwards. That makes APPROVED
 * the terminal success state, and it reads green for the same reason a
 * settled transfer does; there is no COMPLETED to move on to.
 *
 * Transfers use their own map in types/expense-governance, where APPROVED is
 * a middle state and SUCCESS is the end. Colouring APPROVED green here and
 * amber-ish there is deliberate — the same word means different things on
 * either side and the colour follows the meaning, not the word.
 */
export const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  APPROVED: {
    label: "Approved",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  PENDING_APPROVAL: {
    label: "Pending approval",
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  PENDING_OWNER_APPROVAL: {
    label: "Awaiting owner",
    pill: "bg-orange-50 text-orange-700 border border-orange-100",
    dot: "bg-orange-500",
  },
  REJECTED: {
    label: "Rejected",
    pill: "bg-rose-50 text-rose-700 border border-rose-100",
    dot: "bg-rose-500",
  },
  // Kept for older rows written before the approval flow existed.
  PENDING: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  COMPLETED: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
};
export const getStatusMeta = (status?: string | null) =>
  (status && STATUS_META[status]) || {
    label: status || "Unknown",
    pill: "bg-slate-50 text-slate-700 border border-slate-200",
    dot: "bg-slate-400",
  };
export const StatusIcon = CheckCircle2;

/**
 * Who decided this expense, and which way.
 *
 * One column in the design, two fields in the payload — an expense carries
 * both approved_by_name and rejected_by_name, and only one is ever filled.
 * Returning the decision alongside the name lets the cell colour a rejection
 * differently instead of quietly presenting the person who turned it down as
 * the one who approved it.
 */
/**
 * A person's name from the two shapes these endpoints use.
 *
 * `flat` is the `_name` field; `ref` is the id-bearing field beside it. The
 * distinction matters since the backend aligned category-detail with the
 * transfer list: `approved_by` and `initiated_by` are now UUID strings, where
 * category-detail used to send `{ id, name }` objects. So a bare string in
 * `ref` is an id and must never be rendered — `getRefLabel` would happily
 * print it, putting a raw UUID where a name belongs. Only the object form's
 * `.name` is still read, for payloads served before the change.
 */
export const getPersonName = (flat: unknown, ref?: RelatedRef): string => {
  if (typeof flat === "string" && flat.trim()) return flat;
  if (ref && typeof ref === "object" && ref.name) return ref.name;
  return "";
};

export const getDecidedBy = (
  row: any,
): { name: string; decision: "approved" | "rejected" | "pending" } => {
  const rejected = getPersonName(row?.rejected_by_name, row?.rejected_by);
  if (rejected) return { name: rejected, decision: "rejected" };

  const approved = getPersonName(row?.approved_by_name, row?.approved_by);
  if (approved) return { name: approved, decision: "approved" };

  return { name: "—", decision: "pending" };
};

/**
 * The reference to show and copy — "EXP-2026-00432".
 *
 * `reference` is the human-quotable one and always present; the search
 * endpoint matches on it, so what a merchant copies from here is what they
 * can read out to support and what support can paste back to find it.
 *
 * `payment_reference` is the bank's own reference on an expense paid by
 * transfer, and mirrors `reference` on a logged expense — so it is only a
 * fallback, never the first choice: preferring it would show a merchant
 * SYNC-EXP-TRF-A1B2C3D4E5F6 where the readable one exists. The name is the
 * last resort, for rows written before the column did.
 */
export const getExpenseReference = (row: any): string =>
  row?.reference ?? row?.payment_reference ?? row?.name ?? "—";

// The API isn't fully settled on whether related fields (category,
// initiated_by, approved_by) come back as a bare string or a
// `{ id, name }` object — handle both without throwing.
export type RelatedRef = string | { id?: string; name?: string } | null | undefined;

export const getRefLabel = (ref: RelatedRef, fallback = "—"): string => {
  if (!ref) return fallback;
  if (typeof ref === "string") return ref;
  return ref.name || fallback;
};

export const getRefId = (ref: RelatedRef): string | undefined => {
  if (!ref || typeof ref === "string") return undefined;
  return ref.id;
};

// ─── Pagination envelope unwrapping ────────────────────────────────────────
// The backend's list envelopes aren't fully confirmed across every one of
// these new endpoints (e.g. transactions nests items under
// `results.transactions`, but the Swagger "Model" doc for the same endpoint
// claims a plain `results: []`). Rather than assume one shape and break
// silently when it's the other, try every shape we've actually seen or that
// DRF commonly uses.
export interface PaginatedEnvelope<T> {
  items: T[];
  total: number;
  limit: number;
  pages: number;
  hasNext: boolean;
}

export const unwrapPaginated = <T = any>(raw: any): PaginatedEnvelope<T> => {
  if (!raw) return { items: [], total: 0, limit: 0, pages: 0, hasNext: false };
  const results = raw.results;

  let items: T[] = [];
  if (Array.isArray(results)) items = results;
  else if (Array.isArray(results?.transactions)) items = results.transactions;
  else if (Array.isArray(results?.activities)) items = results.activities;
  else if (Array.isArray(results?.data)) items = results.data;
  else if (Array.isArray(raw.data)) items = raw.data;
  else if (Array.isArray(raw.transactions)) items = raw.transactions;
  else if (Array.isArray(raw.table)) items = raw.table;
  else if (Array.isArray(raw.table?.results)) items = raw.table.results;
  else if (Array.isArray(raw)) items = raw;

  const total =
    raw.total ?? raw.count ?? results?.summary?.result_count ?? items.length;
  const limit = raw.limit ?? items.length;
  const pages = raw.pages ?? (limit ? Math.max(1, Math.ceil(total / limit)) : 1);
  const hasNext = Boolean(raw.links?.next ?? raw.next);

  return { items, total, limit, pages, hasNext };
};
