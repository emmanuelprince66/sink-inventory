import { AUTO_BATCH } from "@/app/(dashboard)/inventory/BatchSelect";
import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useTransferProductMutation } from "@/api/products/transfer-product";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema definition
export const transferProductSchema = z.object({
  target_business_id: z.string().uuid("Please select a valid business"),
  target_product_id: z
    .string()
    .uuid("Please select a valid product")
    .optional()
    .nullable(),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(10000, "Quantity cannot exceed 10,000"),
  /**
   * Which batch the units leave from. Omitted, the backend deducts FEFO.
   *
   * Worth choosing by hand here more than anywhere else: the batch travels
   * with the stock, so the receiving branch inherits its batch number, expiry,
   * cost price and supplier. Send the wrong one and the other shop's shelf
   * carries the wrong expiry date.
   */
  batch_id: z.string().optional(),
});

export type TransferProductFormValues = z.infer<typeof transferProductSchema>;

export const useTransferProductHook = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: any;
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const business_id = useBusinessStore((state) => state.business_id);
  const [otherBusiness, setOtherBusiness] = useState<any>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [targetProducts, setTargetProducts] = useState<any[] | null>(null);
  const [hasProducts, setHasProducts] = useState<boolean>(false);

  // Form setup
  const form = useForm<TransferProductFormValues>({
    resolver: zodResolver(transferProductSchema),
    defaultValues: {
      target_business_id: "",
      target_product_id: null,
      quantity: 1,
      batch_id: "",
    },
  });

  // API queries
  const { data: AllBusinessData, isLoading: AllBusinessLoading } =
    useGetAllBusinessQuery();
  const { data: TargetInventoryData, isLoading: TargetInventoryLoading } =
    useGetInventoryQuery({
      params: {
        id: selectedBusiness || "",
        include_raw_material: "false",
      },
      enabled: !!selectedBusiness,
    });

  // Mutation with success/error handling
  const { mutate: transferProduct, isPending: isTransferring } =
    useTransferProductMutation({
      onSuccess: (data) => {
        showToast(
          data.message || "Product transferred successfully",
          "success",
        );
        queryClient.invalidateQueries({
          queryKey: [queryKey.inventory.getAllInventory],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKey.products.fetchProductionHistiory],
        });
        closeModal();
        form.reset();
      },
      onError: (error: any) => {
        // The proxy reports a refused transfer under both keys; a thrown Error
        // (network, bad JSON) carries only `message`, so that one leads.
        showToast(
          error?.message || error?.error || "Failed to transfer product",
          "error",
        );
      },
    });

  // Business data effect
  useEffect(() => {
    if (AllBusinessData && !AllBusinessLoading) {
      const res = AllBusinessData?.results?.filter(
        (item: any) => item.id !== business_id,
      );
      setOtherBusiness(res);
    }
  }, [AllBusinessData, AllBusinessLoading, business_id]);

  // Target products effect
  useEffect(() => {
    if (selectedBusiness && TargetInventoryData) {
      const products = TargetInventoryData.data?.results?.data || [];
      setTargetProducts(products.length > 0 ? products : null);
      setHasProducts(products.length > 0);
    } else {
      setTargetProducts(null);
      setHasProducts(false);
    }
  }, [selectedBusiness, TargetInventoryData]);

  // Handle business selection change
  const handleBusinessChange = (businessId: string) => {
    setSelectedBusiness(businessId);
    form.setValue("target_product_id", null);
  };

  // Submit handler
  const onSubmit = (values: TransferProductFormValues) => {
    if (!id || !business_id) return;

    transferProduct({
      source_product_id: id,
      target_business_id: values.target_business_id,
      target_product_id: hasProducts ? values.target_product_id : null,
      quantity: values.quantity,
      // Left out when the automatic choice was kept, which is the backend's
      // cue to take the earliest-expiring batch.
      ...(values.batch_id && values.batch_id !== AUTO_BATCH
        ? { batch_id: values.batch_id }
        : {}),
    });
  };

  return {
    form,
    onSubmit,
    otherBusiness,
    targetProducts,
    hasProducts,
    AllBusinessLoading,
    TargetInventoryLoading,
    isTransferring,
    handleBusinessChange,
  };
};
