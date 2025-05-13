import { useFetchRestockHistoryQuery } from "@/api/restock/fetch-restock-history";
import { useRestockProductMutation } from "@/api/restock/restock-product";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const RestockSchema = z
  .object({
    name: z.string().min(1, "Customer name is required"),
    qty: z.coerce.number().min(1, "Stock Quantity is required"),
    supplier: z.string().optional(),
    cost_price: z.coerce.number().min(1, "Unit Cost Price is required"),
    selling_price: z.coerce.number().min(1, "Unit Selling Price is required"),
    payment_method: z.string().min(1, "Payment Method is required"),
    due_date: z.string().optional(),
    amount_paid: z.coerce.number().optional(), // Accepts empty input
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

export type RestockFormValues = z.infer<typeof RestockSchema>;

export const useGetRestockHistory = ({
  id,
  data,
}: {
  id?: any;
  data?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const params = useParams();

  console.log("data", data);

  const pId = id || params.id || data?.id;

  console.log("pId", pId);

  const { data: restockHistory } = useFetchRestockHistoryQuery(business_id);

  const { mutate: restockProduct, isPending: restockProductPending } =
    useRestockProductMutation({
      productId: pId,
    });

  const form = useForm<RestockFormValues>({
    resolver: zodResolver(RestockSchema),
    defaultValues: {
      name: data?.name || "",
      qty: data?.quantity || undefined,
      supplier: "",
      cost_price: data?.cost_price || undefined,
      selling_price: data?.selling_price || undefined,
      payment_method: "",
      amount_paid: undefined,
      due_date: "",
    },
    mode: "onChange",
  });

  const { data: SupplierData, isLoading: SupplierLoading } =
    useFetchSupplierDataQuery(business_id);

  const paymentMethodOptions = [
    { label: "Full Payment", value: "FULL" },
    { label: "Credit", value: "CREDIT" },
    { label: "Partial Payment", value: "PART" },
  ];

  const onSubmit = (values: RestockFormValues) => {
    const payload = {
      quantity: values.qty,
      supplier_id: values.supplier,
      cost_price: values.cost_price,
      selling_price: values.selling_price,
      payment_method: values.payment_method,
      ...(values.payment_method === "CREDIT" && { due_date: values.due_date }),
      ...(values.payment_method === "PART" && {
        amount_paid: Number(values.amount_paid),
        due_date: values.due_date,
      }),
    };
    console.log("payload", payload);

    restockProduct({
      payload,
      productId: pId,
    });
  };

  console.log("restockHistory", restockHistory);

  useEffect(() => {
    console.log("form", form.formState.errors);
  }, [form]);

  return {
    restockHistory,
    SupplierData,
    SupplierLoading,
    form,
    restockProductPending,
    onSubmit,
    paymentMethodOptions,
  };
};
