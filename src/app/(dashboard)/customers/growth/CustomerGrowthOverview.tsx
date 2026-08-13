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
import { useFetchCustomerDashboardQuery } from "@/api/customer-analytics/fetch-customer-dashboard";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import type { MetricPercentage, MetricPoint } from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import ChartEmptyState from "./ChartEmptyState";
import { AI_INSIGHTS, OVERVIEW_KPIS } from "./dummyGrowthData";
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

// The two metric shapes the overview endpoint returns differ in how they
// express month-on-month movement: percentages vs. absolute points.
const pctDelta = (m?: MetricPercentage) =>
  m ? `${m.mom_percentage >= 0 ? "+" : ""}${m.mom_percentage}% vs last month` : "";
const pointDelta = (m?: MetricPoint) =>
  m
    ? `${m.mom_point_change >= 0 ? "+" : ""}${m.mom_point_change}pt vs last month`
    : "";

// Counts come back as decimal strings ("17.00") — render them as whole numbers.
const asCount = (value: string | number | undefined | null) => {
  const n = Number(value ?? 0);
  return Number.isNaN(n) ? String(value ?? "") : Math.round(n).toLocaleString();
};

// Rates arrive as 0, 100 or 33.33 — at most one decimal.
const asRate = (value: number | undefined | null) => {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

const CustomerGrowthOverview = ({ month }: { month?: string }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const { data: dashboardRes } = useFetchCustomerDashboardQuery({
    params: { id: business_id ?? "", month },
  });

  const overview = dashboardRes?.data?.overview;
  const charts = dashboardRes?.data?.charts;

  // KPI cards still fall back to the designed sample set before the first
  // payload lands, but the charts below do not — see ChartEmptyState.
  const kpis = overview
    ? [
        { label: "Total Customers", value: asCount(overview.total_customers.value), delta: pctDelta(overview.total_customers) },
        { label: "Active Customers", value: asCount(overview.active_customers.value), delta: pctDelta(overview.active_customers) },
        { label: "New This Month", value: asCount(overview.new_this_month.value), delta: pctDelta(overview.new_this_month) },
        { label: "Returning", value: asCount(overview.returning_customers.value), delta: pctDelta(overview.returning_customers) },
        { label: "Retention Rate", value: `${asRate(overview.retention_rate.value)}%`, delta: pointDelta(overview.retention_rate) },
        { label: "Churn Rate", value: `${asRate(overview.churn_rate.value)}%`, delta: pointDelta(overview.churn_rate) },
        { label: "Avg Lifetime Value", value: formatMoney(Number(overview.avg_lifetime_value.value ?? 0)), delta: pctDelta(overview.avg_lifetime_value) },
        { label: "Loyalty Members", value: asCount(overview.loyalty_members.value), delta: pctDelta(overview.loyalty_members) },
      ]
    : OVERVIEW_KPIS;

  // An empty series renders an empty state rather than a sample trend — a
  // fabricated line on an analytics chart reads as real data.
  const hasRetention = Boolean(charts?.customer_retention?.length);
  const hasNvr = Boolean(charts?.new_vs_returning?.length);

  const retentionLabels = charts?.customer_retention?.map((p) => p.month) ?? [];
  const retentionValues =
    charts?.customer_retention?.map((p) => p.retention_rate) ?? [];

  const nvrLabels = charts?.new_vs_returning?.map((p) => p.month) ?? [];
  const nvrNew = charts?.new_vs_returning?.map((p) => p.new_customers) ?? [];
  const nvrReturning =
    charts?.new_vs_returning?.map((p) => p.returning_customers) ?? [];

  const growth = charts?.total_customer_growth;
  const hasGrowth = Boolean(growth?.chart_data?.length);
  const growthLabels = growth?.chart_data?.map((p) => p.month) ?? [];
  const growthValues = growth?.chart_data?.map((p) => p.total_customers) ?? [];
  const growthTotal = growth ? String(growth.total_customers) : "—";
  const growthDelta = growth ? `${growth.ytd_growth_percentage} YTD` : "";

  const retentionData = {
    labels: retentionLabels,
    datasets: [
      {
        label: "Retention %",
        data: retentionValues,
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
    labels: nvrLabels,
    datasets: [
      {
        label: "New",
        data: nvrNew,
        backgroundColor: "#111827",
        borderRadius: 4,
        barThickness: 10,
      },
      {
        label: "Returning",
        data: nvrReturning,
        backgroundColor: "#329661",
        borderRadius: 4,
        barThickness: 10,
      },
    ],
  };

  const totalGrowthData = {
    labels: growthLabels,
    datasets: [
      {
        label: "Total Customers",
        data: growthValues,
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
        {kpis.map((kpi, idx) => (
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
            {hasRetention ? (
              <Line data={retentionData} options={lineChartOptions} />
            ) : (
              <ChartEmptyState />
            )}
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
            {hasNvr ? (
              <Bar data={newVsReturningData} options={lineChartOptions} />
            ) : (
              <ChartEmptyState />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-grey-5 p-4">
          <h3 className="text-sm font-extrabold text-grey-1">Total Customer Growth</h3>
          <p className="text-xl font-extrabold text-grey-1 mt-1">
            {growthTotal}{" "}
            <span className="text-xs font-bold text-primary-green-300">
              {growthDelta}
            </span>
          </p>
          <div className="h-[150px] mt-2">
            {hasGrowth ? (
              <Line data={totalGrowthData} options={lineChartOptions} />
            ) : (
              <ChartEmptyState height={150} />
            )}
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
