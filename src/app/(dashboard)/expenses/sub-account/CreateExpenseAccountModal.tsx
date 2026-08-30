"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useCreateSubAccountMutation } from "@/api/transactions/create-sub-account";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  Copy,
  Layers,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

/**
 * Creating an Expense Management sub-account, in three steps.
 *
 * They live in one component because they share the created account: the
 * confirmation is only reachable through the form, so splitting them would mean
 * lifting that state into the Expenses page for no gain.
 */

const BENEFITS = [
  {
    icon: Wallet,
    text: "Manage business expenses from one dedicated account.",
  },
  {
    icon: ShieldCheck,
    text: "Control team spending by setting spending rules and permissions.",
  },
  {
    icon: Layers,
    text: "Track operational spending and know where your business money is going.",
  },
  {
    icon: Building2,
    text: "Separate expenses from your main business funds for better financial control.",
  },
  {
    icon: Users,
    text: "Give your team access to approved funds without giving up control of your business finances.",
  },
];

type Step = "intro" | "setup" | "done";

const CreateExpenseAccountModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>("intro");
  const [fundFrom, setFundFrom] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<any | null>(null);

  const { data: businessRes, isLoading: businessLoading } =
    useFetchBusinessById(business_id);

  /**
   * Only real business accounts can fund an expense account. is_sub marks the
   * ones that are themselves sub-accounts, and offering those would let someone
   * fund an expense account from another expense account.
   *
   * An account with no number is dropped rather than shown: previous_account is
   * that number, so such a row could be selected and would then fail on submit
   * with a server-side message the merchant cannot act on.
   */
  const fundingAccounts = useMemo(() => {
    const banks: any[] = businessRes?.data?.banks ?? [];
    return banks.filter((bank) => !bank.is_sub && bank.account_number);
  }, [businessRes]);

  const { mutate: createSubAccount, isPending } = useCreateSubAccountMutation({
    onSuccess: (response: any) => {
      setCreated(response?.data ?? response ?? null);
      setStep("done");
      // The new account appears on the business payload and anywhere banks are
      // listed, so both go stale the moment it exists.
      queryClient.invalidateQueries({
        queryKey: [queryKey.business.getBusinessById],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.transactions.getAllTransactions],
      });
    },
  });

  const reset = () => {
    setStep("intro");
    setFundFrom("");
    setAccountName("");
    setError(null);
    setCreated(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fundFrom) return setError("Choose the account to fund this from.");
    if (!accountName.trim())
      return setError("Give this expense account a name.");

    createSubAccount({
      businessId: business_id ?? "",
      body: {
        // The account NUMBER, which is what the wallet endpoint reports as
        // wallet_details.account_number — not the bank record's id.
        previous_account: fundFrom,
        // "Expense" leads the branch so the name shown on transfers and
        // statements reads as an expense account rather than as another
        // ordinary branch of the business.
        branch: `Expense ${accountName.trim()}`,
        // Without this the backend creates a plain sub-account and the
        // expense screens never see it.
        is_expenses: true,
      },
    });
  };

  const copy = (value: string, label: string) =>
    navigator.clipboard
      .writeText(value)
      .then(() => showToast(`${label} copied`, "success"))
      .catch(() =>
        showToast(`Could not copy the ${label.toLowerCase()}`, "error"),
      );

  const title =
    step === "intro"
      ? "Create an Expense Management Account"
      : step === "setup"
        ? "Set Up Your Expense Account"
        : "Your Expense Management Account Is Ready";

  const detailRows = [
    {
      label: "Account Number",
      value: created?.account_number ?? "—",
      mono: true,
    },
    {
      label: "Account Name",
      value: created?.account_name ?? "—",
      mono: false,
    },
    ...(created?.bank_name
      ? [{ label: "Bank", value: created.bank_name, mono: false }]
      : []),
  ];

  return (
    <CustomModal isOpen={open} onClose={close} trigger={false} title={title}>
      {step === "intro" && (
        <div className="flex w-full min-w-0 flex-col gap-5">
          <p className="text-sm leading-relaxed text-grey-2">
            Create a dedicated account for managing your business expenses and
            operational spending.
          </p>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
              With your Expense Management Account, you can
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-6 text-primary-green-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed text-grey-2">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              className="h-11 flex-1 rounded-xl"
              onClick={() => setStep("setup")}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "setup" && (
        <form onSubmit={submit} className="flex w-full min-w-0 flex-col gap-5">
          <p className="text-sm leading-relaxed text-grey-2">
            Choose the business account you want to fund this Expense Management
            Account from, then give your account a name.
          </p>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
              Fund From
            </label>
            <p className="mt-1 text-[11px] text-grey-3">
              Select an existing SYNC360 business bank account.
            </p>

            {businessLoading ? (
              <Skeleton className="mt-2 h-11 w-full rounded-xl bg-grey-5" />
            ) : fundingAccounts.length === 0 ? (
              <p className="mt-2 rounded-xl bg-warning-2 px-3.5 py-3 text-[11px] leading-relaxed text-warning-1">
                No business bank account found. Create one under Transactions
                first — an expense account has to be funded from somewhere.
              </p>
            ) : (
              <Select value={fundFrom} onValueChange={setFundFrom}>
                <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {/* Keyed and valued on account_number: that is what
                      previous_account expects, and it is the same value the
                      wallet endpoint returns for this bank. */}
                  {fundingAccounts.map((bank) => (
                    <SelectItem
                      key={bank.id ?? bank.account_number}
                      value={String(bank.account_number)}
                    >
                      {bank.bank_name} · {bank.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
              Expense Account Name
            </label>
            <p className="mt-1 text-[11px] text-grey-3">
              Enter the purpose of this account.
            </p>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Operations, Marketing, Staff Expenses"
              className="mt-2 h-11 rounded-xl"
            />
          </div>

          <p className="rounded-xl bg-primary-green-500 px-3.5 py-3 text-[11px] leading-relaxed text-grey-2">
            Your expense account name will be used as part of the account name
            displayed for transactions and transfers.
          </p>

          {error && <p className="text-xs font-medium text-error-1">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setStep("intro")}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-11 flex-1 gap-2 rounded-xl"
              disabled={isPending || fundingAccounts.length === 0}
            >
              {isPending && <Spinner className="h-4 w-4" />}
              Create Expense Account
            </Button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="flex w-full min-w-0 flex-col gap-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green-500 text-primary-green-300">
              <Check className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-grey-2">
              Your Expense Management Account has been successfully created.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-grey-5 bg-white px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-grey-3">{row.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-sm font-extrabold text-grey-1",
                      row.mono && "font-mono tracking-wider",
                    )}
                  >
                    {row.value}
                  </p>
                </div>
                {row.value !== "—" && (
                  <button
                    type="button"
                    onClick={() => copy(String(row.value), row.label)}
                    className="shrink-0 rounded-lg p-1.5 text-grey-3 hover:bg-grey-6 cursor-pointer"
                    title={`Copy ${row.label.toLowerCase()}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-grey-2">
            You can now use this account to manage and control your business
            expenses.
          </p>

          <Button className="h-11 w-full rounded-xl" onClick={close}>
            Done
          </Button>
        </div>
      )}
    </CustomModal>
  );
};

export default CreateExpenseAccountModal;
