import { useUploadProductsMutation } from "@/api/products/upload-bulk-product";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";

import Papa from "papaparse";
import { useState } from "react";
import * as XLSX from "xlsx";

// Define supported date formats (only YYYY-MM-DD is allowed now)
const DATE_FORMATS = ["YYYY-MM-DD"];

// Define allowed unit values
const ALLOWED_UNITS = [
  "Pcs",
  "Kg",
  "Bag",
  "Box",
  "Ctm",
  "Ltd",
  "Pair",
  "Gram",
  "Feet",
  "Roll",
  "Meter",
  "Mil",
  "Bottle",
  "Bundle",
  "MI",
  "Ton",
  "Dozen",
  "Mg",
  "Gr",
];

// Define the product structure based on required columns
export interface ProductItem {
  name: string;
  quantity: number;
  unit: string;
  low_stock_threshold?: number;
  cost_price: number;
  selling_price: number;
  sku?: string;
  expiry_date?: string;
  [key: string]: any;
}

// Error type for validation
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const useUploadCsvHook = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const [previewData, setPreviewData] = useState<ProductItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const router = useRouter();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const formatApiError = (error: any): string => {
    if (!error) return "Unknown error";
    if (
      typeof error === "object" &&
      error !== null &&
      Object.keys(error).length === 0
    )
      return "";
    if (typeof error === "string") return error.trim();

    if (Array.isArray(error)) {
      const messages = error
        .map((e) => formatApiError(e))
        .filter((msg) => msg !== "");
      return messages.join("\n");
    }

    if (error.message) return formatApiError(error.message);
    if (error.error) return formatApiError(error.error);

    if (typeof error === "object") {
      try {
        if (Array.isArray(error.errors)) return formatApiError(error.errors);
        const stringified = JSON.stringify(error);
        return stringified !== "{}" ? stringified : "";
      } catch {
        return "Error object could not be stringified";
      }
    }

    const stringValue = String(error);
    return stringValue !== "[object Object]" ? stringValue : "";
  };

  const business_id = useBusinessStore((state) => state.business_id);

  const { mutate: uploadBulkProducts, isPending } = useUploadProductsMutation({
    businessId: business_id,
    onSuccess: (data) => {
      if (data.success) {
        setIsSuccess(true);
        queryClient.invalidateQueries({
          queryKey: [queryKey.inventory.getAllInventory],
        });
        router.push("/inventory");
        setApiError(null);
      } else {
        setApiError(
          formatApiError(data.message || data.error || "Upload failed")
        );
        setIsSuccess(false);
      }
    },
    onError: (error) => {
      setApiError(formatApiError(error));
      setIsSuccess(false);
    },
  });

  const formatDate = (dateString: string): string | null => {
    if (!dateString) return null;
    const date = moment(dateString, DATE_FORMATS, true);
    return date.isValid() ? date.format("YYYY-MM-DD") : null;
  };

  const validateProduct = (
    product: any,
    rowIndex: number
  ): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredFields = [
      "name",
      "quantity",
      "unit",
      "cost_price",
      "selling_price",
    ];

    requiredFields.forEach((field) => {
      if (!product[field] && product[field] !== 0) {
        errors.push({ row: rowIndex, field, message: `${field} is required` });
      }
    });

    const numericFields = [
      "quantity",
      "low_stock_threshold",
      "cost_price",
      "selling_price",
    ];
    numericFields.forEach((field) => {
      if (
        product[field] !== undefined &&
        product[field] !== null &&
        product[field] !== "" &&
        isNaN(Number(product[field]))
      ) {
        errors.push({
          row: rowIndex,
          field,
          message: `${field} must be a number`,
        });
      }
    });

    if (product.unit && !ALLOWED_UNITS.includes(product.unit)) {
      errors.push({
        row: rowIndex,
        field: "unit",
        message: `Invalid unit. Allowed values are: ${ALLOWED_UNITS.join(
          ", "
        )}`,
      });
    }

    if (product.expiry_date && !formatDate(product.expiry_date)) {
      errors.push({
        row: rowIndex,
        field: "expiry_date",
        message: "Invalid date format. Only YYYY-MM-DD format is accepted.",
      });
    }

    return errors;
  };

  const validateCsvData = (data: any[]): ValidationError[] => {
    let allErrors: ValidationError[] = [];
    const requiredColumns = [
      "name",
      "quantity",
      "unit",
      "cost_price",
      "selling_price",
    ];

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        allErrors.push({
          row: 0,
          field: "headers",
          message: `Missing required columns: ${missingColumns.join(", ")}`,
        });
        return allErrors;
      }
    }

    data.forEach((row, index) => {
      const rowErrors = validateProduct(row, index + 1);
      allErrors = [...allErrors, ...rowErrors];
    });

    return allErrors;
  };

  const parseFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      } else if (file.name.match(/\.(xlsx|xls)$/)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert Excel dates to proper format during parsing
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              raw: false, // This ensures dates are formatted as strings
              dateNF: "yyyy-mm-dd", // Specify the date format we want
            });

            // If dates still come as serial numbers, we'll need to convert them
            const processedData = jsonData.map((item: any) => {
              if (item.expiry_date && typeof item.expiry_date === "number") {
                // Convert Excel serial number to JS date
                const excelDate = item.expiry_date;
                const jsDate = XLSX.SSF.parse_date_code(excelDate);

                // Format as YYYY-MM-DD
                const date = new Date(
                  jsDate.y,
                  jsDate.m - 1, // months are 0-indexed in JS
                  jsDate.d
                );

                // Format to YYYY-MM-DD
                const formattedDate = moment(date).format("YYYY-MM-DD");
                return { ...item, expiry_date: formattedDate };
              }
              return item;
            });

            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(
          new Error("Unsupported file type. Please upload a CSV or Excel file.")
        );
      }
    });
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    setFile(file);
    setIsLoading(true);

    try {
      const parsedData = await parseFile(file);
      const errors = validateCsvData(parsedData);

      setValidationErrors(errors);

      const products = parsedData.map((item: any) => ({
        name: item.name || "",
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "",
        low_stock_threshold:
          item.low_stock_threshold !== undefined
            ? Number(item.low_stock_threshold)
            : undefined,
        cost_price: Number(item.cost_price) || 0,
        selling_price: Number(item.selling_price) || 0,
        sku: item.sku || undefined,
        expiry_date: item.expiry_date
          ? formatDate(item.expiry_date) || undefined
          : undefined,
      }));

      setPreviewData(products);
      setIsPreviewMode(true);
    } catch (error) {
      console.error("Error parsing file:", error);
      setValidationErrors([
        {
          row: 0,
          field: "file",
          message:
            error instanceof Error
              ? error.message
              : "Error parsing file. Please check the format.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = () => {
    if (validationErrors.length > 0) {
      setApiError("Please fix validation errors before submitting");
      return;
    }
    if (!business_id || !file) {
      setApiError("Missing required information");
      return;
    }

    setApiError(null);
    const formData = new FormData();
    formData.append("file", file);
    uploadBulkProducts({ businessId: business_id, file: formData });
  };

  const reset = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setIsPreviewMode(false);
    setApiError(null);
    setIsSuccess(false);
  };

  const generateExampleCsv = (): string => {
    const headers = [
      "name",
      "quantity",
      "unit",
      "low_stock_threshold",
      "cost_price",
      "selling_price",
      "sku",
      "expiry_date",
    ].join(",");

    const exampleRows = [
      ["Product A", "100", "Pcs", "", "15.00", "25.00", "", "2025-12-31"],
      ["Product B", "50", "Box", "5", "20.00", "35.00", "PROD-B", "2026-01-30"],
      ["Product C", "75", "Kg", "", "10.50", "18.99", "", "2025-06-15"],
    ].map((row) => row.join(","));

    return [headers, ...exampleRows].join("\n");
  };

  const generateExampleExcel = (): Blob => {
    const exampleData = [
      {
        name: "Product A",
        quantity: 100,
        unit: "Pcs",
        low_stock_threshold: "",
        cost_price: 15.0,
        selling_price: 25.0,
        sku: "",
        expiry_date: "2025-12-31",
      },
      {
        name: "Product B",
        quantity: 50,
        unit: "Box",
        low_stock_threshold: 5,
        cost_price: 20.0,
        selling_price: 35.0,
        sku: "PROD-B",
        expiry_date: "2026-01-30",
      },
      {
        name: "Product C",
        quantity: 75,
        unit: "Kg",
        low_stock_threshold: "",
        cost_price: 10.5,
        selling_price: 18.99,
        sku: "",
        expiry_date: "2025-06-15",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  const downloadExampleCsv = () => {
    const csvContent = generateExampleCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "example_product_upload.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExampleExcel = () => {
    const blob = generateExampleExcel();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "example_product_upload.xlsx");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    file,
    isLoading,
    previewData,
    validationErrors,
    isPreviewMode,
    isPending,
    apiError,
    isSuccess,
    handleFileSelect,
    handleUploadSubmit,
    reset,
    downloadExampleCsv,
    downloadExampleExcel,
  };
};
