import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddProductMutation } from "@/api/products/add-product";
import { useEditProductMutation } from "@/api/products/edit-product";
import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addProductSchema = z
  .object({
    item_name: z.string().min(1, "Item name is required"),
    sku: z.string().min(1, "Sku is required"),
    category: z.string().min(1, "Category is required"),
    date: z.string().min(1, "Expiry Date is required"),
    supplier: z.string().min(1, "Supplier is required"),
    stock_quantity: z.string().min(1, "Stock Quantity is required"),
    low_stock_tresh: z.string().min(1, "Low Stock Threshold is required"),
    stock_status: z.string().min(1, "Stock Status is required"),
    product_unit: z.string().min(1, "Product Unit is required"),
    cost_price: z.string().min(1, "Unit Cost Price is required"),
    selling_price: z.string().min(1, "Unit Selling Price is required"),
    payment_method: z.string().min(1, "Payment Method is required"),
    discount_value: z.string().min(1, "Discount Value is required"),
    type: z.string().min(1, "Type is required"),
    percentage_discount: z.string().min(1, "Percentage Discount is required"),
    due_date: z.string().optional(),
    image: z.union([
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
        ),
      z.string().min(1, "Product image is required"),
    ]),
    amount_paid: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === "CREDIT") {
      if (!data.due_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Due date is required for credit payment",
          path: ["due_date"],
        });
      }
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

export type addProductFormValues = z.infer<typeof addProductSchema>;

export const useProductHook = ({ id }: { id?: string }) => {
  const params = useParams();
  const productId = id || params.id;
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: ProductData, isLoading: ProductDataLoading } =
    useFetchProductByIdQuery(productId, {
      // Only enable the query when we have a valid productId
      enabled: !!productId,
    });

  const itemsData = ProductData?.data ?? {};

  const { mutate: addProduct, isPending: addProductPending } =
    useAddProductMutation({
      businessId: business_id || "",
    });

  const { mutate: editProduct, isPending: editProductPending } =
    useEditProductMutation({
      productId: productId || "",
    });

  const form = useForm<addProductFormValues>({
    resolver: zodResolver(addProductSchema),
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

  useEffect(() => {
    // Only attempt to reset form if:
    // 1. We are in edit mode (productId exists)
    // 2. Product data loading is complete
    // 3. We have itemsData to work with
    if (productId && !ProductDataLoading && Object.keys(itemsData).length > 0) {
      form.reset({
        item_name: itemsData?.name || "",
        sku: itemsData?.sku || "",
        category: itemsData?.category || "",
        date: itemsData?.expiry_date || "",
        image: itemsData?.image || undefined,
        supplier: itemsData?.supplier || "",
        stock_quantity: itemsData?.quantity
          ? String(Math.floor(Number(itemsData.quantity)))
          : "",
        low_stock_tresh: itemsData?.low_stock_threshold
          ? String(Math.floor(Number(itemsData.low_stock_threshold)))
          : "",
        stock_status: itemsData?.status || "",
        product_unit: itemsData?.unit || "",
        cost_price: itemsData?.cost_price
          ? String(Math.floor(Number(itemsData.cost_price)))
          : "",
        selling_price: itemsData?.selling_price
          ? String(Math.floor(Number(itemsData.selling_price)))
          : "",
        payment_method: itemsData?.payment_method || "",
        discount_value: itemsData?.discount
          ? String(Math.floor(Number(itemsData.discount))) === "0"
            ? ""
            : String(Math.floor(Number(itemsData.discount)))
          : "",
        type: itemsData?.type || "",
        percentage_discount: itemsData?.percentage_discount
          ? String(Math.floor(Number(itemsData.percentage_discount)))
          : "",
        due_date: itemsData?.due_date || "",
        amount_paid: itemsData?.amount_paid
          ? String(Math.floor(Number(itemsData.amount_paid)))
          : "",
      });
    }
  }, [ProductDataLoading, itemsData, form, productId]);

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "PRODUCT",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5,
    });

  const { data: SupplierData, isLoading: SupplierLoading } =
    useFetchSupplierDataQuery(business_id);

  const unitTypeOptions = [
    { label: "Tons", value: "Tons" },
    { label: "Bags", value: "Bags" },
    { label: "Pieces", value: "Pieces" },
    { label: "Rolls", value: "Rolls" },
    { label: "Pairs", value: "Pairs" },
  ];

  const paymentMethodOptions = [
    { label: "Full Payment", value: "FULL" },
    { label: "Credit", value: "CREDIT" },
    { label: "Partial Payment", value: "PART" },
  ];

  const onSubmit = async (values: addProductFormValues) => {
    console.log("values", values);
    if (!business_id) return;

    const formData = new FormData();
    const formattedExpiryDate = values.date
      ? moment(values.date).format("YYYY-MM-DD")
      : "";
    const formattedDueDate = values.due_date
      ? moment(values.due_date).format("YYYY-MM-DD")
      : "";

    // Append all the basic fields
    formData.append("name", values.item_name);
    formData.append("sku", values.sku);
    formData.append("category_id", values.category);
    formData.append("expiry_date", formattedExpiryDate);
    formData.append("supplier_id", values.supplier);
    formData.append("quantity", values.stock_quantity);
    formData.append("low_stock_tresh", values.low_stock_tresh);
    formData.append("stock_status", values.stock_status);
    formData.append("product_unit", values.product_unit);
    formData.append("cost_price", values.cost_price);
    formData.append("selling_price", values.selling_price);
    formData.append("payment_method", values.payment_method);
    formData.append("discount_value", values.discount_value);
    formData.append("type", values.type);
    formData.append("percentage_discount", values.percentage_discount);

    // Only append image if it's a File object (newly selected file)
    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    // Handle payment-specific fields
    if (values.payment_method === "CREDIT") {
      formData.append("due_date", formattedDueDate);
    }

    if (values.payment_method === "PART") {
      formData.append("amount_paid", values.amount_paid || "");
      formData.append("due_date", formattedDueDate);
    }

    if (productId) {
      editProduct({
        payload: formData,
        productId: productId,
      });
    } else {
      addProduct({
        payload: formData,
        businessId: business_id,
      });
    }
  };

  return {
    ProductData,
    onSubmit,
    form,
    editProductPending,
    addProductPending,
    CategoriesData,
    unitTypeOptions,
    // Only mark as loading if we're in edit mode and product data is loading
    loading: (productId && ProductDataLoading) || form.formState.isLoading,
    SupplierData,
    SupplierLoading,
    paymentMethodOptions,
    CategoriesDataLoading,
  };
};
