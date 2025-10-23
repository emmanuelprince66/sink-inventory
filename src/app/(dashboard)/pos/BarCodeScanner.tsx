"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, ScanLine, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScanResult: (result: string) => void;
  onClose: () => void;
  className?: string;
}

const qrcodeRegionId = "html5qr-code-full-region";

export const BarCodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanResult,
  onClose,
  className,
}) => {
  const [error, setError] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initScanner = async () => {
      // Add a small delay for mobile browsers to properly release camera
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Initialize scanner
      const config = {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0,
        formatsToSupport: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        ],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      };

      const onScanSuccess = (decodedText: string) => {
        console.log("Scanned:", decodedText);
        // Stop scanner and call callback
        if (scannerRef.current) {
          scannerRef.current
            .clear()
            .then(() => {
              scannerRef.current = null;
              onScanResult(decodedText);
            })
            .catch((err) => {
              console.error("Failed to clear scanner", err);
              onScanResult(decodedText);
            });
        } else {
          onScanResult(decodedText);
        }
      };

      const onScanError = (errorMessage: string) => {
        // Ignore normal scanning errors
        if (
          !errorMessage.includes("NotFoundException") &&
          !errorMessage.includes("No MultiFormat Readers")
        ) {
          console.warn("Scan error:", errorMessage);
        }
      };

      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          qrcodeRegionId,
          config,
          false
        );
        scannerRef.current = html5QrcodeScanner;
        html5QrcodeScanner.render(onScanSuccess, onScanError);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Scanner initialization error:", err);
        setError(err?.message || "Failed to initialize scanner");
        setPermissionDenied(true);
        setIsLoading(false);
      }
    };

    initScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner", error);
        });
        scannerRef.current = null;
      }

      // Clean up video elements on unmount
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      });
    };
  }, [onScanResult]);

  const handleClose = async () => {
    // Hide UI immediately
    setIsClosing(true);
    onClose();

    // Then do cleanup in background
    setTimeout(async () => {
      // Properly stop the scanner and camera
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
          scannerRef.current = null;
        } catch (error) {
          console.error("Failed to clear scanner on close", error);
        }
      }

      // Force stop all video tracks - more aggressive cleanup for mobile
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => {
            track.stop();
            console.log("Stopped track:", track.kind);
          });
          video.srcObject = null;
        }
        // Remove the video element
        video.remove();
      });

      // Clean up any remaining media streams
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          stream.getTracks().forEach((track) => track.stop());
        } catch (e) {
          // Ignore errors
        }
      }

      // Reset initialization flag to allow fresh start
      hasInitialized.current = false;
    }, 0);
  };

  const handleRetry = () => {
    setError("");
    setPermissionDenied(false);
    setIsLoading(true);
    hasInitialized.current = false;
    window.location.reload();
  };

  // Permission denied state
  if (permissionDenied) {
    return (
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
          className
        )}
      >
        <div className="bg-white p-8 rounded-xl max-w-sm w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Camera Access Required
            </h3>
            <p className="text-gray-600 mb-6">
              {error || "Please allow camera access to scan barcodes"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose} className="px-6">
                Cancel
              </Button>
              <Button
                onClick={handleRetry}
                className="px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4",
        isClosing && "opacity-0 pointer-events-none",
        className
      )}
      style={{ transition: "opacity 0.2s ease-out" }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Close button - Always visible */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClose}
          className="absolute -top-12 right-0 z-50 rounded-full shadow-lg"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Scanner container */}
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
          <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <ScanLine className="h-5 w-5 animate-pulse" />
              <h2 className="text-lg font-semibold">
                {isLoading ? "Initializing..." : "Scanning..."}
              </h2>
            </div>
            <p className="text-sm mt-1 text-white/90">
              Position barcode within the camera view
            </p>
          </div>

          {/* Scanner element */}
          {isLoading && (
            <div className="w-full h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Loading camera...</p>
              </div>
            </div>
          )}
          <div id={qrcodeRegionId} className="w-full"></div>

          {/* Instructions */}
          <div className="p-4 bg-gray-50 text-center text-sm text-gray-600 flex-shrink-0">
            <p>✓ Supports QR codes, barcodes (UPC, EAN, Code128, etc.)</p>
            <p className="mt-1">
              Make sure the code is well lit and clearly visible
            </p>
          </div>
        </div>
      </div>

      {/* Custom styles for html5-qrcode */}
      <style jsx global>{`
        #${qrcodeRegionId} {
          border: none !important;
        }
        #${qrcodeRegionId} > div {
          border: none !important;
        }
        #${qrcodeRegionId} video {
          border-radius: 0 !important;
          width: 100% !important;
          max-height: 400px;
          object-fit: cover;
        }
        #${qrcodeRegionId}__dashboard_section {
          padding: 16px;
        }
        #${qrcodeRegionId}__dashboard_section_csr {
          text-align: center;
          margin: 10px 0;
        }
        #${qrcodeRegionId}__scan_region {
          border: 2px solid #10b981 !important;
        }
        #${qrcodeRegionId}__camera_selection {
          margin: 10px 0;
        }

        /* Style the Start Scanning / Request Permission button */
        #${qrcodeRegionId}__dashboard_section_csr > button,
        #${qrcodeRegionId}__dashboard_section button {
          background: linear-gradient(to right, #10b981, #3b82f6) !important;
          color: white !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3) !important;
        }

        #${qrcodeRegionId}__dashboard_section_csr > button:hover,
        #${qrcodeRegionId}__dashboard_section button:hover {
          background: linear-gradient(to right, #059669, #2563eb) !important;
          box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        /* Style the camera selection dropdown */
        #${qrcodeRegionId}__camera_selection > select {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          padding: 10px 16px !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          color: #374151 !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          width: 100% !important;
          max-width: 300px !important;
        }

        #${qrcodeRegionId}__camera_selection > select:hover {
          border-color: #10b981 !important;
        }

        #${qrcodeRegionId}__camera_selection > select:focus {
          outline: none !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        /* Style camera selection label */
        #${qrcodeRegionId}__camera_selection > span,
        #${qrcodeRegionId}__camera_selection label {
          color: #374151 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          margin-bottom: 8px !important;
          display: block !important;
        }
      `}</style>
    </div>
  );
};
