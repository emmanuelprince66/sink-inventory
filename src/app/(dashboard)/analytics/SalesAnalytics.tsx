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
  // Format amount as currency
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

  // Dummy data for Income Statement
  const incomeStatementData = [
    {
      number: "01",
      category: "Sales Revenue",
      date: "2025/Jan",
      amount: 5000000,
    },
    {
      number: "02",
      category: "Service Revenue",
      date: "2025/Jan",
      amount: 2000000,
    },
    {
      number: "03",
      category: "Other Income",
      date: "2025/Jan",
      amount: 500000,
    },
    {
      number: "04",
      category: "Total Revenue",
      date: "2025/Jan",
      amount: 7500000,
    },
  ];

  // Dummy data for Cost of Operation Statement
  const costOfOperationData = [
    {
      number: "01",
      category: "Cost of Goods Sold",
      date: "2025/Jan",
      amount: 2500000,
    },
    {
      number: "02",
      category: "Operating Expenses",
      date: "2025/Jan",
      amount: 1200000,
    },
    {
      number: "03",
      category: "Marketing Costs",
      date: "2025/Jan",
      amount: 800000,
    },
    {
      number: "04",
      category: "Administrative Costs",
      date: "2025/Jan",
      amount: 600000,
    },
    {
      number: "05",
      category: "Total Costs",
      date: "2025/Jan",
      amount: 5100000,
    },
  ];

  // Dummy data for Gross Profit Analytics
  const grossProfitData = [
    { label: "Profit", jan: 3000000, feb: 3500000 },
    { label: "Direct Cost", jan: 1500000, feb: 1200000 },
    { label: "Net Profit", jan: 1500000, feb: 2300000 },
  ];

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

      {/* Third Row - 3 new cards (Income Statement, Cost of Operation, Gross Profit) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income Statement Card */}
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Income Statement
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      #
                    </th>
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Category
                    </th>
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-right py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeStatementData.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        item.category.includes("Total")
                          ? "font-bold bg-gray-50"
                          : ""
                      }`}
                    >
                      <td className="py-2 px-1 sm:px-2">{item.number}</td>
                      <td className="py-2 px-1 sm:px-2">{item.category}</td>
                      <td className="py-2 px-1 sm:px-2 text-gray-500">
                        {item.date}
                      </td>
                      <td className="py-2 px-1 sm:px-2 text-right text-green-600 font-semibold">
                        {formatToNaira(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CustomCard>

        {/* Cost of Operation Statement Card */}
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Cost of Operation
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      #
                    </th>
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Category
                    </th>
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-right py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {costOfOperationData.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        item.category.includes("Total")
                          ? "font-bold bg-gray-50"
                          : ""
                      }`}
                    >
                      <td className="py-2 px-1 sm:px-2">{item.number}</td>
                      <td className="py-2 px-1 sm:px-2">{item.category}</td>
                      <td className="py-2 px-1 sm:px-2 text-gray-500">
                        {item.date}
                      </td>
                      <td className="py-2 px-1 sm:px-2 text-right text-red-600 font-semibold">
                        {formatToNaira(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CustomCard>

        {/* Gross Profit Analytics Card */}
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Gross Profit Analytics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Metric
                    </th>
                    <th className="text-right py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Jan
                    </th>
                    <th className="text-right py-2 px-1 sm:px-2 font-medium text-gray-600">
                      Feb
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grossProfitData.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        item.label.includes("Net") ? "font-bold bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-2 px-1 sm:px-2 font-medium">
                        {item.label}
                      </td>
                      <td
                        className={`py-2 px-1 sm:px-2 text-right font-semibold ${
                          item.label === "Profit"
                            ? "text-green-600"
                            : item.label === "Direct Cost"
                              ? "text-red-600"
                              : "text-blue-600"
                        }`}
                      >
                        {formatToNaira(item.jan)}
                      </td>
                      <td
                        className={`py-2 px-1 sm:px-2 text-right font-semibold ${
                          item.label === "Profit"
                            ? "text-green-600"
                            : item.label === "Direct Cost"
                              ? "text-red-600"
                              : "text-blue-600"
                        }`}
                      >
                        {formatToNaira(item.feb)}
                      </td>
                    </tr>
                  ))}
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
