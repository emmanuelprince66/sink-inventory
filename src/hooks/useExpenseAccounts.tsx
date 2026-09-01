"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useSelectedExpenseAccountStore } from "@/lib/store/useSelectedExpenseAccountStore";
import { useEffect, useMemo } from "react";

export interface ExpenseAccount {
  id: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  is_sub?: boolean;
  /** What separates an expense account from any other sub-account. */
  is_expenses?: boolean;
}

/**
 * A name short enough to put in a picker.
 *
 * The bank returns the full account name — "Aetos Domain International-Expense
 * operations" — which is the business name plus the branch we asked for. The
 * business name is the same on every one of these accounts, so it is all
 * prefix and no information here, and it is what pushes the label past the
 * width of a select. The branch is the part the merchant typed and the only
 * part that tells two accounts apart.
 */
export const expenseAccountLabel = (account?: ExpenseAccount | null): string => {
  const full = account?.account_name?.trim();
  if (!full) return account?.account_number ?? "Expense account";

  // We create these as "Expense <name>", so that marker is a reliable seam —
  // more so than the last "-", since a business name may contain one.
  const marker = full.search(/expenses?\s/i);
  if (marker > -1) return full.slice(marker);

  const dash = full.lastIndexOf("-");
  return dash > -1 ? full.slice(dash + 1).trim() : full;
};

/**
 * The business's expense accounts, and which one a screen is spending from.
 *
 * A business can hold several — one per department, per branch, per whatever
 * the merchant chose to split by — so nothing here assumes a single account.
 * Only `is_expenses` accounts are returned: the ordinary business accounts and
 * plain sub-accounts belong to the wallet screens, and offering them here would
 * let someone spend the shop's takings from the expenses page.
 *
 * The live business payload is preferred over the persisted snapshot in
 * useBusinessDataStore. That snapshot is written once, when a business is
 * picked from the list, so an account created since then is simply absent from
 * it — which is exactly what happens right after creating one. The store is
 * kept as the fallback for the moment before the query resolves.
 */
export const useExpenseAccounts = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const storedBusiness = useBusinessDataStore((state) => state.businessData);

  const {
    data: businessRes,
    isLoading,
    refetch,
  } = useFetchBusinessById(business_id);

  const accounts: ExpenseAccount[] = useMemo(() => {
    const live = businessRes?.data?.banks;
    const banks: ExpenseAccount[] = Array.isArray(live)
      ? live
      : Array.isArray(storedBusiness?.banks)
        ? storedBusiness.banks
        : [];
    return banks.filter((bank) => bank?.is_expenses === true);
  }, [businessRes, storedBusiness]);

  // Shared and persisted rather than local, so switching account on the
  // Expenses page and then opening Transfer — its own route — arrives at the
  // account that was picked instead of falling back to the first one.
  const chosenId = useSelectedExpenseAccountStore(
    (state) => state.selectedExpenseAccountId,
  );
  const setSelectedId = useSelectedExpenseAccountStore(
    (state) => state.setSelectedExpenseAccountId,
  );

  const selected = useMemo(
    () =>
      accounts.find((account) => account.id === chosenId) ??
      accounts[0] ??
      null,
    [accounts, chosenId],
  );

  const selectedId = selected?.id ?? null;

  // Settle the stored id onto an account that actually exists. Covers the first
  // visit, an account that has since been removed, and a business the user has
  // switched away from — without it the balance would be read for an account
  // this business does not own.
  useEffect(() => {
    if (!accounts.length) return;
    const stillValid = accounts.some((account) => account.id === chosenId);
    if (!stillValid && selectedId) setSelectedId(selectedId);
  }, [accounts, chosenId, selectedId, setSelectedId]);

  /**
   * The selected account's own balance.
   *
   * Read per account rather than from the expenses summary, which reports a
   * single figure — with several expense accounts, switching between them has
   * to change the number, or the card would say the same thing whichever one is
   * chosen. limit 1 because only wallet_details is wanted, not the history.
   */
  const { data: walletData, isLoading: balanceLoading } =
    useFetchTransactionQuery({
      params: { id: selectedId ?? "", limit: 1, page: 1, type: "" },
      enabled: !!selectedId,
    });

  return {
    accounts,
    selected,
    /** What a transfer out of this account has to be keyed on. */
    selectedId,
    setSelectedId,
    balance: Number(
      walletData?.data?.results?.wallet_details?.balance ?? 0,
    ),
    balanceLoading,
    /** Whether the expense features that need an account can be offered. */
    hasExpenseAccount: accounts.length > 0,
    hasMultiple: accounts.length > 1,
    isLoading,
    refetchBusiness: refetch,
  };
};
