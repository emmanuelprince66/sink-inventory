"use client";

import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useSelectedBankStore } from "@/lib/store/useSelectedBankStore";
import { useEffect, useMemo } from "react";

export interface BusinessBankAccount {
  id: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  /** True on sub-accounts; the primary account is the one where this is false. */
  is_sub?: boolean;
}

/**
 * The business's bank accounts, and which one the wallet screens are reading.
 *
 * Every wallet call is keyed on a bank id now, not the business id, so this is
 * the single place that answers "which wallet?". The primary is the account
 * with is_sub false — treated as `!== true` rather than `=== false`, because
 * older payloads omit the field entirely and an account without it is the
 * original one, not a sub-account.
 */
export const useBusinessBanks = () => {
  const businessData = useBusinessDataStore((state: any) => state.businessData);
  const selectedBankId = useSelectedBankStore((state) => state.selectedBankId);
  const setSelectedBankId = useSelectedBankStore(
    (state) => state.setSelectedBankId,
  );

  const banks: BusinessBankAccount[] = useMemo(
    () => (Array.isArray(businessData?.banks) ? businessData.banks : []),
    [businessData],
  );

  const primaryBank = useMemo(
    () => banks.find((bank) => bank.is_sub !== true) ?? banks[0] ?? null,
    [banks],
  );

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.id === selectedBankId) ?? primaryBank,
    [banks, selectedBankId, primaryBank],
  );

  // Settle the stored id onto a bank that actually exists. Covers the first
  // visit, and the case where a persisted id belongs to a bank that has since
  // been removed or to a business the user has switched away from — without
  // this the wallet would be queried with an id the business does not own.
  useEffect(() => {
    if (!banks.length) return;
    const stillValid = banks.some((bank) => bank.id === selectedBankId);
    if (!stillValid && primaryBank?.id) setSelectedBankId(primaryBank.id);
  }, [banks, selectedBankId, primaryBank, setSelectedBankId]);

  return {
    banks,
    primaryBank,
    selectedBank,
    /** What every wallet request should be keyed on. */
    selectedBankId: selectedBank?.id ?? null,
    setSelectedBankId,
    hasBanks: banks.length > 0,
    hasMultipleBanks: banks.length > 1,
    isPrimary: (bank: BusinessBankAccount) => bank.id === primaryBank?.id,
  };
};
