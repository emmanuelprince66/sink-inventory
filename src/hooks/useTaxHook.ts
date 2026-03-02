import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useAddTaxMutation } from "@/api/tax/add-tax";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

// Tax rate schema
const taxRateSchema = z.object({
  rate: z
    .string()
    .min(1, "Tax rate is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      {
        message: "Tax rate must be between 0 and 100",
      },
    ),
});

type TaxRateFormValues = z.infer<typeof taxRateSchema>;

export const useTaxHook = ({
  closeModal,
}: { closeModal?: () => void } = {}) => {
  const { showToast } = useToast();
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    refetch,
  } = useFetchBusinessById(business_id);

  const findBusiness = BusinessData?.data;

  // State
  const [isEditTaxModalOpen, setIsEditTaxModalOpen] = useState(false);

  // Form
  const taxForm = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      rate: findBusiness?.tax_rate || "0.00",
    },
  });

  // Update form when businessData changes or modal opens
  useEffect(() => {
    if (findBusiness?.tax_rate && isEditTaxModalOpen && !BusinessDataLoading) {
      taxForm.reset({
        rate: findBusiness.tax_rate,
      });
    }
  }, [
    findBusiness?.tax_rate,
    isEditTaxModalOpen,
    taxForm,
    BusinessDataLoading,
  ]);

  // Mutation
  const {
    mutate: updateTaxRate,
    isPending: isLoading,
    isSuccess: updateTaxSuccess,
  } = useAddTaxMutation({
    businessId: business_id,
    onSuccess: (data) => {
      console.log("Tax rate updated successfully:", data);
      showToast(data.message || "Tax rate updated successfully", "success");
      setIsEditTaxModalOpen(false);

      refetch();

      if (closeModal) closeModal();
    },
    onError: (error: any) => {
      console.error("Error updating tax rate:", error);
      showToast(
        error?.message || "Failed to update tax rate. Please try again.",
        "error",
      );
    },
  });

  // Handlers
  const handleUpdateTax = (values: TaxRateFormValues) => {
    if (!business_id) {
      showToast("Business ID not found", "error");
      return;
    }

    const payload = {
      rate: values.rate,
    };

    updateTaxRate({ businessId: business_id, payload });
  };

  const handleOpenEditModal = () => {
    setIsEditTaxModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditTaxModalOpen(false);
    taxForm.reset({
      rate: findBusiness?.tax_rate || "0.00",
    });
  };

  // Computed values
  const taxRate = findBusiness?.tax_rate
    ? parseFloat(findBusiness.tax_rate)
    : 0;
  const lastUpdated = findBusiness?.tax_rate_last_updated;

  return {
    // State
    findBusiness,
    BusinessDataLoading,
    isEditTaxModalOpen,
    setIsEditTaxModalOpen,

    // Form
    taxForm,

    // Handlers
    handleUpdateTax,
    handleOpenEditModal,
    handleCloseEditModal,

    // Loading states
    isLoading,
    updateTaxSuccess,

    // Computed values
    taxRate,
    lastUpdated,
  };
};
