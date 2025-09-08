// utils/barcodeUtils.ts

/**
 * Validate if a string looks like a valid barcode
 */
export const isValidBarcode = (code: string): boolean => {
  // Remove any whitespace
  const cleanCode = code.trim();

  // Check if it's not empty and contains only alphanumeric characters and common barcode symbols
  if (!cleanCode || cleanCode.length < 3) {
    return false;
  }

  // Allow alphanumeric characters, hyphens, and periods
  const barcodePattern = /^[A-Za-z0-9\-\.]+$/;
  return barcodePattern.test(cleanCode);
};

/**
 * Format barcode for display
 */
export const formatBarcode = (code: string): string => {
  return code.trim().toUpperCase();
};

/**
 * Common barcode types and their typical lengths
 */
export const BARCODE_TYPES = {
  UPC_A: { length: 12, name: "UPC-A" },
  UPC_E: { length: 8, name: "UPC-E" },
  EAN_13: { length: 13, name: "EAN-13" },
  EAN_8: { length: 8, name: "EAN-8" },
  CODE_39: { minLength: 1, maxLength: 43, name: "Code 39" },
  CODE_128: { minLength: 1, maxLength: 48, name: "Code 128" },
  ITF: { length: 14, name: "ITF-14" },
} as const;

/**
 * Detect possible barcode type based on length and format
 */
export const detectBarcodeType = (code: string): string | null => {
  const cleanCode = code.trim();
  const length = cleanCode.length;

  // Check for numeric-only barcodes first
  const isNumeric = /^\d+$/.test(cleanCode);

  if (isNumeric) {
    switch (length) {
      case 8:
        return BARCODE_TYPES.UPC_E.name;
      case 12:
        return BARCODE_TYPES.UPC_A.name;
      case 13:
        return BARCODE_TYPES.EAN_13.name;
      case 14:
        return BARCODE_TYPES.ITF.name;
      default:
        if (length >= 1 && length <= 43) {
          return BARCODE_TYPES.CODE_39.name;
        }
    }
  } else {
    // Alphanumeric codes
    if (length >= 1 && length <= 43) {
      return BARCODE_TYPES.CODE_39.name;
    }
    if (length >= 1 && length <= 48) {
      return BARCODE_TYPES.CODE_128.name;
    }
  }

  return null;
};
