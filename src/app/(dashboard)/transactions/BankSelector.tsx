"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessBanks } from "@/hooks/useBusinessBanks";
import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";

/** Last four digits are enough to tell two accounts apart at a glance. */
const maskAccount = (accountNumber?: string) =>
  accountNumber ? `••••${accountNumber.slice(-4)}` : "";

/**
 * Picks which wallet the screen is reading.
 *
 * Hidden when there is only one account: a select with a single option is
 * furniture, and the account it would name is already on the card beside it.
 */
const BankSelector = ({ className }: { className?: string }) => {
  const {
    banks,
    selectedBankId,
    setSelectedBankId,
    hasMultipleBanks,
    isPrimary,
  } = useBusinessBanks();

  if (!hasMultipleBanks) return null;

  return (
    <div className={cn("min-w-0", className)}>
      <Select
        value={selectedBankId ?? undefined}
        onValueChange={setSelectedBankId}
      >
        <SelectTrigger
          className="h-10 w-full rounded-xl border-white/20 bg-white/10 text-xs font-bold text-white sm:w-[240px]"
          aria-label="Choose which account to view"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Landmark className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <SelectValue placeholder="Select account" />
          </span>
        </SelectTrigger>

        <SelectContent>
          {banks.map((bank) => (
            <SelectItem key={bank.id} value={bank.id}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">
                  {bank.bank_name ?? "Bank account"}
                  {bank.account_number ? ` · ${maskAccount(bank.account_number)}` : ""}
                </span>
                {isPrimary(bank) && (
                  <span className="shrink-0 rounded-full bg-primary-green-500 px-1.5 py-0.5 text-[9px] font-bold text-primary-green-300">
                    Primary
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BankSelector;
