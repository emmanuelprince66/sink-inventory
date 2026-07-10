"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

// Custom product card component
const CustomProductCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: number | string;
  description?: any;
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

const ProductAnalytics = ({
  ProductAnalyticData,
}: {
  ProductAnalyticData: any;
}) => {
  const fastMoving = ProductAnalyticData?.data?.fast_moving_product;

  // Bar chart data
  const chartData = {
    labels: ["Stock Level vs Units Sold"],
    datasets: [
      {
        label: "Current Stock",
        data: [(fastMoving?.quantity_sold ?? 0) * 2], // Example calculation
        backgroundColor: "#329661",
        borderRadius: { topLeft: 8, topRight: 8 },
        barPercentage: 0.4,
      },
      {
        label: "Units Sold",
        data: [fastMoving?.quantity_sold ?? 0],
        backgroundColor: "#3182ce",
        borderRadius: { topLeft: 8, topRight: 8 },
        barPercentage: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
          font: { weight: "bold", size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full pb-4 sm:pb-8">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomProductCard
          title="Total Products"
          value={ProductAnalyticData?.data?.total_products}
        />
        <CustomProductCard
          title="Low Stock"
          value={ProductAnalyticData?.data?.low_stock}
          description="Products with limited stock"
        />
        <CustomProductCard
          title="Out of Stock"
          value={ProductAnalyticData?.data?.out_of_stock}
          description="Products needing restock"
        />
        <CustomProductCard
          title="Fast Moving"
          value={""}
          description={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-grey-6 overflow-hidden flex-shrink-0">
                {fastMoving?.product__image ? (
                  <img
                    src={fastMoving.product__image}
                    alt={fastMoving?.product__name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-grey-4">
                    No Image
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-sm text-grey-1 truncate">
                  {fastMoving?.product__name || "No data"}
                </p>
                <p className="text-xs text-grey-4">
                  <span className="font-bold text-grey-2">
                    {fastMoving?.quantity_sold ?? 0} units
                  </span>{" "}
                  sold • Top product
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
            <div className="flex-grow h-[300px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default ProductAnalytics;
