"use client";

import { ArrowLeftRight, Check, Package, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ENTRY_TYPES,
  entryTypeLabel,
  entryTypeOf,
  type EntryType,
} from "@/types/expense-governance";

/** Expense / Purchase / Transfer, with a line saying what the choice counts toward. */
export const EntryTypePicker = ({
  value,
  onChange,
  className,
  only,
}: {
  value: EntryType;
  onChange: (value: EntryType) => void;
  className?: string;
  /** Limit the choices, e.g. Expense / Purchase for a manual entry. */
  only?: readonly EntryType[];
}) => (
  <div className={cn("space-y-2", className)}>
    <p className="text-sm font-medium text-grey-2">Type</p>
    <div
      role="radiogroup"
      aria-label="Entry type"
      className={cn("grid gap-1 rounded-xl bg-grey-6 p-1", only && only.length === 2 ? "grid-cols-2" : "grid-cols-3")}
    >
      {ENTRY_TYPES.filter((option) => !only || only.includes(option.value)).map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-lg text-xs font-bold transition-colors cursor-pointer",
              active
                ? "bg-white text-primary-green-300 shadow-sm"
                : "text-grey-3 hover:text-grey-1",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
    <p className="text-xs text-grey-3">
      {ENTRY_TYPES.find((option) => option.value === value)?.hint}
    </p>
  </div>
);

/** Marks purchases and transfers in a list; plain expenses stay unmarked. */
export const EntryTypeBadge = ({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) => {
  const type = entryTypeOf(value);
  if (type === "EXPENSE") return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        type === "PURCHASE"
          ? "bg-primary-green-500 text-primary-green-300"
          : "bg-grey-6 text-grey-3",
        className,
      )}
    >
      {entryTypeLabel(type)}
    </span>
  );
};

/** What Add Expense starts with: log it by hand, or move money out of the wallet. */
export type ExpenseKind = "EXPENSE" | "PURCHASE" | "WALLET_TRANSFER";

const KINDS: readonly {
  value: ExpenseKind;
  title: string;
  hint: string;
  tag: string;
  icon: typeof Receipt;
  tone: string;
}[] = [
  { value: "EXPENSE", title: "Log Expense", hint: "Spent to run the business: fuel, rent, utilities, salaries.", tag: "Manual", icon: Receipt, tone: "bg-error-2 text-error-1" },
  { value: "PURCHASE", title: "Log Purchase", hint: "Spent to buy goods to sell, or raw materials.", tag: "Manual", icon: Package, tone: "bg-primary-green-500 text-primary-green-300" },
  { value: "WALLET_TRANSFER", title: "Wallet Transfer", hint: "Moved from your expense wallet to a bank account.", tag: "Moves money", icon: ArrowLeftRight, tone: "bg-secondary-6 text-primary-green-100" },
];

/**
 * The first step of Add Expense (Mr Sunde, 27 Nov): a manual entry records spend without moving money; a wallet
 * transfer pays it out of the expense wallet, with PIN and approval.
 */
export const ExpenseKindChooser = ({
  onPick,
  transferBlockedReason,
}: {
  onPick: (kind: ExpenseKind) => void;
  /** Set when this login may not move money: the card stays, unavailable, saying why. */
  transferBlockedReason?: string;
}) => (
  <div className="space-y-3">
    <p className="text-sm text-grey-3">What would you like to record?</p>
    {KINDS.map((kind) => {
      const Icon = kind.icon;
      const blocked = kind.value === "WALLET_TRANSFER" && Boolean(transferBlockedReason);
      return (
        <button
          key={kind.value}
          type="button"
          disabled={blocked}
          onClick={() => onPick(kind.value)}
          className="flex w-full items-center gap-3 rounded-2xl border border-grey-5 bg-white p-4 text-left transition-colors hover:border-primary-green-300 hover:bg-secondary-6/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-grey-5 disabled:hover:bg-white cursor-pointer"
        >
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", kind.tone)}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold text-grey-1">{kind.title}</span>
              <span className="rounded-full bg-grey-6 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-grey-3">{kind.tag}</span>
            </span>
            <span className="mt-0.5 block text-xs text-grey-3">{blocked ? transferBlockedReason : kind.hint}</span>
          </span>
        </button>
      );
    })}
  </div>
);

/** "What is this transfer for?" — asked before the transfer form (Expense or Purchase). */
export const TransferPurposeRadio = ({
  value,
  onChange,
}: {
  value: EntryType | null;
  onChange: (value: EntryType) => void;
}) => (
  <fieldset className="space-y-3">
    <legend className="text-base font-extrabold text-grey-1">What is this transfer for?</legend>
    {([
      { value: "EXPENSE", title: "Expense", hint: "Money you spent to run your business." },
      { value: "PURCHASE", title: "Purchase", hint: "Money you spent to buy goods to sell." },
    ] as const).map((option) => {
      const active = value === option.value;
      return (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
            active ? "border-primary-green-300 bg-primary-green-500" : "border-grey-5 bg-white hover:border-primary-green-300/50",
          )}
        >
          <input
            type="radio"
            name="transfer-purpose"
            value={option.value}
            checked={active}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              active ? "border-primary-green-300 bg-primary-green-300 text-white" : "border-grey-4 bg-white",
            )}
          >
            {active && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span>
            <span className="block text-sm font-extrabold text-grey-1">{option.title}</span>
            <span className="mt-0.5 block text-xs text-grey-3">{option.hint}</span>
          </span>
        </label>
      );
    })}
  </fieldset>
);
