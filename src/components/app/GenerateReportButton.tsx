"use client";

import { ReportType } from "@/api/report/generate-report";
import GenerateReportModal from "@/components/app/GenerateReportModal";
import { Button } from "@/components/ui/button";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { FileDown } from "lucide-react";

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

// Self-contained trigger + config modal, for standalone use (i.e. NOT nested
// inside a DropdownMenuItem — see GenerateReportModal usage in Sales.tsx /
// Expenses.tsx for the dropdown case, which needs the modal to live outside
// the dropdown's own subtree so it doesn't unmount when the dropdown closes).
const GenerateReportButton = ({
  reportType,
  label = "Generate Report",
  variant = "outline",
  className,
}: GenerateReportButtonProps) => {
  const { isConfigOpen, openConfig, closeConfig, isStarting, handleGenerate } =
    useReportGeneration(reportType);

  return (
    <>
      <Button variant={variant} onClick={openConfig} className={className}>
        <FileDown className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <GenerateReportModal
        isOpen={isConfigOpen}
        onClose={closeConfig}
        reportType={reportType}
        onSubmit={handleGenerate}
        isSubmitting={isStarting}
      />
    </>
  );
};

export default GenerateReportButton;
