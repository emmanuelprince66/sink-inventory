"use client";

import {
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { BarChart3, DollarSign, Repeat, Users } from "lucide-react";
import {
  ANALYTICS_KPIS,
  MONTH_LABELS,
  NEW_VS_RETURNING,
  RETENTION_TREND,
  TOP_SPENDERS,
} from "./dummyGrowthData";
import { GrowthStatCard } from "./GrowthStatCard";

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

const KPI_ICONS = [
  { icon: <Repeat className="w-4 h-4" />, tone: "bg-secondary-6 text-primary-green-300" },
  { icon: <BarChart3 className="w-4 h-4" />, tone: "bg-info-2 text-info-1" },
  { icon: <DollarSign className="w-4 h-4" />, tone: "bg-warning-2 text-warning-1" },
  { icon: <Users className="w-4 h-4" />, tone: "bg-violet-100 text-violet-600" },
];

const TIER_STYLES: Record<string, string> = {
  VIP: "bg-violet-100 text-violet-700",
  Gold: "bg-warning-2 text-warning-1",
  Silver: "bg-grey-6 text-grey-3",
  Bronze: "bg-orange-100 text-orange-700",
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#111827", padding: 8, cornerRadius: 6 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 10 } } },
    y: { grid: { color: "#f3f4f6" }, ticks: { color: "#9ca3af", font: { size: 10 } } },
  },
} as const;

const CustomerGrowthAnalytics = () => {
  const retentionData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: "Retention %",
        data: RETENTION_TREND,
        borderColor: "#329661",
        backgroundColor: "rgba(50, 150, 97, 0.12)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#329661",
      },
    ],
  };

  const newVsReturningData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: "New",
        data: NEW_VS_RETURNING.new,
        backgroundColor: "#111827",
        borderRadius: 4,
        barThickness: 14,
      },
      {
        label: "Returning",
        data: NEW_VS_RETURNING.returning,
        backgroundColor: "#329661",
        borderRadius: 4,
        barThickness: 14,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ANALYTICS_KPIS.map((kpi, idx) => (
          <GrowthStatCard
            key={kpi.label}
            icon={KPI_ICONS[idx].icon}
            iconTone={KPI_ICONS[idx].tone}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-grey-5 p-4">
          <h3 className="text-sm font-extrabold text-grey-1">Customer Retention Trend</h3>
          <p className="text-xs text-grey-4 mb-3">Monthly retention rate %</p>
          <div className="h-[200px]">
            <Line data={retentionData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-grey-5 p-4">
          <h3 className="text-sm font-extrabold text-grey-1">New vs Returning Customers</h3>
          <div className="h-[200px] mt-3">
            <Bar data={newVsReturningData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-grey-5">
          <h3 className="text-sm font-extrabold text-grey-1">Top Spending Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-grey-6 text-[11px] uppercase tracking-wide text-grey-3">
                <th className="text-left font-bold px-4 sm:px-5 py-3">#</th>
                <th className="text-left font-bold px-4 py-3">Customer</th>
                <th className="text-left font-bold px-4 py-3">Tier</th>
                <th className="text-left font-bold px-4 py-3">Visits</th>
                <th className="text-left font-bold px-4 py-3">Lifetime Value</th>
                <th className="text-left font-bold px-4 py-3">Avg Spend</th>
                <th className="text-left font-bold px-4 sm:px-5 py-3">Retention Score</th>
              </tr>
            </thead>
            <tbody>
              {TOP_SPENDERS.map((customer, idx) => (
                <tr
                  key={customer.name}
                  className="border-b border-grey-6 last:border-0"
                >
                  <td className="px-4 sm:px-5 py-3 text-grey-4 font-bold">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary-green-300 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {customer.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                      <span className="font-bold text-grey-1">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${TIER_STYLES[customer.tier]}`}
                    >
                      {customer.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey-2">{customer.visits}</td>
                  <td className="px-4 py-3 font-bold text-primary-green-300">
                    {customer.lifetimeValue}
                  </td>
                  <td className="px-4 py-3 text-grey-2">{customer.avgSpend}</td>
                  <td className="px-4 sm:px-5 py-3">
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 rounded-full bg-grey-6 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-green-300"
                          style={{ width: `${customer.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-grey-2">
                        {customer.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerGrowthAnalytics;
