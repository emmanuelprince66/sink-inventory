"use client";

import dynamic from "next/dynamic";
import React from "react";

interface BarcodeScannerProps {
  onScanResult: (result: string) => void;
  onClose: () => void;
  className?: string;
}

// Dynamically import the scanner component with SSR disabled
const BarCodeScannerDynamic = dynamic(
  () =>
    import("./BarCodeScannerCore").then((mod) => ({
      default: mod.BarCodeScannerCore,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading scanner...</p>
          </div>
        </div>
      </div>
    ),
  }
);

export const BarCodeScanner: React.FC<BarcodeScannerProps> = (props) => {
  return <BarCodeScannerDynamic {...props} />;
};
