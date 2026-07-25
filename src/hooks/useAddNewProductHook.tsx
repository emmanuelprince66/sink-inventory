import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddProductMutation } from "@/api/products/add-product";
import { useEditProductMutation } from "@/api/products/edit-product";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import { useFetchProductTransactionsQuery } from "@/api/products/get-transactions-history";
import { useFetchTransferHistoryQuery } from "@/api/products/transfer-history";
import { handleSubscriptionError } from "@/api/sub/subscription-interceptor";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

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

// Backend limits (from POST /product/business/{id}/ schema).
// Total combined media (images + videos) cannot exceed MAX_PRODUCT_MEDIA.
export const MAX_PRODUCT_MEDIA = 4;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_VIDEO_SIZE_MB = 10;

// Media item: File for newly added uploads, URL string for existing ones on edit.
const mediaItemSchema = z.union([z.instanceof(File), z.string().url()]);

const createProductSchema = (isEditMode: boolean) => {
  const baseSchema = z.object({
    allow_tax: z.boolean().default(false),
    in_house: z.boolean().default(false),
    raw_material: z.boolean().default(false),
    sell_online: z.boolean().default(false),
    // hide_from_pos: z.boolean().default(false),
    watchlist: z.boolean().default(false),
    item_name: z.string().min(1, "Item name is required"),
    // Per-file size validation lives on each array; the combined-count cap
    // (images.length + videos.length <= MAX_PRODUCT_MEDIA) is enforced in
    // the top-level superRefine on the object schema below.
    images: z
      .array(mediaItemSchema)
      .default([])
      .superRefine((items, ctx) => {
        items.forEach((item, index) => {
          if (
            item instanceof File &&
            item.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Each image must be ${MAX_IMAGE_SIZE_MB}MB or smaller`,
              path: [index],
            });
          }
        });
      }),
    videos: z
      .array(mediaItemSchema)
      .default([])
      .superRefine((items, ctx) => {
        items.forEach((item, index) => {
          if (
            item instanceof File &&
            item.size > MAX_VIDEO_SIZE_MB * 1024 * 1024
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Each video must be ${MAX_VIDEO_SIZE_MB}MB or smaller`,
              path: [index],
            });
          }
        });
      }),
    weight: z.string().default(""),
    description: z.string().default(""),
    sku: z.string().default(""),
    category: z.string().default(""),
    expiry_date: z.string().default(""),
    department: z.string().default(""),
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
    // Combined media cap (images + videos).
    const totalMedia = (data.images?.length || 0) + (data.videos?.length || 0);
    if (totalMedia > MAX_PRODUCT_MEDIA) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You can upload at most ${MAX_PRODUCT_MEDIA} media items in total (images + videos).`,
        path: ["images"],
      });
    }

    // Single-product required fields. Enforced for both create AND edit so
    // a user switching from multiple → single during edit must fill these in.
    // (stock_quantity is the one exception — backend keeps quantity in edit
    // mode and won't accept changes here anyway.)
    if (data.variation_type === "single") {
      if (!isEditMode && !data.stock_quantity) {
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
// MEDIA NORMALIZATION
// ============================================================
// The backend returns product media as a single `media` array of
// { id, file, type } where `type` is "IMAGE" | "VIDEO". Split it into the
// two arrays the form/MediaUploader expects. Falls back to the legacy
// single `image` URL when the new shape is absent.
interface ApiMediaItem {
  id: string;
  file: string;
  type: "IMAGE" | "VIDEO" | string;
}

const splitMediaFromResponse = (
  media: unknown,
  legacySingleImage?: unknown,
): { images: string[]; videos: string[] } => {
  if (Array.isArray(media) && media.length > 0) {
    const images: string[] = [];
    const videos: string[] = [];
    for (const item of media as ApiMediaItem[]) {
      const url = typeof item?.file === "string" ? item.file : "";
      if (!url) continue;
      if (item.type === "VIDEO") videos.push(url);
      else images.push(url);
    }
    return { images, videos };
  }
  // Legacy fallback — single image URL only. Some old products return an
  // empty `media: []` even though they still have a real legacy `image`,
  // so an empty array must fall through here too, not just a missing one.
  if (typeof legacySingleImage === "string" && legacySingleImage.length > 0) {
    return { images: [legacySingleImage], videos: [] };
  }
  return { images: [], videos: [] };
};

// ============================================================
// HELPER FUNCTION TO EXTRACT VARIATIONS FROM API DATA
// ============================================================
const extractVariationsFromAPI = (variations: any[]): Variation[] => {
  console.log("🔍 [extractVariationsFromAPI] Input variations:", variations);
  if (!variations || variations.length === 0) return [];

  const variationMap = new Map<string, Set<string>>();

  variations.forEach((v) => {
    // Remove parent product name if it exists (format: "ProductName - Color / Size")
    let variationName = v.name;
    if (variationName.includes(" - ")) {
      variationName = variationName.split(" - ")[1] || variationName;
    }

    const parts = variationName.split(" / ").map((p: string) => p.trim());

    parts.forEach((part: string, index: number) => {
      let variationType: string;

      if (index === 0) {
        variationType = "Color";
      } else if (index === 1) {
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

  const result = Array.from(variationMap.entries()).map(
    ([name, valuesSet]) => ({
      id: `variation-${Date.now()}-${name}`,
      name,
      values: Array.from(valuesSet),
    }),
  );

  console.log("✅ [extractVariationsFromAPI] Extracted variations:", result);
  return result;
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
  const { showToast } = useToast();

  const productId = id || params.id;
  const business_id = useBusinessStore((state: any) => state.business_id);
  const isEditMode = !!productId;
  const isUserSubscribed = useIsUserSubscribeStore(
    (state: any) => state.is_subscribed,
  );
  const queryClient = useQueryClient();

  // Track form initialization state
  const [isFormReady, setIsFormReady] = useState(false);
  const productIdRef = useRef<string | null>(null);

  console.log(
    "🚀 [useAddNewProductHook] Mode:",
    isEditMode ? "EDIT" : "CREATE",
  );
  console.log("🆔 [useAddNewProductHook] Product ID:", productId);
  console.log("🏢 [useAddNewProductHook] Business ID:", business_id);

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const {
    data: ProductData,
    isLoading: ProductDataLoading,
    refetch: refetchProduct,
  } = useFetchProductByIdQuery(productId, { enabled: isEditMode });

  console.log("📦 [ProductData] Fetched product data:", ProductData);

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
    useFetchSupplierDataQuery(business_id, { enabled: !!business_id });

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
      images: [],
      videos: [],
      weight: "",
      description: "",
      supplier: "",
      stock_quantity: "",
      low_stock_tresh: "",
      // hide_from_pos: false,
      stock_status: "IN-STOCK",
      product_unit: "",
      cost_price: "",
      selling_price: "",
      payment_method: "",
      discount_value: "",
      discount_threshold: "",

      allow_tax: false,
      in_house: false,
      raw_material: false,
      sell_online: false,
      watchlist: false,
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
    (name: string | null | undefined) => {
      if (!name || !CategoriesData?.data) return "";
      const category = CategoriesData.data.find(
        (category: any) => category.name === name,
      );
      console.log(`🏷️ [getCategoryByName] "${name}" -> ID:`, category?.id);
      return category?.id || "";
    },
    [CategoriesData],
  );

  const getSupplierByName = useCallback(
    (name: string | null | undefined) => {
      if (!name || !SupplierData?.data?.results?.data) return "";
      const supplier = SupplierData.data.results.data.find(
        (supplier: any) => supplier.name === name,
      );
      console.log(`🚚 [getSupplierByName] "${name}" -> ID:`, supplier?.id);
      return supplier?.id || "";
    },
    [SupplierData],
  );

  const {
    data: DepartmentData,
    isLoading: DepartmentDataLoading,
    refetch: refetchDepartments,
    isRefetching: isRefetchingDepartments,
  } = useFetchDepartmentsQuery(business_id, {
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });
  console.log("DepartmentDatae", DepartmentData);

  // Mirror the category/supplier lookup pattern so the Department select can
  // be hydrated with the existing department ID on edit.
  const getDepartmentByName = useCallback(
    (name: string | null | undefined) => {
      if (!name || !DepartmentData?.data) return "";
      const department = DepartmentData.data.find((d: any) => d.name === name);
      console.log(`🏬 [getDepartmentByName] "${name}" -> ID:`, department?.id);
      return department?.id || "";
    },
    [DepartmentData],
  );
  const generateProductVariations = useCallback(
    (variations: Variation[]): ProductVariation[] => {
      console.log(
        "🎲 [generateProductVariations] Input variations:",
        variations,
      );
      if (variations.length === 0) return [];

      const generateCombinations = (arrays: string[][]): string[][] => {
        if (arrays.length === 0) return [[]];
        const [first, ...rest] = arrays;
        const restCombinations = generateCombinations(rest);
        return first.flatMap((value) =>
          restCombinations.map((combination) => [value, ...combination]),
        );
      };

      const valueArrays = variations.map((v) => v.values);
      const combinations = generateCombinations(valueArrays);

      const result = combinations.map((combination, index) => ({
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

      console.log(
        "✅ [generateProductVariations] Generated combinations:",
        result,
      );
      return result;
    },
    [],
  );

  // ============================================================
  // RESET FORM WITH PRODUCT DATA (EDIT MODE) - FIXED
  // ============================================================

  useEffect(() => {
    // Reset form ready state when product ID changes
    if (productIdRef.current !== productId) {
      console.log("🔄 [useEffect] Product ID changed, resetting form state");
      productIdRef.current = productId as string;
      setIsFormReady(false);
    }

    // Skip if not in edit mode
    if (!isEditMode) {
      setIsFormReady(true);
      return;
    }

    // Wait for critical data to load — including departments so the lookup
    // can resolve the saved department name to an ID for the Select.
    if (ProductDataLoading || CategoriesDataLoading || DepartmentDataLoading) {
      console.log("⏳ [useEffect] Waiting for critical data to load...");
      return;
    }

    // Ensure critical data exists
    if (!ProductData?.data || !CategoriesData || !DepartmentData) {
      console.log("⚠️ [useEffect] Critical data not available yet");
      return;
    }

    console.log("🔄 [useEffect] Starting form reset...");

    const itemsData = ProductData.data;
    console.log("📦 [useEffect] Product data:", itemsData);

    const hasVariations =
      itemsData.variations && itemsData.variations.length > 0;
    console.log("📊 [useEffect] Has variations:", hasVariations);

    if (hasVariations) {
      // MULTIPLE VARIATIONS FLOW
      console.log("🔀 [useEffect] Processing MULTIPLE variations");
      const extractedVariations = extractVariationsFromAPI(
        itemsData.variations,
      );

      const productVariations = itemsData.variations.map(
        (v: any, index: number) => {
          console.log(`📝 [useEffect] Mapping variation ${index}:`, v);

          // Remove parent product name from combination for editing
          let combinationWithoutParent = v.name || "";
          if (combinationWithoutParent.includes(" - ")) {
            combinationWithoutParent =
              combinationWithoutParent.split(" - ")[1] ||
              combinationWithoutParent;
          }

          return {
            id: v.id || "",
            combination: combinationWithoutParent,
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
            watchlist: v.is_watchlist || false,
            sell_online: v.sell_online || false,
            in_house: v.in_house || false,
            raw_material: v.raw_material || false,
          };
        },
      );

      console.log(
        "✅ [useEffect] Product variations mapped:",
        productVariations,
      );

      const categoryId = getCategoryByName(itemsData.category);
      const supplierId = getSupplierByName(itemsData.supplier);
      const departmentId = getDepartmentByName(itemsData.department);

      console.log("🏷️ [useEffect] Resolved category ID:", categoryId);
      console.log("🚚 [useEffect] Resolved supplier ID:", supplierId);
      console.log("🏬 [useEffect] Resolved department ID:", departmentId);

      form.reset(
        {
          item_name: itemsData.name || "",
          sku: itemsData.sku || "",
          category: categoryId,
          department: departmentId,
          expiry_date: itemsData.expiry_date || "",
          images: splitMediaFromResponse(itemsData.media, itemsData.image)
            .images,
          videos: splitMediaFromResponse(itemsData.media).videos,
          weight: itemsData.weight ? String(itemsData.weight) : "",
          description: itemsData.description || "",
          supplier: supplierId,
          product_unit: itemsData.unit || "",
          payment_method: "",
          type: "",
          percentage_discount: "",
          due_date: "",
          amount_paid: "",
          allow_tax: false,
          // hide_from_pos: false,
          in_house: false,
          raw_material: false,
          sell_online: false,
          watchlist: false,
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
        },
        { keepDefaultValues: false },
      );
    } else {
      // SINGLE PRODUCT FLOW
      console.log("📦 [useEffect] Processing SINGLE product");

      const categoryId = getCategoryByName(itemsData.category);
      const supplierId = getSupplierByName(itemsData.supplier);
      const departmentId = getDepartmentByName(itemsData.department);

      console.log("🏷️ [useEffect] Resolved category ID:", categoryId);
      console.log("🚚 [useEffect] Resolved supplier ID:", supplierId);
      console.log("🏬 [useEffect] Resolved department ID:", departmentId);

      form.reset(
        {
          item_name: itemsData.name || "",
          sku: itemsData.sku || "",
          category: categoryId,
          department: departmentId,
          expiry_date: itemsData.expiry_date || "",
          images: splitMediaFromResponse(itemsData.media, itemsData.image)
            .images,
          videos: splitMediaFromResponse(itemsData.media).videos,
          weight: itemsData.weight ? String(itemsData.weight) : "",
          description: itemsData.description || "",
          supplier: supplierId,
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
          allow_tax: itemsData.allow_tax || false,
          // hide_from_pos: itemsData.hide_from_pos || false,
          in_house: itemsData.in_house || false,
          raw_material: itemsData.raw_material || false,
          sell_online: itemsData.sell_online || false,
          watchlist: itemsData.watchlist || false,
        },
        { keepDefaultValues: false },
      );
    }

    console.log("✅ [useEffect] Form reset complete");

    // Mark form as ready AFTER reset completes
    // Use setTimeout to ensure the form state has propagated
    setTimeout(() => {
      setIsFormReady(true);
      console.log("✅ [useEffect] Form marked as ready");

      // Debug log current values
      const currentValues = form.getValues();
      console.log("🔍 [useEffect] Current form values after reset:");
      console.log("  - category:", currentValues.category);
      console.log("  - supplier:", currentValues.supplier);
      console.log("  - product_unit:", currentValues.product_unit);
      console.log("  - expiry_date:", currentValues.expiry_date);
      console.log("  - item_name:", currentValues.item_name);
    }, 0);
  }, [
    ProductData,
    ProductDataLoading,
    CategoriesDataLoading,
    DepartmentDataLoading,
    DepartmentData,
    form,
    isEditMode,
    CategoriesData,
    productId,
    getCategoryByName,
    getSupplierByName,
    getDepartmentByName,
  ]);

  // ============================================================
  // FORM SUBMISSION - IMPROVED
  // ============================================================

  const onSubmit = async (values: ProductFormValues) => {
    console.log("🚀 [onSubmit] Starting submission");
    console.log("📋 [onSubmit] Form values:", values);
    console.log("🔧 [onSubmit] Is Edit Mode:", isEditMode);

    if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
      console.log("⚠️ [onSubmit] User not subscribed, opening modal");
      handleOpenNotSubscribeModal?.();
      return;
    }
    if (!business_id) {
      console.log("❌ [onSubmit] No business_id found");
      return;
    }

    const formData = new FormData();

    // Always append basic product info
    formData.append("name", values.item_name.trim());

    // Media payload — backend rules (POST + PATCH /product/business/{id}/):
    // - Newly added entries are File objects → append to `images`/`videos`.
    // - Existing entries are URL strings (already saved on the server). On
    //   edit we forward the *kept* media IDs as `kept_media_ids` so the
    //   backend can delete anything the user removed. URL → ID lookup uses
    //   the original ProductData.media response.
    const apiMedia: ApiMediaItem[] = Array.isArray(ProductData?.data?.media)
      ? ProductData.data.media
      : [];
    const urlToId = new Map<string, string>(
      apiMedia.map((m) => [m.file, m.id]),
    );

    const appendKeptId = (url: string) => {
      const id = urlToId.get(url);
      if (id) formData.append("kept_media_ids", id);
    };

    (values.images || []).forEach((item) => {
      if (item instanceof File) {
        formData.append("images", item);
        console.log("📷 [onSubmit] Appending image file:", item.name);
      } else if (isEditMode) {
        appendKeptId(item);
      }
    });
    (values.videos || []).forEach((item) => {
      if (item instanceof File) {
        formData.append("videos", item);
        console.log("🎬 [onSubmit] Appending video file:", item.name);
      } else if (isEditMode) {
        appendKeptId(item);
      }
    });

    const appendIfNotEmpty = (fieldName: string, value: string | undefined) => {
      if (value !== undefined && value !== null && value.trim() !== "") {
        formData.append(fieldName, value.trim());
        console.log(`✅ [onSubmit] Appended ${fieldName}:`, value);
      }
    };

    appendIfNotEmpty("sku", values.sku);
    appendIfNotEmpty("category_id", values.category);
    appendIfNotEmpty("department_id", values.department);
    appendIfNotEmpty("supplier_id", values.supplier);
    appendIfNotEmpty("unit", values.product_unit);
    appendIfNotEmpty("weight", values.weight);
    appendIfNotEmpty("description", values.description);
    appendIfNotEmpty("payment_method", values.payment_method);
    appendIfNotEmpty("discount_type", values.type);
    appendIfNotEmpty("percentage_discount", values.percentage_discount);

    formData.append("allow_tax", String(values.allow_tax));
    // formData.append("hide_from_pos", String(values.hide_from_pos));
    formData.append("in_house", String(values.in_house));
    formData.append("raw_material", String(values.raw_material));
    formData.append("sell_online", String(values.sell_online));
    formData.append("watchlist", String(values.watchlist));
    // Explicit variation intent so the backend can drop existing variations
    // when a multi-variation product is switched to single during edit.
    formData.append("variation_type", values.variation_type);

    if (values.expiry_date) {
      const formattedDate = moment(values.expiry_date).format("YYYY-MM-DD");
      appendIfNotEmpty("expiry_date", formattedDate);
    }

    if (values.variation_type === "single") {
      console.log("📦 [onSubmit] Processing SINGLE product variation");
      appendIfNotEmpty("quantity", values.stock_quantity);
      appendIfNotEmpty("low_stock_threshold", values.low_stock_tresh);
      appendIfNotEmpty("status", values.stock_status);
      appendIfNotEmpty("cost_price", values.cost_price);
      appendIfNotEmpty("selling_price", values.selling_price);
      appendIfNotEmpty("discount", values.discount_value);
      appendIfNotEmpty("discount_threshold", values.discount_threshold);
    } else {
      console.log("🔀 [onSubmit] Processing MULTIPLE product variations");
      console.log(
        "📊 [onSubmit] Total variations:",
        values.product_variations.length,
      );

      const parentProductName = values.item_name.trim();

      const variationInputs = values.product_variations.map(
        (variation, index) => {
          console.log(
            `🔍 [onSubmit] Processing variation ${index}:`,
            variation,
          );

          // Add parent product name to variation combination
          const variationNameWithParent = `${parentProductName} - ${variation.combination.trim()}`;

          const baseVariation: any = {
            name: variationNameWithParent,
            cost_price: variation.cost_price.trim(),
            selling_price: variation.selling_price.trim(),
            quantity: variation.quantity.trim(),
            status: variation.status,
          };

          if (variation.low_stock_threshold?.trim()) {
            baseVariation.low_stock_threshold =
              variation.low_stock_threshold.trim();
          }
          if (variation.discount?.trim()) {
            baseVariation.discount = variation.discount.trim();
          }
          if (variation.discount_threshold?.trim()) {
            baseVariation.discount_threshold =
              variation.discount_threshold.trim();
          }
          if (variation.expiry_date) {
            baseVariation.expiry_date = moment(variation.expiry_date).format(
              "YYYY-MM-DD",
            );
          }

          if (
            isEditMode &&
            variation.id &&
            !variation.id.startsWith("variation-")
          ) {
            baseVariation.id = variation.id;
            console.log(
              `🆔 [onSubmit] Added ID to variation ${index}:`,
              variation.id,
            );
          }

          console.log(`✅ [onSubmit] Final variation ${index}:`, baseVariation);
          return baseVariation;
        },
      );

      console.log("📦 [onSubmit] All variation inputs:", variationInputs);
      formData.append("variation_inputs", JSON.stringify(variationInputs));
    }

    if (values.payment_method === "CREDIT" && values.due_date) {
      appendIfNotEmpty(
        "due_date",
        moment(values.due_date).format("YYYY-MM-DD"),
      );
    }

    if (values.payment_method === "PART") {
      appendIfNotEmpty("amount_paid", values.amount_paid);
      if (values.due_date) {
        appendIfNotEmpty(
          "due_date",
          moment(values.due_date).format("YYYY-MM-DD"),
        );
      }
    }

    console.log("=== 📋 FORM DATA DEBUG ===");
    console.log("🔧 Is Edit Mode:", isEditMode);
    console.log("🆔 Product ID:", productId);

    const formDataObj: Record<string, any> = {};
    Array.from(formData.keys()).forEach((key) => {
      const value = formData.get(key);
      if (key === "variation_inputs" && typeof value === "string") {
        formDataObj[key] = JSON.parse(value);
      } else {
        formDataObj[key] = value;
      }
    });
    console.log("📋 Complete FormData Object:", formDataObj);
    console.log("=== END DEBUG ===");

    if (isEditMode) {
      console.log("🔄 [onSubmit] Calling editProduct mutation");
      editProduct(
        { payload: formData, productId: productId as string },
        {
          onSuccess: (response) => {
            console.log("✅ [onSubmit] Edit successful, response:", response);
            queryClient.invalidateQueries({
              queryKey: [queryKey.inventory.getAllInventory],
            });
            refetchProduct();
            router.back();
          },
          onError: (error) => {
            console.error("❌ [onSubmit] Edit failed:", error);
          },
        },
      );
    } else {
      console.log("➕ [onSubmit] Calling addProduct mutation");
      addProduct(
        { payload: formData, businessId: business_id },
        {
          onSuccess: (response) => {
            console.log("✅ [onSubmit] Add successful, response:", response);
            queryClient.invalidateQueries({
              queryKey: [queryKey.inventory.getAllInventory],
            });
            router.back();
          },
          onError: (error) => {
            console.error("❌ [onSubmit] Add failed:", error);
            const isSubscriptionError = handleSubscriptionError(error);

            // Only show regular error toast if it's NOT a subscription error
            if (!isSubscriptionError) {
              const errorMessage =
                error?.message || error?.error || "Error creating service";
              showToast(errorMessage, "error");
            }
          },
        },
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
    { label: "Packs", value: "Pack" },
    { label: "Kegs", value: "Keg" },
    { label: "Congos", value: "Congo" },
    { label: "Crates", value: "Crate" },
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

  // ============================================================
  // COMPREHENSIVE LOADING STATE - OPTIMIZED
  // ============================================================

  // Only wait for critical data needed to populate the form
  const isLoadingCriticalData = isEditMode
    ? ProductDataLoading || CategoriesDataLoading || DepartmentDataLoading
    : CategoriesDataLoading || DepartmentDataLoading;
  // Check if we have the critical data
  const hasRequiredData = isEditMode
    ? !!ProductData && !!CategoriesData && !!DepartmentData
    : !!CategoriesData && !!DepartmentData;

  // Show loading until form is fully initialized and ready
  const isPageLoading = isLoadingCriticalData || (isEditMode && !isFormReady);

  // console.log("🔍 [Loading State Debug]:");
  // console.log("  - isEditMode:", isEditMode);
  // console.log("  - ProductDataLoading:", ProductDataLoading);
  // console.log("  - CategoriesDataLoading:", CategoriesDataLoading);
  // console.log("  - isFormReady:", isFormReady);
  // console.log("  - hasRequiredData:", hasRequiredData);
  // console.log("  - isPageLoading:", isPageLoading);

  return {
    form,
    onSubmit,
    loading: isPageLoading,
    isLoadingCriticalData,
    hasRequiredData,
    addProductPending,
    editProductPending,
    ProductDataLoading,
    ProductTransactionLoading,
    TransferHistoryLoading,
    CategoriesDataLoading,
    SupplierLoading,
    DepartmentData,
    DepartmentDataLoading,
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
