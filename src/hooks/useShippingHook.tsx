import {
  useCreateShippingMethodMutation,
  useDeleteShippingMutation,
  useEditShippingMethodMutation,
  useFetchAllShippingQuery,
  useFetchShippingByIdQuery,
} from "@/api/shipping/shipping";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";
// Shipping Method Schema
export const shippingMethodSchema = z.object({
  location_name: z
    .string()
    .min(1, "Location name is required")
    .max(255, "Location name must be less than 255 characters")
    .trim(),
  fee: z
    .string()
    .refine(
      (val) => {
        if (val === null || val === "" || val === undefined) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid amount" }
    )
    .nullable()
    .optional(),
  shipping_description: z
    .string()
    .min(1, "Shipping description is required")
    .max(500, "Description must be less than 500 characters")
    .trim(),
  visible_on_checkout: z.boolean().optional(),
});

export type ShippingMethodPayload = z.infer<typeof shippingMethodSchema>;

const shippingMethodInitialFormData: ShippingMethodPayload = {
  location_name: "",
  fee: "",
  shipping_description: "",
  visible_on_checkout: false,
};

const useShippingHook = ({ closeModal }: { closeModal?: () => void }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const shippingMethodId = params.id as string;

  const router = useRouter();

  // Fetch all shipping data
  const {
    data: ShippingData,
    isLoading: allShippingDataLoading,
    error: ShippingError,
    refetch,
  } = useFetchAllShippingQuery({
    business_id,
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { mutate: deleteShipping, isPending: deleteShippingLoading } =
    useDeleteShippingMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
        queryClient.invalidateQueries({
          queryKey: [queryKey.shipping.getAllShippings, business_id],
        });
        refetch();

        if (closeModal) closeModal();

        // if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });

  // Fetch shipping method by ID for edit
  const { data: shippingMethodData, isLoading: shippingMethodLoading } =
    useFetchShippingByIdQuery(shippingMethodId, {
      enabled: !!shippingMethodId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const handleDeleteShipping = (shipping: any) => {
    deleteShipping(shipping?.id);
  };

  // Create shipping method mutation
  const {
    mutate: CreateShippingMethod,
    isPending: createShippingMethodLoading,
  } = useCreateShippingMethodMutation({
    businessId: business_id,
    onSuccess: (data) => {
      showToast(
        data.message || "Shipping method created successfully",
        "success"
      );
      queryClient.invalidateQueries({
        queryKey: [queryKey.shipping.getAllShippings, business_id],
      });
      refetch();
      if (closeModal) {
        closeModal();
        return;
      }
      router.push("/shipping");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to create shipping method";
      showToast(errorMessage, "error");
    },
  });

  // Edit shipping method mutation
  const { mutate: editShippingMethod, isPending: editShippingMethodLoading } =
    useEditShippingMethodMutation({
      onSuccess: (data: any) => {
        showToast(
          data.message || "Shipping method updated successfully",
          "success"
        );
        queryClient.invalidateQueries({
          queryKey: [queryKey.shipping.getAllShippings, business_id],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKey.shipping.getShippingById, shippingMethodId],
        });
        refetch();
        router.push("/shipping");
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "Failed to update shipping method";
        showToast(errorMessage, "error");
      },
    });

  const form = useForm<ShippingMethodPayload>({
    resolver: zodResolver(shippingMethodSchema),
    defaultValues: shippingMethodInitialFormData,
    mode: "onChange",
  });

  useEffect(() => {
    if (shippingMethodId && shippingMethodData && !shippingMethodLoading) {
      const initialValues = {
        location_name: shippingMethodData?.data?.location || "",
        fee: shippingMethodData?.data?.amount?.toString() || "",
        shipping_description: shippingMethodData?.data?.description || "",
        visible_on_checkout: shippingMethodData?.data?.visible ?? false,
      };
      form.reset(initialValues);
    }
  }, [shippingMethodId, shippingMethodData, shippingMethodLoading, form]);

  const onSubmit: SubmitHandler<ShippingMethodPayload> = (values) => {
    const payload = {
      location: values.location_name.trim(),
      amount: values.fee || null,
      description: values.shipping_description.trim(),
      visible: values.visible_on_checkout || false,
    };

    if (shippingMethodId) {
      editShippingMethod({
        shippingId: shippingMethodId,
        payload,
      });
    } else {
      CreateShippingMethod({
        businessId: business_id,
        payload,
      });
    }
  };

  const resetShippingMethodForm = () => {
    form.reset(shippingMethodInitialFormData);
  };

  return {
    // Data
    ShippingData,
    allShippingDataLoading,
    ShippingError,
    shippingMethodData,
    shippingMethodLoading,

    // Form
    form,
    onSubmit,

    // delete
    deleteShipping,
    deleteShippingLoading,
    handleDeleteShipping,

    // Loadings
    isSubmitting: createShippingMethodLoading || editShippingMethodLoading,

    // Actions
    resetShippingMethodForm,
    refetch,
  };
};

export default useShippingHook;
