"use client";
import CustomSelect, {
  SelectOption,
  SelectValue,
} from "@/components/app/CustomSelect";
import { Spinner } from "@/components/ui/spinner";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowBigLeftDash } from "lucide-react";
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
  const [openPinModal, setOpenPinModal] = useState(false);
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

  console.log("TrxData", trxData);

  // Transform bank data to select options
  useEffect(() => {
    if (BankTrxData) {
      setBankOptions(
        BankTrxData.map((bank: any) => ({
          value: bank.bankCode,
          label: bank.name,
          ...bank,
        }))
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
        }))
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

    setShowConfirmTransfer(true);
  };

  return (
    <>
      {showConfirmTransfer ? (
        <ConfirmTransfer
          transferDetails={{
            bank: recipientBank,
            category,
            accountNumber,
            accountName: beneficiaryInfo?.data?.name || accountName,
            amount,
            narration,
          }}
          beneficiaryInfo={beneficiaryInfo} // Pass beneficiaryInfo to preserve it
          onCancel={() => setShowConfirmTransfer(false)}
        />
      ) : (
        <div className=" flex flex-col items-start justify-center   ">
          <ArrowBigLeftDash
            className="cursor-pointer w-6 h-6 mb-4 mt-4"
            onClick={() => history.back()}
          />
          <div className=" md:w-[60%] w-full  mx-auto border border-gray-200 rounded-lg shadow ">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-t-xl shadow-md">
              <p className="text-sm opacity-80 mb-1">Available Balance</p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                {formatToNaira(
                  trxData?.data?.results?.wallet_details?.balance || 0
                )}
              </h2>
              <p className="text-xs opacity-70 mt-2">
                Your funds are ready to be transferred.
              </p>
            </div>

            {/* Transfer Form */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Transfer Funds
                </h3>
                <p className="text-sm text-gray-500 mt-1">
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
                    className="block text-sm font-medium text-gray-700"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  <p className="text-xs text-yellow-600 mt-1">
                    Attach an expense category (except for stock purchases)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="accountName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Account Name
                    </label>

                    {enquiryLoading && (
                      <div className="flex items-center justify-center">
                        <Spinner size={"sm"} />
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    disabled
                    id="accountName"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Recipient Full Name"
                    value={accountName}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount (NGN)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="block text-sm font-medium text-gray-700"
                  >
                    Narration (Optional)
                  </label>
                  <input
                    type="text"
                    id="narration"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g. Rent payment"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                  />
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      message.includes("successful")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Transfer Now
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Transfer;
