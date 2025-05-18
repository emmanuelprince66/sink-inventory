"use client";

import { useUploadCsvHook } from "@/hooks/useUploadCsvHook";
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

const UploadProduct = () => {
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
  } = useUploadCsvHook();

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex w-full justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Upload Products</h1>
      </div>

      {!isPreviewMode ? (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
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
              <UploadCloud size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragging
                  ? "Drop your file here"
                  : "Drag & Drop your file here"}
              </h3>
              <p className="text-gray-500 mb-4">or</p>
              <button
                onClick={triggerFileInput}
                className="bg-primary-green-300 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-md transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Browse Files"}
              </button>
              <p className="text-sm text-gray-500 mt-4">
                CSV and Excel files are supported
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Make sure your file has the following columns:
            </p>
            <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-x-auto">
              name, quantity, unit, low_stock_threshold (optional), cost_price,
              selling_price, sku (optional), expiry_date (optional)
            </div>
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={downloadExampleCsv}
                className="flex items-center cursor-pointer text-primary-green-300 hover:text-green-800"
              >
                <Download size={16} className="mr-2" />
                Download CSV example
              </button>
              <button
                onClick={downloadExampleExcel}
                className="flex items-center cursor-pointer text-primary-green-300 hover:text-green-800"
              >
                <Download size={16} className="mr-2" />
                Download Excel example
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <File size={20} className="text-blue-600 mr-2" />
                <span className="font-medium">
                  {file?.name} ({previewData.length} products)
                </span>
              </div>
              <div>
                {validationErrors.length > 0 ? (
                  <div className="flex items-center text-red-600">
                    <AlertCircle size={16} className="mr-1" />
                    <span className="text-sm">
                      {validationErrors.length} validation issues
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <Check size={16} className="mr-1" />
                    <span className="text-sm">Ready to upload</span>
                  </div>
                )}
              </div>
            </div>

            {apiError && (
              <div className="text-red-500 p-2 mb-4 rounded">
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
              <div className="text-green-500 p-2 mb-4 rounded">
                Upload successful!
              </div>
            )}

            {hasHeaderErrors && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                {validationErrors
                  .filter(
                    (error) =>
                      error.field === "headers" || error.field === "file"
                  )
                  .map((error, index) => (
                    <div key={index} className="flex items-start text-red-700">
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.slice(0, 10).map((product, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "name")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.name || "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "quantity")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.quantity !== undefined ? product.quantity : "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "unit")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.unit || "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "low_stock_threshold")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.low_stock_threshold !== undefined
                        ? product.low_stock_threshold
                        : "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "cost_price")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.cost_price !== undefined
                        ? product.cost_price
                        : "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "selling_price")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.selling_price !== undefined
                        ? product.selling_price
                        : "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "sku")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.sku || "—"}
                    </td>
                    <td
                      className={`px-3 py-2 whitespace-nowrap text-sm ${
                        getCellError(index, "expiry_date")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.expiry_date || "—"}
                    </td>
                  </tr>
                ))}
                {previewData.length > 10 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-3 text-sm text-gray-500 text-center"
                    >
                      {previewData.length - 10} more products not shown in
                      preview
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap justify-end space-x-3 gap-3">
            <button
              onClick={reset}
              className="flex items-center cursor-pointer w-[180px] text-center flex justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              className="flex items-center px-4 w-[180px] text-center flex justify-center py-2 cursor-pointer bg-primary-green-300 text-white rounded-md hover:bg-green-700 focus:outline-none disabled:bg-green-100"
              disabled={validationErrors.length > 0 || isPending}
            >
              <UploadCloud size={16} className="mr-2" />
              {isPending ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProduct;
