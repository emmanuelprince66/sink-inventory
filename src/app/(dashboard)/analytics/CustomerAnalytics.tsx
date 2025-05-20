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
    <CustomCard className="border-gray-200 w-full" shadow>
      <div className="flex flex-col gap-2 items-start">
        <p className="font-[500] text-sm text-primary-black-100">{title}</p>
        <p className="font-[600] text-xl text-primary-black-100">{value}</p>
        {description && <p className="text-xs text-gray-600">{description}</p>}
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
          CustomerAnalyticData.data.new_customers,
          CustomerAnalyticData.data.returning_customers,
        ],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#FF6384", "#36A2EB"],
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
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full px-4 py-8">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomCustomerCard
          title="Total Customers"
          value={CustomerAnalyticData.data.total_customers}
        />
        <CustomCustomerCard
          title="New Customers"
          value={CustomerAnalyticData.data.new_customers}
          description={`${CustomerAnalyticData.data.change_customers}% change`}
        />
        <CustomCustomerCard
          title="Returning Customers"
          value={CustomerAnalyticData.data.returning_customers}
          description="Repeat purchases"
        />
        <CustomCustomerCard
          title="Top Customer"
          value={""}
          description={
            <div className="flex items-center gap-3">
              {/* Placeholder for customer image - replace with actual image if available */}
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                <span className="text-xs text-gray-400">
                  {CustomerAnalyticData.data.top_customer.name
                    ? CustomerAnalyticData.data.top_customer.name.charAt(0)
                    : "?"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {CustomerAnalyticData.data.top_customer.name || "No data"}
                </p>
                <p className="text-xs text-gray-500">
                  Last purchase{" "}
                  {formatToNaira(
                    CustomerAnalyticData.data.top_customer.last_amount
                  ) || "N/A"}{" "}
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Second Row - Single card */}
      <div className="grid grid-cols-1 gap-4">
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-lg mb-4">Customer Distribution</h3>
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
