import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddProductMutation } from "@/api/products/add-product";
import { useEditProductMutation } from "@/api/products/edit-product";
import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import { useFetchProductTransactionsQuery } from "@/api/products/get-transactions-history";
import { useFetchTransferHistoryQuery } from "@/api/products/transfer-history";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";

// ============================================================
// SCHEMAS
// ============================================================

const variationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variation name is required"),
  values: z.array(z.string()).min(1, "At least one value is required"),
});

const productVariationSchema = z.object({
  id: z.string(),
  combination: z.string(),
  cost_price: z.string().default(""),
  selling_price: z.string().default(""),
  quantity: z.string().default(""),
  status: z.string().default("IN-STOCK"),
  discount: z.string().default(""),
  low_stock_threshold: z.string().default(""),
  discount_threshold: z.string().default(""),
  expiry_date: z.string().default(""),
});

const createProductSchema = (isEditMode: boolean) => {
  const baseSchema = z.object({
    item_name: z.string().min(1, "Item name is required"),
    image: z
      .union([
        z
          .instanceof(File)
          .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            "File size must be less than 5MB"
          )
          .refine(
            (file) =>
              ["image/jpeg", "image/png", "image/webp"].includes(file.type),
            "Only .jpg, .png, and .webp formats are supported"
          ),
        z.string(),
        z.undefined(),
      ])
      .optional(),
    sku: z.string().default(""),
    category: z.string().default(""),
    expiry_date: z.string().default(""),
    supplier: z.string().default(""),
    product_unit: z.string().default(""),
    payment_method: z.string().default(""),
    type: z.string().default(""),
    percentage_discount: z.string().default(""),
    due_date: z.string().default(""),
    amount_paid: z.string().default(""),
    variation_type: z.enum(["single", "multiple"]).default("single"),
    variations: z.array(variationSchema).default([]),
    product_variations: z.array(productVariationSchema).default([]),
    stock_quantity: z.string().default(""),
    low_stock_tresh: z.string().default(""),
    stock_status: z.string().default("IN-STOCK"),
    cost_price: z.string().default(""),
    selling_price: z.string().default(""),
    discount_value: z.string().default(""),
    discount_threshold: z.string().default(""),
  });

  return baseSchema.superRefine((data, ctx) => {
    if (data.variation_type === "single" && !isEditMode) {
      if (!data.stock_quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stock Quantity is required",
          path: ["stock_quantity"],
        });
      }
      if (!data.low_stock_tresh) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Low Stock Threshold is required",
          path: ["low_stock_tresh"],
        });
      }
      if (!data.stock_status) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stock Status is required",
          path: ["stock_status"],
        });
      }
      if (!data.cost_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unit Cost Price is required",
          path: ["cost_price"],
        });
      }
      if (!data.selling_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unit Selling Price is required",
          path: ["selling_price"],
        });
      }
    }

    if (data.variation_type === "multiple") {
      if (data.variations.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one variation type is required",
          path: ["variations"],
        });
      }

      data.product_variations.forEach((variation, index) => {
        if (!variation.cost_price || variation.cost_price === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cost price is required for all variations",
            path: ["product_variations", index, "cost_price"],
          });
        }
        if (!variation.selling_price || variation.selling_price === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selling price is required for all variations",
            path: ["product_variations", index, "selling_price"],
          });
        }
        if (!variation.quantity || variation.quantity === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Quantity is required for all variations",
            path: ["product_variations", index, "quantity"],
          });
        }
        if (!variation.status || variation.status === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Status is required for all variations",
            path: ["product_variations", index, "status"],
          });
        }
      });
    }

    if (!isEditMode) {
      if (data.payment_method === "CREDIT" && !data.due_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Due date is required for credit payment",
          path: ["due_date"],
        });
      }

      if (data.payment_method === "PART") {
        if (!data.amount_paid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Amount paid is required for partial payment",
            path: ["amount_paid"],
          });
        }
        if (!data.due_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Due date is required for partial payment",
            path: ["due_date"],
          });
        }
      }
    }
  });
};

type ProductSchema = ReturnType<typeof createProductSchema>;
export type ProductFormValues = z.infer<ProductSchema>;

interface Variation {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariation {
  id: string;
  combination: string;
  cost_price: string;
  selling_price: string;
  quantity: string;
  status: string;
  discount: string;
  low_stock_threshold: string;
  discount_threshold: string;
  expiry_date: string;
}

// ============================================================
// HELPER FUNCTION TO EXTRACT VARIATIONS FROM API DATA
// ============================================================
const extractVariationsFromAPI = (variations: any[]): Variation[] => {
  if (!variations || variations.length === 0) return [];

  // Extract variation types from combination names
  // Example: "Red / 100" -> Color: [Red], Size: [100]
  const variationMap = new Map<string, Set<string>>();

  variations.forEach((v) => {
    const parts = v.name.split(" / ").map((p: string) => p.trim());

    parts.forEach((part: string, index: number) => {
      // Determine variation type based on position or content
      let variationType: string;

      if (index === 0) {
        // First part is typically Color
        variationType = "Color";
      } else if (index === 1) {
        // Second part is typically Size
        variationType = "Size";
      } else {
        variationType = `Variation ${index + 1}`;
      }

      if (!variationMap.has(variationType)) {
        variationMap.set(variationType, new Set());
      }
      variationMap.get(variationType)?.add(part);
    });
  });

  // Convert map to array format
  return Array.from(variationMap.entries()).map(([name, valuesSet]) => ({
    id: `variation-${Date.now()}-${name}`,
    name,
    values: Array.from(valuesSet),
  }));
};

// ============================================================
// MAIN HOOK
// ============================================================

export const useAddNewProductHook = ({
  id,
  page,
  handleOpenNotSubscribeModal,
}: {
  id?: string;
  handleOpenNotSubscribeModal?: () => void;
  page?: any;
}) => {
  const params = useParams();
  const { user } = useUserRole();
  const router = useRouter();

  const productId = id || params.id;
  const business_id = useBusinessStore((state: any) => state.business_id);
  const isEditMode = !!productId;
  const isUserSubscribed = useIsUserSubscribeStore(
    (state: any) => state.is_subscribed
  );
  const queryClient = useQueryClient();

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const { data: ProductData, isLoading: ProductDataLoading } =
    useFetchProductByIdQuery(productId, { enabled: isEditMode });

  console.log("product data", ProductData);

  const { data: ProductTransactionData, isLoading: ProductTransactionLoading } =
    useFetchProductTransactionsQuery({
      params: { page, limit: 30, id: productId },
      enabled: isEditMode,
      staleTime: 1000 * 60 * 5,
    });

  const { data: TransferHistoryData, isLoading: TransferHistoryLoading } =
    useFetchTransferHistoryQuery(productId, { enabled: !!productId });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: { id: business_id, type: "PRODUCT" },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5,
    });

  const { data: SupplierData, isLoading: SupplierLoading } =
    useFetchSupplierDataQuery(business_id);

  // ============================================================
  // MUTATIONS
  // ============================================================

  const { mutate: addProduct, isPending: addProductPending } =
    useAddProductMutation({ businessId: business_id || "" });

  const { mutate: editProduct, isPending: editProductPending } =
    useEditProductMutation({ productId: productId || "" });

  // ============================================================
  // FORM SETUP
  // ============================================================

  const schema = createProductSchema(isEditMode);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema) as Resolver<ProductFormValues>,
    defaultValues: {
      item_name: "",
      sku: "",
      category: "",
      expiry_date: "",
      image: undefined,
      supplier: "",
      stock_quantity: "",
      low_stock_tresh: "",
      stock_status: "IN-STOCK",
      product_unit: "",
      cost_price: "",
      selling_price: "",
      payment_method: "",
      discount_value: "",
      discount_threshold: "",
      type: "",
      percentage_discount: "",
      due_date: "",
      amount_paid: "",
      variation_type: "single",
      variations: [],
      product_variations: [],
    },
    mode: "onChange",
  });

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getCategoryByName = useCallback(
    (name: string) => {
      if (!CategoriesData?.data) return undefined;
      const category = CategoriesData.data.find(
        (category: any) => category.name === name
      );
      return category?.id;
    },
    [CategoriesData]
  );

  const getSupplierByName = useCallback(
    (name: string) => {
      if (!SupplierData?.data?.results?.data) return undefined;
      const supplier = SupplierData.data.results.data.find(
        (supplier: any) => supplier.name === name
      );
      return supplier?.id;
    },
    [SupplierData]
  );

  const generateProductVariations = useCallback(
    (variations: Variation[]): ProductVariation[] => {
      if (variations.length === 0) return [];

      const generateCombinations = (arrays: string[][]): string[][] => {
        if (arrays.length === 0) return [[]];
        const [first, ...rest] = arrays;
        const restCombinations = generateCombinations(rest);
        return first.flatMap((value) =>
          restCombinations.map((combination) => [value, ...combination])
        );
      };

      const valueArrays = variations.map((v) => v.values);
      const combinations = generateCombinations(valueArrays);

      return combinations.map((combination, index) => ({
        id: `variation-${Date.now()}-${index}`,
        combination: combination.join(" / "),
        cost_price: "",
        selling_price: "",
        quantity: "",
        status: "IN-STOCK",
        discount: "",
        low_stock_threshold: "",
        discount_threshold: "",
        expiry_date: "",
      }));
    },
    []
  );

  // ============================================================
  // RESET FORM WITH PRODUCT DATA (EDIT MODE)
  // ============================================================

  useEffect(() => {
    if (
      isEditMode &&
      !ProductDataLoading &&
      ProductData?.data &&
      CategoriesData &&
      SupplierData
    ) {
      const itemsData = ProductData.data;

      // Check if this is a product with variations
      const hasVariations =
        itemsData.variations && itemsData.variations.length > 0;

      if (hasVariations) {
        // MULTIPLE VARIATIONS FLOW
        const extractedVariations = extractVariationsFromAPI(
          itemsData.variations
        );

        const productVariations = itemsData.variations.map((v: any) => ({
          id: v.id || "",
          combination: v.name || "",
          cost_price: v.cost_price ? String(v.cost_price) : "",
          selling_price: v.selling_price ? String(v.selling_price) : "",
          quantity: v.quantity ? String(v.quantity) : "",
          status: v.status || "IN-STOCK",
          discount: v.discount ? String(v.discount) : "",
          low_stock_threshold: v.low_stock_threshold
            ? String(v.low_stock_threshold)
            : "",
          discount_threshold: v.discount_threshold
            ? String(v.discount_threshold)
            : "",
          expiry_date: v.expiry_date || "",
        }));

        form.reset({
          item_name: itemsData.name || "",
          sku: itemsData.sku || "",
          category: getCategoryByName(itemsData.category) || "",
          expiry_date: itemsData.expiry_date || "",
          image: itemsData.image || undefined,
          supplier: getSupplierByName(itemsData.supplier) || "",
          product_unit: itemsData.unit || "",
          payment_method: "",
          type: "",
          percentage_discount: "",
          due_date: "",
          amount_paid: "",
          variation_type: "multiple",
          variations: extractedVariations,
          product_variations: productVariations,
          stock_quantity: "",
          low_stock_tresh: "",
          stock_status: "IN-STOCK",
          cost_price: "",
          selling_price: "",
          discount_value: "",
          discount_threshold: "",
        });
      } else {
        // SINGLE PRODUCT FLOW
        form.reset({
          item_name: itemsData.name || "",
          sku: itemsData.sku || "",
          category: getCategoryByName(itemsData.category) || "",
          expiry_date: itemsData.expiry_date || "",
          image: itemsData.image || undefined,
          supplier: getSupplierByName(itemsData.supplier) || "",
          stock_quantity: itemsData.quantity ? String(itemsData.quantity) : "",
          low_stock_tresh: itemsData.low_stock_threshold
            ? String(itemsData.low_stock_threshold)
            : "",
          stock_status: itemsData.status || "IN-STOCK",
          product_unit: itemsData.unit || "",
          cost_price: itemsData.cost_price ? String(itemsData.cost_price) : "",
          selling_price: itemsData.selling_price
            ? String(itemsData.selling_price)
            : "",
          discount_value: itemsData.discount ? String(itemsData.discount) : "",
          discount_threshold: itemsData.discount_threshold
            ? String(itemsData.discount_threshold)
            : "",
          payment_method: "",
          type: "",
          percentage_discount: "",
          due_date: "",
          amount_paid: "",
          variation_type: "single",
          variations: [],
          product_variations: [],
        });
      }
    }
  }, [
    ProductData,
    ProductDataLoading,
    form,
    isEditMode,
    CategoriesData,
    SupplierData,
    getCategoryByName,
    getSupplierByName,
  ]);

  // ============================================================
  // FORM SUBMISSION
  // ============================================================

  const onSubmit = async (values: ProductFormValues) => {
    if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
      handleOpenNotSubscribeModal?.();
      return;
    }
    if (!business_id) return;

    const formData = new FormData();

    formData.append("name", values.item_name);

    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    const appendIfNotEmpty = (fieldName: string, value: string | undefined) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(fieldName, value);
      }
    };

    appendIfNotEmpty("sku", values.sku);
    appendIfNotEmpty("category_id", values.category);
    appendIfNotEmpty("supplier_id", values.supplier);
    appendIfNotEmpty("unit", values.product_unit);
    appendIfNotEmpty("payment_method", values.payment_method);
    appendIfNotEmpty("discount_type", values.type);
    appendIfNotEmpty("percentage_discount", values.percentage_discount);

    if (values.expiry_date) {
      appendIfNotEmpty(
        "expiry_date",
        moment(values.expiry_date).format("YYYY-MM-DD")
      );
    }

    if (values.variation_type === "single") {
      appendIfNotEmpty("quantity", values.stock_quantity);
      appendIfNotEmpty("low_stock_threshold", values.low_stock_tresh);
      appendIfNotEmpty("status", values.stock_status);
      appendIfNotEmpty("cost_price", values.cost_price);
      appendIfNotEmpty("selling_price", values.selling_price);
      appendIfNotEmpty("discount", values.discount_value);
      appendIfNotEmpty("discount_threshold", values.discount_threshold);
    } else {
      const variationInputs = values.product_variations.map((variation) => {
        const baseVariation: any = {
          name: variation.combination,
          cost_price: variation.cost_price,
          selling_price: variation.selling_price,
          quantity: variation.quantity,
          low_stock_threshold: variation.low_stock_threshold || "",
          discount_threshold: variation.discount_threshold || "",
          expiry_date: variation.expiry_date
            ? moment(variation.expiry_date).format("YYYY-MM-DD")
            : "",
          status: variation.status,
          discount: variation.discount || "",
        };

        // ✅ ADD ID FOR EDIT MODE (only for existing variations)
        if (
          isEditMode &&
          variation.id &&
          !variation.id.startsWith("variation-")
        ) {
          baseVariation.id = variation.id;
        }

        return baseVariation;
      });

      formData.append("variation_inputs", JSON.stringify(variationInputs));
    }

    if (values.payment_method === "CREDIT" && values.due_date) {
      appendIfNotEmpty(
        "due_date",
        moment(values.due_date).format("YYYY-MM-DD")
      );
    }

    if (values.payment_method === "PART") {
      appendIfNotEmpty("amount_paid", values.amount_paid);
      if (values.due_date) {
        appendIfNotEmpty(
          "due_date",
          moment(values.due_date).format("YYYY-MM-DD")
        );
      }
    }

    if (isEditMode) {
      editProduct(
        { payload: formData, productId: productId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [queryKey.inventory.getAllInventory],
            });
            router.back();
          },
        }
      );
    } else {
      addProduct(
        { payload: formData, businessId: business_id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [queryKey.inventory.getAllInventory],
            });
            router.back();
          },
        }
      );
    }
  };

  // ============================================================
  // OPTIONS
  // ============================================================

  const unitTypeOptions = [
    { label: "Pieces", value: "Pcs" },
    { label: "Kilograms", value: "Kg" },
    { label: "Bags", value: "Bag" },
    { label: "Boxes", value: "Box" },
    { label: "Cartons", value: "Ctn" },
    { label: "Limited", value: "Ltd" },
    { label: "Pairs", value: "Pair" },
    { label: "Grams", value: "Gram" },
    { label: "Feet", value: "Feet" },
    { label: "Rolls", value: "Roll" },
    { label: "Meters", value: "Meter" },
    { label: "Milliliters", value: "Mil" },
    { label: "Bottles", value: "Bottle" },
    { label: "Bundles", value: "Bundle" },
    { label: "Milliliters", value: "Ml" },
    { label: "Tons", value: "Ton" },
    { label: "Dozens", value: "Dozen" },
    { label: "Milligrams", value: "Mg" },
    { label: "Grains", value: "Gr" },
  ];

  const StatusTypeOptions = [
    { label: "IN-STOCK", value: "IN-STOCK" },
    { label: "LOW", value: "LOW" },
    { label: "OUT-OF-STOCK", value: "OUT-OF-STOCK" },
  ];

  const paymentMethodOptions = [
    { label: "Full Payment", value: "FULL" },
    { label: "Credit", value: "CREDIT" },
    { label: "Partial Payment", value: "PART" },
  ];

  return {
    form,
    onSubmit,
    loading: (isEditMode && ProductDataLoading) || form.formState.isLoading,
    addProductPending,
    editProductPending,
    ProductDataLoading,
    ProductTransactionLoading,
    TransferHistoryLoading,
    CategoriesDataLoading,
    SupplierLoading,
    ProductData,
    ProductTransactionData,
    TransferHistoryData,
    CategoriesData,
    SupplierData,
    unitTypeOptions,
    StatusTypeOptions,
    paymentMethodOptions,
    generateProductVariations,
    isEditMode,
    business_id,
    productId,
  };
};
