"use client";

import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Activity,
  Award,
  Heart,
  HeartCrack,
  Repeat,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import {
  AI_INSIGHTS,
  MONTH_LABELS,
  NEW_VS_RETURNING,
  OVERVIEW_KPIS,
  RETENTION_TREND,
  TOTAL_GROWTH,
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

const KPI_ICONS: { icon: React.ReactNode; tone: string }[] = [
  { icon: <Users className="w-4 h-4" />, tone: "bg-secondary-6 text-primary-green-300" },
  { icon: <Activity className="w-4 h-4" />, tone: "bg-info-2 text-info-1" },
  { icon: <UserPlus className="w-4 h-4" />, tone: "bg-success-2 text-success-1" },
  { icon: <Repeat className="w-4 h-4" />, tone: "bg-violet-100 text-violet-600" },
  { icon: <Heart className="w-4 h-4" />, tone: "bg-success-2 text-success-1" },
  { icon: <HeartCrack className="w-4 h-4" />, tone: "bg-error-2 text-error-1" },
  { icon: <Award className="w-4 h-4" />, tone: "bg-warning-2 text-warning-1" },
  { icon: <Star className="w-4 h-4" />, tone: "bg-info-2 text-info-1" },
];

const lineChartOptions = {
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

const CustomerGrowthOverview = () => {
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
        barThickness: 10,
      },
      {
        label: "Returning",
        data: NEW_VS_RETURNING.returning,
        backgroundColor: "#329661",
        borderRadius: 4,
        barThickness: 10,
      },
    ],
  };

  const totalGrowthData = {
    labels: TOTAL_GROWTH.labels,
    datasets: [
      {
        label: "Total Customers",
        data: TOTAL_GROWTH.values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {OVERVIEW_KPIS.map((kpi, idx) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-grey-5 p-4">
          <h3 className="text-sm font-extrabold text-grey-1">Customer Retention</h3>
          <p className="text-xs text-grey-4 mb-3">Monthly retention rate %</p>
          <div className="h-[180px]">
            <Line data={retentionData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-grey-5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-extrabold text-grey-1">New vs Returning</h3>
            <div className="flex items-center gap-3 text-[10px] text-grey-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-grey-1" /> New
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-green-300" /> Returning
              </span>
            </div>
          </div>
          <div className="h-[180px]">
            <Bar data={newVsReturningData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-grey-5 p-4">
          <h3 className="text-sm font-extrabold text-grey-1">Total Customer Growth</h3>
          <p className="text-xl font-extrabold text-grey-1 mt-1">
            {TOTAL_GROWTH.total}{" "}
            <span className="text-xs font-bold text-primary-green-300">
              {TOTAL_GROWTH.ytdDelta}
            </span>
          </p>
          <div className="h-[150px] mt-2">
            <Line data={totalGrowthData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* AI Customer Insights */}
      <div className="bg-grey-1 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary-green-300" />
          <h3 className="text-sm font-extrabold text-white">AI Customer Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_INSIGHTS.map((insight) => (
            <div
              key={insight.text}
              className="bg-white/5 border border-white/10 rounded-xl p-3.5"
            >
              <p className="text-sm text-white/90 leading-relaxed">
                {insight.text}
              </p>
              <button className="text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 mt-2 cursor-pointer">
                {insight.actionLabel} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerGrowthOverview;
