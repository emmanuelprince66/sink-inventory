"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalyticHook } from "@/hooks/useAnalyticHook";
import { formatToNaira } from "@/utils/formatMoney";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { DateRange } from "react-day-picker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─── constants ────────────────────────────────────────────────────────────────

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
const SHORT_MONTHS = [
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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2016 + 1 },
  (_, i) => CURRENT_YEAR - i, // newest first
);

// ─── skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="p-4 border border-border-tint bg-white rounded-xl animate-pulse">
    <div className="h-4 w-24 bg-grey-5 rounded mb-3" />
    <div className="h-8 w-32 bg-grey-5 rounded mb-2" />
    <div className="h-3 w-20 bg-grey-6 rounded" />
  </div>
);

const ChartSkeleton = () => (
  <div className="h-[250px] sm:h-[300px] bg-grey-6 animate-pulse rounded-lg" />
);

// ─── component ────────────────────────────────────────────────────────────────

interface TaxAnalyticsProps {
  dateRange?: DateRange;
}

const TaxAnalytics = ({ dateRange }: TaxAnalyticsProps) => {
  const [taxYear, setTaxYear] = useState<number>(CURRENT_YEAR);

  const { TaxAnalyticData, TaxAnalyticLoading } = useAnalyticHook({
    taxYear,
    dateRange,
  });

  // ── Real data from API ─────────────────────────────────────────────────────
  const apiData = TaxAnalyticData?.data;

  // All directly from API
  const totalSales = apiData?.total_sales ?? 0;
  const totalTax = apiData?.total_tax ?? 0;
  const taxRate = apiData?.tax_rate ?? 0;
  const apiYear = apiData?.year ?? taxYear;

  // monthly_tax: API gives {1..12} → convert to 0-indexed array
  const monthlyTaxArray: number[] = Array.from(
    { length: 12 },
    (_, i) => apiData?.monthly_tax?.[String(i + 1)] ?? 0,
  );

  // VAT-style breakdown — derived from real data
  const vatCollected = totalTax; // total_tax IS the tax collected
  const vatPaidInput = 0; // not in API
  const netVatPosition = vatCollected - vatPaidInput;
  const developmentLevy = 0; // not in API

  // Current display labels
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = FULL_MONTHS[currentMonthIndex];
  const currentYear = String(taxYear);

  // Filing due: 21st of next month
  const nextMonth = new Date(taxYear, currentMonthIndex + 1, 21);
  const filingDueDate = nextMonth.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const today = new Date();
  const daysUntilDue = Math.max(
    0,
    Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // Export package — mark complete when we have real data
  const exportPackages = [
    { name: "Monthly Sales Summary", completed: !!apiData },
    { name: "VAT Breakdown Report", completed: !!apiData },
    { name: "Payment Instructions", completed: true },
    { name: "Development Levy Calculation", completed: false },
  ];

  // ── Chart — use real monthly_tax array ────────────────────────────────────
  const chartData = {
    labels: SHORT_MONTHS,
    datasets: [
      {
        label: "Tax Amount",
        data: monthlyTaxArray,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 12,
        callbacks: {
          label: (ctx: any) => `₦${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) => {
            if (v === 0) return "₦0";
            if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
            if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
            return `₦${v}`;
          },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-3 sm:pb-6">
      {/* ── Year filter header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-grey-3">Year:</label>
          <Select
            value={String(taxYear)}
            onValueChange={(v) => setTaxYear(Number(v))}
          >
            <SelectTrigger className="h-10 min-h-0 font-bold text-grey-2 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-grey-4">
          Showing tax data for {currentMonth} {currentYear}
        </div>
      </div>

      {/* ── 4 KPI cards — plain colored label, big value, grey subtitle ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {TaxAnalyticLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <CustomCard className="p-4 border border-border-tint bg-white hover:shadow-md transition-shadow">
              <span className="text-xs sm:text-sm font-bold text-grey-3">
                Total Sales
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-grey-1 mt-2">
                {formatToNaira(totalSales)}
              </p>
              <p className="text-xs text-grey-4 mt-1">For {apiYear}</p>
            </CustomCard>

            <CustomCard className="p-4 border border-border-tint bg-white hover:shadow-md transition-shadow">
              <span className="text-xs sm:text-sm font-bold text-warning-1">
                Total Tax
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-grey-1 mt-2">
                {formatToNaira(totalTax)}
              </p>
              <p className="text-xs text-grey-4 mt-1">
                {taxRate}% tax rate applied
              </p>
            </CustomCard>

            <CustomCard className="p-4 border border-border-tint bg-white hover:shadow-md transition-shadow">
              <span className="text-xs sm:text-sm font-bold text-info-1">
                Net VAT Position
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-grey-1 mt-2">
                {formatToNaira(netVatPosition)}
              </p>
              <p
                className={`text-xs mt-1 ${netVatPosition > 0 ? "text-error-1 font-bold" : "text-grey-4"}`}
              >
                {netVatPosition > 0 ? "Payable" : "Nil"}
              </p>
            </CustomCard>

            <CustomCard className="p-4 border border-border-tint bg-white hover:shadow-md transition-shadow">
              <span className="text-xs sm:text-sm font-bold text-violet-600">
                Development Levy
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-grey-1 mt-2">
                {formatToNaira(developmentLevy)}
              </p>
              <p className="text-xs text-grey-4 mt-1">
                Exempt (Small Company)
              </p>
            </CustomCard>
          </>
        )}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Monthly Tax Trend — real monthly_tax data */}
        <CustomCard className="p-4 sm:p-6 border border-border-tint">
          <h3 className="font-bold text-sm sm:text-base text-grey-1 mb-4">
            Monthly Tax Trend — {currentYear}
          </h3>
          {TaxAnalyticLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[250px] sm:h-[300px]">
              <Line data={chartData} options={chartOptions as any} />
            </div>
          )}
        </CustomCard>

        {/* VAT Breakdown — derived from real data */}
        <CustomCard className="p-4 sm:p-6 border border-border-tint">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm sm:text-base text-grey-1">
              VAT Breakdown
            </h3>
            <span className="text-xs text-grey-3">Rate: {taxRate}%</span>
          </div>

          <div className="divide-y divide-border-tint">
            <div className="pb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-success-1">
                  Tax Collected
                </span>
                <span className="font-bold text-grey-1">
                  {formatToNaira(vatCollected)}
                </span>
              </div>
              <p className="text-xs text-grey-3 mt-1">
                From sales to customers
              </p>
            </div>

            <div className="py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-info-1">
                  Tax Paid (Input)
                </span>
                <span className="font-bold text-grey-1">
                  {formatToNaira(vatPaidInput)}
                </span>
              </div>
              <p className="text-xs text-grey-3 mt-1">
                On business purchases &amp; expenses
              </p>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-grey-1">
                  Net VAT Position
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-grey-1">
                    {formatToNaira(netVatPosition)}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      netVatPosition > 0
                        ? "bg-error-2 text-error-1"
                        : "bg-grey-6 text-grey-3"
                    }`}
                  >
                    {netVatPosition > 0 ? "Payable" : "Nil"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action required — only show when there's a real payable */}
            {netVatPosition > 0 && (
              <div className="pt-4">
                <div className="bg-error-2 p-3 rounded-lg border border-error-1/20">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-error-1 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-error-1 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-error-1">
                        Action Required
                      </p>
                      <p className="text-xs text-error-1 mt-1">
                        Tax payment of {formatToNaira(netVatPosition)} is due
                        by {filingDueDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CustomCard>
      </div>

      {/* ── Bottom 3 cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Tax Calendar */}
        <CustomCard className="p-4 sm:p-6 border border-border-tint hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-grey-3" />
            <h3 className="font-bold text-sm sm:text-base text-grey-1">
              Tax Calendar
            </h3>
          </div>
          <div className="bg-success-2 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-success-1 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-grey-1">
                  VAT Return Filing Due
                </p>
                <p className="text-xs text-grey-3 mt-1">
                  VAT return for {currentMonth} {currentYear} is due
                </p>
                <p className="text-xs text-grey-3">Due: {filingDueDate}</p>
                <p className="text-xs font-bold text-success-1 mt-2">
                  {daysUntilDue > 0 ? `In ${daysUntilDue} days` : "Due today"}
                </p>
              </div>
            </div>
          </div>
        </CustomCard>

        {/* Filing Status */}
        <CustomCard className="p-4 sm:p-6 border border-border-tint hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-grey-3" />
            <h3 className="font-bold text-sm sm:text-base text-grey-1">
              Filing Status
            </h3>
          </div>
          <div className="space-y-3">
            <span className="text-sm text-grey-3 block">
              {currentMonth} {currentYear}
            </span>
            <div className="w-full bg-grey-1 rounded-full h-1.5" />
            <div className="flex items-start gap-2">
              <CheckCircle
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  netVatPosition > 0 ? "text-error-1" : "text-grey-1"
                }`}
              />
              <div>
                <p className="text-sm font-bold text-grey-1">
                  {netVatPosition > 0
                    ? "Tax Payment Due"
                    : "No Filing Required"}
                </p>
                <p className="text-xs text-grey-3 mt-1">
                  {netVatPosition > 0
                    ? `Pay ${formatToNaira(netVatPosition)} by ${filingDueDate}`
                    : "No tax obligations for this period"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full text-sm rounded-full"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Filing Guide
            </Button>
          </div>
        </CustomCard>

        {/* Export & Reports */}
        <CustomCard className="p-4 sm:p-6 border border-border-tint hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-grey-3" />
              <h3 className="font-bold text-sm sm:text-base text-grey-1">
                Export &amp; Reports
              </h3>
            </div>
            <span className="bg-secondary-6 text-primary-green-100 text-xs font-bold px-2 py-1 rounded-full">
              {exportPackages.filter((p) => p.completed).length} items
            </span>
          </div>
          <div className="space-y-2">
            {exportPackages.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-grey-3 text-xs">{item.name}</span>
                {item.completed ? (
                  <CheckCircle className="w-4 h-4 text-success-1" />
                ) : (
                  <div className="w-4 h-4 border border-grey-5 rounded-full" />
                )}
              </div>
            ))}
          </div>
          <div className="pt-3 mt-3 border-t border-border-tint">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-grey-3">Total Sales</span>
              <span className="font-bold text-grey-1">
                {formatToNaira(totalSales)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-grey-3">Total Tax</span>
              <span
                className={`font-bold ${netVatPosition > 0 ? "text-error-1" : "text-grey-1"}`}
              >
                {formatToNaira(totalTax)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-grey-3">Tax Rate</span>
              <span className="font-bold text-info-1">{taxRate}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Button variant="outline" size="sm" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Excel
            </Button>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default TaxAnalytics;
