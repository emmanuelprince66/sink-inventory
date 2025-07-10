import { useState } from "react";
import ConfirmTransfer from "./ConfirmTransfer";

const Transfer = () => {
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);
  // Dummy data for wallet balance and bank options
  const walletBalance = 12_500.75;
  const banks = [
    { id: "select", name: "Select a bank" },
    { id: "chase", name: "Chase Bank" },
    { id: "bankofamerica", name: "Bank of America" },
    { id: "wells", name: "Wells Fargo" },
    { id: "citi", name: "Citibank" },
  ];

  // State for form fields
  const [recipientBank, setRecipientBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    // Basic validation
    if (
      !recipientBank ||
      recipientBank === "select" ||
      !accountNumber ||
      !accountName ||
      !amount
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance) {
      setMessage(
        "Invalid amount. Please enter a positive amount within your balance."
      );
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage(
        `Transfer of $${parseFloat(amount).toFixed(
          2
        )} to ${accountName} (${accountNumber}) at ${
          banks.find((b) => b.id === recipientBank)?.name
        } successful!`
      );
      // Clear form after successful transfer
      setRecipientBank("select");
      setAccountNumber("");
      setAccountName("");
      setAmount("");
      setNarration("");
    }, 1000);
  };

  return (
    <>
      {showConfirmTransfer ? (
        <ConfirmTransfer />
      ) : (
        <div className="">
          <div className="max-w-xl w-full bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-t-xl shadow-md">
              <p className="text-sm opacity-80 mb-1">Available Balance</p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                $
                {walletBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
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
                  <label
                    htmlFor="bank"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Recipient Bank
                  </label>
                  <select
                    id="bank"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={recipientBank}
                    onChange={(e) => setRecipientBank(e.target.value)}
                    required
                  >
                    {banks.map((bank) => (
                      <option
                        key={bank.id}
                        value={bank.id}
                        disabled={bank.id === "select"}
                      >
                        {bank.name}
                      </option>
                    ))}
                  </select>
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
                  <label
                    htmlFor="accountName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Recipient Full Name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount (USD)
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
                  onClick={() => setShowConfirmTransfer(true)}
                  className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
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
