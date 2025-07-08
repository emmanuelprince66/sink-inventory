"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Landmark, Wallet } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import TransactionDetails from "./TransactionDetails";

interface Transaction {
  id: string;
  customerName: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

const Transactions = () => {
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showTrxDetails, setShowTrxDetails] = useState(false);
  const [kycType, setKycType] = useState<"business" | "individual">(
    "individual"
  );

  // Dummy data
  const walletBalance = 1250000;
  const transactions: Transaction[] = [
    {
      id: "TRX-001",
      customerName: "John Doe",
      type: "credit",
      amount: 50000,
      date: "2023-10-15",
      status: "completed",
    },
    {
      id: "TRX-002",
      customerName: "Jane Smith",
      type: "debit",
      amount: 25000,
      date: "2023-10-14",
      status: "completed",
    },
    {
      id: "TRX-003",
      customerName: "Acme Corp",
      type: "credit",
      amount: 175000,
      date: "2023-10-12",
      status: "completed",
    },
    {
      id: "TRX-004",
      customerName: "Bob Johnson",
      type: "debit",
      amount: 45000,
      date: "2023-10-10",
      status: "pending",
    },
    {
      id: "TRX-005",
      customerName: "Sarah Williams",
      type: "credit",
      amount: 80000,
      date: "2023-10-08",
      status: "completed",
    },
  ];

  const totalInflow = transactions
    .filter((t) => t.type === "credit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === "debit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const formatToNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col justify-start gap-5 items-start px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <h1 className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Transactions
          </h1>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
            <Button
              className="border-primary-green-300 w-full sm:w-auto"
              onClick={() => setShowPinModal(true)}
            >
              Setup Transaction Pin
            </Button>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {/* Wallet Balance */}
          <CustomCard className="p-4 bg-primary-green-200 border border-primary-green-300 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-green-100 rounded-full">
                  <Wallet className="w-5 h-5 text-primary-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Wallet Balance
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatToNaira(walletBalance)}
              </span>
            </div>
          </CustomCard>

          {/* Inflow */}
          <CustomCard className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <ArrowDownLeft className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Total Inflow
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatToNaira(totalInflow)}
              </span>
            </div>
          </CustomCard>

          {/* Outflow */}
          <CustomCard className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <ArrowUpRight className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Total Outflow
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatToNaira(totalOutflow)}
              </span>
            </div>
          </CustomCard>
        </div>

        {/* Bank Account Card */}
        <CustomCard className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Main Account</p>
                <p className="text-xs opacity-90">Access Bank •••• 4567</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                View Details
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                Transfer
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className="text-sm">
              Account Name:{" "}
              <span className="font-medium">John Doe Enterprises</span>
            </p>
            <p className="text-sm">
              Available Balance:{" "}
              <span className="font-medium">
                {formatToNaira(walletBalance)}
              </span>
            </p>
          </div>
        </CustomCard>

        {/* Search and Filters */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <SearchInput
              placeholder="Search by customer name or transaction ID..."
              value={searchInput}
              onValueChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="border-gray-300 flex-1 md:flex-none"
            >
              All
            </Button>
            <Button
              variant="outline"
              className="border-green-300 text-green-600 flex-1 md:flex-none"
            >
              Credit
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 flex-1 md:flex-none"
            >
              Debit
            </Button>
          </div>
        </div>

        {/* Transactions Table (hidden on mobile) */}
        <div className="w-full rounded-lg border border-gray-200 hidden sm:block">
          <table className="w-full min-w-[600px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {transaction.customerName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === "credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatToNaira(transaction.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setShowTrxDetails(true)}
                      className="cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Transaction List (visible only on mobile) */}
        <div className="w-full sm:hidden space-y-3">
          {transactions.map((transaction) => (
            <CustomCard key={transaction.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{transaction.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">{transaction.id}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatToNaira(transaction.amount)}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                      transaction.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : transaction.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-primary-green-600 border-primary-green-200"
              >
                View Details
              </Button>
            </CustomCard>
          ))}
        </div>

        {/* Verify KYC Button */}
        <div className="w-full flex justify-center mt-6 pb-6">
          <Button
            onClick={() => setShowKycModal(true)}
            className="bg-primary-green-600 hover:bg-primary-green-700 w-full sm:w-auto"
          >
            Complete KYC Verification
          </Button>
        </div>
      </div>

      {/* Transaction Pin Modal */}
      <CustomModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Setup Transaction Pin"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New 4-digit Pin
            </label>
            <input
              type="password"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
              placeholder="Enter pin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Pin
            </label>
            <input
              type="password"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
              placeholder="Confirm pin"
            />
          </div>
          <Button className="w-full mt-4 bg-primary-green-600 hover:bg-primary-green-700">
            Save Pin
          </Button>
        </div>
      </CustomModal>

      {/* KYC Verification Modal */}
      <CustomModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        title="Complete KYC Verification"
      >
        <div className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={kycType === "individual" ? "default" : "outline"}
              onClick={() => setKycType("individual")}
              className="w-full"
            >
              Individual
            </Button>
            <Button
              variant={kycType === "business" ? "default" : "outline"}
              onClick={() => setKycType("business")}
              className="w-full"
            >
              Business
            </Button>
          </div>

          {kycType === "individual" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BVN
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
                  placeholder="Enter your BVN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BVN
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
                  placeholder="Enter business BVN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CAC Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
                  placeholder="Enter CAC number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incorporation Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green-300"
                />
              </div>
            </div>
          )}

          <Button className="w-full bg-primary-green-600 hover:bg-primary-green-700">
            Verify Account
          </Button>
        </div>
      </CustomModal>
      {/* KYC Verification Modal */}
      <CustomModal
        isOpen={showTrxDetails}
        onClose={() => setShowTrxDetails(false)}
        title="Transaction Details"
      >
        <TransactionDetails />
      </CustomModal>
    </>
  );
};

export default Transactions;
