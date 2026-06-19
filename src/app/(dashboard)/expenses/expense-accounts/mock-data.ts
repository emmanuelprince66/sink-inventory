// UI-only mock data for the Expense Account Management module.
// Replace the constants below with React Query hooks once the backend ships.

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
  description?: string;
  balance: number;
  monthlySpend: number;
  /** Top-level account (only one is "main"). Sub-accounts have parentId set. */
  isMain: boolean;
  parentId: string | null;
  assignedUsers: string[]; // user IDs
  /** Transfers above this amount require manager approval. */
  approvalThreshold: number;
  /** Optional monthly spending limit. */
  spendingLimit?: number;
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
  reference: string; // human-readable e.g. EXP-2026-00432
  sourceAccountId: string;
  /** `null` when the transaction is an outgoing expense (not a transfer). */
  destinationAccountId: string | null;
  amount: number;
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

export const EXPENSE_CATEGORIES = [
  "Fuel",
  "Transport",
  "Salaries",
  "Marketing",
  "Logistics",
  "Operations",
  "Utilities",
  "Maintenance",
] as const;

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

// ─── Accounts ───────────────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: ExpenseAccount[] = [
  {
    id: "acc-main",
    name: "Main Expense Account",
    accountNumber: "0114-2308-77",
    description: "Primary expense pool the business funds from the wallet.",
    balance: 4_320_000,
    monthlySpend: 1_140_000,
    isMain: true,
    parentId: null,
    assignedUsers: ["u-owner", "u-mgr-1", "u-mgr-2"],
    approvalThreshold: 0,
    createdAt: "2026-01-04T09:00:00Z",
  },
  {
    id: "acc-ops",
    name: "Operations",
    accountNumber: "0114-2308-21",
    description: "Day-to-day operational spending.",
    balance: 520_000,
    monthlySpend: 380_000,
    isMain: false,
    parentId: "acc-main",
    assignedUsers: ["u-mgr-1", "u-staff-1", "u-staff-3"],
    approvalThreshold: 100_000,
    spendingLimit: 1_000_000,
    createdAt: "2026-01-12T10:30:00Z",
  },
  {
    id: "acc-marketing",
    name: "Marketing",
    accountNumber: "0114-2308-22",
    description: "Campaigns, ads, brand activations.",
    balance: 280_000,
    monthlySpend: 220_000,
    isMain: false,
    parentId: "acc-main",
    assignedUsers: ["u-mgr-2", "u-staff-2"],
    approvalThreshold: 200_000,
    spendingLimit: 600_000,
    createdAt: "2026-02-01T08:15:00Z",
  },
  {
    id: "acc-logistics",
    name: "Logistics",
    accountNumber: "0114-2308-23",
    description: "Dispatch riders, fuel, vehicle maintenance.",
    balance: 165_000,
    monthlySpend: 145_000,
    isMain: false,
    parentId: "acc-main",
    assignedUsers: ["u-mgr-1", "u-staff-3"],
    approvalThreshold: 50_000,
    spendingLimit: 500_000,
    createdAt: "2026-02-14T14:00:00Z",
  },
  {
    id: "acc-petty",
    name: "Petty Cash",
    accountNumber: "0114-2308-24",
    description: "Small day-to-day cash purchases.",
    balance: 32_000,
    monthlySpend: 84_000,
    isMain: false,
    parentId: "acc-main",
    assignedUsers: ["u-owner", "u-staff-1"],
    approvalThreshold: 25_000,
    spendingLimit: 100_000,
    createdAt: "2026-03-01T11:20:00Z",
  },
];

export const getAccountById = (id: string): ExpenseAccount | undefined =>
  MOCK_ACCOUNTS.find((a) => a.id === id);

// Total balance across every account (including main).
export const computeTotalBalance = (accounts = MOCK_ACCOUNTS): number =>
  accounts.reduce((sum, a) => sum + a.balance, 0);

// ─── Transactions ───────────────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: ExpenseTransaction[] = [
  {
    id: "txn-001",
    reference: "EXP-2026-00432",
    sourceAccountId: "acc-ops",
    destinationAccountId: null,
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
    sourceAccountId: "acc-marketing",
    destinationAccountId: null,
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
    sourceAccountId: "acc-main",
    destinationAccountId: "acc-logistics",
    amount: 200_000,
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
    sourceAccountId: "acc-logistics",
    destinationAccountId: null,
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
    sourceAccountId: "acc-petty",
    destinationAccountId: null,
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
    sourceAccountId: "acc-ops",
    destinationAccountId: null,
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
];

// ─── Dashboard / report derivations ─────────────────────────────────────────

export interface CategorySpend {
  category: string;
  amount: number;
}
export const computeCategorySpend = (
  txns = MOCK_TRANSACTIONS,
): CategorySpend[] => {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.status === "COMPLETED" || t.status === "APPROVED") {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

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

export interface AccountSpend {
  account: ExpenseAccount;
  amount: number;
}
export const computeAccountSpend = (
  txns = MOCK_TRANSACTIONS,
): AccountSpend[] => {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.status === "COMPLETED" || t.status === "APPROVED") {
      map.set(
        t.sourceAccountId,
        (map.get(t.sourceAccountId) || 0) + t.amount,
      );
    }
  }
  return Array.from(map.entries())
    .map(([accId, amount]) => ({ account: getAccountById(accId)!, amount }))
    .filter((entry) => entry.account)
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
