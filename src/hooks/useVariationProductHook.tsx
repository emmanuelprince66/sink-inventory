import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

// Types
interface Variation {
  id: string;
  name?: string;
  values: string[];
  [key: string]: any;
}

interface ProductVariation {
  id: string;
  combination: string;
  cost_price?: string;
  selling_price?: string;
  quantity?: string;
  status?: string;
  discount?: string;
  low_stock_threshold?: string;
  [key: string]: any;
}

interface FormData {
  variation_type?: string;
  variations: Variation[];
  product_variations: ProductVariation[];
  [key: string]: any;
}

type VariationField =
  | "cost_price"
  | "selling_price"
  | "quantity"
  | "status"
  | "discount"
  | "low_stock_threshold";

interface UseVariationProductHookProps {
  form: UseFormReturn<FormData>;
  generateProductVariations: (variations: Variation[]) => ProductVariation[];
  StatusTypeOptions: Array<{ value: string; label: string }>;
}

// Helper function to format field labels
const formatFieldLabel = (field: VariationField): string => {
  const fieldLabels: Record<VariationField, string> = {
    cost_price: "Cost Price",
    selling_price: "Selling Price",
    quantity: "Quantity",
    status: "Status",
    discount: "Discount",
    low_stock_threshold: "Low Stock Threshold",
  };
  return fieldLabels[field];
};

export const useVariationProductHook = ({
  form,
  generateProductVariations,
  StatusTypeOptions,
}: UseVariationProductHookProps) => {
  // Core variation sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedVariationType, setSelectedVariationType] = useState("");
  const [newVariationValues, setNewVariationValues] = useState<string[]>([""]);
  const [editingVariationIndex, setEditingVariationIndex] = useState<
    number | null
  >(null);

  // Bulk edit state
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [bulkEditField, setBulkEditField] = useState<VariationField | "">("");
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [showBulkEditInput, setShowBulkEditInput] = useState(false);
  const [bulkEditError, setBulkEditError] = useState<string | null>(null);

  // Edit all modal state
  const [showEditAllModal, setShowEditAllModal] = useState(false);
  const [editAllData, setEditAllData] = useState({
    cost_price: "",
    selling_price: "",
    quantity: "",
    status: "IN-STOCK",
    discount: "",
    low_stock_threshold: "",
  });

  // Watch variation type
  const variationType = form.watch("variation_type") || "single";

  // Field arrays
  const {
    fields: variations,
    append: appendVariation,
    remove: removeVariation,
    update: updateVariation,
  } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const { fields: productVariations, replace: replaceProductVariations } =
    useFieldArray({
      control: form.control,
      name: "product_variations",
    });

  // Memoize product variations to prevent unnecessary recalculations
  const memoizedProductVariations = useMemo(() => {
    if (variationType === "multiple" && variations.length > 0) {
      return generateProductVariations(variations as Variation[]);
    }
    return [];
  }, [variations, variationType, generateProductVariations]);

  // Update product variations when variations change
  useEffect(() => {
    if (variationType === "multiple" && variations.length > 0) {
      const currentVariations = form.getValues("product_variations") || [];
      const newCombinations = generateProductVariations(
        variations as Variation[]
      );

      // Merge existing data with new combinations
      const mergedVariations = newCombinations.map((newVar) => {
        const existing = currentVariations.find(
          (c: ProductVariation) => c.combination === newVar.combination
        );
        return existing || newVar;
      });

      // Only update if there are actual changes
      const hasChanges =
        JSON.stringify(currentVariations) !== JSON.stringify(mergedVariations);
      if (hasChanges) {
        replaceProductVariations(mergedVariations);
      }
    } else if (variationType === "single") {
      // Clear product variations when switching to single type
      replaceProductVariations([]);
    }
  }, [
    variationType,
    variations,
    form,
    generateProductVariations,
    replaceProductVariations,
  ]);

  // Variation Sheet Functions
  const handleAddVariation = useCallback(
    (type: string) => {
      const existingIndex = variations.findIndex((v) => v.name === type);
      if (existingIndex >= 0) {
        const existingValues = variations[existingIndex].values;
        setNewVariationValues([...existingValues, ""]);
        setEditingVariationIndex(existingIndex);
      } else {
        setNewVariationValues([""]);
        setEditingVariationIndex(null);
      }
      setSelectedVariationType(type);
      setIsSheetOpen(true);
    },
    [variations]
  );

  const handleSaveVariation = useCallback(() => {
    const filteredValues = newVariationValues.filter((v) => v.trim() !== "");
    if (!selectedVariationType || filteredValues.length === 0) return;

    if (editingVariationIndex !== null) {
      // Update existing variation
      updateVariation(editingVariationIndex, {
        ...variations[editingVariationIndex],
        values: filteredValues,
      });
    } else {
      // Add new variation
      appendVariation({
        id: Date.now().toString(),
        name: selectedVariationType,
        values: filteredValues,
      });
    }

    resetVariationSheet();
  }, [
    newVariationValues,
    selectedVariationType,
    editingVariationIndex,
    updateVariation,
    variations,
    appendVariation,
  ]);

  const handleDeleteVariation = useCallback(
    (index: number) => {
      removeVariation(index);
    },
    [removeVariation]
  );

  const handleEditVariation = useCallback(
    (index: number) => {
      const variation = variations[index];
      setSelectedVariationType(variation.name || "");
      setNewVariationValues([...variation.values, ""]);
      setEditingVariationIndex(index);
      setIsSheetOpen(true);
    },
    [variations]
  );

  const addVariationValue = useCallback(() => {
    setNewVariationValues((prev) => [...prev, ""]);
  }, []);

  const updateVariationValue = useCallback((index: number, value: string) => {
    setNewVariationValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const removeVariationValue = useCallback((index: number) => {
    setNewVariationValues((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Bulk Edit Functions
  const handleSelectAllVariations = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedVariations(productVariations.map((v: any) => v.id));
      } else {
        setSelectedVariations([]);
      }
    },
    [productVariations]
  );

  const handleSelectVariation = useCallback(
    (variationId: string, checked: boolean) => {
      setSelectedVariations((prev) => {
        if (checked) {
          return [...prev, variationId];
        } else {
          return prev.filter((id) => id !== variationId);
        }
      });
    },
    []
  );

  const handleBulkEdit = useCallback(
    (field: VariationField) => {
      setBulkEditField(field);
      setBulkEditError(null);

      // Pre-populate with first selected variation's value
      const firstSelectedVariation = productVariations.find((v: any) =>
        selectedVariations.includes(v.id)
      );
      if (firstSelectedVariation) {
        setBulkEditValue(String((firstSelectedVariation as any)[field] || ""));
      } else {
        setBulkEditValue("");
      }
      setShowBulkEditInput(true);
    },
    [productVariations, selectedVariations]
  );

  const validateNumericField = useCallback(
    (value: string, fieldName: string): string | null => {
      if (!value.trim()) return null; // Allow empty values

      const cleanValue = value.replace(/,/g, "");
      if (!/^\d*\.?\d*$/.test(cleanValue)) {
        return `Invalid ${fieldName}: Please enter a valid number`;
      }

      const numValue = Number(cleanValue);
      if (numValue < 0) {
        return `Invalid ${fieldName}: Please enter a positive number`;
      }

      return null;
    },
    []
  );

  const applyBulkEdit = useCallback(() => {
    if (!bulkEditField) {
      setBulkEditError("Please select a field to edit");
      return;
    }

    // Validate numeric fields
    if (
      [
        "cost_price",
        "selling_price",
        "quantity",
        "discount",
        "low_stock_threshold",
      ].includes(bulkEditField)
    ) {
      const error = validateNumericField(
        bulkEditValue,
        formatFieldLabel(bulkEditField)
      );
      if (error) {
        setBulkEditError(error);
        return;
      }
    }

    // Apply the bulk edit
    productVariations.forEach((variation: any, index: number) => {
      if (selectedVariations.includes(variation.id)) {
        form.setValue(
          `product_variations.${index}.${bulkEditField}` as any,
          bulkEditValue
        );
      }
    });

    resetBulkEdit();
  }, [
    bulkEditField,
    bulkEditValue,
    validateNumericField,
    productVariations,
    selectedVariations,
    form,
  ]);

  // Edit All Modal Functions
  const handleEditAll = useCallback(() => {
    // Pre-populate with first selected variation's data or defaults
    const firstSelectedVariation = productVariations.find((v: any) =>
      selectedVariations.includes(v.id)
    );

    if (firstSelectedVariation) {
      const variation = firstSelectedVariation as any;
      setEditAllData({
        cost_price: variation.cost_price || "",
        selling_price: variation.selling_price || "",
        quantity: variation.quantity || "",
        status: variation.status || "IN-STOCK",
        discount: variation.discount || "",
        low_stock_threshold: variation.low_stock_threshold || "",
      });
    } else {
      // Reset to defaults if no selection
      setEditAllData({
        cost_price: "",
        selling_price: "",
        quantity: "",
        status: "IN-STOCK",
        discount: "",
        low_stock_threshold: "",
      });
    }
    setShowEditAllModal(true);
  }, [productVariations, selectedVariations]);

  const validateEditAllData = useCallback(
    (data: typeof editAllData): string | null => {
      const numericFields = [
        "cost_price",
        "selling_price",
        "quantity",
        "discount",
        "low_stock_threshold",
      ];

      for (const field of numericFields) {
        const value = data[field as keyof typeof data];
        if (value && value !== "") {
          const error = validateNumericField(
            value,
            formatFieldLabel(field as VariationField)
          );
          if (error) return error;
        }
      }
      return null;
    },
    [validateNumericField]
  );

  const applyEditAll = useCallback(() => {
    const validationError = validateEditAllData(editAllData);
    if (validationError) {
      setBulkEditError(validationError);
      return;
    }

    // Apply to selected variations only
    productVariations.forEach((variation: any, index: number) => {
      if (selectedVariations.includes(variation.id)) {
        Object.entries(editAllData).forEach(([field, value]) => {
          if (value !== "") {
            form.setValue(`product_variations.${index}.${field}` as any, value);
          }
        });
      }
    });

    setShowEditAllModal(false);
    setBulkEditError(null);
  }, [
    editAllData,
    validateEditAllData,
    productVariations,
    selectedVariations,
    form,
  ]);

  // Reset Functions
  const resetVariationSheet = useCallback(() => {
    setIsSheetOpen(false);
    setSelectedVariationType("");
    setNewVariationValues([""]);
    setEditingVariationIndex(null);
  }, []);

  const resetBulkEdit = useCallback(() => {
    setShowBulkEditInput(false);
    setBulkEditField("");
    setBulkEditValue("");
    setSelectedVariations([]);
    setBulkEditError(null);
  }, []);

  const resetEditAllModal = useCallback(() => {
    setShowEditAllModal(false);
    setBulkEditError(null);
  }, []);

  const exitBulkEditMode = useCallback(() => {
    setIsBulkEditMode(false);
    resetBulkEdit();
  }, [resetBulkEdit]);

  // Computed values
  const isSaveDisabled = useMemo(() => {
    return (
      !selectedVariationType ||
      newVariationValues.filter((v) => v.trim()).length === 0
    );
  }, [selectedVariationType, newVariationValues]);

  const allVariationsSelected = useMemo(() => {
    return (
      selectedVariations.length === productVariations.length &&
      productVariations.length > 0
    );
  }, [selectedVariations.length, productVariations.length]);

  const hasSelectedVariations = useMemo(() => {
    return selectedVariations.length > 0;
  }, [selectedVariations.length]);

  // Update edit all data
  const updateEditAllData = useCallback((field: string, value: string) => {
    setEditAllData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setBulkEditError(null);
  }, []);

  return {
    // Core state
    variations,
    productVariations,
    variationType,

    // Variation sheet
    isSheetOpen,
    selectedVariationType,
    newVariationValues,
    editingVariationIndex,
    isSaveDisabled,
    setIsSheetOpen,

    // Bulk edit
    isBulkEditMode,
    selectedVariations,
    bulkEditField,
    bulkEditValue,
    showBulkEditInput,
    bulkEditError,
    allVariationsSelected,
    hasSelectedVariations,
    setIsBulkEditMode,
    setBulkEditValue,
    setBulkEditError,

    // Edit all modal
    showEditAllModal,
    editAllData,
    updateEditAllData,

    // Variation sheet functions
    handleAddVariation,
    handleSaveVariation,
    handleDeleteVariation,
    handleEditVariation,
    addVariationValue,
    updateVariationValue,
    removeVariationValue,
    resetVariationSheet,

    // Bulk edit functions
    handleSelectAllVariations,
    handleSelectVariation,
    handleBulkEdit,
    applyBulkEdit,
    exitBulkEditMode,

    // Edit all functions
    handleEditAll,
    applyEditAll,
    resetEditAllModal,

    // Utility
    formatFieldLabel,
    StatusTypeOptions,
  };
};
