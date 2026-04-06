import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useTransferProductMutation } from "@/api/products/transfer-product";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
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
    },
  });

  // API queries
  const { data: AllBusinessData, isLoading: AllBusinessLoading } =
    useGetAllBusinessQuery();
  const { data: TargetInventoryData, isLoading: TargetInventoryLoading } =
    useGetInventoryQuery({
      params: {
        id: selectedBusiness || "",
      },
      enabled: !!selectedBusiness,
    });

  // Mutation with success/error handling
  const { mutate: transferProduct, isPending: isTransferring } =
    useTransferProductMutation({
      onSuccess: (data) => {
        showToast(
          data.message || "Product transferred successfully",
          "success"
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
      onError: (error) => {
        showToast(error.message || "Failed to transfer product", "error");
      },
    });

  // Business data effect
  useEffect(() => {
    if (AllBusinessData && !AllBusinessLoading) {
      const res = AllBusinessData?.results?.filter(
        (item: any) => item.id !== business_id
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
