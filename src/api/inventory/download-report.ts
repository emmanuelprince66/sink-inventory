// api/analytic/download-inventory-report.ts
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type DownloadInventoryReportParams = {
  id: string;
  format?: "csv" | "excel";
};

export const downloadInventoryReport = async ({
  id,
  format = "csv",
}: DownloadInventoryReportParams) => {
  const url = new URL(`/api/inventory/${id}/report`, window.location.origin);

  const params = new URLSearchParams();
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
    throw new Error(errorData.message || "Failed to download inventory report");
  }

  // Return the blob for download
  return response.blob();
};

const generateInventoryFilename = (format: "csv" | "excel"): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const timestamp = `${y}-${m}-${day}`;
  const extension = format === "csv" ? "csv" : "xlsx";
  return `inventory-report_${timestamp}.${extension}`;
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

export const useDownloadInventoryReport = () => {
  return useMutation({
    mutationFn: downloadInventoryReport,
    onSuccess: (blob, variables) => {
      const filename = generateInventoryFilename(variables.format || "csv");
      downloadFile(blob, filename);
      toast.success("Inventory report downloaded successfully");
    },
    onError: (error: Error) => {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download inventory report");
    },
  });
};
