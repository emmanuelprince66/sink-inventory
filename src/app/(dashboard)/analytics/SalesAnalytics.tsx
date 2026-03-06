"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
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
import { endOfMonth, format, getDaysInMonth, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { DateRange } from "react-day-picker";
import PaymentDetails from "./PaymentDetails";

ChartJS.register(ArcElement, Tooltip, Legend);

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

const CURRENT_YEAR = new Date().getFullYear();
// 2016 → current year, displayed newest-first
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2016 + 1 },
  (_, i) => CURRENT_YEAR - i,
);

const fmt = (n: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(n)
    : "₦0";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert API monthly object {1..12} → 0-indexed array [0..11] */
const monthObjToArray = (monthObj: Record<string, number> = {}): number[] =>
  Array.from({ length: 12 }, (_, i) => monthObj[String(i + 1)] ?? 0);

/** Build rows for YearTable from API categories */
const buildYearRows = (
  categories: Record<
    string,
    { monthly: Record<string, number>; ytd: number }
  > = {},
) =>
  Object.entries(categories).map(([name, val], i) => ({
    number: String(i + 1),
    category: name,
    monthly: monthObjToArray(val.monthly),
    ytd: val.ytd,
  }));

/** Build rows for MonthTable from API categories, filtered to a given month with date range */
const buildMonthRows = (
  categories: Record<
    string,
    { monthly: Record<string, number>; ytd: number }
  > = {},
  monthIndex: number, // 0-based
  dateRange?: DateRange,
  selectedYear?: number,
) => {
  // Get the base monthly amount for this month
  const baseRows = Object.entries(categories).map(([name, val], i) => ({
    number: String(i + 1),
    category: name,
    actual: val.monthly[String(monthIndex + 1)] ?? 0, // API keys are 1-based
  }));

  // If we have a date range, calculate the prorated amount
  if (dateRange?.from && dateRange?.to && selectedYear) {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    // Only prorate if both dates are in the same month
    if (
      fromDate.getMonth() === toDate.getMonth() &&
      fromDate.getFullYear() === selectedYear &&
      toDate.getFullYear() === selectedYear
    ) {
      const daysInMonth = getDaysInMonth(new Date(selectedYear, monthIndex));
      const startDay = fromDate.getDate();
      const endDay = toDate.getDate();
      const daysInRange = endDay - startDay + 1;

      // Prorate the amounts based on days in range vs days in month
      const prorateRatio = daysInRange / daysInMonth;

      return baseRows.map((row) => ({
        ...row,
        actual: Math.round(row.actual * prorateRatio),
      }));
    }
  }

  return baseRows;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton = ({
  rows = 6,
  cols = 15,
}: {
  rows?: number;
  cols?: number;
}) => (
  <div className="p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm bg-white animate-pulse">
    <div className="h-6 w-56 bg-gray-200 rounded mx-auto mb-6" />
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: cols > 6 ? 900 : "auto" }}>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-2">
                <div className="h-4 bg-gray-200 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri} className="border-b border-gray-100">
              {Array.from({ length: cols }).map((_, ci) => (
                <td key={ci} className="py-3 px-2">
                  <div
                    className={`h-4 rounded ${ci === 1 ? "bg-gray-200 w-3/4" : "bg-gray-100"}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────

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

// ─── Year Table ───────────────────────────────────────────────────────────────

const YearTable = ({
  title,
  rows,
  totalsLabel,
  accentClass,
}: {
  title: string;
  rows: { number: string; category: string; monthly: number[]; ytd: number }[];
  totalsLabel: string;
  accentClass: string;
}) => {
  const colTotals = MONTHS.map((_, mi) =>
    rows.reduce((s, r) => s + (r.monthly[mi] ?? 0), 0),
  );
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);

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
                style={{ minWidth: 160 }}
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="text-center py-8 text-gray-400">
                  No data for this period
                </td>
              </tr>
            ) : (
              rows.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
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
                    {fmt(item.ytd)}
                  </td>
                </tr>
              ))
            )}
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

// ─── Month Table ──────────────────────────────────────────────────────────────

const MonthTable = ({
  title,
  rows,
  totalsLabel,
  actualAccent,
}: {
  title: string;
  rows: { number: string; category: string; actual: number }[];
  totalsLabel: string;
  actualAccent: string;
}) => {
  const totalActual = rows.reduce((s, r) => s + r.actual, 0);

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
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400">
                  No data for this month
                </td>
              </tr>
            ) : (
              rows.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
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
                </tr>
              ))
            )}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
              <td className="py-3 px-2 sm:px-4" colSpan={2}>
                {totalsLabel}
              </td>
              <td className={`py-3 px-2 sm:px-4 text-right ${actualAccent}`}>
                {fmt(totalActual)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CustomCard>
  );
};

// ─── Net Profit Summary ───────────────────────────────────────────────────────

const NetProfitTable = ({
  filterMode,
  selectedYear,
  selectedMonth,
  revenueByMonth,
  expensesByMonth,
  netProfitByMonth,
  dateRangeLabel,
  proratedRevenue,
  proratedExpenses,
  proratedNetProfit,
}: {
  filterMode: FilterMode;
  selectedYear: number;
  selectedMonth: number;
  revenueByMonth: number[];
  expensesByMonth: number[];
  netProfitByMonth: number[];
  dateRangeLabel?: string;
  proratedRevenue?: number;
  proratedExpenses?: number;
  proratedNetProfit?: number;
}) => {
  if (filterMode === "year") {
    const ytdRevenue = revenueByMonth.reduce((a, b) => a + b, 0);
    const ytdExpenses = expensesByMonth.reduce((a, b) => a + b, 0);
    const ytdNet = netProfitByMonth.reduce((a, b) => a + b, 0);

    const summaryRows = [
      {
        label: "Gross Profit",
        values: revenueByMonth,
        ytd: ytdRevenue,
        accent: "text-green-600",
        bold: false,
      },
      {
        label: "Direct Costs (Expenses)",
        values: expensesByMonth,
        ytd: ytdExpenses,
        accent: "text-red-500",
        bold: false,
      },
      {
        label: "Net Profit",
        values: netProfitByMonth,
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
                    className={`py-3 px-2 text-right bg-gray-50 ${row.bold ? "font-bold text-gray-900" : "font-semibold"} ${row.ytd < 0 ? "text-red-600" : row.accent}`}
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

  // ── Month view ──
  const revenueActual = proratedRevenue ?? revenueByMonth[selectedMonth] ?? 0;
  const expensesActual =
    proratedExpenses ?? expensesByMonth[selectedMonth] ?? 0;
  const netActual = proratedNetProfit ?? netProfitByMonth[selectedMonth] ?? 0;

  const rows = [
    {
      label: "Revenue",
      actual: revenueActual,
      accent: "text-green-600",
      bold: false,
    },
    {
      label: "Direct Costs (Expenses)",
      actual: expensesActual,
      accent: "text-red-500",
      bold: false,
    },
    {
      label: "Net Profit",
      actual: netActual,
      accent: "text-emerald-700",
      bold: true,
    },
  ];

  return (
    <CustomCard className="border-gray-200" shadow>
      <h3 className="font-[600] text-lg sm:text-xl mb-4 text-center">
        Net Profit Summary —{" "}
        {dateRangeLabel || `${FULL_MONTHS[selectedMonth]} ${selectedYear}`}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Category
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
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
              </tr>
            ))}
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
  monthDateRange,
  setMonthDateRange,
}: {
  filterMode: FilterMode;
  setFilterMode: (m: FilterMode) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  monthDateRange: DateRange | undefined;
  setMonthDateRange: (d: DateRange | undefined) => void;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-300">
        {(["year", "month"] as FilterMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filterMode === m
                ? "text-white"
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

      {/* Date Range selector — only in month mode */}
      {filterMode === "month" && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Date Range:
          </label>
          <DatePickerWithRange
            date={monthDateRange}
            onDateChange={setMonthDateRange}
          />
        </div>
      )}

      <span className="ml-auto text-xs text-gray-500 italic">
        {filterMode === "year"
          ? `Showing all months for ${selectedYear}`
          : monthDateRange?.from && monthDateRange?.to
            ? `Showing ${format(monthDateRange.from, "MMM dd")} - ${format(monthDateRange.to, "MMM dd, yyyy")}`
            : "Select a date range"}
      </span>
    </div>
  );
};

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

  const [filterMode, setFilterMode] = useState<FilterMode>("year");
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  ); // 0-based

  // New state for month date range filter
  const [monthDateRange, setMonthDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // Update month date range to current month bounds when year or filter mode changes
  useEffect(() => {
    if (filterMode === "month") {
      const now = new Date();
      const year = selectedYear;
      const month = now.getMonth(); // Use current month
      setMonthDateRange({
        from: startOfMonth(new Date(year, month)),
        to: endOfMonth(new Date(year, month)),
      });
      setSelectedMonth(month);
    }
  }, [filterMode, selectedYear]);

  // Extract month from date range when it changes
  useEffect(() => {
    if (monthDateRange?.from) {
      const newMonth = new Date(monthDateRange.from).getMonth();
      if (newMonth !== selectedMonth) {
        setSelectedMonth(newMonth);
      }
    }
  }, [monthDateRange]);

  const handleOpenPaymentDetailsModal = (name: string) => {
    setName(name);
    setOpenPaymentDetailsModal(true);
  };
  const handleClosePaymentDetailsModal = () =>
    setOpenPaymentDetailsModal(false);

  // ── Single hook call — only passes selectedYear (no monthDateRange) ──
  const {
    BankBreakDownAnalytics,
    BankBreakDownAnalyticsLoading,
    MaxSalesAnalyticData,
    MaxSalesAnalyticLoading,
  } = useAnalyticHook({
    openPaymentDetailsModal,
    name,
    dateRange,
    selectedYear, // ← Only year changes trigger new API fetch
  });

  // ── Derive arrays from real API data ─────────────────────────────────────
  const apiData = MaxSalesAnalyticData?.data;

  const revenueByMonth = monthObjToArray(apiData?.revenue?.total?.monthly);
  const expensesByMonth = monthObjToArray(apiData?.expenses?.total?.monthly);
  const netProfitByMonth = monthObjToArray(apiData?.net_profit?.total?.monthly);

  const revenueCategories = apiData?.revenue?.categories ?? {};
  const expensesCategories = apiData?.expenses?.categories ?? {};

  // Year view rows — all 12 months
  const incomeYearRows = buildYearRows(revenueCategories);
  const directCostYearRows = buildYearRows(expensesCategories);

  // Month view rows — filtered by date range on the frontend
  const incomeMonthRows = buildMonthRows(
    revenueCategories,
    selectedMonth,
    monthDateRange,
    selectedYear,
  );
  const directCostMonthRows = buildMonthRows(
    expensesCategories,
    selectedMonth,
    monthDateRange,
    selectedYear,
  );

  // Calculate prorated totals for Net Profit table
  let proratedRevenue: number | undefined;
  let proratedExpenses: number | undefined;
  let proratedNetProfit: number | undefined;

  if (filterMode === "month" && monthDateRange?.from && monthDateRange?.to) {
    const fromDate = new Date(monthDateRange.from);
    const toDate = new Date(monthDateRange.to);

    // Only prorate if both dates are in the same month
    if (
      fromDate.getMonth() === toDate.getMonth() &&
      fromDate.getFullYear() === selectedYear &&
      toDate.getFullYear() === selectedYear
    ) {
      const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
      const startDay = fromDate.getDate();
      const endDay = toDate.getDate();
      const daysInRange = endDay - startDay + 1;
      const prorateRatio = daysInRange / daysInMonth;

      const baseRevenue = revenueByMonth[selectedMonth] ?? 0;
      const baseExpenses = expensesByMonth[selectedMonth] ?? 0;
      const baseNetProfit = netProfitByMonth[selectedMonth] ?? 0;

      proratedRevenue = Math.round(baseRevenue * prorateRatio);
      proratedExpenses = Math.round(baseExpenses * prorateRatio);
      proratedNetProfit = Math.round(baseNetProfit * prorateRatio);
    }
  }

  const dateRangeLabel =
    monthDateRange?.from && monthDateRange?.to
      ? `${format(monthDateRange.from, "MMM dd")} - ${format(monthDateRange.to, "MMM dd, yyyy")}`
      : `${FULL_MONTHS[selectedMonth]} ${selectedYear}`;

  // ── Chart ─────────────────────────────────────────────────────────────────
  const chartData = {
    labels: [
      `Total Profit ${fmt(SalesAnalyticData?.data?.total_profit ?? 0)}`,
      `Expenses ${fmt(SalesAnalyticData?.data?.expenses ?? 0)}`,
    ],
    datasets: [
      {
        data: [
          SalesAnalyticData?.data?.total_profit ?? 0,
          SalesAnalyticData?.data?.expenses ?? 0,
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
          label: (ctx) => {
            let label = ctx.label || "";
            if (label) label += ": ";
            if (ctx.parsed !== null) label += fmt(ctx.parsed);
            return label;
          },
        },
      },
    },
  };

  const headingText =
    filterMode === "year" ? `${selectedYear} — Year to Date` : dateRangeLabel;

  const tableCols = filterMode === "year" ? 15 : 3;

  return (
    <div className="w-full py-4 sm:py-8">
      {/* Top controls */}
      <div className="w-full justify-end flex gap-3 mb-4">
        {user?.role === "OWNER" && (
          <Button
            className="border-primary-green-300 text-xs sm:text-sm"
            onClick={openAttendantsModal}
          >
            {attendantsName || "Select Attendant"}
          </Button>
        )}
        {attendantsName && (
          <Button
            variant="outline"
            className="border primary-red-100 text-primary-red-100 text-xs sm:text-sm"
            onClick={handleClearAttendant}
          >
            Clear
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CustomSalesCard
          title="Total Revenue"
          amount={SalesAnalyticData?.data?.total_Revenue}
          change={SalesAnalyticData?.data?.total_Revenue_change}
        />
        {user?.role === "OWNER" && (
          <CustomSalesCard
            title="Total Profit"
            amount={SalesAnalyticData?.data?.total_profit}
            change={SalesAnalyticData?.data?.total_profit_change}
          />
        )}
        <CustomSalesCard
          title="Avg. Transaction"
          amount={SalesAnalyticData?.data?.average_transaction_value}
          change={SalesAnalyticData?.data?.average_transaction_value_change}
        />
        <CustomSalesCard
          title="Transactions"
          amount={SalesAnalyticData?.data?.transaction_count}
          change={SalesAnalyticData?.data?.transaction_count_change}
          type="transaction"
        />
      </div>

      {/* Doughnut + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <CustomCard className="h-full border-gray-200" shadow>
          <div className="h-full flex flex-col">
            <h3 className="font-[600] text-base sm:text-lg mb-4">
              Net Profit : {fmt(SalesAnalyticData?.data?.net_profit ?? 0)}
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
              {SalesAnalyticData?.data?.transaction_breakdown?.map(
                (method: any, index: number) => (
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

      {/* Financial Tables */}
      <div className="space-y-6">
        <div>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{headingText}</h2>
          </div>
          <FilterBar
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            monthDateRange={monthDateRange}
            setMonthDateRange={setMonthDateRange}
          />
        </div>

        {/* Revenue table */}
        {MaxSalesAnalyticLoading ? (
          <TableSkeleton rows={6} cols={tableCols} />
        ) : filterMode === "year" ? (
          <YearTable
            title="Revenue"
            rows={incomeYearRows}
            totalsLabel="TOTAL REVENUE"
            accentClass="text-green-600"
          />
        ) : (
          <MonthTable
            title={`Revenue — ${dateRangeLabel}`}
            rows={incomeMonthRows}
            totalsLabel="TOTAL REVENUE"
            actualAccent="text-green-600"
          />
        )}

        {/* Expenses table */}
        {MaxSalesAnalyticLoading ? (
          <TableSkeleton rows={5} cols={tableCols} />
        ) : filterMode === "year" ? (
          <YearTable
            title="Direct Costs (Expenses)"
            rows={directCostYearRows}
            totalsLabel="TOTAL DIRECT COSTS"
            accentClass="text-red-600"
          />
        ) : (
          <MonthTable
            title={`Direct Costs — ${dateRangeLabel}`}
            rows={directCostMonthRows}
            totalsLabel="TOTAL DIRECT COSTS"
            actualAccent="text-red-600"
          />
        )}

        {/* Net Profit summary */}
        {MaxSalesAnalyticLoading ? (
          <TableSkeleton rows={3} cols={tableCols} />
        ) : (
          <NetProfitTable
            filterMode={filterMode}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            revenueByMonth={revenueByMonth}
            expensesByMonth={expensesByMonth}
            netProfitByMonth={netProfitByMonth}
            dateRangeLabel={filterMode === "month" ? dateRangeLabel : undefined}
            proratedRevenue={proratedRevenue}
            proratedExpenses={proratedExpenses}
            proratedNetProfit={proratedNetProfit}
          />
        )}
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
