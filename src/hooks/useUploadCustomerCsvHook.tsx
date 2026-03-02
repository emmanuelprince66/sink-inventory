import { useUploadCustomersMutation } from "@/api/customer/upload-bulk-customer";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useState } from "react";
import * as XLSX from "xlsx";

// Define the customer structure based on required columns
export interface CustomerItem {
  name: string;
  phone: string;
  email: string;
  [key: string]: any;
}

// Error type for validation
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const useUploadCustomerCsvHook = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [previewData, setPreviewData] = useState<CustomerItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const formatApiError = (error: any): string => {
    if (!error) return "Unknown error";
    if (typeof error === "string") return error.trim();
    if (error.message) return formatApiError(error.message);
    if (error.error) return formatApiError(error.error);

    if (Array.isArray(error)) {
      return error
        .map((e) => formatApiError(e))
        .filter((msg) => msg)
        .join("\n");
    }

    if (typeof error === "object") {
      try {
        return JSON.stringify(error);
      } catch {
        return "Error object could not be stringified";
      }
    }

    return String(error);
  };

  const business_id = useBusinessStore((state) => state.business_id);

  const { mutate: uploadBulkCustomers, isPending } = useUploadCustomersMutation(
    {
      businessId: business_id,
      onSuccess: (data) => {
        if (data.success) {
          setIsSuccess(true);

          queryClient.invalidateQueries({
            queryKey: [queryKey.customers.getAllCustomers],
          });
          router.push("/customers");
          setApiError(null);
        } else {
          setApiError(
            formatApiError(data.message || data.error || "Upload failed"),
          );
          setIsSuccess(false);
        }
      },
      onError: (error) => {
        setApiError(formatApiError(error));
        setIsSuccess(false);
      },
    },
  );

  const validateCustomer = (
    customer: any,
    rowIndex: number,
  ): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredFields = ["name", "phone", "email"];

    // Check required fields
    requiredFields.forEach((field) => {
      if (!customer[field]) {
        errors.push({ row: rowIndex, field, message: `${field} is required` });
      }
    });

    // Validate email format
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push({
        row: rowIndex,
        field: "email",
        message: "Invalid email format",
      });
    }

    return errors;
  };

  const validateCsvData = (data: any[]): ValidationError[] => {
    let allErrors: ValidationError[] = [];
    const requiredColumns = ["name", "phone", "email"];

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col),
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
      const rowErrors = validateCustomer(row, index + 1);
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
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(
          new Error(
            "Unsupported file type. Please upload a CSV or Excel file.",
          ),
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

      console.log("errors", errors);

      setValidationErrors(errors);

      const customers = parsedData.map((item: any) => ({
        name: item.name || "",
        phone: item.phone || "",
        email: item.email || "",
      }));

      setPreviewData(customers);
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
    uploadBulkCustomers({ businessId: business_id, file: formData });
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
    const headers = ["name", "phone", "email"].join(",");

    const exampleRows = [
      ["John Doe", "+2345678944440", "john@example.com"],
      ["Jane Smith", "+2344447654321", "jane@example.com"],
      ["Bob Johnson", "+2342444334455", "bob@example.com"],
    ].map((row) => row.join(","));

    return [headers, ...exampleRows].join("\n");
  };

  const generateExampleExcel = (): Blob => {
    const exampleData = [
      {
        name: "John Doe",
        phone: "+2345554567890",
        email: "john@example.com",
      },
      {
        name: "Jane Smith",
        phone: "+234557654321",
        email: "jane@example.com",
      },
      {
        name: "Bob Johnson",
        phone: "+23444334455",
        email: "bob@example.com",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
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
    link.setAttribute("download", "example_customer_upload.csv");
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
    link.setAttribute("download", "example_customer_upload.xlsx");
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
