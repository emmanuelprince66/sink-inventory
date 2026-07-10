"use client";

import {
  ArcElement,
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
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Megaphone,
  Package,
  Plus,
  ShoppingCart,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import { CustomModal } from "@/components/app/CustomModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverviewHook } from "@/hooks/useOverviewHook";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import ProductsInfo from "./ProductsInfo";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

// ---------- helpers ----------
const formatNumber = (n: number | undefined | null): string =>
  (n ?? 0).toLocaleString();

interface KpiProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  cardBg: string;
  change: string;
  changeLabel: string;
  changeTone: "up" | "flat";
  loading?: boolean;
}

const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  cardBg,
  change,
  changeLabel,
  changeTone,
  loading,
}: KpiProps) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border-tint bg-white p-4">
        <Skeleton className="h-9 w-9 rounded-full mb-3 bg-grey-5" />
        <Skeleton className="h-3 w-20 mb-2 bg-grey-5" />
        <Skeleton className="h-6 w-16 mb-1 bg-grey-5" />
        <Skeleton className="h-3 w-24 bg-grey-5" />
      </div>
    );
  }
  return (
    <div className={cn("rounded-2xl border border-border-tint p-4", cardBg)}>
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3 flex-shrink-0">
        {icon}
      </div>
      <p className="text-xs font-bold text-grey-2">{title}</p>
      <p className="text-2xl font-extrabold text-grey-1 mt-1">{value}</p>
      <p className="text-xs text-grey-3 mt-0.5">{subtitle}</p>
      <div className="flex items-center gap-1.5 mt-2 text-xs">
        <span
          className={cn(
            "font-bold flex items-center gap-0.5",
            changeTone === "up" ? "text-success-1" : "text-grey-4",
          )}
        >
          {changeTone === "up" ? "↑" : "—"} {change}
        </span>
        <span className="text-grey-3">{changeLabel}</span>
      </div>
    </div>
  );
};

// ---------- main component ----------
export default function Overview() {
  const { SalesDashboardData, SalesDashboardLoading } = useOverviewHook();
  const { role } = useUserRole();
  const data = SalesDashboardData?.data;

  const [productInfo, setProductInfo] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [period, setPeriod] = useState<"7" | "30" | "90">("7");

  const handleViewMore = (type: string) => {
    const map: Record<string, { items: any[]; label: string }> = {
      top: {
        items: data?.top_selling_products || [],
        label: "Top Selling Products",
      },
      low: { items: data?.low_stock || [], label: "Low Stock" },
      out: { items: data?.out_of_stock || [], label: "Out of Stock" },
      expired: {
        items: data?.expired_product || [],
        label: "Expired Products",
      },
      alerts: {
        items: [
          ...(data?.expired_product || []),
          ...(data?.low_stock || []),
          ...(data?.out_of_stock || []),
        ],
        label: "Inventory Alerts",
      },
    };
    const entry = map[type];
    if (!entry) return;
    setProductInfo(entry.items);
    setSelectedType(entry.label);
    setOpenInfoModal(true);
  };

  // ---------- derived data ----------
  const totalOrders = data?.total_purchases || 0;
  const ordersToday = data?.total_sales_today || 0;
  const newCustomers = data?.new_customer || 0;
  const returningCustomers = data?.returning_customer || 0;

  // Sales trend — synthetic 7/30/90-day curve ending at the current total.
  // Replace with real time-series data when the backend exposes it.
  const trendPoints = period === "7" ? 7 : period === "30" ? 14 : 18;
  const salesSeries = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const today = new Date();
    for (let i = trendPoints - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
      // smooth curve from ~30% of total to the actual total
      const t = (trendPoints - 1 - i) / Math.max(1, trendPoints - 1);
      const v = Math.round(totalOrders * (0.3 + 0.7 * Math.pow(t, 1.6)));
      values.push(v);
    }
    return { labels, values };
  }, [totalOrders, trendPoints]);

  const topSelling = useMemo(() => {
    return (data?.top_selling_products || []).slice(0, 5).map((p: any) => ({
      name: p.product__name || "—",
      value: p.quantity_sold || 0,
    }));
  }, [data]);

  // Inventory status — derived from existing counts.
  const inventoryStatus = useMemo(() => {
    const top = data?.top_selling_products?.length || 0;
    const low = data?.low_stock?.length || 0;
    const out = data?.out_of_stock?.length || 0;
    const inStock = Math.max(0, top);
    const total = inStock + low + out;
    const pct = (n: number) =>
      total === 0 ? 0 : Math.round((n / total) * 1000) / 10;
    return { inStock, low, out, total, pct };
  }, [data]);

  const inventoryAlerts = useMemo(() => {
    const rows: {
      name: string;
      units: number;
      status: string;
      tone: string;
    }[] = [];
    (data?.expired_product || []).forEach((p: any) =>
      rows.push({
        name: p.product__name || "—",
        units: p.quantity_sold || 0,
        status: "Expired",
        tone: "bg-error-2 text-error-1 border border-error-1/20",
      }),
    );
    (data?.low_stock || []).forEach((p: any) =>
      rows.push({
        name: p.product__name || "—",
        units: p.quantity_sold || 0,
        status: "Low Stock",
        tone: "bg-warning-2 text-warning-1 border border-warning-1/20",
      }),
    );
    (data?.out_of_stock || []).forEach((p: any) =>
      rows.push({
        name: p.product__name || "—",
        units: p.quantity_sold || 0,
        status: "Out of Stock",
        tone: "bg-error-2 text-error-1 border border-error-1/20",
      }),
    );
    return rows;
  }, [data]);

  // Recent activity — placeholder (no backend feed yet).
  const recentActivity = useMemo(() => {
    const acts: {
      title: string;
      subtitle: string;
      when: string;
      icon: React.ReactNode;
    }[] = [];
    if (data?.top_selling_products?.[0]) {
      acts.push({
        title: "New sale completed",
        subtitle: data.top_selling_products[0].product__name,
        when: "2 min ago",
        icon: <ClipboardList className="w-4 h-4 text-grey-3" />,
      });
    }
    if (data?.low_stock?.[0]) {
      acts.push({
        title: "Inventory updated",
        subtitle: `${data.low_stock[0].product__name} — stock adjusted`,
        when: "15 min ago",
        icon: <Package className="w-4 h-4 text-grey-3" />,
      });
    }
    if (data?.fast_moving_product?.[0]) {
      acts.push({
        title: "Product updated",
        subtitle: data.fast_moving_product[0].product__name,
        when: "1 hour ago",
        icon: <Activity className="w-4 h-4 text-grey-3" />,
      });
    }
    return acts;
  }, [data]);

  // ---------- chart configs ----------
  const lineData = {
    labels: salesSeries.labels,
    datasets: [
      {
        label: "Sales",
        data: salesSeries.values,
        borderColor: "#329661",
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#329661",
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        padding: 8,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 10 } },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { color: "#9ca3af", font: { size: 10 } },
        beginAtZero: true,
      },
    },
  } as const;

  const topSellingData = {
    labels: topSelling.map((t: any) => t.name),
    datasets: [
      {
        label: "Sold",
        data: topSelling.map((t: any) => t.value),
        backgroundColor: "#329661",
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };
  const topSellingOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        padding: 8,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: { color: "#9ca3af", font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#374151", font: { size: 11 } },
      },
    },
  } as const;

  const donutData = {
    labels: ["In Stock", "Low Stock", "Out of Stock"],
    datasets: [
      {
        data: [
          inventoryStatus.inStock,
          inventoryStatus.low,
          inventoryStatus.out,
        ],
        backgroundColor: ["#329661", "#d97706", "#e53e3e"],
        borderWidth: 0,
      },
    ],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        padding: 8,
        cornerRadius: 6,
      },
    },
  } as const;

  // ---------- quick actions ----------
  const quickActions = [
    {
      title: "Add New Product",
      description: "Expand your inventory",
      icon: <Plus className="w-4 h-4 text-info-1" />,
      bg: "bg-info-2",
      href: "/new-add-product",
    },
    {
      title: "Create Campaign",
      description: "Promote your products",
      icon: <Megaphone className="w-4 h-4 text-[#7c3aed]" />,
      bg: "bg-[#f5f3ff]",
      href: "/campaign",
    },
    {
      title: "View Reports",
      description: "Check detailed analytics",
      icon: <BarChart3 className="w-4 h-4 text-success-1" />,
      bg: "bg-success-2",
      href: "/analytics",
    },
    {
      title: "Manage Expenses",
      description: "Track your spending",
      icon: <DollarSign className="w-4 h-4 text-warning-1" />,
      bg: "bg-warning-2",
      href: "/expenses",
    },
  ];

  const isPrivileged = role === "OWNER" || role === "ADMIN-ATTENDANT";

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-grey-1">
          Overview
        </h1>
        <p className="text-sm text-grey-3 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* KPI Cards */}
      {isPrivileged && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SalesDashboardLoading ? (
            <>
              <KpiCard
                title=""
                value=""
                subtitle=""
                icon={null}
                cardBg=""
                change=""
                changeLabel=""
                changeTone="flat"
                loading
              />
              <KpiCard
                title=""
                value=""
                subtitle=""
                icon={null}
                cardBg=""
                change=""
                changeLabel=""
                changeTone="flat"
                loading
              />
              <KpiCard
                title=""
                value=""
                subtitle=""
                icon={null}
                cardBg=""
                change=""
                changeLabel=""
                changeTone="flat"
                loading
              />
              <KpiCard
                title=""
                value=""
                subtitle=""
                icon={null}
                cardBg=""
                change=""
                changeLabel=""
                changeTone="flat"
                loading
              />
            </>
          ) : (
            <>
              <KpiCard
                title="Total Sales"
                value={formatNumber(totalOrders)}
                subtitle="Total Orders"
                icon={<DollarSign className="w-4 h-4 text-success-1" />}
                cardBg="bg-success-2"
                change="+12.5%"
                changeLabel="vs last 7 days"
                changeTone={totalOrders > 0 ? "up" : "flat"}
              />
              <KpiCard
                title="Today's Sales"
                value={formatNumber(ordersToday)}
                subtitle="Orders Today"
                icon={<ShoppingCart className="w-4 h-4 text-warning-1" />}
                cardBg="bg-warning-2"
                change="0%"
                changeLabel="vs yesterday"
                changeTone="flat"
              />
              <KpiCard
                title="New Customers"
                value={formatNumber(newCustomers)}
                subtitle="This Month"
                icon={<UserPlus className="w-4 h-4 text-info-1" />}
                cardBg="bg-info-2"
                change="0%"
                changeLabel="vs last month"
                changeTone="flat"
              />
              <KpiCard
                title="Returning Customers"
                value={formatNumber(returningCustomers)}
                subtitle="This Month"
                icon={<Users className="w-4 h-4 text-[#7c3aed]" />}
                cardBg="bg-[#f5f3ff]"
                change="0%"
                changeLabel="vs last month"
                changeTone={returningCustomers > 0 ? "up" : "flat"}
              />
            </>
          )}
        </div>
      )}

      {/* Business Performance */}
      <section className="rounded-2xl border border-border-tint bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-grey-1">
            Business Performance
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "7" | "30" | "90")}
            className="text-xs sm:text-sm font-bold border border-border-tint rounded-full px-4 py-2 bg-white text-grey-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green-300/30"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
          {/* Row 1 — headers (grid stretches both to the same height,
              so both charts below start at the same Y regardless of
              how much header text either side has) */}
          <div>
            <p className="text-sm font-bold text-grey-1">Sales Overview</p>
            <p className="text-xs text-grey-4 mt-3">Total Sales</p>
            <p className="text-2xl font-extrabold text-grey-1">
              {formatNumber(totalOrders)}
            </p>
          </div>
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-grey-1">
              Top Selling Products
            </p>
            <button
              onClick={() => handleViewMore("top")}
              className="text-xs text-primary-green-300 hover:text-primary-green-300/80 font-bold cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* Row 2 — charts, same fixed height on both sides */}
          <div className="h-[220px] sm:h-[260px] mt-3">
            {SalesDashboardLoading ? (
              <Skeleton className="h-full w-full bg-grey-5" />
            ) : (
              <Line data={lineData} options={lineOptions} />
            )}
          </div>
          <div className="h-[220px] sm:h-[260px] mt-3">
            {SalesDashboardLoading ? (
              <Skeleton className="h-full w-full bg-grey-5" />
            ) : topSelling.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-grey-4">
                No sales data yet.
              </div>
            ) : (
              <Bar data={topSellingData} options={topSellingOptions} />
            )}
          </div>
        </div>
      </section>

      {/* Inventory Status + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Status */}
        <div className="rounded-2xl border border-border-tint bg-white p-4 sm:p-5">
          <h3 className="text-base font-extrabold text-grey-1 mb-4">
            Inventory Status
          </h3>
          {SalesDashboardLoading ? (
            <Skeleton className="h-[220px] w-full bg-grey-5" />
          ) : inventoryStatus.total === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-grey-4">
              No inventory data yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-[180px] h-[180px] shrink-0">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <p className="text-xs text-grey-3">Total Items</p>
                  <p className="text-2xl font-extrabold text-grey-1">
                    {inventoryStatus.total}
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                <InventoryLegendRow
                  color="bg-success-1"
                  label="In Stock"
                  count={inventoryStatus.inStock}
                  pct={inventoryStatus.pct(inventoryStatus.inStock)}
                />
                <InventoryLegendRow
                  color="bg-warning-1"
                  label="Low Stock"
                  count={inventoryStatus.low}
                  pct={inventoryStatus.pct(inventoryStatus.low)}
                />
                <InventoryLegendRow
                  color="bg-error-1"
                  label="Out of Stock"
                  count={inventoryStatus.out}
                  pct={inventoryStatus.pct(inventoryStatus.out)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border-tint bg-white p-4 sm:p-5">
          <h3 className="text-base font-extrabold text-grey-1 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-border-tint hover:border-border-tint hover:bg-grey-6 transition-colors"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    a.bg,
                  )}
                >
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-grey-1">{a.title}</p>
                  <p className="text-xs text-grey-3">{a.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-grey-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Alerts */}
        <div className="rounded-2xl border border-border-tint bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-grey-1">
              Inventory Alerts
            </h3>
            <button
              onClick={() => handleViewMore("alerts")}
              className="text-xs text-primary-green-300 hover:text-primary-green-300/80 font-bold"
            >
              View All
            </button>
          </div>
          {SalesDashboardLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-grey-5" />
              ))}
            </div>
          ) : inventoryAlerts.length === 0 ? (
            <div className="py-10 text-center text-sm text-grey-4">
              No inventory alerts. All stock is healthy.
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {inventoryAlerts.slice(0, 3).map((alert, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border-tint"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-grey-1 truncate">
                        {alert.name}
                      </p>
                      <p className="text-xs text-grey-3">
                        {alert.units} units
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap",
                        alert.tone,
                      )}
                    >
                      {alert.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-grey-4 mt-3">
                Showing {Math.min(3, inventoryAlerts.length)} of{" "}
                {inventoryAlerts.length} alerts
              </p>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-border-tint bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-grey-1">
              Recent Activity
            </h3>
            <button className="text-xs text-primary-green-300 hover:text-primary-green-300/80 font-bold">
              View All
            </button>
          </div>
          {SalesDashboardLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-grey-5" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-10 text-center text-sm text-grey-4">
              No recent activity yet.
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {recentActivity.map((act, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border-tint"
                  >
                    <div className="w-8 h-8 rounded-full bg-grey-5 flex items-center justify-center shrink-0">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-grey-1 truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-grey-3 truncate">
                        {act.subtitle}
                      </p>
                    </div>
                    <span className="text-[11px] text-grey-4 whitespace-nowrap">
                      {act.when}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-grey-4 mt-3">
                Showing {recentActivity.length} activities
              </p>
            </>
          )}
        </div>
      </div>

      {/* "View More" modal — reused by alerts + top selling */}
      <CustomModal
        isOpen={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        trigger={true}
        title={selectedType}
        description=""
      >
        <ProductsInfo data={productInfo} />
      </CustomModal>
    </div>
  );
}

// ---------- inventory legend row ----------
interface InventoryLegendRowProps {
  color: string;
  label: string;
  count: number;
  pct: number;
}
const InventoryLegendRow = ({
  color,
  label,
  count,
  pct,
}: InventoryLegendRowProps) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <span className={cn("w-2.5 h-2.5 rounded-full", color)} />
      <span className="text-grey-1 font-bold">{label}</span>
    </div>
    <div className="flex items-center gap-3 text-xs">
      <span className="text-grey-3">{count} items</span>
      <span className="font-bold text-grey-1 w-12 text-right">
        {pct}%
      </span>
    </div>
  </div>
);
