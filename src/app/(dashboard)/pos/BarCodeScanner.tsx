"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);

  // Mark component as mounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cleanup = useCallback(async () => {
    console.log("🧹 Cleaning up camera resources...");

    // Clear any pending timeouts
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = undefined;
    }

    // Stop scanning first
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      } catch (err) {
        console.warn("Error resetting code reader:", err);
      }
    }

    setIsScanning(false);

    // Stop all video tracks to turn off camera
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        console.log(`🛑 Stopping ${tracks.length} tracks`);

        tracks.forEach((track) => {
          if (track.readyState === "live") {
            console.log(`Stopping ${track.kind} track`);
            track.stop(); // This should turn off the camera light
          }
        });
        streamRef.current = null;
      } catch (err) {
        console.warn("Error stopping stream:", err);
      }
    }

    // Clear video source and reset video element
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load(); // Reset video element
      } catch (err) {
        console.warn("Error cleaning up video element:", err);
      }
    }

    console.log("✅ Camera cleanup completed");
  }, []);

  const initializeScanner = useCallback(async () => {
    // Clean up any existing instances first
    await cleanup();

    if (!isMountedRef.current) return;

    try {
      setError("");
      setHasPermission(null);

      // Request camera permission with timeout
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Camera access timeout")), 10000)
        ),
      ]);

      if (!isMountedRef.current) {
        // Component unmounted while waiting for permission
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setHasPermission(true);

      // Initialize the code reader
      codeReaderRef.current = new BrowserMultiFormatReader();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          if (!videoRef.current)
            return reject(new Error("Video ref not available"));

          const onLoadedMetadata = () => {
            videoRef.current?.removeEventListener(
              "loadedmetadata",
              onLoadedMetadata
            );
            resolve(true);
          };

          const onError = () => {
            videoRef.current?.removeEventListener("error", onError);
            reject(new Error("Video playback failed"));
          };

          videoRef.current.addEventListener("loadedmetadata", onLoadedMetadata);
          videoRef.current.addEventListener("error", onError);
        });

        await videoRef.current.play();
        startScanning();
      }
    } catch (err) {
      console.error("❌ Error initializing scanner:", err);
      if (!isMountedRef.current) return;

      setHasPermission(false);
      setError(
        err instanceof Error
          ? err.message
          : "Camera access denied or not available"
      );
    }
  }, [cleanup]);

  const startScanning = useCallback(() => {
    if (!codeReaderRef.current || !videoRef.current || isScanning) return;

    setIsScanning(true);
    setError("");

    try {
      codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error) => {
          if (!isMountedRef.current) return;

          if (result) {
            // Successfully scanned a barcode
            const scannedText = result.getText();
            console.log("✅ Scanned barcode:", scannedText);

            // Use timeout to ensure cleanup happens in next event loop
            scanTimeoutRef.current = setTimeout(() => {
              cleanup();
              onScanResult(scannedText);
            }, 0);
            return;
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("Scanning error:", error);
            if (!isMountedRef.current) return;
            setError("Scanning failed, please try again");
          }
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      if (!isMountedRef.current) return;
      setError("Failed to start scanner");
      setIsScanning(false);
    }
  }, [isScanning, cleanup, onScanResult]);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  }, []);

  const handleRetry = useCallback(async () => {
    setError("");
    await initializeScanner();
  }, [initializeScanner]);

  const handleClose = useCallback(async () => {
    await cleanup(); // Ensure camera is stopped before closing
    onClose();
  }, [cleanup, onClose]);

  // Main effect for initialization
  useEffect(() => {
    initializeScanner();

    return () => {
      // Cleanup on unmount
      cleanup();
    };
  }, [initializeScanner, cleanup]);

  // Additional safety: cleanup on window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cleanup]);

  // Permission denied state
  if (hasPermission === false) {
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

  // Loading state
  if (hasPermission === null) {
    return (
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
          className
        )}
      >
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Initializing camera...</p>
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
      <div className="relative w-full h-full max-w-md max-h-[600px] mx-4">
        {/* Close button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Scanner UI */}
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />

          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning frame */}
              <div className="w-64 h-64 border-2 border-white border-opacity-50 rounded-lg relative">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>

                {/* Animated scanning line */}
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                    <ScanLine className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-400 h-8 w-8 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-20 left-0 right-0 text-center text-white px-4">
            <p className="text-lg font-medium mb-2">
              {isScanning ? "Scanning..." : "Position barcode within the frame"}
            </p>
            <p className="text-sm text-gray-300">
              Make sure the barcode is well lit and clearly visible
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-2 rounded text-center">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="ml-2 text-white hover:text-white hover:bg-red-600"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
