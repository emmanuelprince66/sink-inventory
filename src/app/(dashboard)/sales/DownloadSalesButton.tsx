// components/sales/DownloadSalesButton.tsx
"use client";

import { useDownloadSalesReport } from "@/api/sales/download-sales-report";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import moment from "moment";
import { DateRange } from "react-day-picker";

interface DownloadSalesButtonProps {
  business_id: string | null;
  dateRange?: DateRange | undefined;
  activeTab?: "products" | "history";
  className?: string;
  attendantId?: string;
  searchInput?: string;
  activeProductFilter?: string;
  activeOrderFilter?: string;
}

export const DownloadSalesButton = ({
  business_id,
  dateRange,
  activeTab = "history",
  className = "",
  attendantId,
  searchInput,
  activeProductFilter,
  activeOrderFilter,
}: DownloadSalesButtonProps) => {
  const { mutate: downloadReport, isPending: isDownloading } =
    useDownloadSalesReport();

  // Map product filters to API parameters
  const getProductFilterParams = () => {
    if (activeTab !== "products" || !activeProductFilter) return {};

    switch (activeProductFilter) {
      case "Fast Moving":
        return { fast_moving: true };
      case "Most Profitable":
        return { most_profitable: true };
      case "Top Selling":
        return { top_selling: true };
      case "Discounted":
        return { discounted: true };
      default:
        return {};
    }
  };

  // Map order filter to status
  const getOrderStatus = () => {
    if (activeTab !== "history" || !activeOrderFilter) return undefined;

    switch (activeOrderFilter) {
      case "Completed":
        return "COMPLETED";
      case "Pending":
        return "PENDING";
      case "Cancelled":
        return "CANCELLED";
      default:
        return undefined;
    }
  };

  const handleDownload = (format: "csv" | "excel") => {
    if (!business_id) return;

    const type = activeTab === "products" ? "product_sold" : "order_history";

    downloadReport({
      id: business_id,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      format,
      type,
      attendant_id: attendantId,
      search: searchInput && searchInput.length >= 3 ? searchInput : undefined,
      status: getOrderStatus(),
      ...getProductFilterParams(),
      dateRange,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          disabled={isDownloading || !business_id}
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? "Downloading..." : "Download Report"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-gray-500">
          {activeTab === "products" ? "Products Sold" : "Order History"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDownload("csv")}
          disabled={isDownloading}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDownload("excel")}
          disabled={isDownloading}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
