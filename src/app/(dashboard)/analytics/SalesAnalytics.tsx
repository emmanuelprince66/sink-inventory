"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { useAnalyticHook } from "@/hooks/useAnalyticHook";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import PaymentDetails from "./PaymentDetails";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom card component
const CustomCard = ({
  children,
  className = "",
  shadow = false,
}: {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
}) => {
  return (
    <div
      className={`p-4 sm:p-6 rounded-xl border ${className} ${
        shadow ? "shadow-sm" : ""
      }`}
      style={{ backgroundColor: "#FEFFFE" }}
    >
      {children}
    </div>
  );
};

// Custom sales card component
const CustomSalesCard = ({
  title,
  amount,
  type,
  change,
}: {
  title: string;
  amount: number | string;
  change?: number;
  type?: string;
}) => {
  const formattedAmount =
    typeof amount === "number" ? formatToNaira(amount) : amount;

  return (
    <CustomCard
      className="bg-primary-green-200 border-primary-green-300 w-full shadow"
      shadow
    >
      <div className="flex flex-col gap-2 items-start">
        <p className="font-[500] text-xs sm:text-sm text-primary-black-100">
          {title}
        </p>
        <p className="font-[600] text-lg sm:text-xl text-primary-black-100">
          {type === "transaction" ? amount : formattedAmount}
        </p>
        {change !== undefined && (
          <p
            className={`text-xs ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}% from last period
          </p>
        )}
      </div>
    </CustomCard>
  );
};

const SalesAnalytics = ({
  SalesAnalyticData,
  openAttendantsModal,
  handleClearAttendant,
  attendantsName,
  dateRange,
}: {
  SalesAnalyticData: any;
  openAttendantsModal: any;
  handleClearAttendant: any;
  attendantsName: any;
  dateRange: any;
}) => {
  const { user } = useUserRole();
  const [openPaymentDetailsModal, setOpenPaymentDetailsModal] = useState(false);
  const [name, setName] = useState("");

  const handleOpenPaymentDetailsModal = (name: string) => {
    setName(name);
    setOpenPaymentDetailsModal(true);
  };
  const handleClosePaymentDetailsModal = () =>
    setOpenPaymentDetailsModal(false);

  const { BankBreakDownAnalytics, BankBreakDownAnalyticsLoading } =
    useAnalyticHook({ openPaymentDetailsModal, name, dateRange });

  // Get month/year from dateRange
  const getMonthYear = () => {
    if (dateRange?.from) {
      const date = new Date(dateRange.from);
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
    return "April 2025";
  };

  // Data from screenshot - Income Statement
  const incomeStatementData = [
    { number: "1", category: "Revenue", actual: 1172380, budget: 1146700 },
    { number: "2", category: "Bed", actual: 0, budget: 47850 },
    { number: "3", category: "Nasal Mask & Prongs", actual: 0, budget: 62325 },
    { number: "4", category: "CPAP/BIPAP", actual: 66500, budget: 103000 },
    { number: "5", category: "Oral/Nasal", actual: 0, budget: 50250 },
    { number: "6", category: "Humidifier", actual: 0, budget: 167500 },
    { number: "7", category: "Cable", actual: 40000, budget: 145000 },
    { number: "8", category: "Home Care", actual: 30200, budget: 83600 },
    { number: "9", category: "Others", actual: 0, budget: 0 },
    { number: "10", category: "Staging", actual: 0, budget: 0 },
  ];

  const incomeTotal = {
    actual: incomeStatementData.reduce((sum, item) => sum + item.actual, 0),
    budget: incomeStatementData.reduce((sum, item) => sum + item.budget, 0),
  };

  // Data from screenshot - Cost of Sales/Direct Costs
  const directCostsData = [
    { number: "7", category: "Consumables", actual: 465000, budget: 163000 },
    { number: "8", category: "Commission Paid", actual: 0, budget: 0 },
    { number: "9", category: "Sleep Studies", actual: 0, budget: 0 },
    {
      number: "10",
      category: "Referral Party Waiver",
      actual: 107375,
      budget: 60751,
    },
    { number: "11", category: "Bank Charges (POS)", actual: 0, budget: 0 },
    { number: "12", category: "Trade Fairs", actual: 0, budget: 0 },
    { number: "13", category: "Re-Inspection Fees", actual: 0, budget: 0 },
    { number: "14", category: "Transportation", actual: 0, budget: 0 },
  ];

  const directCostsTotal = {
    actual: directCostsData.reduce((sum, item) => sum + item.actual, 0),
    budget: directCostsData.reduce((sum, item) => sum + item.budget, 0),
  };

  // Data from screenshot - Operating Expenses (OPEX)
  const opexData = [
    { number: "14", category: "Staff", actual: 150000, budget: 166667 },
    { number: "15", category: "Welfare", actual: 607500, budget: 645000 },
    { number: "16", category: "Stationery", actual: 1000, budget: 0 },
    {
      number: "17",
      category: "Recruitment/Promotional Expe",
      actual: 0,
      budget: 40000,
    },
    {
      number: "18",
      category: "Training/Induction",
      actual: 27600,
      budget: 68500,
    },
    { number: "19", category: "Electricity", actual: 26200, budget: 50000 },
    { number: "20", category: "Internet/Boiler", actual: 0, budget: 20000 },
    { number: "21", category: "Rent", actual: 42000, budget: 0 },
    {
      number: "22",
      category: "Taxation & Licence",
      actual: 110500,
      budget: 37800,
    },
    {
      number: "23",
      category: "Office Equipment",
      actual: 27000,
      budget: 25000,
    },
    { number: "24", category: "Postage", actual: 5000, budget: 14000 },
    { number: "25", category: "Lab. Expenses", actual: 143700, budget: 40000 },
    { number: "26", category: "Operational Exp", actual: 4500, budget: 0 },
    { number: "27", category: "Bank Charges", actual: 15155, budget: 16000 },
  ];

  const opexTotal = {
    actual: opexData.reduce((sum, item) => sum + item.actual, 0),
    budget: opexData.reduce((sum, item) => sum + item.budget, 0),
  };

  // Doughnut chart data
  const chartData = {
    labels: [
      `Total Profit ${formatToNaira(SalesAnalyticData?.data.total_profit)} `,
      `Expenses ${formatToNaira(SalesAnalyticData?.data.expenses)}`,
    ],
    datasets: [
      {
        data: [
          SalesAnalyticData?.data.total_profit,
          SalesAnalyticData?.data.expenses,
        ],
        backgroundColor: ["#4CAF50", "#DC2626"],
        borderColor: ["#388E3C", "red"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += formatToNaira(context.parsed);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="w-full py-4 sm:py-8">
      <div className="w-full justify-end flex gap-3 mb-4">
        {user && user?.role === "OWNER" && (
          <Button
            className="border-primary-green-300 text-xs sm:text-sm"
            onClick={openAttendantsModal}
          >
            {attendantsName ? `${attendantsName}` : "Select Attendant"}
          </Button>
        )}

        {attendantsName && (
          <Button
            variant={"outline"}
            className="border primary-red-100 text-primary-red-100 text-xs sm:text-sm"
            onClick={handleClearAttendant}
          >
            clear
          </Button>
        )}
      </div>

      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomSalesCard
          title="Total Revenue"
          amount={SalesAnalyticData?.data.total_Revenue}
          change={SalesAnalyticData?.data.total_Revenue_change}
        />

        {user && user?.role === "OWNER" && (
          <CustomSalesCard
            title="Total Profit"
            amount={SalesAnalyticData?.data.total_profit}
            change={SalesAnalyticData?.data.total_profit_change}
          />
        )}

        <CustomSalesCard
          title="Avg. Transaction"
          amount={SalesAnalyticData?.data.average_transaction_value}
          change={SalesAnalyticData?.data.average_transaction_value_change}
        />
        <CustomSalesCard
          title="Transactions"
          amount={SalesAnalyticData?.data.transaction_count}
          change={SalesAnalyticData?.data.transaction_count_change}
          type="transaction"
        />
      </div>

      {/* Second Row - 2 cards (Doughnut Chart & Payment Methods) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Doughnut Chart Card */}
        <CustomCard className="h-full border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Net Profit : {formatToNaira(SalesAnalyticData?.data.net_profit)}
            </h3>
            <div className="flex-grow h-[250px] sm:h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </CustomCard>

        {/* Payment Method Card */}
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Payment Methods
            </h3>
            <div className="space-y-4 flex-grow">
              {SalesAnalyticData?.data?.transaction_breakdown.map(
                (method: any, index: any) => (
                  <div
                    key={index}
                    onClick={() =>
                      handleOpenPaymentDetailsModal(method?.payment_method)
                    }
                    className="flex cursor-pointer p-2 hover:bg-primary-green-500 justify-between items-center w-full text-sm sm:text-base"
                  >
                    <span className="font-medium">
                      {method?.payment_method}
                    </span>
                    <span className="font-semibold">
                      {formatToNaira(method?.total_amount)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Third Row - Single Column Layout with Month Heading */}
      <div className="space-y-6">
        {/* Month Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Month of {getMonthYear()}
          </h2>
        </div>

        {/* Income Statement */}
        <CustomCard className="border-gray-200" shadow>
          <div className="flex flex-col">
            <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
              Income Statement
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      #
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Actual
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Budget
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeStatementData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 sm:px-4 text-gray-600">
                        {item.number}
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-green-600 font-semibold">
                        {formatToNaira(item.actual)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-blue-600 font-semibold">
                        {formatToNaira(item.budget)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                    <td className="py-3 px-2 sm:px-4" colSpan={2}>
                      TOTAL
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-green-700">
                      {formatToNaira(incomeTotal.actual)}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-blue-700">
                      {formatToNaira(incomeTotal.budget)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CustomCard>

        {/* Direct Costs / Out of Sales */}
        <CustomCard className="border-gray-200" shadow>
          <div className="flex flex-col">
            <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
              Direct Costs (Out of Sales)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      #
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Actual
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Budget
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {directCostsData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 sm:px-4 text-gray-600">
                        {item.number}
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-red-600 font-semibold">
                        {formatToNaira(item.actual)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-orange-600 font-semibold">
                        {formatToNaira(item.budget)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                    <td className="py-3 px-2 sm:px-4" colSpan={2}>
                      TOTAL DIRECT COSTS
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-red-700">
                      {formatToNaira(directCostsTotal.actual)}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-orange-700">
                      {formatToNaira(directCostsTotal.budget)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CustomCard>

        {/* Operating Expenses (OPEX) */}
        <CustomCard className="border-gray-200" shadow>
          <div className="flex flex-col">
            <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
              Operating Expenses (OPEX)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      #
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Actual
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                      Budget
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opexData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 sm:px-4 text-gray-600">
                        {item.number}
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-purple-600 font-semibold">
                        {formatToNaira(item.actual)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-indigo-600 font-semibold">
                        {formatToNaira(item.budget)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                    <td className="py-3 px-2 sm:px-4" colSpan={2}>
                      TOTAL OPERATING EXPENSES
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-purple-700">
                      {formatToNaira(opexTotal.actual)}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-indigo-700">
                      {formatToNaira(opexTotal.budget)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Payment Details Modal */}
      <CustomModal
        isOpen={openPaymentDetailsModal}
        onClose={handleClosePaymentDetailsModal}
        trigger={true}
        title="Payment Details"
        description=""
      >
        <PaymentDetails
          BankBreakDownAnalyticsLoading={BankBreakDownAnalyticsLoading}
          BankBreakDownAnalytics={BankBreakDownAnalytics}
        />
      </CustomModal>
    </div>
  );
};

export default SalesAnalytics;
