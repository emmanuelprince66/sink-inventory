"use client";
import CustomSelect, {
  SelectOption,
  SelectValue,
} from "@/components/app/CustomSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmTransfer from "../ConfirmTransfer";

const Transfer = () => {
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);

  // State for form fields
  const [recipientBank, setRecipientBank] = useState<SelectValue>(null);
  const [category, setCategory] = useState<SelectValue>(null);
  const [accountNumber, setAccountNumber] = useState("");

  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [message, setMessage] = useState("");
  const [bankOptions, setBankOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const {
    BankTrxData,
    CategoriesData,
    TrxData: trxData,
    BankDataLoading,
    beneficiaryInfo,
    CategoriesDataLoading,
    enquiryLoading,
  } = useTransactionsHook({ recipientBank, accountNumber });

  const trxBalance = trxData?.data?.results?.wallet_details?.balance || 0;

  // Transform bank data to select options
  useEffect(() => {
    if (BankTrxData) {
      setBankOptions(
        BankTrxData.map((bank: any) => ({
          value: bank.bankCode,
          label: bank.name,
          ...bank,
        })),
      );
    }
  }, [BankTrxData]);

  // Transform category data to select options
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

  // Update account name when beneficiary info changes
  useEffect(() => {
    if (beneficiaryInfo?.data?.name) {
      setAccountName(beneficiaryInfo.data.name);
    } else {
      setAccountName("");
    }
  }, [beneficiaryInfo]);

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setMessage("");

    if (!recipientBank || !accountNumber || !amount) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (!accountName) {
      setMessage("Please wait for account name verification.");
      return;
    }

    if (accountNumber.length < 10) {
      setMessage("Please enter a valid account number.");
      return;
    }

    if (!beneficiaryInfo?.data?.name) {
      setMessage("Please wait for account name verification.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount greater than zero.");
      return;
    }

    if (parseFloat(amount) > trxBalance) {
      setMessage("Insufficient balance for this transfer.");
      return;
    }

    setShowConfirmTransfer(true);
  };

  if (showConfirmTransfer) {
    return (
      <ConfirmTransfer
        transferDetails={{
          bank: recipientBank,
          category,
          accountNumber,
          accountName: beneficiaryInfo?.data?.name || accountName,
          amount,
          narration,
        }}
        beneficiaryInfo={beneficiaryInfo}
        onCancel={() => setShowConfirmTransfer(false)}
      />
    );
  }

  return (
    <div className="px-4 py-6 w-full flex flex-col gap-6 items-center">
      <div className="w-full md:w-[60%]">
        <button
          onClick={() => history.back()}
          className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="w-full mt-5 border border-grey-5 rounded-2xl overflow-hidden bg-white">
          {/* Wallet Balance Card */}
          <div className="bg-primary-green-100 text-white p-6">
            <p className="text-sm text-white/70 mb-1">Available Balance</p>
            <h2 className="text-4xl font-extrabold tracking-tight">
              {formatToNaira(
                trxData?.data?.results?.wallet_details?.balance || 0,
              )}
            </h2>
            <p className="text-xs text-white/60 mt-2">
              Your funds are ready to be transferred.
            </p>
          </div>

          {/* Transfer Form */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-grey-1">
                Transfer Funds
              </h3>
              <p className="text-sm text-grey-3 mt-1">
                Send money to another account securely.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  Attach an expense category (except for stock purchases)
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

                  {enquiryLoading && (
                    <div className="flex items-center justify-center">
                      <Spinner size={"sm"} />
                    </div>
                  )}
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
                  placeholder="e.g. Rent payment"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    message.includes("successful")
                      ? "bg-success-2 text-success-1"
                      : "bg-error-2 text-error-1"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full h-12">
                Transfer Now
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
