// UI-only mock data for the Expense Account Management module.
//
// Model: a SINGLE expense account holds the operational float. Every outgoing
// movement (whether logged via "Add Expense" or routed through "Transfer
// Money") is tagged with a CATEGORY. The category is the dimensional axis
// used for reporting (chart of spend, per-category dashboard tiles, etc.).

import {
  type LucideIcon,
  Briefcase,
  Cog,
  Flame,
  Megaphone,
  ShieldCheck,
  Truck,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

export type AccountRole = "Owner" | "Manager" | "Staff";

export interface AccountUser {
  id: string;
  name: string;
  role: AccountRole;
  initials: string;
}

export interface ExpenseAccount {
  id: string;
  name: string;
  accountNumber: string;
  /** Bank that holds the float (e.g. "VFD MFB"). */
  bankName: string;
  balance: number;
  monthlySpend: number;
  /** Users assigned to the account (visible to operators). */
  assignedUsers: string[];
  /** Transfers above this amount require manager approval. */
  approvalThreshold: number;
  createdAt: string;
}

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface TransactionAttachment {
  id: string;
  name: string;
  size: string;
  type: "receipt" | "invoice" | "other";
}

export interface ExpenseTransaction {
  id: string;
  reference: string;
  amount: number;
  /** Always categorised — the user must pick a category at submit time. */
  category: string;
  narration: string;
  initiatedById: string;
  approvedById?: string;
  approvedAt?: string;
  status: TransactionStatus;
  createdAt: string;
  attachments: TransactionAttachment[];
}

// ─── Categories (preset + custom) ───────────────────────────────────────────
//
// Each category gets a Lucide icon + tinted background so the dashboard
// tiles read at a glance.

export interface CategoryMeta {
  name: string;
  icon: LucideIcon;
  /** Tailwind tile background + foreground tone. */
  tone: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  Fuel: {
    name: "Fuel",
    icon: Flame,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Transport: {
    name: "Transport",
    icon: Truck,
    tone: "bg-sky-50 text-sky-700 border-sky-100",
  },
  Salaries: {
    name: "Salaries",
    icon: Wallet,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  Marketing: {
    name: "Marketing",
    icon: Megaphone,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
  Logistics: {
    name: "Logistics",
    icon: Briefcase,
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  Operations: {
    name: "Operations",
    icon: Cog,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  Utilities: {
    name: "Utilities",
    icon: Zap,
    tone: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  Maintenance: {
    name: "Maintenance",
    icon: Wrench,
    tone: "bg-teal-50 text-teal-700 border-teal-100",
  },
};

export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_META) as Array<
  keyof typeof CATEGORY_META
>;

// Per-category budgets. UI-only — when the backend ships, fetch from
// /expense-budgets/business/{business_id}/. Categories without an entry here
// render as "No budget set" with a "Set Budget" CTA.
export interface CategoryBudget {
  /** Total amount allocated for the duration. */
  budget: number;
  /** Length of the budget window, in months. */
  durationMonths: number;
}
export const CATEGORY_BUDGETS: Record<string, CategoryBudget> = {
  Fuel: { budget: 400_000, durationMonths: 6 },
  Transport: { budget: 200_000, durationMonths: 6 },
  Salaries: { budget: 2_000_000, durationMonths: 6 },
  Marketing: { budget: 600_000, durationMonths: 6 },
  Logistics: { budget: 500_000, durationMonths: 6 },
  Operations: { budget: 300_000, durationMonths: 6 },
  Utilities: { budget: 400_000, durationMonths: 6 },
  Maintenance: { budget: 200_000, durationMonths: 6 },
};

const FALLBACK_CATEGORY_META: CategoryMeta = {
  name: "Other",
  icon: ShieldCheck,
  tone: "bg-slate-50 text-slate-700 border-slate-200",
};
export const getCategoryMeta = (name: string): CategoryMeta =>
  CATEGORY_META[name] || { ...FALLBACK_CATEGORY_META, name };

// ─── Users ──────────────────────────────────────────────────────────────────

export const MOCK_USERS: AccountUser[] = [
  { id: "u-owner", name: "Tobi Olosunde", role: "Owner", initials: "TO" },
  { id: "u-mgr-1", name: "Sarah Adeyemi", role: "Manager", initials: "SA" },
  { id: "u-mgr-2", name: "David Okeke", role: "Manager", initials: "DO" },
  { id: "u-staff-1", name: "John Bello", role: "Staff", initials: "JB" },
  { id: "u-staff-2", name: "Chiamaka Eze", role: "Staff", initials: "CE" },
  { id: "u-staff-3", name: "Yusuf Bala", role: "Staff", initials: "YB" },
];

export const getUserById = (id: string): AccountUser | undefined =>
  MOCK_USERS.find((u) => u.id === id);

// ─── The single Expense Account ─────────────────────────────────────────────

export const EXPENSE_ACCOUNT: ExpenseAccount = {
  id: "acc-main",
  name: "Main Expense Account",
  accountNumber: "0114-2308-77",
  bankName: "VFD MFB",
  balance: 5_317_000,
  monthlySpend: 1_140_000,
  assignedUsers: [
    "u-owner",
    "u-mgr-1",
    "u-mgr-2",
    "u-staff-1",
    "u-staff-2",
    "u-staff-3",
  ],
  approvalThreshold: 100_000,
  createdAt: "2026-01-04T09:00:00Z",
};

// ─── Transactions ───────────────────────────────────────────────────────────
// All belong to the single account; the discriminator is `category`.

export const MOCK_TRANSACTIONS: ExpenseTransaction[] = [
  {
    id: "txn-001",
    reference: "EXP-2026-00432",
    amount: 75_000,
    category: "Fuel",
    narration: "Diesel top-up for the generator (Ikeja branch).",
    initiatedById: "u-staff-1",
    approvedById: "u-mgr-1",
    approvedAt: "2026-06-17T11:14:00Z",
    status: "COMPLETED",
    createdAt: "2026-06-17T10:48:00Z",
    attachments: [
      { id: "att-1", name: "fuel-receipt.pdf", size: "212 KB", type: "receipt" },
    ],
  },
  {
    id: "txn-002",
    reference: "EXP-2026-00433",
    amount: 180_000,
    category: "Marketing",
    narration: "Instagram boost for the June campaign.",
    initiatedById: "u-staff-2",
    status: "PENDING",
    createdAt: "2026-06-18T08:22:00Z",
    attachments: [
      { id: "att-2", name: "meta-invoice.pdf", size: "428 KB", type: "invoice" },
    ],
  },
  {
    id: "txn-003",
    reference: "EXP-2026-00434",
    amount: 320_000,
    category: "Logistics",
    narration: "Top-up logistics float for the weekend run.",
    initiatedById: "u-owner",
    approvedById: "u-owner",
    approvedAt: "2026-06-18T09:00:00Z",
    status: "COMPLETED",
    createdAt: "2026-06-18T08:55:00Z",
    attachments: [],
  },
  {
    id: "txn-004",
    reference: "EXP-2026-00435",
    amount: 28_500,
    category: "Transport",
    narration: "Rider settlement for delivery 2026-06-17.",
    initiatedById: "u-staff-3",
    approvedById: "u-mgr-1",
    approvedAt: "2026-06-18T07:30:00Z",
    status: "APPROVED",
    createdAt: "2026-06-18T07:12:00Z",
    attachments: [
      { id: "att-3", name: "rider-slip.jpg", size: "96 KB", type: "receipt" },
    ],
  },
  {
    id: "txn-005",
    reference: "EXP-2026-00436",
    amount: 12_000,
    category: "Operations",
    narration: "Cleaning supplies — tap soap, mop, refuse bags.",
    initiatedById: "u-staff-1",
    status: "REJECTED",
    createdAt: "2026-06-16T15:48:00Z",
    attachments: [],
  },
  {
    id: "txn-006",
    reference: "EXP-2026-00437",
    amount: 320_000,
    category: "Salaries",
    narration: "June stipend for Ikeja contract staff.",
    initiatedById: "u-mgr-1",
    approvedById: "u-owner",
    approvedAt: "2026-06-15T14:40:00Z",
    status: "COMPLETED",
    createdAt: "2026-06-15T14:10:00Z",
    attachments: [
      {
        id: "att-4",
        name: "stipend-schedule.xlsx",
        size: "61 KB",
        type: "other",
      },
    ],
  },
  {
    id: "txn-007",
    reference: "EXP-2026-00438",
    amount: 45_000,
    category: "Utilities",
    narration: "PHCN prepaid units for the warehouse.",
    initiatedById: "u-staff-2",
    approvedById: "u-mgr-2",
    approvedAt: "2026-06-14T10:08:00Z",
    status: "COMPLETED",
    createdAt: "2026-06-14T09:30:00Z",
    attachments: [
      { id: "att-5", name: "phcn-recharge.png", size: "84 KB", type: "receipt" },
    ],
  },
  {
    id: "txn-008",
    reference: "EXP-2026-00439",
    amount: 22_000,
    category: "Maintenance",
    narration: "Generator service + oil change.",
    initiatedById: "u-staff-3",
    approvedById: "u-mgr-1",
    approvedAt: "2026-06-12T16:15:00Z",
    status: "COMPLETED",
    createdAt: "2026-06-12T15:00:00Z",
    attachments: [],
  },
];

// ─── Derivations (dashboard + reports) ──────────────────────────────────────

export interface CategoryStats {
  category: string;
  /** Total spent (Completed + Approved). */
  total: number;
  /** Number of completed/approved transactions. */
  count: number;
  /** Budget config if one is set. */
  budget?: CategoryBudget;
  /** Monthly budget — `budget / durationMonths`. Undefined when no budget. */
  monthlyBudget?: number;
  /** Remaining budget (budget - total). Undefined when no budget. */
  remaining?: number;
  /** Spent as % of budget (0-100+). Undefined when no budget. */
  spentPct?: number;
}
export const computeCategoryStats = (
  txns = MOCK_TRANSACTIONS,
): CategoryStats[] => {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of txns) {
    if (t.status === "COMPLETED" || t.status === "APPROVED") {
      const prev = map.get(t.category) || { total: 0, count: 0 };
      map.set(t.category, {
        total: prev.total + t.amount,
        count: prev.count + 1,
      });
    }
  }

  const buildStats = (category: string): CategoryStats => {
    const agg = map.get(category) || { total: 0, count: 0 };
    const budget = CATEGORY_BUDGETS[category];
    if (!budget) {
      return { category, total: agg.total, count: agg.count };
    }
    const monthlyBudget = budget.budget / budget.durationMonths;
    const remaining = Math.max(0, budget.budget - agg.total);
    const spentPct =
      budget.budget > 0 ? Math.round((agg.total / budget.budget) * 100) : 0;
    return {
      category,
      total: agg.total,
      count: agg.count,
      budget,
      monthlyBudget,
      remaining,
      spentPct,
    };
  };

  const result: CategoryStats[] = EXPENSE_CATEGORIES.map(buildStats);
  // Plus any custom categories that turned up in transactions.
  for (const category of map.keys()) {
    if (!EXPENSE_CATEGORIES.includes(category as any)) {
      result.push(buildStats(category));
    }
  }
  return result.sort((a, b) => b.total - a.total);
};

/** Single-category lookup. */
export const computeCategoryBudgetStats = (
  category: string,
  txns = MOCK_TRANSACTIONS,
): CategoryStats => {
  return computeCategoryStats(txns).find((c) => c.category === category) || {
    category,
    total: 0,
    count: 0,
  };
};

/** All transactions for a given category (newest first). */
export const getCategoryTransactions = (
  category: string,
  txns = MOCK_TRANSACTIONS,
): ExpenseTransaction[] =>
  txns
    .filter((t) => t.category === category)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

export interface UserSpend {
  user: AccountUser;
  amount: number;
}
export const computeUserSpend = (txns = MOCK_TRANSACTIONS): UserSpend[] => {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.status === "COMPLETED" || t.status === "APPROVED") {
      map.set(t.initiatedById, (map.get(t.initiatedById) || 0) + t.amount);
    }
  }
  return Array.from(map.entries())
    .map(([userId, amount]) => ({ user: getUserById(userId)!, amount }))
    .filter((entry) => entry.user)
    .sort((a, b) => b.amount - a.amount);
};

// ─── Status meta ────────────────────────────────────────────────────────────

export const STATUS_META: Record<
  TransactionStatus,
  { label: string; pill: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    pill: "bg-sky-50 text-sky-700 border border-sky-100",
    dot: "bg-sky-500",
  },
  REJECTED: {
    label: "Rejected",
    pill: "bg-rose-50 text-rose-700 border border-rose-100",
    dot: "bg-rose-500",
  },
  COMPLETED: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
};
