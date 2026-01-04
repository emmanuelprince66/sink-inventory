// api/analytic/download-report.ts
import {
  downloadFile,
  generateAnalyticsFilename,
} from "@/utils/download-utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DownloadReportApiParams = {
  id: string;
  start_date?: string;
  end_date?: string;
  format?: "csv" | "excel";
};

export type DownloadReportParams = DownloadReportApiParams & {
  dateRange?: { from?: Date; to?: Date };
};

export const downloadAnalyticsReport = async ({
  id,
  start_date,
  end_date,
  format = "csv",
}: DownloadReportApiParams) => {
  const url = new URL(`/api/analytics/${id}/report`, window.location.origin);

  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  params.append("export", format);

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download analytics report");
  }

  // Return the blob for download
  return response.blob();
};

export const useDownloadAnalyticsReport = () => {
  return useMutation({
    mutationFn: (params: DownloadReportParams) => {
      // Extract only API params for the fetch call
      const { dateRange, ...apiParams } = params;
      return downloadAnalyticsReport(apiParams);
    },
    onSuccess: (blob, variables) => {
      const filename = generateAnalyticsFilename(
        variables.dateRange,
        variables.format
      );
      downloadFile(blob, filename);
      toast.success("Report downloaded successfully");
    },
    onError: (error: Error) => {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download report");
    },
  });
};
