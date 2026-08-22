"use client";

import {
  Banknote,
  Gift,
  HandCoins,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import type { ReactNode } from "react";

export interface TransactionTypeMeta {
  icon: ReactNode;
  label: string;
  /** Icon bubble on a row. */
  tone: string;
  /** The filter pill when it is the active one. */
  pillActive: string;
}

/**
 * One tone per event type, shared by the row icon and its filter pill so the
 * colour a merchant filters by is the colour they then see in the list.
 */
export const TYPE_META: Record<string, TransactionTypeMeta> = {
  PURCHASE: {
    icon: <ShoppingBag className="h-4 w-4" />,
    label: "Purchase",
    tone: "bg-secondary-6 text-primary-green-300",
    pillActive: "bg-primary-green-300 text-white",
  },
  WALLET: {
    icon: <Banknote className="h-4 w-4" />,
    label: "Wallet",
    tone: "bg-info-2 text-info-1",
    pillActive: "bg-info-1 text-white",
  },
  DEBT: {
    icon: <HandCoins className="h-4 w-4" />,
    label: "Debt",
    tone: "bg-warning-2 text-warning-1",
    pillActive: "bg-warning-1 text-white",
  },
  LOYALTY: {
    icon: <Gift className="h-4 w-4" />,
    label: "Loyalty",
    tone: "bg-violet-100 text-violet-700",
    pillActive: "bg-violet-600 text-white",
  },
  REFERRAL: {
    icon: <UserPlus className="h-4 w-4" />,
    label: "Referral",
    tone: "bg-emerald-100 text-emerald-700",
    pillActive: "bg-emerald-600 text-white",
  },
};

export const typeMeta = (type: string): TransactionTypeMeta =>
  TYPE_META[type] ?? {
    icon: <Banknote className="h-4 w-4" />,
    label: type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " "),
    tone: "bg-grey-6 text-grey-3",
    pillActive: "bg-grey-1 text-white",
  };

/** Status chips. PAID and SUCCESSFUL both mean settled. */
export const STATUS_TONES: Record<string, string> = {
  SUCCESSFUL: "bg-success-2 text-success-1",
  PAID: "bg-success-2 text-success-1",
  UNPAID: "bg-warning-2 text-warning-1",
  PENDING: "bg-warning-2 text-warning-1",
  REVERSED: "bg-error-2 text-error-1",
  CANCELLED: "bg-grey-6 text-grey-3",
};

export const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
