import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useAddProductMutation } from "@/api/products/add-product";
import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
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
    useFetchProductByIdQuery(productId);

  const { mutate: addProduct, isPending: addProductPending } =
    useAddProductMutation({
      businessId: business_id,
    });

  const form = useForm<addProductFormValues>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      item_name: "",
      sku: "",
      category: "",
      date: "",
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

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "PRODUCT",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
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

  const onSubmit = (values: addProductFormValues) => {
    const payload = {
      name: values.item_name,
      sku: values.sku,
      category_id: values.category,
      expiry_date: values.date,
      supplier_id: values.supplier,
      stock_quantity: Number(values.stock_quantity),
      low_stock_tresh: Number(values.low_stock_tresh),
      stock_status: values.stock_status,
      product_unit: values.product_unit,
      cost_price: Number(values.cost_price),
      selling_price: Number(values.selling_price),
      payment_method: values.payment_method,
      discount_value: Number(values.discount_value),
      type: values.type,
      percentage_discount: Number(values.percentage_discount),
      ...(values.payment_method === "CREDIT" && { due_date: values.due_date }),
      ...(values.payment_method === "PART" && {
        amount_paid: Number(values.amount_paid),
        due_date: values.due_date,
      }),
    };
    console.log("payload", payload);
    addProduct({
      payload,
      businessId: business_id,
    });
  };

  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);
  return {
    ProductData,
    onSubmit,
    form,
    addProductPending,
    CategoriesData,
    unitTypeOptions,

    SupplierData,
    SupplierLoading,
    paymentMethodOptions,
    CategoriesDataLoading,
  };
};
