import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, X } from "lucide-react";
import React, { useState } from "react";

interface ImageUploadWithOptionsProps {
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
  onError?: (message: string) => void;
}

export const ImageUploadWithOptions: React.FC<ImageUploadWithOptionsProps> = ({
  value,
  onChange,
  onError,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(
        "File selected:",
        file.name,
        "Type:",
        file.type,
        "Size:",
        file.size,
      );

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        onError?.("File size must be less than 5MB");
        return;
      }

      onChange(file);
      setShowOptionsModal(false);
    }
  };

  const handleTakePhoto = () => {
    setShowOptionsModal(false);
    // Small delay to ensure modal closes before opening camera
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 100);
  };

  const handleChooseFile = () => {
    setShowOptionsModal(false);
    // Small delay to ensure modal closes before opening file picker
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
                onClick={() => setShowOptionsModal(true)}
                className="text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-initial"
              >
                Change
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleRemoveImage}
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
        <div className="mt-1 flex justify-center px-6 bg-white pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
          <div className="space-y-1 text-center flex flex-col items-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowOptionsModal(true)}
              >
                Upload Image
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP, HEIC up to 5MB
            </p>
          </div>
        </div>
      )}

      {/* Options Modal */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="sm:max-w-md bg-white border-gray-100 shadow-sm">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Choose how you want to add your product image
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 flex flex-col justify-center items-center w-full">
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
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};
