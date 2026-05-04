// lib/utils/downloadUtils.ts

/**
 * Triggers a file download in the browser
 * @param blob - The file blob to download
 * @param filename - The name for the downloaded file
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Formats a date for filename usage
 * @param date - Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatDateForFilename = (date?: Date): string => {
  // Use local timezone parts — toISOString() shifts to UTC and shows the
  // wrong calendar day for users east of GMT.
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Generates a filename for the analytics report
 * @param dateRange - The date range for the report
 * @param format - File format (csv or excel)
 * @returns Generated filename
 */
export const generateAnalyticsFilename = (
  dateRange?: { from?: Date; to?: Date },
  format: "csv" | "excel" = "csv"
): string => {
  const startDate = formatDateForFilename(dateRange?.from);
  const endDate = formatDateForFilename(dateRange?.to);
  const extension = format === "csv" ? "csv" : "xlsx";

  return `analytics-report_${startDate}_to_${endDate}.${extension}`;
};
