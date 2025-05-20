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
    <CustomCard className="border-gray-200 w-full" shadow>
      <div className="flex flex-col gap-2 items-start">
        <p className="font-[500] text-sm text-primary-black-100">{title}</p>
        <p className="font-[600] text-xl text-primary-black-100">{value}</p>
        {description && <p className="text-xs text-gray-600">{description}</p>}
      </div>
    </CustomCard>
  );
};

const ProductAnalytics = ({
  ProductAnalyticData,
}: {
  ProductAnalyticData: any;
}) => {
  // Bar chart data
  const chartData = {
    labels: ["Stock Level vs Units Sold"],
    datasets: [
      {
        label: "Current Stock",
        data: [ProductAnalyticData.data.fast_moving_product.quantity_sold * 2], // Example calculation
        backgroundColor: "#4CAF50",
        borderRadius: { topLeft: 8, topRight: 8 },
        barPercentage: 0.4,
      },
      {
        label: "Units Sold",
        data: [ProductAnalyticData.data.fast_moving_product.quantity_sold],
        backgroundColor: "#2196F3",
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
    <div className="w-full px-4 py-8">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomProductCard
          title="Total Products"
          value={ProductAnalyticData.data.total_products}
        />
        <CustomProductCard
          title="Low Stock"
          value={ProductAnalyticData.data.low_stock}
          description="Products with limited stock"
        />
        <CustomProductCard
          title="Out of Stock"
          value={ProductAnalyticData.data.out_of_stock}
          description="Products needing restock"
        />
        <CustomProductCard
          title="Fast Moving"
          value={""}
          description={
            <div className="flex items-center gap-3">
              {/* Product Image - add a default if image doesn't exist */}
              <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden">
                {ProductAnalyticData.data.fast_moving_product.product__image ? (
                  <img
                    src={
                      ProductAnalyticData.data.fast_moving_product
                        .product__image
                    }
                    alt={
                      ProductAnalyticData.data.fast_moving_product.product__name
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold text-sm">
                  {ProductAnalyticData.data.fast_moving_product.product__name}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-primary-black-100">
                    {ProductAnalyticData.data.fast_moving_product.quantity_sold}{" "}
                    units
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
        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            {/* <h3 className="font-[600] text-lg mb-4">
              Stock vs Sales Performance
            </h3> */}
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
