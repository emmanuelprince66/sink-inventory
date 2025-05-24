"use client";

import { Button } from "@/components/ui/button";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

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
      className={`p-6 rounded-xl border ${className} ${
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
        <p className="font-[500] text-sm text-primary-black-100">{title}</p>
        <p className="font-[600] text-xl text-primary-black-100">
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
}: {
  SalesAnalyticData: any;
  openAttendantsModal: any;
  handleClearAttendant: any;
  attendantsName: any;
}) => {
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
        backgroundColor: ["#4CAF50", "#8BC34A"],
        borderColor: ["#388E3C", "#689F38"],
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
    <div className="w-full  py-8">
      <div className="w-full justify-end flex gap-3 mb-4 ">
        <Button
          className=" border-primary-green-300 "
          onClick={openAttendantsModal}
        >
          {attendantsName ? `${attendantsName}` : "Select Attendant"}
        </Button>

        {attendantsName && (
          <Button
            variant={"outline"}
            className=" border primary-red-100 text-primary-red-100"
            onClick={handleClearAttendant}
          >
            clear
          </Button>
        )}
      </div>
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomSalesCard
          title="Total Revenue"
          amount={SalesAnalyticData?.data.total_Revenue}
          change={SalesAnalyticData?.data.total_Revenue_change}
        />
        <CustomSalesCard
          title="Total Profit"
          amount={SalesAnalyticData?.data.total_profit}
          change={SalesAnalyticData?.data.total_profit_change}
        />
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

      {/* Second Row - 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Doughnut Chart Card */}
        <CustomCard className="h-full border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-lg mb-4">
              Net Profit : {formatToNaira(SalesAnalyticData?.data.net_profit)}
            </h3>
            <div className="flex-grow h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </CustomCard>

        {/* Payment Method Card */}
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-lg mb-4">Payment Methods</h3>
            <div className="space-y-4 flex-grow">
              {SalesAnalyticData?.data?.transaction_breakdown.map(
                (method: any, index: any) => (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full"
                  >
                    <span className="font-medium">
                      {method?.payment_method}
                    </span>
                    <span className="font-semibold">
                      {formatToNaira(method?.total_amount)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default SalesAnalytics;
