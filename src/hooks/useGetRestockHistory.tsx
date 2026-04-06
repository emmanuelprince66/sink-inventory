import { useFetchRestockHistoryQuery } from "@/api/restock/fetch-restock-history";
import { useRestockProductMutation } from "@/api/restock/restock-product";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

const RestockSchema = z
  .object({
    name: z.string().min(1, "Customer name is required"),
    qty: z.coerce.number().min(1, "Stock Quantity is required"),
    supplier: z.string().optional(),
    expiry_date: z.string().optional(),
    cost_price: z.coerce.number().min(1, "Unit Cost Price is required"),
    selling_price: z.coerce.number().min(1, "Unit Selling Price is required"),
    payment_method: z.string().min(1, "Payment Method is required"),
    due_date: z.string().optional(),
    amount_paid: z.coerce.number().optional(),
    variation_id: z.string().optional(),
    remark: z.string().optional(),
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
  closeModal,
}: {
  id?: any;
  data?: any;
  closeModal?: any;
}) => {
  const { showToast } = useToast();
  const business_id = useBusinessStore((state) => state.business_id);
  const params = useParams();
  const queryClient = useQueryClient();

  const pId = id || params.id || data?.id;

  // Check if product has variations
  const hasVariations = data?.variations && data.variations.length > 0;

  const {
    data: restockHistory,
    refetch,
    isLoading: restockHistoryLoading,
  } = useFetchRestockHistoryQuery(pId, {
    enabled: !!pId,
  });

  const { mutate: restockProduct, isPending: restockProductPending } =
    useRestockProductMutation({
      productId: pId,
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");
        refetch();
        queryClient.invalidateQueries({
          queryKey: [queryKey.inventory.getAllInventory],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKey.products.fetchAllRestockHistory],
        });
        if (closeModal) closeModal();
      },
    });

  const form = useForm<RestockFormValues>({
    resolver: zodResolver(RestockSchema),
    defaultValues: {
      name: data?.name || "",
      qty: undefined,
      expiry_date: "",
      supplier: "",
      cost_price: data?.cost_price || undefined,
      selling_price: data?.selling_price || undefined,
      payment_method: "",
      amount_paid: undefined,
      due_date: "",
      variation_id: "",
      remark: "",
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

  // Watch for variation changes to update cost_price and selling_price
  const selectedVariationId = form.watch("variation_id");

  useEffect(() => {
    if (hasVariations && selectedVariationId) {
      const selectedVariation = data.variations.find(
        (v: any) => v.id === selectedVariationId,
      );
      if (selectedVariation) {
        form.setValue("cost_price", selectedVariation.cost_price || undefined);
        form.setValue(
          "selling_price",
          selectedVariation.selling_price || undefined,
        );
        form.setValue("expiry_date", selectedVariation.expiry_date || "");
      }
    }
  }, [selectedVariationId, hasVariations, data, form]);

  const onSubmit = (values: RestockFormValues) => {
    const payload = {
      quantity: values.qty,
      cost_price: Math.round(Number(values.cost_price)),
      selling_price: Math.round(Number(values.selling_price)),
      payment_method: values.payment_method,
      ...(values.expiry_date && {
        expiry_date: moment(values.expiry_date).format("YYYY-MM-DD").toString(),
      }),
      ...(values.supplier && { supplier_id: values.supplier }),
      ...(hasVariations &&
        values.variation_id && { variation_id: values.variation_id }), // Add variation_id if exists
      ...(values.payment_method === "CREDIT" && {
        due_date: moment(values.due_date).format("YYYY-MM-DD").toString(),
      }),
      ...(values.payment_method === "PART" && {
        amount_paid: Number(values.amount_paid),
        due_date: moment(values.due_date).format("YYYY-MM-DD").toString(),
      }),
      ...(values.remark && { remark: values.remark }),
    };
    console.log("payload----5", payload);

    restockProduct({
      payload,
      productId: pId,
    });
  };

  return {
    restockHistory,
    SupplierData,
    restockHistoryLoading,
    SupplierLoading,
    form,
    restockProductPending,
    onSubmit,
    paymentMethodOptions,
    hasVariations,
    variations: data?.variations || [],
  };
};
