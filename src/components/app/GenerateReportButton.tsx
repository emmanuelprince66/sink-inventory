"use client";

import {
  ReportFormat,
  ReportTimeframe,
  ReportType,
  useGenerateReport,
} from "@/api/report/generate-report";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { FileDown } from "lucide-react";
import { useState } from "react";

interface GenerateReportButtonProps {
  reportType: ReportType;
  label?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  className?: string;
}

const TIMEFRAME_OPTIONS: { value: ReportTimeframe; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_1_month", label: "Last 1 month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "custom", label: "Custom range" },
];

const FORMAT_OPTIONS: { value: ReportFormat; label: string }[] = [
  { value: "xlsx", label: "Excel (.xlsx) — styled" },
  { value: "csv", label: "CSV (.csv)" },
  { value: "json", label: "JSON (.json)" },
];

const REPORT_TITLES: Record<ReportType, string> = {
  sales: "Sales Report",
  inventory: "Inventory Report",
  expenses: "Expenses Report",
  analytics: "Analytics Report",
};

const GenerateReportButton = ({
  reportType,
  label = "Generate Report",
  variant = "outline",
  className,
}: GenerateReportButtonProps) => {
  const { showToast } = useToast();
  const business_id = useBusinessStore((state) => state.business_id);
  const { mutate: generate, isPending } = useGenerateReport();

  const [isOpen, setIsOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("last_7_days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Default to xlsx per backend recommendation (styled output).
  const [exportFormat, setExportFormat] = useState<ReportFormat>("xlsx");

  const handleGenerate = () => {
    if (!business_id) {
      showToast("No business selected — cannot generate report.", "error");
      return;
    }
    if (timeframe === "custom" && (!startDate || !endDate)) {
      showToast("Please select a start and end date.", "error");
      return;
    }
    if (timeframe === "custom" && startDate > endDate) {
      showToast("Start date must be before end date.", "error");
      return;
    }

    generate(
      {
        business_id,
        report_type: reportType,
        timeframe,
        start_date: timeframe === "custom" ? startDate : undefined,
        end_date: timeframe === "custom" ? endDate : undefined,
        export_format: exportFormat,
      },
      {
        onSuccess: () => setIsOpen(false),
      },
    );
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <FileDown className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <CustomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Generate ${REPORT_TITLES[reportType]}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select
              value={timeframe}
              onValueChange={(v) => setTimeframe(v as ReportTimeframe)}
            >
              <SelectTrigger id="timeframe" className="w-full">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {timeframe === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="export_format">Export format</Label>
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as ReportFormat)}
            >
              <SelectTrigger id="export_format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500">
              Excel keeps the styled layout from the backend. CSV / JSON are raw
              data only.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleGenerate}
              disabled={isPending}
            >
              {isPending ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default GenerateReportButton;
