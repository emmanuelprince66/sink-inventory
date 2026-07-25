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

// The transactions endpoint currently only ever returns "COMPLETED", but the
// pill map is left open so a future status renders sensibly (grey) instead
// of crashing.
export const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  COMPLETED: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  REJECTED: {
    label: "Rejected",
    pill: "bg-rose-50 text-rose-700 border border-rose-100",
    dot: "bg-rose-500",
  },
};
export const getStatusMeta = (status?: string | null) =>
  (status && STATUS_META[status]) || {
    label: status || "Unknown",
    pill: "bg-slate-50 text-slate-700 border border-slate-200",
    dot: "bg-slate-400",
  };
export const StatusIcon = CheckCircle2;

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
