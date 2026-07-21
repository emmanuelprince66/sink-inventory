"use client";

import { useState } from "react";

import {
  ReportFormat,
  ReportTimeframe,
  ReportType,
} from "@/api/report/generate-report";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenerateReportFormValues } from "@/hooks/useReportGeneration";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  Info,
} from "lucide-react";

const TIMEFRAME_OPTIONS: { value: ReportTimeframe; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_1_month", label: "Last 1 month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "custom", label: "Custom range" },
];

const FORMAT_OPTIONS: {
  value: ReportFormat;
  label: string;
  hint: string;
  icon: typeof FileSpreadsheet;
}[] = [
  {
    value: "xlsx",
    label: "Excel",
    hint: "Styled layout",
    icon: FileSpreadsheet,
  },
  { value: "csv", label: "CSV", hint: "Raw data", icon: FileText },
  { value: "json", label: "JSON", hint: "Raw data", icon: FileJson },
];

const REPORT_TITLES: Record<ReportType, string> = {
  sales: "Sales Report",
  inventory: "Inventory Report",
  expenses: "Expenses Report",
  analytics: "Analytics Report",
};

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  onSubmit: (values: GenerateReportFormValues) => void;
  isSubmitting: boolean;
}

// Pure config form — the config step only. Once submitted, generation
// happens in the background (see useReportGeneration); this modal doesn't
// track progress itself so it can safely be closed/unmounted without
// interrupting anything.
const GenerateReportModal = ({
  isOpen,
  onClose,
  reportType,
  onSubmit,
  isSubmitting,
}: GenerateReportModalProps) => {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("last_7_days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Default to xlsx per backend recommendation (styled output).
  const [exportFormat, setExportFormat] = useState<ReportFormat>("xlsx");

  const handleGenerateClick = () => {
    onSubmit({ timeframe, startDate, endDate, exportFormat });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Generate ${REPORT_TITLES[reportType]}`}
      description="Choose a date range and file format — we'll notify you when it's ready."
      size="lg"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-green-300 to-primary-green-300/80 flex items-center justify-center text-white shadow-md shadow-primary-green-300/20">
          <FileDown className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-grey-5"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleGenerateClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting..." : "Generate Report"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Timeframe */}
        <div className="space-y-2.5">
          <Label className="flex items-center gap-1.5 text-grey-1">
            <Clock className="w-3.5 h-3.5 text-grey-3" />
            Timeframe
          </Label>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeframe(opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full border text-sm font-semibold cursor-pointer transition-colors",
                  timeframe === opt.value
                    ? "bg-primary-green-300 border-primary-green-300 text-white"
                    : "bg-white border-grey-5 text-grey-3 hover:border-primary-green-300 hover:text-grey-2",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {timeframe === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="start_date" className="text-xs text-grey-3">
                  Start date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_date" className="text-xs text-grey-3">
                  End date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Export format */}
        <div className="space-y-2.5">
          <Label className="text-grey-1">Export format</Label>
          <div className="grid grid-cols-3 gap-2.5">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = exportFormat === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExportFormat(opt.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all cursor-pointer",
                    selected
                      ? "border-primary-green-300 ring-2 ring-primary-green-300/20 bg-secondary-6"
                      : "border-grey-5 hover:border-primary-green-300 hover:bg-secondary-6",
                  )}
                >
                  {selected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-green-300 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </span>
                  )}
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      selected ? "text-primary-green-300" : "text-grey-3",
                    )}
                  />
                  <div>
                    <p className="text-xs font-bold text-grey-1">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-grey-3">{opt.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background-generation note */}
        <div className="flex items-start gap-2.5 rounded-xl border border-info-1/30 bg-info-2 p-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-info-1" />
          <p className="text-xs font-medium text-info-1">
            Generation runs in the background — you'll get a notification with
            the download once it's ready, so feel free to close this and keep
            working.
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default GenerateReportModal;
