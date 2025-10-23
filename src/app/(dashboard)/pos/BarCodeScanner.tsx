"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, RefreshCw, ScanLine, X } from "lucide-react";
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
  const [cameraStarted, setCameraStarted] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasInitialized = useRef(false);
  const mountTimeRef = useRef<number>(Date.now());

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    // Prevent double initialization
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initScanner = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Add a small delay in production to ensure DOM is ready
        if (isProduction) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // More robust camera permission check
        let hasPermission = false;

        try {
          // First check if we can enumerate devices (less intrusive)
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideoDevices = devices.some(
            (device) => device.kind === "videoinput"
          );

          if (!hasVideoDevices) {
            throw new Error("No camera found");
          }

          // Then try to get user media
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          // Immediately stop the test stream
          stream.getTracks().forEach((track) => {
            track.stop();
          });

          hasPermission = true;
          setPermissionDenied(false);
        } catch (err: any) {
          console.error("Camera permission check failed:", err);

          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            setPermissionDenied(true);
            setError(
              "Camera permission denied. Please allow camera access in your browser settings."
            );
          } else if (
            err.name === "NotFoundError" ||
            err.name === "OverconstrainedError"
          ) {
            setError(
              "No suitable camera found. Please check if your camera is available and not being used by another application."
            );
          } else {
            setError("Camera not available or accessible.");
          }

          setIsLoading(false);
          return;
        }

        if (!hasPermission) {
          setIsLoading(false);
          return;
        }

        // Wait a bit for DOM to be fully ready, especially in production
        await new Promise((resolve) =>
          setTimeout(resolve, isProduction ? 200 : 50)
        );

        // Initialize scanner with more robust configuration
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
          ],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          // Remove the unsupported scanTypes property
        };

        const onScanSuccess = (decodedText: string) => {
          console.log("Scanned:", decodedText);

          // Debounce rapid scans
          const now = Date.now();
          if (now - mountTimeRef.current < 1000) {
            console.log("Ignoring scan too soon after mount");
            return;
          }

          if (scannerRef.current) {
            scannerRef.current.pause();

            // Small delay before clearing to ensure result is processed
            setTimeout(() => {
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
            }, 100);
          } else {
            onScanResult(decodedText);
          }
        };

        const onScanError = (errorMessage: string) => {
          // Ignore normal scanning errors
          if (
            !errorMessage.includes("NotFoundException") &&
            !errorMessage.includes("No MultiFormat Readers") &&
            !errorMessage.includes("QR code parse error")
          ) {
            console.warn("Scan error:", errorMessage);
          }
        };

        // Ensure the target element exists
        const scannerElement = document.getElementById(qrcodeRegionId);
        if (!scannerElement) {
          throw new Error("Scanner element not found");
        }

        // Clear any existing content
        scannerElement.innerHTML = "";

        const html5QrcodeScanner = new Html5QrcodeScanner(
          qrcodeRegionId,
          config,
          false
        );

        scannerRef.current = html5QrcodeScanner;

        // Render the scanner
        html5QrcodeScanner.render(onScanSuccess, onScanError);

        // Set loading to false after a short delay to allow camera to start
        setTimeout(() => {
          setCameraStarted(true);
          setIsLoading(false);
        }, 1000);

        // Fallback: if camera doesn't start within 5 seconds, show error
        setTimeout(() => {
          if (isLoading) {
            console.warn("Camera start timeout");
            setError(
              "Camera is taking longer than expected to start. Please try again."
            );
            setIsLoading(false);
          }
        }, 5000);
      } catch (err: any) {
        console.error("Scanner initialization error:", err);
        setError(err?.message || "Failed to initialize scanner");
        setPermissionDenied(true);
        setIsLoading(false);
        setCameraStarted(false);
      }
    };

    // Start initialization with a small delay to ensure component is mounted
    const initTimer = setTimeout(initScanner, isProduction ? 300 : 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(initTimer);
      cleanupScanner();
    };
  }, [onScanResult, isProduction]);

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        // Use pause first, then clear
        scannerRef.current.pause();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.error("Failed to clear scanner", error);
      }
    }

    // Force stop all video tracks
    const videoElements = document.querySelectorAll("video");
    videoElements.forEach((video) => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        video.srcObject = null;
      }
    });

    // Also clean up any canvas elements
    const canvasElements = document.querySelectorAll("canvas");
    canvasElements.forEach((canvas) => {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  };

  const handleClose = async () => {
    await cleanupScanner();
    onClose();
  };

  const handleRetry = async () => {
    await cleanupScanner();
    setError("");
    setPermissionDenied(false);
    setIsLoading(true);
    setCameraStarted(false);
    hasInitialized.current = false;
    mountTimeRef.current = Date.now();

    // Use a fresh initialization
    setTimeout(() => {
      hasInitialized.current = false;
    }, 100);
  };

  const handleManualPermission = async () => {
    try {
      // Try to trigger permission dialog directly
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      handleRetry();
    } catch (err) {
      console.error("Manual permission failed:", err);
      setError(
        "Please allow camera access in your browser settings and try again."
      );
    }
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
            <p className="text-gray-600 mb-4">
              {error || "Please allow camera access to scan barcodes"}
            </p>
            <div className="text-xs text-gray-500 mb-6">
              <p>If you previously denied permission:</p>
              <p>1. Look for the camera icon in your browser's address bar</p>
              <p>2. Click it and select "Allow"</p>
              <p>3. Refresh the page or click Try Again</p>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <Button variant="outline" onClick={handleClose} className="px-6">
                Cancel
              </Button>
              <Button
                onClick={handleManualPermission}
                className="px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Grant Permission & Retry
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
        className
      )}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Close button - Always visible */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClose}
          className="absolute -top-12 right-0 z-50 rounded-full shadow-lg bg-white hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Scanner container */}
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
          <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <ScanLine className="h-5 w-5 animate-pulse" />
              <h2 className="text-lg font-semibold">
                {isLoading ? "Initializing Camera..." : "Scanning..."}
              </h2>
            </div>
            <p className="text-sm mt-1 text-white/90">
              Position barcode within the camera view
            </p>
          </div>

          {/* Scanner element */}
          {isLoading && (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Starting camera...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few seconds
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 flex-col">
              <Camera className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          <div
            id={qrcodeRegionId}
            className="w-full"
            style={{
              minHeight: cameraStarted ? "400px" : "0px",
              display: isLoading || error ? "none" : "block",
            }}
          />

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
          background: #f9fafb;
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
