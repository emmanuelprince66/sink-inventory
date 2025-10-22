"use client";

import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";
import React, { useState } from "react";
import { BarCodeScanner } from "./BarCodeScanner"; // ← This now imports the new component

interface ScannerButtonProps {
  onScanResult: (result: string) => void;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ScannerButton: React.FC<ScannerButtonProps> = ({
  onScanResult,
  className,
  variant = "outline",
  size = "default",
}) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScanResult = (result: string) => {
    setShowScanner(false);
    onScanResult(result);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowScanner(true)}
        className={className}
      >
        <ScanLine className="h-4 w-4 mr-2" />
        Scan
      </Button>

      {showScanner && (
        <BarCodeScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};
