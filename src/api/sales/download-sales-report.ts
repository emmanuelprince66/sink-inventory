// api/analytic/download-sales-report.ts
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DownloadSalesReportApiParams = {
  id: string;
  start_date?: string;
  end_date?: string;
  format?: "csv" | "excel";
  type?: "product_sold" | "order_history";
  attendant_id?: string;
  payment_status?: string;
  status?: string;
  search?: string;
  fast_moving?: boolean;
  most_profitable?: boolean;
  top_selling?: boolean;
  discounted?: boolean;
};

export type DownloadSalesReportParams = DownloadSalesReportApiParams & {
  dateRange?: { from?: Date; to?: Date };
};

export const downloadSalesReport = async ({
  id,
  start_date,
  end_date,
  format = "csv",
  type = "order_history",
  attendant_id,
  payment_status,
  status,
  search,
  fast_moving,
  most_profitable,
  top_selling,
  discounted,
}: DownloadSalesReportApiParams) => {
  const url = new URL(`/api/sales/${id}/report`, window.location.origin);

  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  params.append("export", format);
  params.append("type", type);
  if (attendant_id) params.append("attendant_id", attendant_id);
  if (payment_status) params.append("payment_status", payment_status);
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  if (fast_moving) params.append("fast_moving", "true");
  if (most_profitable) params.append("most_profitable", "true");
  if (top_selling) params.append("top_selling", "true");
  if (discounted) params.append("discounted", "true");

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download sales report");
  }

  // Return the blob for download
  return response.blob();
};

const generateSalesFilename = (
  dateRange?: { from?: Date; to?: Date },
  format?: "csv" | "excel",
  type?: "product_sold" | "order_history"
): string => {
  const formatDateForFilename = (date?: Date): string => {
    const d = date ?? new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const startDate = formatDateForFilename(dateRange?.from);
  const endDate = formatDateForFilename(dateRange?.to);
  const extension = format === "csv" ? "csv" : "xlsx";
  const reportType =
    type === "product_sold" ? "products-sold" : "order-history";

  return `sales-${reportType}_${startDate}_to_${endDate}.${extension}`;
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const useDownloadSalesReport = () => {
  return useMutation({
    mutationFn: (params: DownloadSalesReportParams) => {
      // Extract only API params for the fetch call
      const { dateRange, ...apiParams } = params;
      return downloadSalesReport(apiParams);
    },
    onSuccess: (blob, variables) => {
      const filename = generateSalesFilename(
        variables.dateRange,
        variables.format,
        variables.type
      );
      downloadFile(blob, filename);
      toast.success("Sales report downloaded successfully");
    },
    onError: (error: Error) => {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download sales report");
    },
  });
};
