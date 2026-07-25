import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  GenerateReportParams,
  ReportFormat,
  ReportTimeframe,
  ReportType,
  downloadReportResult,
  isReportStatusTerminal,
  useGenerateReportTask,
  useReportStatusQuery,
} from "@/api/report/generate-report";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useToast } from "./toast/useToast";

export interface GenerateReportFormValues {
  timeframe: ReportTimeframe;
  startDate?: string;
  endDate?: string;
  exportFormat: ReportFormat;
}

// Owns the whole generate → poll → download lifecycle for one report type.
// Deliberately lives at the calling SCREEN's level (Sales.tsx/Expenses.tsx/
// Analytics.tsx), not inside the config modal or a dropdown item — closing
// the modal (or the dropdown that opened it) must not kill an in-flight
// poll. Progress/result is surfaced via a single sonner toast, updated in
// place by id, so it survives regardless of what's mounted around it.
export const useReportGeneration = (reportType: ReportType) => {
  const { showToast } = useToast();
  const business_id = useBusinessStore((state) => state.business_id);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const openConfig = () => setIsConfigOpen(true);
  const closeConfig = () => setIsConfigOpen(false);

  const [taskId, setTaskId] = useState<string | null>(null);
  const paramsRef = useRef<GenerateReportParams | null>(null);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const { mutate: startTask, isPending: isStarting } = useGenerateReportTask();
  const { data: statusResult } = useReportStatusQuery(taskId);

  const handleGenerate = (values: GenerateReportFormValues) => {
    if (!business_id) {
      showToast("No business selected — cannot generate report.", "error");
      return;
    }
    if (values.timeframe === "custom" && (!values.startDate || !values.endDate)) {
      showToast("Please select a start and end date.", "error");
      return;
    }
    if (
      values.timeframe === "custom" &&
      values.startDate &&
      values.endDate &&
      values.startDate > values.endDate
    ) {
      showToast("Start date must be before end date.", "error");
      return;
    }

    const params: GenerateReportParams = {
      business_id,
      report_type: reportType,
      timeframe: values.timeframe,
      start_date: values.timeframe === "custom" ? values.startDate : undefined,
      end_date: values.timeframe === "custom" ? values.endDate : undefined,
      export_format: values.exportFormat,
    };

    startTask(params, {
      onSuccess: (data) => {
        paramsRef.current = params;
        setTaskId(data.task_id);
        closeConfig();
        toastIdRef.current = toast.loading("Generating your report…", {
          description: "This can take a moment for larger date ranges.",
          duration: Infinity,
        });
      },
      onError: (error: Error) => {
        showToast(error.message || "Failed to start report generation", "error");
      },
    });
  };

  // Fires once the poll reaches a terminal state (ready, expired, or
  // failed) — updates the existing loading toast in place instead of
  // stacking a new one.
  useEffect(() => {
    if (!statusResult || !isReportStatusTerminal(statusResult)) return;

    const toastId = toastIdRef.current;

    if (statusResult.httpStatus === 200) {
      if (paramsRef.current) {
        // Keep the loading toast up while the file itself downloads —
        // it's a separate fetch (S3), not instantaneous for large files.
        toast.loading("Downloading your report…", { id: toastId, duration: Infinity });
        downloadReportResult(statusResult, paramsRef.current).finally(() => {
          toast.success("Report downloaded", { id: toastId, duration: 5000 });
        });
      } else {
        toast.success("Report generated successfully", {
          id: toastId,
          duration: 5000,
        });
      }
    } else {
      const message =
        statusResult.detail ||
        (statusResult.httpStatus === 404
          ? "Report link expired — please try again."
          : "Report generation failed. Please try again.");
      toast.error(message, { id: toastId, duration: 6000 });
    }

    toastIdRef.current = undefined;
    paramsRef.current = null;
    setTaskId(null);
  }, [statusResult]);

  return {
    isConfigOpen,
    openConfig,
    closeConfig,
    isStarting,
    isGenerating: !!taskId,
    handleGenerate,
  };
};
