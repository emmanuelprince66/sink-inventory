"use client";

import { Button } from "@/components/ui/button";
import { useUploadCustomerCsvHook } from "@/hooks/useUploadCustomerCsvHook";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Download,
  File,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const CustomersUpload = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    file,
    isLoading,
    previewData,
    validationErrors,
    isPreviewMode,
    isPending,
    handleFileSelect,
    apiError,
    handleUploadSubmit,
    isSuccess,
    reset,
    downloadExampleCsv,
    downloadExampleExcel,
  } = useUploadCustomerCsvHook();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && !selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      alert("Please select a CSV or Excel file");
      return;
    }
    handleFileSelect(selectedFile);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (droppedFile && !droppedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      alert("Please drop a CSV or Excel file");
      return;
    }
    handleFileSelect(droppedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getCellError = (rowIndex: number, field: string) => {
    return validationErrors.find(
      (error) => error.row === rowIndex + 1 && error.field === field
    );
  };

  const hasHeaderErrors = validationErrors.some(
    (error) => error.field === "headers" || error.field === "file"
  );

  return (
    <div className="px-4 py-6 w-full flex flex-col gap-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 mr-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-xl ml-3 sm:text-2xl font-extrabold text-grey-1">
          Upload Customers
        </h1>
      </div>

      {!isPreviewMode ? (
        <div className="bg-white rounded-2xl border border-grey-5 p-6 max-w-3xl mx-auto w-full">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-primary-green-300 bg-primary-green-300/10"
                : "border-grey-5"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center">
              <UploadCloud size={48} className="text-grey-4 mb-4" />
              <h3 className="text-lg font-bold text-grey-1 mb-2">
                {isDragging
                  ? "Drop your file here"
                  : "Drag & Drop your file here"}
              </h3>
              <p className="text-grey-3 mb-4">or</p>
              <Button onClick={triggerFileInput} disabled={isLoading}>
                {isLoading ? "Processing..." : "Browse Files"}
              </Button>
              <p className="text-sm text-grey-3 mt-4">
                CSV and Excel files are supported
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-grey-3 mb-2">
              Make sure your file has the following columns:
            </p>
            <div className="bg-grey-6 rounded-lg p-3 text-xs font-mono overflow-x-auto text-grey-2">
              name, phone, email
            </div>
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={downloadExampleCsv}
                className="flex items-center cursor-pointer text-sm font-bold text-primary-green-300 hover:text-primary-green-300/80 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download CSV example
              </button>
              <button
                onClick={downloadExampleExcel}
                className="flex items-center cursor-pointer text-sm font-bold text-primary-green-300 hover:text-primary-green-300/80 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download Excel example
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-grey-5 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <File size={20} className="text-info-1 mr-2" />
                <span className="font-bold text-grey-1">
                  {file?.name} ({previewData.length} customers)
                </span>
              </div>
              <div>
                {validationErrors.length > 0 ? (
                  <div className="flex items-center text-error-1">
                    <AlertCircle size={16} className="mr-1" />
                    <span className="text-sm font-medium">
                      {validationErrors.length} validation issues
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-success-1">
                    <Check size={16} className="mr-1" />
                    <span className="text-sm font-medium">Ready to upload</span>
                  </div>
                )}
              </div>
            </div>

            {apiError && (
              <div className="text-error-1 text-sm font-medium bg-error-2 p-3 mb-4 rounded-lg">
                {apiError
                  .split("\n")
                  .filter((line) => line.trim() !== "" && line.trim() !== "{}")
                  .map((line, i) => (
                    <div key={i} className="flex items-start">
                      <AlertCircle
                        size={16}
                        className="mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span>{line}</span>
                    </div>
                  ))}
              </div>
            )}

            {isSuccess && (
              <div className="text-success-1 text-sm font-medium bg-success-2 p-3 mb-4 rounded-lg">
                Upload successful!
              </div>
            )}

            {hasHeaderErrors && (
              <div className="bg-error-2 border border-error-1/30 rounded-lg p-3 mb-4">
                {validationErrors
                  .filter(
                    (error) =>
                      error.field === "headers" || error.field === "file"
                  )
                  .map((error, index) => (
                    <div key={index} className="flex items-start text-error-1 text-sm font-medium">
                      <AlertCircle
                        size={16}
                        className="mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span>{error.message}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-grey-5">
            <table className="min-w-full divide-y divide-grey-5">
              <thead className="bg-grey-6">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-grey-3 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-grey-3 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-grey-3 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-grey-3 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-grey-5">
                {previewData.slice(0, 10).map((customer, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-grey-6/40"}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-grey-3">
                      {index + 1}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "name")
                          ? "text-error-1 font-medium"
                          : "text-grey-1"
                      }`}
                    >
                      {customer.name || "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "phone")
                          ? "text-error-1 font-medium"
                          : "text-grey-1"
                      }`}
                    >
                      {customer.phone || "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "email")
                          ? "text-error-1 font-medium"
                          : "text-grey-1"
                      }`}
                    >
                      {customer.email || "—"}
                    </td>
                  </tr>
                ))}
                {previewData.length > 10 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-sm text-grey-3 text-center"
                    >
                      {previewData.length - 10} more customers not shown in
                      preview
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={reset}
              className="w-[180px] justify-center"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={validationErrors.length > 0 || isPending}
              className="w-[180px] justify-center"
            >
              <UploadCloud size={16} className="mr-2" />
              {isPending ? "Uploading..." : "Confirm Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersUpload;
