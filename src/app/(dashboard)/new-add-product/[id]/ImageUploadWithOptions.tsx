import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import imageCompression from "browser-image-compression";
import { Camera, Upload, X } from "lucide-react";
import React, { useState } from "react";

interface ImageUploadWithOptionsProps {
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
  onError?: (message: string) => void;
}

// Helper function to detect if device is mobile
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;

  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
};

export const ImageUploadWithOptions: React.FC<ImageUploadWithOptionsProps> = ({
  value,
  onChange,
  onError,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📸 Original file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + " MB",
    });

    // Validate file size before compression
    if (file.size > 10 * 1024 * 1024) {
      console.log("❌ File too large even for compression:", file.size);
      onError?.("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    // Infer MIME type from extension (needed for HEIC and files missing type)
    const inferMimeType = (fileName: string, fallback: string): string => {
      const ext = fileName.toLowerCase().split(".").pop();
      switch (ext) {
        case "png":
          return "image/png";
        case "jpg":
        case "jpeg":
          return "image/jpeg";
        case "webp":
          return "image/webp";
        case "heic":
          return "image/heic";
        case "heif":
          return "image/heif";
        default:
          return fallback || "image/jpeg";
      }
    };

    const mimeType =
      file.type && file.type !== "application/octet-stream"
        ? file.type
        : inferMimeType(file.name, "image/jpeg");

    let processedFile: File;

    // Compress if larger than 1MB
    if (file.size > 1 * 1024 * 1024) {
      setIsCompressing(true);
      console.log("🔄 Compressing image...");

      try {
        const options = {
          maxSizeMB: 0.9,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: mimeType,
        };

        const compressed = await imageCompression(file, options);

        // ✅ FIX: imageCompression returns a Blob-like object, not a true File.
        // Wrapping in new File() ensures `instanceof File` checks pass downstream.
        processedFile = new File([compressed], file.name, {
          type: mimeType,
          lastModified: file.lastModified,
        });

        console.log("✅ Compression successful:", {
          name: processedFile.name,
          type: processedFile.type,
          size: processedFile.size,
          sizeInMB: (processedFile.size / 1024 / 1024).toFixed(2) + " MB",
          originalSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          compressionRatio:
            ((1 - processedFile.size / file.size) * 100).toFixed(1) + "%",
        });
      } catch (error) {
        console.error("❌ Compression failed:", error);
        onError?.("Failed to process image. Please try another photo.");
        setIsCompressing(false);
        e.target.value = "";
        return;
      } finally {
        setIsCompressing(false);
      }
    } else {
      console.log("✅ File small enough, no compression needed");

      // Still wrap in new File() to normalise type, in case it was missing
      processedFile = new File([file], file.name, {
        type: mimeType,
        lastModified: file.lastModified,
      });
    }

    console.log("✅ Final file ready for upload:", {
      name: processedFile.name,
      type: processedFile.type,
      size: processedFile.size,
      sizeInMB: (processedFile.size / 1024 / 1024).toFixed(2) + " MB",
      isFile: processedFile instanceof File,
    });

    onChange(processedFile);
    setShowOptionsModal(false);

    // Reset input
    e.target.value = "";
  };

  const handleUploadClick = () => {
    if (isMobile) {
      setShowOptionsModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleChangeClick = () => {
    if (isMobile) {
      setShowOptionsModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleTakePhoto = () => {
    console.log("📷 Opening camera...");
    setShowOptionsModal(false);
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 100);
  };

  const handleChooseFile = () => {
    console.log("📁 Opening file picker...");
    setShowOptionsModal(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleRemoveImage = () => {
    onChange(undefined);
  };

  return (
    <>
      {/* Preview Section */}
      {value instanceof File || (typeof value === "string" && value) ? (
        <div className="relative mt-1 border-2 border-gray-200 rounded-md p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={
                    value instanceof File ? URL.createObjectURL(value) : value
                  }
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value instanceof File ? value.name : "Current image"}
                </p>
                <p className="text-xs text-gray-500">
                  {value instanceof File
                    ? `${(value.size / 1024 / 1024).toFixed(2)} MB`
                    : "Uploaded image"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleChangeClick}
                disabled={isCompressing}
                className="text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-initial"
              >
                {isCompressing ? "Processing..." : "Change"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleRemoveImage}
                disabled={isCompressing}
                className="text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-initial"
              >
                <X className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
          <div className="space-y-1 text-center flex flex-col items-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleUploadClick}
                disabled={isCompressing}
              >
                {isCompressing ? "Processing..." : "Upload Image"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {isCompressing
                ? "Compressing image..."
                : "PNG, JPG, WEBP, HEIC up to 10MB"}
            </p>
          </div>
        </div>
      )}

      {/* Options Modal */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="sm:max-w-md flex flex-col align-center justify-center bg-white border-gray-50 shadow-sm">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Choose how you want to add your product image
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 w-full flex flex-col justify-center align-center">
            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-6 flex items-center justify-start gap-4 hover:bg-green-50 hover:border-green-600"
              onClick={handleTakePhoto}
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Take Photo</div>
                <div className="text-sm text-gray-500">
                  Use your camera to capture an image
                </div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-6 flex items-center justify-start gap-4 hover:bg-green-50 hover:border-green-600"
              onClick={handleChooseFile}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Choose File</div>
                <div className="text-sm text-gray-500">
                  Select from your photo library or files
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={isCompressing}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isCompressing}
      />
    </>
  );
};
