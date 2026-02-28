"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { Button } from "@/components/ui/button";
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
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import { DateRange } from "react-day-picker";

// Register ChartJS components
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

interface TaxAnalyticsProps {
  dateRange?: DateRange;
  TaxAnalyticData?: any;
}

const TaxAnalytics = ({ dateRange, TaxAnalyticData }: TaxAnalyticsProps) => {
  // Mock data - replace with actual data from TaxAnalyticData
  const totalSales = 263375.0;
  const vatCollected = 18375.0;
  const netVatPosition = 18375.0;
  const developmentLevy = 0.0;
  const vatRate = 7.5;
  const vatPaidInput = 0.0;

  // Calendar data
  const currentMonth = "February";
  const currentYear = "2026";
  const filingDueDate = "Mar 21, 2026";
  const daysUntilDue = 22;

  // Export package items
  const exportPackages = [
    { name: "Monthly Sales Summary", completed: true },
    { name: "VAT Breakdown Report", completed: true },
    { name: "Payment Instructions", completed: true },
    { name: "Development Levy Calculation", completed: false },
  ];

  // Chart data for Monthly Tax Trend
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Tax Amount",
        data: [0, 0, 0, 0, 0, 263375],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context: any) {
            return `₦${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            if (value === 0) return "₦0";
            if (value >= 75000) return "₦75K";
            if (value >= 150000) return "₦150K";
            if (value >= 225000) return "₦225K";
            if (value >= 300000) return "₦300K";
            return `₦${value}`;
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header Section with Month/Year Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        {/* <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="px-2 sm:px-3">
            ←
          </Button>
          <Select defaultValue={currentMonth}>
            <SelectTrigger className="w-[120px] sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="January">January</SelectItem>
              <SelectItem value="February">February</SelectItem>
              <SelectItem value="March">March</SelectItem>
              <SelectItem value="April">April</SelectItem>
              <SelectItem value="May">May</SelectItem>
              <SelectItem value="June">June</SelectItem>
              <SelectItem value="July">July</SelectItem>
              <SelectItem value="August">August</SelectItem>
              <SelectItem value="September">September</SelectItem>
              <SelectItem value="October">October</SelectItem>
              <SelectItem value="November">November</SelectItem>
              <SelectItem value="December">December</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue={currentYear}>
            <SelectTrigger className="w-[100px] sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="px-2 sm:px-3">
            →
          </Button>
        </div> */}
        <div className="text-sm text-gray-600 w-full sm:w-auto text-left sm:text-right">
          Showing data for {currentMonth} {currentYear}
        </div>
      </div>

      {/* Bottom Row - 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <CustomCard className="p-4 border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-600">
              Total Sales
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatToNaira(totalSales)}
          </p>
          <p className="text-xs text-gray-500 mt-1">From 1 paid invoice</p>
        </CustomCard>

        <CustomCard className="p-4 border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs sm:text-sm text-gray-600">
              VAT Collected
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatToNaira(vatCollected)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{vatRate}% standard rate</p>
        </CustomCard>

        <CustomCard className="p-4 border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className="text-xs sm:text-sm text-gray-600">
              Net VAT Position
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatToNaira(netVatPosition)}
          </p>
          <span className="inline-block mt-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
            Payable
          </span>
        </CustomCard>

        <CustomCard className="p-4 border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm text-gray-600">
              Development Levy
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatToNaira(developmentLevy)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Exempt (Small Company)</p>
        </CustomCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Monthly Tax Trend Chart */}
        <CustomCard className="p-4 sm:p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm sm:text-base">
              Monthly Tax Trend
            </h3>
            <div className="bg-black text-white text-xs px-2 py-1 rounded">
              +100%
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CustomCard>

        {/* VAT Breakdown Card */}
        <CustomCard className="p-4 sm:p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm sm:text-base">
              VAT Breakdown
            </h3>
            <span className="text-xs text-gray-600">
              Current Rate: {vatRate}%
            </span>
          </div>

          <div className="space-y-4">
            {/* VAT Collected */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">VAT Collected</span>
                </div>
                <span className="font-bold">{formatToNaira(vatCollected)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
              <p className="text-xs text-gray-600">From sales to customers</p>
            </div>

            {/* VAT Paid (Input) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 rotate-180" />
                  <span className="text-sm font-medium">VAT Paid (Input)</span>
                </div>
                <span className="font-bold">{formatToNaira(vatPaidInput)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className="bg-blue-500 h-2 rounded-full w-0"></div>
              </div>
              <p className="text-xs text-gray-600">
                On business purchases & expenses
              </p>
            </div>

            {/* Net VAT Position */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Net VAT Position</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {formatToNaira(netVatPosition)}
                  </span>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    Payable
                  </span>
                </div>
              </div>
            </div>

            {/* Action Required */}
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Action Required
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    VAT payment of {formatToNaira(netVatPosition)} is due by{" "}
                    {filingDueDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Tax Calendar Card */}
        <CustomCard className="p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-sm sm:text-base">
                Tax Calendar
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    VAT Return Filing Due
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    VAT return for {currentMonth} {currentYear} is due
                  </p>
                  <p className="text-xs text-gray-600">Due: {filingDueDate}</p>
                </div>
              </div>
              <div className="inline-block bg-black text-white text-xs px-2 py-1 rounded">
                In {daysUntilDue} days
              </div>
            </div>
          </div>
        </CustomCard>

        {/* Filing Status Card */}
        <CustomCard className="p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-sm sm:text-base">
                Filing Status
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {currentMonth} {currentYear}
              </span>
              <span className="text-gray-900 font-medium">
                No Filing Required
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-black h-2 rounded-full w-full"></div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    No Filing Required
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    No tax obligations for this period
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full text-sm" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View Filing Guide
            </Button>
          </div>
        </CustomCard>

        {/* Export & Reports Card */}
        <CustomCard className="p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-sm sm:text-base">
                Export & Reports
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Export Package</span>
              <span className="bg-black text-white text-xs px-2 py-1 rounded">
                3 items
              </span>
            </div>

            <div className="space-y-2">
              {exportPackages.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 text-xs">{item.name}</span>
                  {item.completed && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {!item.completed && (
                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Sales</span>
                <span className="font-medium">{formatToNaira(totalSales)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT Position</span>
                <span className="font-medium text-red-600">
                  +{formatToNaira(netVatPosition)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Excel
              </Button>
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default TaxAnalytics;
