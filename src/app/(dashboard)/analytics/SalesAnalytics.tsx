"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { useAnalyticHook } from "@/hooks/useAnalyticHook";
import { useUserRole } from "@/lib/store/user-store";
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import PaymentDetails from "./PaymentDetails";

ChartJS.register(ArcElement, Tooltip, Legend);

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterMode = "year" | "month";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = [2024, 2025, 2026];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(n)
    : "₦0";

// ─── Sub-components ──────────────────────────────────────────────────────────

const CustomCard = ({
  children,
  className = "",
  shadow = false,
}: {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
}) => (
  <div
    className={`p-4 sm:p-6 rounded-xl border ${className} ${shadow ? "shadow-sm" : ""}`}
    style={{ backgroundColor: "#FEFFFE" }}
  >
    {children}
  </div>
);

const CustomSalesCard = ({
  title,
  amount,
  type,
  change,
}: {
  title: string;
  amount: number | string;
  change?: number;
  type?: string;
}) => {
  const formattedAmount = typeof amount === "number" ? fmt(amount) : amount;
  return (
    <CustomCard
      className="bg-primary-green-200 border-primary-green-300 w-full shadow"
      shadow
    >
      <div className="flex flex-col gap-2 items-start">
        <p className="font-[500] text-xs sm:text-sm text-primary-black-100">
          {title}
        </p>
        <p className="font-[600] text-lg sm:text-xl text-primary-black-100">
          {type === "transaction" ? amount : formattedAmount}
        </p>
        {change !== undefined && (
          <p
            className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {change >= 0 ? "+" : ""}
            {change}% from last period
          </p>
        )}
      </div>
    </CustomCard>
  );
};

// ─── Year-view table (columns = months) ──────────────────────────────────────

const YearTable = ({
  title,
  rows,
  totalsLabel,
  accentClass,
}: {
  title: string;
  rows: { number: string; category: string; monthly: number[] }[];
  totalsLabel: string;
  accentClass: string;
}) => {
  const colTotals = MONTHS.map((_, mi) =>
    rows.reduce((s, r) => s + (r.monthly[mi] ?? 0), 0),
  );
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);
  const rowTotals = rows.map((r) => r.monthly.reduce((a, b) => a + b, 0));

  return (
    <CustomCard className="border-gray-200" shadow>
      <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm" style={{ minWidth: 900 }}>
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 font-semibold text-gray-700 sticky left-0 bg-white">
                #
              </th>
              <th
                className="text-left py-3 px-2 font-semibold text-gray-700 sticky left-6 bg-white"
                style={{ minWidth: 140 }}
              >
                Category
              </th>
              {MONTHS.map((m) => (
                <th
                  key={m}
                  className="text-right py-3 px-2 font-semibold text-gray-700"
                  style={{ minWidth: 90 }}
                >
                  {m}
                </th>
              ))}
              <th
                className="text-right py-3 px-2 font-semibold text-gray-900 bg-gray-50"
                style={{ minWidth: 110 }}
              >
                YTD Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 text-gray-500 sticky left-0 bg-inherit">
                  {item.number}
                </td>
                <td className="py-2 px-2 font-medium text-gray-900 sticky left-6 bg-inherit">
                  {item.category}
                </td>
                {item.monthly.map((v, mi) => (
                  <td
                    key={mi}
                    className={`py-2 px-2 text-right font-semibold ${accentClass}`}
                  >
                    {v !== 0 ? (
                      fmt(v)
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
                <td className="py-2 px-2 text-right font-bold text-gray-800 bg-gray-50">
                  {fmt(rowTotals[i])}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
              <td className="py-3 px-2" colSpan={2}>
                {totalsLabel}
              </td>
              {colTotals.map((t, i) => (
                <td key={i} className={`py-3 px-2 text-right ${accentClass}`}>
                  {fmt(t)}
                </td>
              ))}
              <td className="py-3 px-2 text-right text-gray-900">
                {fmt(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CustomCard>
  );
};

// ─── Month-view table (single-month, Actual vs Budget) ───────────────────────

const MonthTable = ({
  title,
  rows,
  totalsLabel,
  actualAccent,
  budgetAccent,
}: {
  title: string;
  rows: { number: string; category: string; actual: number; budget: number }[];
  totalsLabel: string;
  actualAccent: string;
  budgetAccent: string;
}) => {
  const total = {
    actual: rows.reduce((s, r) => s + r.actual, 0),
    budget: rows.reduce((s, r) => s + r.budget, 0),
  };
  return (
    <CustomCard className="border-gray-200" shadow>
      <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                #
              </th>
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700">
                Category
              </th>
              <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                Actual
              </th>
              <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700">
                Budget
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 sm:px-4 text-gray-600">
                  {item.number}
                </td>
                <td className="py-3 px-2 sm:px-4 font-medium text-gray-900">
                  {item.category}
                </td>
                <td
                  className={`py-3 px-2 sm:px-4 text-right font-semibold ${actualAccent}`}
                >
                  {item.actual !== 0 ? (
                    fmt(item.actual)
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td
                  className={`py-3 px-2 sm:px-4 text-right font-semibold ${budgetAccent}`}
                >
                  {item.budget !== 0 ? (
                    fmt(item.budget)
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
              <td className="py-3 px-2 sm:px-4" colSpan={2}>
                {totalsLabel}
              </td>
              <td
                className={`py-3 px-2 sm:px-4 text-right ${actualAccent.replace("600", "700")}`}
              >
                {fmt(total.actual)}
              </td>
              <td
                className={`py-3 px-2 sm:px-4 text-right ${budgetAccent.replace("600", "700")}`}
              >
                {fmt(total.budget)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CustomCard>
  );
};

// ─── Net Profit Summary Table ─────────────────────────────────────────────────

const NetProfitTable = ({
  filterMode,
  selectedYear,
  selectedMonth,
  incomeByMonth,
  directCostsByMonth,
  incomeMonthData,
  directCostsMonthData,
}: {
  filterMode: FilterMode;
  selectedYear: number;
  selectedMonth: number;
  incomeByMonth: number[];
  directCostsByMonth: number[];
  incomeMonthData: { actual: number; budget: number };
  directCostsMonthData: { actual: number; budget: number };
}) => {
  if (filterMode === "year") {
    const netProfits = MONTHS.map(
      (_, i) => incomeByMonth[i] - directCostsByMonth[i],
    );
    const ytdRevenue = incomeByMonth.reduce((a, b) => a + b, 0);
    const ytdDirectCosts = directCostsByMonth.reduce((a, b) => a + b, 0);
    const ytdNet = ytdRevenue - ytdDirectCosts;

    const summaryRows = [
      {
        label: "Revenue",
        values: incomeByMonth,
        ytd: ytdRevenue,
        accent: "text-green-600",
        bold: false,
      },
      {
        label: "Direct Costs (Expenses)",
        values: directCostsByMonth,
        ytd: ytdDirectCosts,
        accent: "text-red-500",
        bold: false,
      },
      {
        label: "Net Profit",
        values: netProfits,
        ytd: ytdNet,
        accent: "text-emerald-700",
        bold: true,
      },
    ];

    return (
      <CustomCard className="border-gray-200" shadow>
        <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
          Net Profit Summary — {selectedYear} YTD
        </h3>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs sm:text-sm"
            style={{ minWidth: 900 }}
          >
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th
                  className="text-left py-3 px-2 font-semibold text-gray-700 sticky left-0 bg-white"
                  style={{ minWidth: 200 }}
                >
                  Category
                </th>
                {MONTHS.map((m) => (
                  <th
                    key={m}
                    className="text-right py-3 px-2 font-semibold text-gray-700"
                    style={{ minWidth: 90 }}
                  >
                    {m}
                  </th>
                ))}
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-900 bg-gray-50"
                  style={{ minWidth: 110 }}
                >
                  YTD
                </th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b ${row.bold ? "border-t-2 border-gray-300 bg-gray-50" : "border-gray-100 hover:bg-gray-50"}`}
                >
                  <td
                    className={`py-3 px-2 sticky left-0 bg-inherit ${row.bold ? "font-bold" : "font-medium"} text-gray-900`}
                  >
                    {row.label}
                  </td>
                  {row.values.map((v, mi) => (
                    <td
                      key={mi}
                      className={`py-3 px-2 text-right ${row.bold ? "font-bold" : "font-semibold"} ${v < 0 ? "text-red-600" : row.accent}`}
                    >
                      {v !== 0 ? (
                        fmt(v)
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                  <td
                    className={`py-3 px-2 text-right ${row.bold ? "font-bold text-gray-900" : "font-semibold"} ${row.ytd < 0 ? "text-red-600" : row.accent} bg-gray-50`}
                  >
                    {fmt(row.ytd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CustomCard>
    );
  }

  // Month view
  const netActual = incomeMonthData.actual - directCostsMonthData.actual;
  const netBudget = incomeMonthData.budget - directCostsMonthData.budget;

  const rows = [
    {
      label: "Revenue",
      actual: incomeMonthData.actual,
      budget: incomeMonthData.budget,
      accent: "text-green-600",
      bold: false,
    },
    {
      label: "Direct Costs (Expenses)",
      actual: directCostsMonthData.actual,
      budget: directCostsMonthData.budget,
      accent: "text-red-500",
      bold: false,
    },
    {
      label: "Net Profit",
      actual: netActual,
      budget: netBudget,
      accent: "text-emerald-700",
      bold: true,
    },
  ];

  return (
    <CustomCard className="border-gray-200" shadow>
      <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
        Net Profit Summary — {FULL_MONTHS[selectedMonth]} {selectedYear}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Category
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">
                Actual
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">
                Budget
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">
                Variance
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const variance = row.actual - row.budget;
              return (
                <tr
                  key={i}
                  className={`border-b ${row.bold ? "border-t-2 border-gray-300 bg-gray-50" : "border-gray-100 hover:bg-gray-50"}`}
                >
                  <td
                    className={`py-3 px-4 ${row.bold ? "font-bold" : "font-medium"} text-gray-900`}
                  >
                    {row.label}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${row.bold ? "font-bold" : "font-semibold"} ${row.actual < 0 ? "text-red-600" : row.accent}`}
                  >
                    {fmt(row.actual)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${row.bold ? "font-bold" : "font-semibold"} ${row.budget < 0 ? "text-red-500" : "text-gray-600"}`}
                  >
                    {fmt(row.budget)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${row.bold ? "font-bold" : "font-semibold"} ${variance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {variance >= 0 ? "+" : ""}
                    {fmt(variance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CustomCard>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FilterBar = ({
  filterMode,
  setFilterMode,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}: {
  filterMode: FilterMode;
  setFilterMode: (m: FilterMode) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
}) => (
  <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
    {/* Mode toggle */}
    <div className="flex rounded-lg overflow-hidden border border-gray-300">
      {(["year", "month"] as FilterMode[]).map((m) => (
        <button
          key={m}
          onClick={() => setFilterMode(m)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
            filterMode === m
              ? "bg-primary-green-300 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
          style={filterMode === m ? { backgroundColor: "#16a34a" } : {}}
        >
          {m === "year" ? "Year (YTD)" : "Month"}
        </button>
      ))}
    </div>

    {/* Year selector */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Year:</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>

    {/* Month selector — only shown in month mode */}
    {filterMode === "month" && (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {FULL_MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
      </div>
    )}

    <span className="ml-auto text-xs text-gray-500">
      {filterMode === "year"
        ? `Showing all months for ${selectedYear}`
        : `Showing ${FULL_MONTHS[selectedMonth]} ${selectedYear}`}
    </span>
  </div>
);

// ─── Static sample data (replace with API data in production) ────────────────

// Income statement monthly actuals [Jan..Dec] for 2025
const INCOME_MONTHLY_2025 = [
  1389600, 1489200, 1661492, 1407630, 1961112, 2087052, 2480180, 1946324,
  4090375, 3386313, 3309770, 2680625,
];
const INCOME_MONTHLY_2026 = [1172380, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const DIRECT_COSTS_MONTHLY_2025 = [
  405252, 513030, 576325, 570375, 489700, 522750, 750225, 670530, 742125,
  615575, 772800, 744000,
];
const DIRECT_COSTS_MONTHLY_2026 = [572375, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// ─── Main Component ───────────────────────────────────────────────────────────

const SalesAnalytics = ({
  SalesAnalyticData,
  openAttendantsModal,
  handleClearAttendant,
  attendantsName,
  dateRange,
}: {
  SalesAnalyticData: any;
  openAttendantsModal: any;
  handleClearAttendant: any;
  attendantsName: any;
  dateRange: any;
}) => {
  const { user } = useUserRole();
  const [openPaymentDetailsModal, setOpenPaymentDetailsModal] = useState(false);
  const [name, setName] = useState("");

  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>("year");
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Jan

  const handleOpenPaymentDetailsModal = (name: string) => {
    setName(name);
    setOpenPaymentDetailsModal(true);
  };
  const handleClosePaymentDetailsModal = () =>
    setOpenPaymentDetailsModal(false);

  const { BankBreakDownAnalytics, BankBreakDownAnalyticsLoading } =
    useAnalyticHook({ openPaymentDetailsModal, name, dateRange });

  // ── Pick monthly data based on year ──────────────────────────────────────
  const incomeMonthlyTotals =
    selectedYear === 2025 ? INCOME_MONTHLY_2025 : INCOME_MONTHLY_2026;
  const directCostsMonthlyTotals =
    selectedYear === 2025
      ? DIRECT_COSTS_MONTHLY_2025
      : DIRECT_COSTS_MONTHLY_2026;

  // ── Income Statement rows ─────────────────────────────────────────────────
  const incomeCategories = [
    { number: "1", category: "Revenue", budget: 1146700 },
    { number: "2", category: "Bed", budget: 47850 },
    { number: "3", category: "Nasal Mask & Prongs", budget: 62325 },
    { number: "4", category: "CPAP/BIPAP", budget: 103000 },
    { number: "5", category: "Oral/Nasal", budget: 50250 },
    { number: "6", category: "Humidifier", budget: 167500 },
    { number: "7", category: "Cable", budget: 145000 },
    { number: "8", category: "Home Care", budget: 83600 },
    { number: "9", category: "Others", budget: 0 },
    { number: "10", category: "Staging", budget: 0 },
  ];

  const incomeRowsMonthly = incomeCategories.map((c, i) => ({
    ...c,
    monthly: incomeMonthlyTotals.map((total) =>
      i === 0
        ? Math.round(total * 0.55)
        : Math.round(total * 0.04 * (i % 3 === 0 ? 1.5 : 1)),
    ),
  }));

  // ── Direct Costs rows ─────────────────────────────────────────────────────
  const directCostCategories = [
    { number: "7", category: "Consumables", budget: 163000 },
    { number: "8", category: "Commission Paid", budget: 0 },
    { number: "9", category: "Sleep Studies", budget: 0 },
    { number: "10", category: "Referral Party Waiver", budget: 60751 },
    { number: "11", category: "Bank Charges (POS)", budget: 0 },
    { number: "12", category: "Trade Fairs", budget: 0 },
    { number: "13", category: "Re-Inspection Fees", budget: 0 },
    { number: "14", category: "Transportation", budget: 0 },
  ];

  const directCostRowsMonthly = directCostCategories.map((c, i) => ({
    ...c,
    monthly: directCostsMonthlyTotals.map((total) =>
      i === 0
        ? Math.round(total * 0.8)
        : i === 3
          ? Math.round(total * 0.18)
          : 0,
    ),
  }));

  // ── Month-view single-month data ──────────────────────────────────────────
  const incomeMonthActual = incomeMonthlyTotals[selectedMonth] ?? 0;
  const directCostsMonthActual = directCostsMonthlyTotals[selectedMonth] ?? 0;

  const incomeMonthRows = incomeCategories.map((c, i) => ({
    ...c,
    actual:
      i === 0
        ? Math.round(incomeMonthActual * 0.55)
        : Math.round(incomeMonthActual * 0.04 * (i % 3 === 0 ? 1.5 : 1)),
  }));

  const directCostMonthRows = directCostCategories.map((c, i) => ({
    ...c,
    actual:
      i === 0
        ? Math.round(directCostsMonthActual * 0.8)
        : i === 3
          ? Math.round(directCostsMonthActual * 0.18)
          : 0,
  }));

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = {
    labels: [
      `Total Profit ${fmt(SalesAnalyticData?.data.total_profit ?? 0)}`,
      `Expenses ${fmt(SalesAnalyticData?.data.expenses ?? 0)}`,
    ],
    datasets: [
      {
        data: [
          SalesAnalyticData?.data.total_profit ?? 0,
          SalesAnalyticData?.data.expenses ?? 0,
        ],
        backgroundColor: ["#4CAF50", "#DC2626"],
        borderColor: ["#388E3C", "red"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.label || "";
            if (label) label += ": ";
            if (context.parsed !== null) label += fmt(context.parsed);
            return label;
          },
        },
      },
    },
  };

  // ── Heading text ──────────────────────────────────────────────────────────
  const headingText =
    filterMode === "year"
      ? `${selectedYear} — Year to Date`
      : `${FULL_MONTHS[selectedMonth]} ${selectedYear}`;

  return (
    <div className="w-full py-4 sm:py-8">
      {/* Top row controls */}
      <div className="w-full justify-end flex gap-3 mb-4">
        {user && user?.role === "OWNER" && (
          <Button
            className="border-primary-green-300 text-xs sm:text-sm"
            onClick={openAttendantsModal}
          >
            {attendantsName ? `${attendantsName}` : "Select Attendant"}
          </Button>
        )}
        {attendantsName && (
          <Button
            variant={"outline"}
            className="border primary-red-100 text-primary-red-100 text-xs sm:text-sm"
            onClick={handleClearAttendant}
          >
            clear
          </Button>
        )}
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomSalesCard
          title="Total Revenue"
          amount={SalesAnalyticData?.data.total_Revenue}
          change={SalesAnalyticData?.data.total_Revenue_change}
        />
        {user && user?.role === "OWNER" && (
          <CustomSalesCard
            title="Total Profit"
            amount={SalesAnalyticData?.data.total_profit}
            change={SalesAnalyticData?.data.total_profit_change}
          />
        )}
        <CustomSalesCard
          title="Avg. Transaction"
          amount={SalesAnalyticData?.data.average_transaction_value}
          change={SalesAnalyticData?.data.average_transaction_value_change}
        />
        <CustomSalesCard
          title="Transactions"
          amount={SalesAnalyticData?.data.transaction_count}
          change={SalesAnalyticData?.data.transaction_count_change}
          type="transaction"
        />
      </div>

      {/* Doughnut + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <CustomCard className="h-full border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Net Profit : {fmt(SalesAnalyticData?.data.net_profit ?? 0)}
            </h3>
            <div className="flex-grow h-[250px] sm:h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </CustomCard>

        <CustomCard className="border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Payment Methods
            </h3>
            <div className="space-y-4 flex-grow">
              {SalesAnalyticData?.data?.transaction_breakdown.map(
                (method: any, index: any) => (
                  <div
                    key={index}
                    onClick={() =>
                      handleOpenPaymentDetailsModal(method?.payment_method)
                    }
                    className="flex cursor-pointer p-2 hover:bg-primary-green-500 justify-between items-center w-full text-sm sm:text-base"
                  >
                    <span className="font-medium">
                      {method?.payment_method}
                    </span>
                    <span className="font-semibold">
                      {fmt(method?.total_amount)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </CustomCard>
      </div>

      {/* ── Financial Tables Section ── */}
      <div className="space-y-6">
        {/* Section heading + filter bar */}
        <div>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{headingText}</h2>
          </div>
          <FilterBar
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        </div>

        {/* Income Statement */}
        {filterMode === "year" ? (
          <YearTable
            title="Income Statement"
            rows={incomeRowsMonthly}
            totalsLabel="TOTAL"
            accentClass="text-green-600"
          />
        ) : (
          <MonthTable
            title="Income Statement"
            rows={incomeMonthRows}
            totalsLabel="TOTAL"
            actualAccent="text-green-600"
            budgetAccent="text-blue-600"
          />
        )}

        {/* Direct Costs */}
        {filterMode === "year" ? (
          <YearTable
            title="Direct Costs (Out of Sales)"
            rows={directCostRowsMonthly}
            totalsLabel="TOTAL DIRECT COSTS"
            accentClass="text-red-600"
          />
        ) : (
          <MonthTable
            title="Direct Costs (Out of Sales)"
            rows={directCostMonthRows}
            totalsLabel="TOTAL DIRECT COSTS"
            actualAccent="text-red-600"
            budgetAccent="text-orange-600"
          />
        )}

        {/* Net Profit Summary */}
        <NetProfitTable
          filterMode={filterMode}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          incomeByMonth={incomeMonthlyTotals}
          directCostsByMonth={directCostsMonthlyTotals}
          incomeMonthData={{
            actual: incomeMonthActual,
            budget: incomeCategories.reduce((s, c) => s + c.budget, 0),
          }}
          directCostsMonthData={{
            actual: directCostsMonthActual,
            budget: directCostCategories.reduce((s, c) => s + c.budget, 0),
          }}
        />
      </div>

      {/* Payment Details Modal */}
      <CustomModal
        isOpen={openPaymentDetailsModal}
        onClose={handleClosePaymentDetailsModal}
        trigger={true}
        title="Payment Details"
        description=""
      >
        <PaymentDetails
          BankBreakDownAnalyticsLoading={BankBreakDownAnalyticsLoading}
          BankBreakDownAnalytics={BankBreakDownAnalytics}
        />
      </CustomModal>
    </div>
  );
};

export default SalesAnalytics;
