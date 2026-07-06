import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export type ReportType = "sales" | "expenses" | "inventory" | "analytics";
export type ReportTimeframe =
  | "today"
  | "last_7_days"
  | "last_1_month"
  | "last_3_months"
  | "custom";
export type ReportFormat = "json" | "csv" | "xlsx";

export interface GenerateReportParams {
  business_id: string;
  report_type: ReportType;
  timeframe: ReportTimeframe;
  start_date?: string; // YYYY-MM-DD, only when timeframe === "custom"
  end_date?: string; // YYYY-MM-DD, only when timeframe === "custom"
  export_format?: ReportFormat; // defaults to xlsx
}

const formatDateForFilename = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const buildFilename = (
  report_type: ReportType,
  timeframe: ReportTimeframe,
  export_format: ReportFormat,
  start_date?: string,
  end_date?: string,
): string => {
  const ext =
    export_format === "xlsx"
      ? "xlsx"
      : export_format === "csv"
        ? "csv"
        : "json";
  const today = formatDateForFilename(new Date());
  const rangePart =
    timeframe === "custom" && start_date && end_date
      ? `${start_date}_to_${end_date}`
      : timeframe;
  return `${report_type}-report_${rangePart}_${today}.${ext}`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateReport = async (params: GenerateReportParams) => {
  const {
    business_id,
    report_type,
    timeframe,
    start_date,
    end_date,
    export_format = "xlsx",
  } = params;

  const url = new URL("/api/report/generate", window.location.origin);
  url.searchParams.append("business_id", business_id);
  url.searchParams.append("report_type", report_type);
  url.searchParams.append("timeframe", timeframe);
  if (timeframe === "custom") {
    if (start_date) url.searchParams.append("start_date", start_date);
    if (end_date) url.searchParams.append("end_date", end_date);
  }
  url.searchParams.append("export_format", export_format);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    let message = "Failed to generate report";
    try {
      const errorBody = await response.json();
      message = errorBody.error || errorBody.message || message;
    } catch {
      // upstream returned a non-JSON error; keep generic message
    }
    throw new Error(message);
  }

  return response.blob();
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: generateReport,
    onSuccess: (blob, variables) => {
      const filename = buildFilename(
        variables.report_type,
        variables.timeframe,
        variables.export_format ?? "xlsx",
        variables.start_date,
        variables.end_date,
      );
      downloadBlob(blob, filename);
      toast.success("Report generated successfully");
    },
    onError: (error: Error) => {
      console.error("Generate report error:", error);
      toast.error(error.message || "Failed to generate report");
    },
  });
};
