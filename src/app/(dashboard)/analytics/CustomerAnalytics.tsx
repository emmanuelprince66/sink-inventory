"use client";

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
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-6 rounded-2xl border border-border-tint bg-white ${className}`}>
      {children}
    </div>
  );
};

// Custom customer card component
const CustomCustomerCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: number | string;
  description?: React.ReactNode;
}) => {
  return (
    <CustomCard className="w-full">
      <div className="flex flex-col gap-2 items-start">
        <p className="text-sm font-bold text-grey-3">{title}</p>
        <p className="text-xl font-extrabold text-grey-1">{value}</p>
        {description && (
          <div className="text-xs text-grey-3 w-full">{description}</div>
        )}
      </div>
    </CustomCard>
  );
};

const CustomerAnalytics = ({
  CustomerAnalyticData,
}: {
  CustomerAnalyticData: any;
}) => {
  // Doughnut chart data
  const chartData = {
    labels: ["New Customers", "Returning Customers"],
    datasets: [
      {
        data: [
          CustomerAnalyticData?.data?.new_customers || 0,
          CustomerAnalyticData?.data?.returning_customers || 0,
        ],
        backgroundColor: ["#329661", "#3182ce"],
        borderColor: ["#329661", "#3182ce"],
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
        labels: {
          color: "#374151",
          font: { weight: "bold", size: 12 },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  const topCustomerName = CustomerAnalyticData?.data?.top_customer?.name;

  return (
    <div className="w-full pb-4 sm:pb-8">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomCustomerCard
          title="Total Customers"
          value={CustomerAnalyticData?.data?.total_customers}
        />
        <CustomCustomerCard
          title="New Customers"
          value={CustomerAnalyticData?.data?.new_customers || 0}
          description={`${CustomerAnalyticData?.data?.change_customers || 0}% change`}
        />
        <CustomCustomerCard
          title="Returning Customers"
          value={CustomerAnalyticData?.data?.returning_customers || 0}
          description="Repeat purchases"
        />
        <CustomCustomerCard
          title="Top Customer"
          value={""}
          description={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-6 overflow-hidden flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-green-300">
                  {topCustomerName ? topCustomerName.charAt(0) : "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-grey-1 truncate">
                  {topCustomerName || "No data"}
                </p>
                <p className="text-xs text-grey-4">
                  Last purchase{" "}
                  {formatToNaira(
                    CustomerAnalyticData?.data?.top_customer?.last_amount,
                  ) || "N/A"}
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Second Row - Single card */}
      <div className="grid grid-cols-1 gap-4">
        <CustomCard>
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-extrabold text-grey-1 mb-4">
              Customer Distribution
            </h3>
            <div className="flex-grow h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
