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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
// Dynamic schema creation
const createProductSchema = (isEditMode: boolean) => {
  const baseSchema = z.object({
    item_name: z.string().min(1, "Item name is required"),
    // Modified image validation to be optional in edit mode
    image: isEditMode
      ? z.union([
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
        ])
      : z.union([
          z
            .instanceof(File, { message: "Product image is required" })
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
    sku: isEditMode ? z.string().optional() : z.string().optional(),
    category: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Category is required"),
    date: z.string().optional(),
    supplier: z.string().optional(),
    stock_quantity: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Stock Quantity is required"),
    low_stock_tresh: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Low Stock Threshold is required"),
    stock_status: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Stock Status is required"),
    product_unit: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Product Unit is required"),
    cost_price: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Unit Cost Price is required"),
    selling_price: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Unit Selling Price is required"),
    payment_method: isEditMode
      ? z.string().optional()
      : z.string().min(1, "Payment Method is required"),
    discount_value: z.string().optional(),
    type: z.string().optional(),
    percentage_discount: z.string().optional(),
    due_date: z.string().optional(),
    amount_paid: z.string().optional(),
  });

  return baseSchema.superRefine((data, ctx) => {
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
export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;

export const useProductHook = ({
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
  const business_id = useBusinessStore((state) => state.business_id);
  const isEditMode = !!productId;
  const isUserSubscribed = useIsUserSubscribeStore(
    (state) => state.is_subscribed
  );
  const queryClient = useQueryClient();

  // Data fetching
  const { data: ProductData, isLoading: ProductDataLoading } =
    useFetchProductByIdQuery(productId, { enabled: isEditMode });

  const {
    data: ProductTransactionData,
    isLoading: ProductTransactionLoading,
    // refetch: refetchInventory,
    // isRefetching: isRefetchingInventory,
  } = useFetchProductTransactionsQuery({
    params: {
      page,
      limit: 30,
      id: productId,
    },
    enabled: isEditMode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // const { data: ProductTransactionData, isLoading: ProductTransactionLoading } =
  //   useFetchProductTransactionsQuery(productId, { enabled: isEditMode });
  const { data: TransferHistoryData, isLoading: TransferHistoryLoading } =
    useFetchTransferHistoryQuery(productId, { enabled: !!productId });

  // console.log("TransferHistoryData", TransferHistoryData);

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: { id: business_id, type: "PRODUCT" },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5,
    });

  const { data: SupplierData, isLoading: SupplierLoading } =
    useFetchSupplierDataQuery(business_id);

  // console.log("SupplierData", SupplierData);

  // Mutations
  const { mutate: addProduct, isPending: addProductPending } =
    useAddProductMutation({ businessId: business_id || "" });

  const { mutate: editProduct, isPending: editProductPending } =
    useEditProductMutation({ productId: productId || "" });

  const getCategoryByName = (name: string) => {
    const category = CategoriesData?.data.find(
      (category: any) => category.name === name
    );

    // console.log("category", category);
    return category?.id;
  };

  const getSupplierByName = (name: string) => {
    const supplier = SupplierData?.data?.results?.data?.find(
      (supplier: any) => supplier.name === name
    );

    return supplier?.id;
  };

  // console.log("CategoriesData", CategoriesData);
  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema(isEditMode)),
    defaultValues: {
      item_name: "",
      sku: "",
      category: "",
      date: "",
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
    },
    mode: "onChange",
  });

  // Reset form with product data in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      !ProductDataLoading &&
      ProductData?.data &&
      CategoriesData &&
      SupplierData
    ) {
      const itemsData = ProductData.data;

      console.log("itemsData", itemsData);

      // console.log("iddddd", getCategoryByName(itemsData.category));
      form.reset({
        item_name: itemsData.name || "",
        sku: itemsData.sku || "",
        category: getCategoryByName(itemsData.category) || "",
        date: itemsData.expiry_date || "",
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
      });
    }
  }, [
    ProductData,
    ProductDataLoading,
    form,
    isEditMode,
    CategoriesData,
    SupplierData,
  ]);

  // Form submission
  const onSubmit = async (values: ProductFormValues) => {
    if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
      handleOpenNotSubscribeModal?.();
      return;
    }
    if (!business_id) return;

    const formData = new FormData();

    // Always include the name
    formData.append("name", values.item_name);

    // Only include image if it's a File (newly selected)
    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    // Helper function to conditionally append fields
    const appendIfNotEmpty = (fieldName: string, value: string | undefined) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(fieldName, value);
      }
    };

    // Optional fields (only append if they exist)
    appendIfNotEmpty("sku", values.sku);
    appendIfNotEmpty("category_id", values.category);
    appendIfNotEmpty(
      "expiry_date",
      values.date ? moment(values.date).format("YYYY-MM-DD") : undefined
    );
    appendIfNotEmpty("supplier_id", values.supplier);
    appendIfNotEmpty("quantity", values.stock_quantity);
    appendIfNotEmpty("low_stock_threshold", values.low_stock_tresh);
    appendIfNotEmpty("status", values.stock_status);
    appendIfNotEmpty("unit", values.product_unit);
    appendIfNotEmpty("cost_price", values.cost_price);
    appendIfNotEmpty("selling_price", values.selling_price);
    appendIfNotEmpty("payment_method", values.payment_method);
    appendIfNotEmpty("discount", values.discount_value);
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
      // For new products, ensure all required fields are present
      const requiredFields = {
        sku: values.sku || "",
        category_id: values.category || "",
        expiry_date: values.date
          ? moment(values.date).format("YYYY-MM-DD")
          : "",
        supplier_id: values.supplier || "",
        quantity: values.stock_quantity || "",
        low_stock_threshold: values.low_stock_tresh || "",
        status: values.stock_status || "",
        unit: values.product_unit || "",
        cost_price: values.cost_price || "",
        selling_price: values.selling_price || "",
        payment_method: values.payment_method || "",
        discount_type: values.discount_value || "",
        type: values.type || "",
        percentage_discount: values.percentage_discount || "",
      };

      // Create new FormData with all required fields
      const newProductFormData = new FormData();
      newProductFormData.append("name", values.item_name);
      newProductFormData.append(
        "image",
        values.image instanceof File ? values.image : ""
      );

      Object.entries(requiredFields).forEach(([key, value]) => {
        newProductFormData.append(key, value);
      });

      // Add payment fields if they exist
      if (values.payment_method === "CREDIT" && values.due_date) {
        newProductFormData.append(
          "due_date",
          moment(values.due_date).format("YYYY-MM-DD")
        );
      }

      if (values.payment_method === "PART") {
        newProductFormData.append("amount_paid", values.amount_paid || "");
        if (values.due_date) {
          newProductFormData.append(
            "due_date",
            moment(values.due_date).format("YYYY-MM-DD")
          );
        }
      }

      addProduct(
        { payload: newProductFormData, businessId: business_id },
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

  // Options for select inputs
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
  };
};
