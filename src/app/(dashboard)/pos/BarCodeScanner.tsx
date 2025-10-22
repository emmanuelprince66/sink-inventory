"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, ScanLine, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScanResult: (result: string) => void;
  onClose: () => void;
  className?: string;
}

export const BarCodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanResult,
  onClose,
  className,
}) => {
  const [error, setError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrcodeRegionId = useRef(`html5qr-code-${Date.now()}`).current;

  const initScanner = useCallback(async () => {
    // First check if we have camera permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        // Stop the stream immediately - we just needed to check permission
        stream.getTracks().forEach((track) => track.stop());
      } else {
        throw new Error("Camera not supported on this device");
      }
    } catch (err: any) {
      console.error("Camera permission error:", err);
      setPermissionDenied(true);
      setError(
        err.name === "NotAllowedError"
          ? "Camera permission denied"
          : "Camera not available"
      );
      return;
    }

    // Now initialize the scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ],
    };

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      console.log("Scanned:", decodedText);
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
      // Ignore not found errors - they're normal during scanning
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
      setIsInitialized(true);
    } catch (err: any) {
      console.error("Scanner initialization error:", err);
      setError(err?.message || "Failed to initialize scanner");
      setPermissionDenied(true);
    }
  }, [qrcodeRegionId, onScanResult]);

  // Callback ref to initialize scanner when element is mounted
  const scannerElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null && !scannerRef.current) {
        // Element is now in the DOM, initialize scanner
        setShowScanner(true);
        setTimeout(() => {
          initScanner();
        }, 100);
      }
    },
    [initScanner]
  );

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, []);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch((error) => {
          console.error("Failed to clear scanner on close", error);
        })
        .finally(() => {
          onClose();
        });
    } else {
      onClose();
    }
  };

  const handleRetry = () => {
    setError("");
    setPermissionDenied(false);
    setIsInitialized(false);
    setShowScanner(false);
    // Try initializing again
    setTimeout(() => {
      initScanner();
    }, 100);
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
        <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
          <div className="text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Camera Access Required
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "Please allow camera access to scan barcodes"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50",
        className
      )}
    >
      <div className="relative w-full h-full max-w-2xl mx-4 flex flex-col items-center justify-center">
        {/* Close button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Scanner container */}
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-2xl">
          <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-center">
            <div className="flex items-center justify-center gap-2">
              <ScanLine className="h-5 w-5 animate-pulse" />
              <h2 className="text-lg font-semibold">
                {isInitialized ? "Scanning..." : "Initializing..."}
              </h2>
            </div>
            <p className="text-sm mt-1 text-white/90">
              Position barcode within the camera view
            </p>
          </div>

          {/* Scanner element - html5-qrcode renders here */}
          {!isInitialized && (
            <div className="w-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Loading camera...</p>
              </div>
            </div>
          )}
          <div
            ref={scannerElementRef}
            id={qrcodeRegionId}
            className="w-full"
          ></div>

          {/* Instructions */}
          <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
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
          min-height: 400px;
        }
        #${qrcodeRegionId} > div {
          border: none !important;
        }
        #${qrcodeRegionId} video {
          border-radius: 0 !important;
          width: 100% !important;
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
      `}</style>
    </div>
  );
};
