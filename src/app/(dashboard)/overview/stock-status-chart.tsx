"use client";

import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { useRef } from "react";
import { Pie } from "react-chartjs-2";

// Register the required Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

interface StockStatusChartProps {
  data: any;
}

export function StockStatusChart({ data }: StockStatusChartProps) {
  const chartRef = useRef<Chart<"pie"> | null>(null);

  // Calculate stock status counts from real data
  const getStockStatusData = () => {
    if (!data) return { inStock: 0, lowStock: 0, outOfStock: 0 };

    const inStock =
      data.top_selling_products?.filter(
        (item: any) => item.product__status === "IN-STOCK"
      ).length || 0;

    const lowStock = data.low_stock?.length || 0;
    const outOfStock = data.out_of_stock?.length || 0;

    return { inStock, lowStock, outOfStock };
  };

  const stockData = getStockStatusData();
  const total = stockData.inStock + stockData.lowStock + stockData.outOfStock;

  const chartData = {
    labels: ["In Stock", "Low Stock", "Out of Stock"],
    datasets: [
      {
        data: [stockData.inStock, stockData.lowStock, stockData.outOfStock],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (total === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-center mb-4">
          Inventory Stock Status
        </h3>
        <p className="text-muted-foreground text-center">
          No stock data available
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-sm font-medium text-center mb-2">
        Inventory Stock Status
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="h-[250px] w-full max-w-[400px]">
          <Pie data={chartData} options={options} ref={chartRef} />
        </div>
      </div>
    </div>
  );
}
