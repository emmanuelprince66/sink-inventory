import { useMutation, useQuery } from "@tanstack/react-query";

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

// GET /report/generate/ now returns 202 + a task_id instead of streaming the
// file in the same request — report generation runs as a background job.
export interface GenerateReportTaskResponse {
  status: string; // "PENDING"
  task_id: string;
  status_check_url: string;
}

// GET /report/status/{task_id}/ — poll until httpStatus is 200 (ready) or
// 404/500 (terminal failure). httpStatus 202 means "still generating".
export interface ReportStatusResult {
  httpStatus: number;
  status?: string; // "PENDING" | "SUCCESS" | "FAILURE"
  export_format?: ReportFormat;
  data?: unknown; // inline payload when export_format === "json"
  download_url?: string; // present for csv/xlsx once SUCCESS
  filename?: string;
  detail?: string; // error message on 404/500
}

export const isReportStatusTerminal = (result: ReportStatusResult) =>
  result.httpStatus === 200 ||
  result.httpStatus === 404 ||
  result.httpStatus === 500;

export const isReportStatusSuccess = (result: ReportStatusResult) =>
  result.httpStatus === 200;

const formatDateForFilename = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const buildFallbackFilename = (
  report_type: ReportType,
  timeframe: ReportTimeframe,
  export_format: ReportFormat,
  start_date?: string,
  end_date?: string,
): string => {
  const ext =
    export_format === "xlsx" ? "xlsx" : export_format === "csv" ? "csv" : "json";
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

// csv/xlsx come back as a direct S3 download_url. The `download` attribute
// on an <a> is silently ignored by browsers for cross-origin URLs (S3 is a
// different origin than the app), so a plain `<a download href={s3Url}>`
// doesn't download at all — it just opens the file in a new tab. Fetching
// it ourselves and downloading the resulting blob keeps everything in the
// current tab and forces a real download regardless of the bucket's
// Content-Disposition header. Falls back to opening in a new tab only if
// the fetch itself fails (e.g. the bucket doesn't have CORS enabled for
// this origin) so the user can still get the file some way.
const downloadFromUrl = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const blob = await response.blob();
    downloadBlob(blob, filename);
  } catch (error) {
    console.error("Same-tab report download failed, falling back to a new tab:", error);
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

// json has no download_url, the report is inline in `data`, so we build a
// blob client-side to keep the same "always downloads a file" behavior.
export const downloadReportResult = async (
  result: ReportStatusResult,
  params: GenerateReportParams,
) => {
  const filename =
    result.filename ||
    buildFallbackFilename(
      params.report_type,
      params.timeframe,
      params.export_format ?? "xlsx",
      params.start_date,
      params.end_date,
    );

  if (result.download_url) {
    await downloadFromUrl(result.download_url, filename);
    return;
  }

  const blob = new Blob([JSON.stringify(result.data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
};

export const generateReportTask = async (
  params: GenerateReportParams,
): Promise<GenerateReportTaskResponse> => {
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
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || body.message || "Failed to start report generation");
  }

  return body;
};

export const fetchReportStatus = async (
  taskId: string,
): Promise<ReportStatusResult> => {
  const response = await fetch(`/api/report/status/${taskId}`, {
    method: "GET",
  });
  const body = await response.json().catch(() => ({}));
  return { httpStatus: response.status, ...body };
};

export const useGenerateReportTask = () => {
  return useMutation({
    mutationFn: generateReportTask,
  });
};

// Polls every 3s until the task reaches a terminal state (SUCCESS/FAILURE/
// expired). Disabled entirely when there's no taskId yet.
export const useReportStatusQuery = (taskId: string | null) => {
  return useQuery({
    queryKey: ["report-status", taskId],
    queryFn: () => fetchReportStatus(taskId as string),
    enabled: !!taskId,
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data as ReportStatusResult | undefined;
      if (!data) return 3000;
      return isReportStatusTerminal(data) ? false : 3000;
    },
    refetchIntervalInBackground: true,
    retry: false,
  });
};
