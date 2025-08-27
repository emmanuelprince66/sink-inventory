import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddProductMutation } from "@/api/products/add-product";
import { useEditProductMutation } from "@/api/products/edit-product";
import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import { useFetchProductTransactionsQuery } from "@/api/products/get-transactions-history";
import { useFetchTransferHistoryQuery } from "@/api/products/transfer-history";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define interfaces for select options
interface SelectOption {
  label: string;
  value: string;
}

// Updated schema with conditional validation based on variation_type
const createProductSchema = z
  .object({
    item_name: z.string().min(1, "Item name is required"),
    image: z.union([
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
        )
        .optional(),
      z.string().optional(),
    ]),
    sku: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    supplier: z.string().optional(),
    // Single product fields - only required when variation_type is single
    stock_quantity: z.string().optional(),
    low_stock_tresh: z.string().optional(),
    stock_status: z.string().optional(),
    product_unit: z.string().min(1, "Product Unit is required"),
    cost_price: z.string().optional(),
    selling_price: z.string().optional(),
    payment_method: z.string().min(1, "Payment Method is required"),
    discount_value: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      }, "Discount must be 0 or greater"),
    type: z.string().optional(),
    percentage_discount: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      }, "Percentage discount must be between 0 and 100"),
    due_date: z.string().optional(),
    amount_paid: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num > 0;
      }, "Amount paid must be greater than 0"),
    variation_type: z.enum(["single", "multiple"]).optional(),
    variations: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          values: z.array(z.string()),
        })
      )
      .optional(),
    product_variations: z
      .array(
        z.object({
          id: z.string(),
          combination: z.string(),
          cost_price: z.string().optional(),
          selling_price: z.string().optional(),
          quantity: z.string().optional(),
          status: z.string(),
          discount: z.string().optional(),
          low_stock_threshold: z.string().optional(),
          sku: z.string().optional(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate single product fields when variation_type is single
    if (data.variation_type === "single") {
      if (!data.stock_quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stock Quantity is required",
          path: ["stock_quantity"],
        });
      } else {
        const num = Number(data.stock_quantity);
        if (isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Stock quantity must be greater than 0",
            path: ["stock_quantity"],
          });
        }
      }

      if (!data.low_stock_tresh) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Low Stock Threshold is required",
          path: ["low_stock_tresh"],
        });
      } else {
        const num = Number(data.low_stock_tresh);
        if (isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Low stock threshold must be greater than 0",
            path: ["low_stock_tresh"],
          });
        }
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
      } else {
        const num = Number(data.cost_price);
        if (isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cost price must be greater than 0",
            path: ["cost_price"],
          });
        }
      }

      if (!data.selling_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unit Selling Price is required",
          path: ["selling_price"],
        });
      } else {
        const num = Number(data.selling_price);
        if (isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selling price must be greater than 0",
            path: ["selling_price"],
          });
        }
      }
    }

    // Only validate product variations when variation_type is multiple
    if (data.variation_type === "multiple") {
      if (!data.product_variations || data.product_variations.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Product variations are required for multiple variation type",
          path: ["product_variations"],
        });
      } else {
        data.product_variations.forEach((variation, index) => {
          if (!variation.cost_price) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Cost price is required",
              path: ["product_variations", index, "cost_price"],
            });
          } else {
            const num = Number(variation.cost_price);
            if (isNaN(num) || num <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cost price must be greater than 0",
                path: ["product_variations", index, "cost_price"],
              });
            }
          }

          if (!variation.selling_price) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Selling price is required",
              path: ["product_variations", index, "selling_price"],
            });
          } else {
            const num = Number(variation.selling_price);
            if (isNaN(num) || num <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selling price must be greater than 0",
                path: ["product_variations", index, "selling_price"],
              });
            }
          }

          if (!variation.quantity) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Quantity is required",
              path: ["product_variations", index, "quantity"],
            });
          } else {
            const num = Number(variation.quantity);
            if (isNaN(num) || num <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Quantity must be greater than 0",
                path: ["product_variations", index, "quantity"],
              });
            }
          }

          if (!variation.low_stock_threshold) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Low stock threshold is required",
              path: ["product_variations", index, "low_stock_threshold"],
            });
          } else {
            const num = Number(variation.low_stock_threshold);
            if (isNaN(num) || num <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Low stock threshold must be greater than 0",
                path: ["product_variations", index, "low_stock_threshold"],
              });
            }
          }

          if (variation.discount && variation.discount !== "") {
            const num = Number(variation.discount);
            if (isNaN(num) || num < 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Discount cannot be negative",
                path: ["product_variations", index, "discount"],
              });
            }
          }
        });
      }
    }

    // Payment method validation (applies to both types)
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
  });

export type ProductFormValues = z.infer<typeof createProductSchema>;

export const useProductHook = ({
  id,
  page,
  handleOpenNotSubscribeModal,
}: {
  id?: any;
  handleOpenNotSubscribeModal?: () => void;
  page?: any;
}) => {
  const params = useParams();
  const { user } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();
  const productId = id || params.id;
  const business_id = useBusinessStore((state) => state.business_id);
  const isEditMode = !!productId;
  const isUserSubscribed = useIsUserSubscribeStore(
    (state) => state.is_subscribed
  );
  const queryClient = useQueryClient();

  // Use ref to prevent multiple resets
  const hasInitialized = useRef(false);

  // Data fetching
  const { data: ProductData, isLoading: ProductDataLoading } =
    useFetchProductByIdQuery(productId, { enabled: isEditMode });

  const { data: ProductTransactionData, isLoading: ProductTransactionLoading } =
    useFetchProductTransactionsQuery({
      params: {
        page,
        limit: 30,
        id: productId,
      },
      enabled: isEditMode,
      staleTime: 1000 * 60 * 5, // 5 minutes
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

  // Mutations
  const { mutate: addProduct, isPending: addProductPending } =
    useAddProductMutation({ businessId: business_id || "" });

  const { mutate: editProduct, isPending: editProductPending } =
    useEditProductMutation({ productId: productId || "" });

  // Memoize helper functions to prevent recreating on every render
  const getCategoryByName = useCallback(
    (name: string) => {
      const category = CategoriesData?.data.find(
        (category: any) => category.name === name
      );
      return category?.id;
    },
    [CategoriesData?.data]
  );

  const getSupplierByName = useCallback(
    (name: string) => {
      const supplier = SupplierData?.data?.results?.data?.find(
        (supplier: any) => supplier.name === name
      );
      return supplier?.id;
    },
    [SupplierData?.data?.results?.data]
  );

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      item_name: "",
      sku: "",
      category: "",
      image: undefined,
      supplier: "",
      stock_quantity: "",
      low_stock_tresh: "",
      stock_status: "",
      product_unit: "",
      cost_price: "",
      selling_price: "",
      payment_method: "",
      discount_value: "",
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

  // Memoize helper function to parse variations from backend data
  const parseVariationsFromBackend = useCallback((productData: any) => {
    if (!productData.variations || productData.variations.length === 0) {
      return { variations: [], variationType: "single", productVariations: [] };
    }

    // Group variations by their attributes
    const variationGroups: { [key: string]: Set<string> } = {};

    productData.variations.forEach((variation: any) => {
      const parts = variation.name.split("-");
      if (parts.length >= 1) {
        const [color, size] = parts;
        if (!variationGroups["Color"]) variationGroups["Color"] = new Set();
        if (size && !variationGroups["Size"])
          variationGroups["Size"] = new Set();

        variationGroups["Color"].add(color);
        if (size) variationGroups["Size"].add(size);
      }
    });

    const variations = Object.entries(variationGroups).map(
      ([name, values], index) => ({
        id: `var-${index}`,
        name,
        values: Array.from(values),
      })
    );

    const productVariations =
      productData.variations?.map((v: any, index: number) => ({
        id: `var-${index}`,
        combination: v.name,
        cost_price: v.cost_price ? String(v.cost_price) : "",
        selling_price: v.selling_price ? String(v.selling_price) : "",
        quantity: v.quantity ? String(v.quantity) : "",
        status: v.status || "IN-STOCK",
        discount: v.discount ? String(v.discount) : "",
        low_stock_threshold: v.low_stock_threshold
          ? String(v.low_stock_threshold)
          : "",
        sku: v.sku || "",
      })) || [];

    return {
      variations,
      variationType: variations.length > 0 ? "multiple" : "single",
      productVariations,
    };
  }, []);

  // Memoize generate product variations function
  const generateProductVariations = useCallback(
    (variations: ProductFormValues["variations"]) => {
      if (!variations || variations.length === 0) return [];

      if (variations.length === 1) {
        return variations[0].values.map((value, index) => ({
          id: `var-${index}`,
          combination: value,
          cost_price: "",
          selling_price: "",
          quantity: "",
          status: "IN-STOCK",
          discount: "",
          low_stock_threshold: "",
          sku: "",
        }));
      }

      const combinations: string[] = [];

      const generateCombinations = (
        current: string[],
        variationIndex: number
      ) => {
        if (variationIndex === variations.length) {
          combinations.push(current.join("-"));
          return;
        }

        const currentVariation = variations[variationIndex];
        for (const value of currentVariation.values) {
          generateCombinations([...current, value], variationIndex + 1);
        }
      };

      generateCombinations([], 0);

      return combinations.map((combination, index) => ({
        id: `var-${index}`,
        combination,
        cost_price: "",
        selling_price: "",
        quantity: "",
        status: "IN-STOCK",
        discount: "",
        low_stock_threshold: "",
        sku: "",
      }));
    },
    []
  );

  // Reset form with product data in edit mode - Only run once when data becomes available
  useEffect(() => {
    if (
      isEditMode &&
      !ProductDataLoading &&
      ProductData?.data &&
      CategoriesData &&
      SupplierData &&
      !hasInitialized.current
    ) {
      const itemsData = ProductData.data;
      const { variations, variationType, productVariations } =
        parseVariationsFromBackend(itemsData);

      form.reset({
        item_name: itemsData.name || "",
        sku: itemsData.sku || "",
        category: getCategoryByName(itemsData.category) || "",
        image: itemsData.image || undefined,
        supplier: getSupplierByName(itemsData.supplier) || "",
        stock_quantity: itemsData.quantity ? String(itemsData.quantity) : "",
        low_stock_tresh: itemsData.low_stock_threshold
          ? String(itemsData.low_stock_threshold)
          : "",
        stock_status: itemsData.status || "",
        product_unit: itemsData.unit || "",
        cost_price: itemsData.cost_price ? String(itemsData.cost_price) : "",
        selling_price: itemsData.selling_price
          ? String(itemsData.selling_price)
          : "",
        payment_method: itemsData.payment_method || "",
        discount_value: itemsData.discount ? String(itemsData.discount) : "",
        type: itemsData.type || "",
        percentage_discount: itemsData.percentage_discount
          ? String(itemsData.percentage_discount)
          : "",
        due_date: itemsData.due_date || "",
        amount_paid: itemsData.amount_paid ? String(itemsData.amount_paid) : "",
        variation_type: variationType as "single" | "multiple",
        variations,
        product_variations: productVariations,
      });

      hasInitialized.current = true;
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
    parseVariationsFromBackend,
  ]);

  // Define type for numeric fields to fix TypeScript error
  type NumericField =
    | "cost_price"
    | "selling_price"
    | "stock_quantity"
    | "low_stock_tresh";

  // Updated onSubmit function with conditional logic based on variation_type
  const onSubmit = useCallback(
    async (values: ProductFormValues) => {
      if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
        handleOpenNotSubscribeModal?.();
        return;
      }
      if (!business_id) return;

      // Determine which fields to validate based on variation type
      const variationType = values.variation_type || "single";

      if (variationType === "single") {
        // Validate single product numeric fields
        const singleNumericFields: NumericField[] = [
          "cost_price",
          "selling_price",
          "stock_quantity",
          "low_stock_tresh",
        ];

        for (const field of singleNumericFields) {
          if (values[field]) {
            const cleanValue = values[field].replace(/,/g, "");
            if (!/^\d*\.?\d*$/.test(cleanValue)) {
              console.error(
                `Invalid ${field}: ${values[field]} contains non-numeric characters`
              );
              showToast(
                `Invalid ${field}: Please enter a valid number`,
                "error"
              );
              return;
            }
          }
        }
      } else if (variationType === "multiple") {
        // Validate variation fields
        const variationNumericFields = [
          "cost_price",
          "selling_price",
          "quantity",
          "low_stock_threshold",
          "discount",
        ] as const;

        if (values.product_variations) {
          for (let i = 0; i < values.product_variations.length; i++) {
            const variation = values.product_variations[i];
            for (const field of variationNumericFields) {
              const value = variation[field];
              if (value !== undefined && value !== "") {
                const cleanValue = String(value).replace(/,/g, "");
                if (
                  !/^\d+(\.\d+)?$/.test(cleanValue) ||
                  Number(cleanValue) < 0
                ) {
                  console.error(
                    `Invalid ${field} in variation ${variation.combination}: ${value} is not a valid positive number`
                  );
                  showToast(
                    `Invalid ${field} in variation ${variation.combination}: Please enter a valid positive number`,
                    "error"
                  );
                  return;
                }
              }
            }
          }
        }
      }

      const formData = new FormData();

      // Always include the name
      formData.append("name", values.item_name);

      // Only include image if it's a File (newly selected)
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      // Helper function to conditionally append fields
      const appendIfNotEmpty = (
        fieldName: string,
        value: string | undefined
      ) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(fieldName, value);
        }
      };

      // Handle variations based on variation_type
      if (
        variationType === "multiple" &&
        values.variations &&
        values.product_variations
      ) {
        // Send variations as JSON string
        // const variationsData = values.variations.map((variation) => ({
        //   name: variation.name,
        //   values: variation.values,
        // }));
        // formData.append("variations", JSON.stringify(variationsData));

        // Send variation_inputs as JSON string - this is the key change!
        const variationInputs = values.product_variations.map((prodVar) => ({
          name: prodVar.combination,
          cost_price: prodVar.cost_price || "",
          selling_price: prodVar.selling_price || "",
          quantity: prodVar.quantity || "",
          status: prodVar.status,
          discount: prodVar.discount || "0",
          low_stock_threshold: prodVar.low_stock_threshold || "5",
        }));

        formData.append("variation_inputs", JSON.stringify(variationInputs));
      } else {
        // Single product variation - only add these fields for single type
        // formData.append("variation_type", "single");
        appendIfNotEmpty("quantity", values.stock_quantity);
        appendIfNotEmpty("cost_price", values.cost_price);
        appendIfNotEmpty("selling_price", values.selling_price);
        appendIfNotEmpty("status", values.stock_status);
        appendIfNotEmpty("discount", values.discount_value);
        appendIfNotEmpty("low_stock_threshold", values.low_stock_tresh);
      }

      // Optional fields (common to both types)
      appendIfNotEmpty("sku", values.sku);
      appendIfNotEmpty("category_id", values.category);
      appendIfNotEmpty("supplier_id", values.supplier);
      appendIfNotEmpty("unit", values.product_unit);
      appendIfNotEmpty("payment_method", values.payment_method);
      appendIfNotEmpty("discount_type", values.type);
      appendIfNotEmpty("percentage_discount", values.percentage_discount);

      // Payment-specific fields
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

      console.log("Form Data Entries:");
      Array.from(formData.entries()).forEach((pair) => {
        // Pretty print JSON strings for better debugging
        if (pair[0] === "variation_inputs" || pair[0] === "variations") {
          console.log(pair[0], "JSON:", JSON.parse(pair[1] as string));
        } else {
          console.log(pair[0], pair[1]);
        }
      });

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
            onError: (error: any) => {
              console.error("Edit product error:", error);
              showToast(error?.error || "An error occurred", "error");
            },
          }
        );
      } else {
        console.log("Form Data Entries:");
        Array.from(formData.entries()).forEach((pair) => {
          // Pretty print JSON strings for better debugging
          if (pair[0] === "variation_inputs" || pair[0] === "variations") {
            console.log(pair[0], "JSON:", JSON.parse(pair[1] as string));
          } else {
            console.log(pair[0], pair[1]);
          }
        });

        // Uncomment when ready to submit
        addProduct(
          { payload: formData, businessId: business_id },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: [queryKey.inventory.getAllInventory],
              });
              router.back();
            },
            onError: (error: any) => {
              console.error("Add product error:", error);
              showToast(error?.error || "An error occurred", "error");
            },
          }
        );
      }
    },
    [
      isUserSubscribed,
      user,
      handleOpenNotSubscribeModal,
      business_id,
      isEditMode,
      editProduct,
      productId,
      queryClient,
      router,
      addProduct,
      showToast,
    ]
  );
  // Memoize options for select inputs to prevent recreating
  const unitTypeOptions: SelectOption[] = useMemo(
    () => [
      { label: "Pieces", value: "Pcs" },
      { label: "Kilograms", value: "Kg" },
      { label: "Bags", value: "Bag" },
      { label: "Boxes", value: "Box" },
      { label: "Cartons", value: "Ctn" },
      { label: "Lots", value: "Ltd" },
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
      { label: "Grams", value: "Gr" },
    ],
    []
  );

  const StatusTypeOptions: SelectOption[] = useMemo(
    () => [
      { label: "In Stock", value: "IN-STOCK" },
      { label: "Low Stock", value: "LOW" },
      { label: "Out of Stock", value: "OUT-OF-STOCK" },
    ],
    []
  );

  const paymentMethodOptions: SelectOption[] = useMemo(
    () => [
      { label: "Full Payment", value: "FULL" },
      { label: "Credit", value: "CREDIT" },
      { label: "Partial Payment", value: "PART" },
    ],
    []
  );

  console.log("Product Data:", ProductData);
  return {
    ProductData,
    onSubmit,
    form,
    editProductPending,
    TransferHistoryLoading,
    ProductTransactionData,
    ProductTransactionLoading,
    TransferHistoryData,
    addProductPending,
    CategoriesData,
    unitTypeOptions,
    paymentMethodOptions,
    loading: (isEditMode && ProductDataLoading) || form.formState.isLoading,
    SupplierData,
    SupplierLoading,
    CategoriesDataLoading,
    StatusTypeOptions,
    isEditMode,
    categoriesData: CategoriesData,
    supplierData: SupplierData,
    generateProductVariations,
  };
};
