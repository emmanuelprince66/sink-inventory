"use client";

import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useRef } from "react";
import { Bar } from "react-chartjs-2";

// Register the required Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Item {
  name: string;
  value: number;
}

interface StockPerformanceChartProps {
  title: string;
  items: Item[];
  color: string;
}

export function StockPerformanceChart({
  title,
  items,
  color,
}: StockPerformanceChartProps) {
  const chartRef = useRef<Chart<"bar"> | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-center mb-4">{title}</h3>
        <p className="text-muted-foreground text-center">No data available</p>
      </div>
    );
  }

  const labels = items.map((item) => {
    // Truncate long product names for better display
    return item.name.length > 15
      ? item.name.substring(0, 15) + "..."
      : item.name;
  });
  const values = items.map((item) => item.value);

  // Find max value to set appropriate scale
  const maxValue = Math.max(...values);
  const scaleMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;

  const data = {
    labels,
    datasets: [
      {
        label: "Quantity Sold",
        data: values,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Quantity Sold: ${context.raw}`,
          title: (context: any) => {
            // Show full product name in tooltip
            const index = context[0].dataIndex;
            return items[index]?.name || "";
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: scaleMax,
        grid: {
          display: true,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          stepSize: Math.ceil(scaleMax / 5),
        },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
          drawOnChartArea: false,
          drawTicks: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-sm font-medium text-center mb-2">{title}</h3>
      <div className="flex-1">
        <Bar data={data} options={options} ref={chartRef} />
      </div>
    </div>
  );
}
