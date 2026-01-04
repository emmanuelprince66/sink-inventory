// components/inventory/DownloadInventoryButton.tsx
"use client";

import { useDownloadInventoryReport } from "@/api/inventory/download-report";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface DownloadInventoryButtonProps {
  business_id: string | null;
  className?: string;
}

export const DownloadInventoryButton = ({
  business_id,
  className = "",
}: DownloadInventoryButtonProps) => {
  const { mutate: downloadReport, isPending: isDownloading } =
    useDownloadInventoryReport();

  const handleDownload = (format: "csv" | "excel") => {
    if (!business_id) return;

    downloadReport({
      id: business_id,
      format,
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
      <DropdownMenuContent align="end" className="w-48">
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
