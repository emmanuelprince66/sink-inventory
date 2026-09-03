"use client";

import CustomSelect, {
  SelectOption,
  SelectValue,
} from "@/components/app/CustomSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  expenseAccountLabel,
  useExpenseAccounts,
} from "@/hooks/useExpenseAccounts";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ConfirmExpenseTransfer from "./ConfirmExpenseTransfer";

/**
 * Spending out of an expense account.
 *
 * The same transfer the transactions page runs, with one difference that
 * changes everything downstream: the money leaves an expense account rather
 * than the business's main wallet. Every wallet call is keyed on a bank id, so
 * the account picked at the top is threaded through the balance, the transfer
 * and the confirm step — otherwise the screen would show one account's balance
 * and debit another's.
 *
 * Only is_expenses accounts are offered. A business can hold several, and the
 * first is selected on arrival so the common case — one account — needs no
 * choice at all.
 */
const ExpenseTransfer = () => {
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);

  const [recipientBank, setRecipientBank] = useState<SelectValue>(null);
  const [category, setCategory] = useState<SelectValue>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [message, setMessage] = useState("");
  const [bankOptions, setBankOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  // The balance comes from here rather than from the transfer hook's own
  // transaction query, so the number on this screen is the same one the
  // Expenses card showed for the same account.
  const {
    accounts,
    selected,
    selectedId,
    setSelectedId,
    balance,
    hasExpenseAccount,
    hasMultiple,
    isLoading: accountsLoading,
  } = useExpenseAccounts();

  const {
    BankTrxData,
    CategoriesData,
    BankDataLoading,
    beneficiaryInfo,
    CategoriesDataLoading,
    enquiryLoading,
  } = useTransactionsHook({
    recipientBank,
    accountNumber,
    sourceBankId: selectedId,
  });

  useEffect(() => {
    if (BankTrxData) {
      setBankOptions(
        BankTrxData.map((bank: any) => ({
          // The endpoint sends bank_code and code, never bankCode — reading
          // the camelCase name left every option with an undefined value,
          // which the transfer then posted as a blank bank_code.
          value: bank.bank_code ?? bank.code ?? "",
          label: bank.name,
          ...bank,
        })),
      );
    }
  }, [BankTrxData]);

  useEffect(() => {
    if (CategoriesData?.data) {
      setCategoryOptions(
        CategoriesData.data.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
          ...cat,
        })),
      );
    }
  }, [CategoriesData]);

  useEffect(() => {
    setAccountName(beneficiaryInfo?.data?.name ?? "");
  }, [beneficiaryInfo]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setMessage("");

    if (!selectedId) {
      setMessage("Choose the expense account this comes out of.");
      return;
    }

    if (!recipientBank || !accountNumber || !amount) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (accountNumber.length < 10) {
      setMessage("Please enter a valid account number.");
      return;
    }

    // Caught here rather than at the API, which answers a missing code with
    // "This field may not be blank" and no clue as to which field it means.
    if (
      !(
        (recipientBank as any)?.bank_code ??
        (recipientBank as any)?.code ??
        (recipientBank as any)?.value
      )
    ) {
      setMessage("That bank is missing its code — pick it again.");
      return;
    }

    if (!beneficiaryInfo?.data?.name) {
      setMessage("Please wait for account name verification.");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount greater than zero.");
      return;
    }

    if (parseFloat(amount) > balance) {
      setMessage("Insufficient balance in this expense account.");
      return;
    }

    setShowConfirmTransfer(true);
  };

  if (showConfirmTransfer) {
    return (
      <ConfirmExpenseTransfer
        details={{
          // bank_code first: it is the field the endpoint actually returns,
          // and the one the account-name enquiry already reads. `value` is
          // only a fallback for an option built somewhere else.
          bankCode: String(
            (recipientBank as any)?.bank_code ??
              (recipientBank as any)?.code ??
              (recipientBank as any)?.value ??
              "",
          ),
          bankName: String((recipientBank as any)?.label ?? ""),
          accountNumber,
          accountName: beneficiaryInfo?.data?.name || accountName,
          amount,
          narration,
          categoryId: (category as any)?.value
            ? String((category as any).value)
            : undefined,
          categoryName: (category as any)?.label
            ? String((category as any).label)
            : undefined,
        }}
        onCancel={() => setShowConfirmTransfer(false)}
        onDone={() => {
          setShowConfirmTransfer(false);
          setRecipientBank(null);
          setCategory(null);
          setAccountNumber("");
          setAccountName("");
          setAmount("");
          setNarration("");
        }}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      <div className="w-full md:w-[60%]">
        <button
          onClick={() => history.back()}
          className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Nothing on this screen works without an account to spend from, so
            that is the whole page until one exists. */}
        {!accountsLoading && !hasExpenseAccount ? (
          <div className="w-full rounded-2xl border border-grey-5 bg-white p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-6 text-primary-green-300">
              <Wallet className="h-5 w-5" />
            </span>
            <p className="mt-4 text-lg font-extrabold text-grey-1">
              No expense account yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-grey-3">
              Expense transfers come out of a dedicated expense account. Create
              one on the Expenses page and fund it from a business account.
            </p>
            <Button asChild className="mt-5 h-11 rounded-xl">
              <Link href="/expenses">Go to Expenses</Link>
            </Button>
          </div>
        ) : (
          <div className="w-full mt-5 border border-grey-5 rounded-2xl overflow-hidden bg-white">
            {/* Balance of the account being spent from — it moves with the
                picker below, so the number is always the one at risk. */}
            <div className="bg-primary-green-100 text-white p-6">
              <p className="text-sm text-white/70 mb-1">
                Available in {expenseAccountLabel(selected)}
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                {formatToNaira(balance)}
              </h2>
              <p className="text-xs text-white/60 mt-2">
                {selected?.bank_name}
                {selected?.bank_name && selected?.account_number ? " · " : ""}
                {selected?.account_number}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-grey-1">
                  Transfer From Expenses
                </h3>
                <p className="text-sm text-grey-3 mt-1">
                  Pay a supplier or a bill straight out of an expense account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Always shown, even with a single account: this is the one
                    field on the form that decides whose money moves, and a
                    merchant should see it stated rather than inferred. */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-grey-2">
                    Spend From
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {accounts.map((account) => {
                      const active = account.id === selectedId;
                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => setSelectedId(account.id)}
                          className={cn(
                            "rounded-xl border p-3 text-left transition-colors cursor-pointer",
                            active
                              ? "border-primary-green-300 bg-primary-green-500"
                              : "border-grey-5 bg-white hover:border-primary-green-300/50",
                          )}
                        >
                          <p className="truncate text-sm font-bold text-grey-1">
                            {expenseAccountLabel(account)}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-grey-3">
                            {account.bank_name}
                            {account.bank_name && account.account_number
                              ? " · "
                              : ""}
                            {account.account_number}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {hasMultiple && (
                    <p className="text-xs text-grey-3">
                      Switching accounts changes the balance above and the
                      account this transfer leaves from.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <CustomSelect
                    label="Recipient Bank"
                    options={bankOptions}
                    value={recipientBank}
                    onChange={setRecipientBank}
                    isLoading={BankDataLoading}
                    placeholder="Search for a bank..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="accountNumber"
                    className="block text-sm font-medium text-grey-2"
                  >
                    Account Number
                  </label>
                  <Input
                    type="text"
                    id="accountNumber"
                    placeholder="1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <CustomSelect
                    label="Category (Optional)"
                    options={categoryOptions}
                    value={category}
                    onChange={setCategory}
                    isLoading={CategoriesDataLoading}
                    placeholder="Select a category..."
                  />
                  <p className="text-xs text-warning-1 mt-1">
                    Attach an expense category so this shows up under the right
                    heading in your reports.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="accountName"
                      className="block text-sm font-medium text-grey-2"
                    >
                      Account Name
                    </label>
                    {enquiryLoading && <Spinner size={"sm"} />}
                  </div>
                  <Input
                    type="text"
                    disabled
                    id="accountName"
                    placeholder="Recipient Full Name"
                    value={accountName}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-grey-2"
                  >
                    Amount (NGN)
                  </label>
                  <Input
                    type="number"
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="narration"
                    className="block text-sm font-medium text-grey-2"
                  >
                    Narration (Optional)
                  </label>
                  <Input
                    type="text"
                    id="narration"
                    placeholder="e.g. Diesel for the generator"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                  />
                </div>

                {message && (
                  <div className="p-3 rounded-lg text-sm font-medium bg-error-2 text-error-1">
                    {message}
                  </div>
                )}

                <Button type="submit" className="w-full h-12">
                  Transfer Now
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTransfer;
