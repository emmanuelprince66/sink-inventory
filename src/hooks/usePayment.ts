import { useUpdateBusinessMutation } from "@/api/business/create-business";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useEffect, useState } from "react";
import { useToast } from "./toast/useToast";

export const usePayment = () => {
  const business_id = useBusinessStore((state: any) => state.business_id);

  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    refetch: refetchBusiness,
  } = useFetchBusinessById(business_id);
  const { showToast } = useToast();

  const [showConfirmKycModal, setShowConfirmKycModal] = useState(false);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(false);
  const [chargeOption, setChargeOption] = useState<"customer" | "myself">(
    "customer",
  );
  const [isSaving, setIsSaving] = useState(false);

  // Update state when BusinessData is loaded
  useEffect(() => {
    if (BusinessData?.data) {
      setOnlinePaymentEnabled(BusinessData.data.allow_online_payment || false);
      // If pay_transaction_charges is FALSE, customer pays (not business)
      setChargeOption(
        BusinessData.data.pay_transaction_charges ? "myself" : "customer",
      );
    }
  }, [BusinessData]);

  const updateBusinessMutation = useUpdateBusinessMutation({
    onSuccess: () => {
      setIsSaving(false);
      refetchBusiness();
      showToast("Update successful.", "success");
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  const handleOnlinePaymentToggle = (checked: boolean) => {
    // Check if user has completed KYC
    if (checked && !BusinessData?.data?.kyc) {
      // Show KYC modal
      setShowConfirmKycModal(true);
      return;
    }

    // If KYC is completed or toggling off, update the state
    setOnlinePaymentEnabled(checked);
  };

  const handleChargeOptionChange = (option: "customer" | "myself") => {
    setChargeOption(option);
  };

  const handleSaveChanges = () => {
    if (!BusinessData?.data?.id) return;

    setIsSaving(true);

    const formData = new FormData();
    formData.append("business_id", BusinessData.data.id);
    formData.append("allow_online_payment", String(onlinePaymentEnabled));
    // If customer pays, pay_transaction_charges should be FALSE
    // If myself pays, pay_transaction_charges should be TRUE
    formData.append(
      "pay_transaction_charges",
      String(chargeOption === "myself"),
    );

    updateBusinessMutation.mutate(formData);
  };

  const hasChanges = () => {
    if (!BusinessData?.data) return false;

    const currentPayCharges = chargeOption === "myself";
    return (
      onlinePaymentEnabled !== BusinessData.data.allow_online_payment ||
      currentPayCharges !== BusinessData.data.pay_transaction_charges
    );
  };

  return {
    BusinessData,
    BusinessDataLoading,
    showConfirmKycModal,
    setShowConfirmKycModal,
    onlinePaymentEnabled,
    chargeOption,
    isSaving,
    handleOnlinePaymentToggle,
    refetchBusiness,
    handleChargeOptionChange,
    handleSaveChanges,
    hasChanges: hasChanges(),
    isKycCompleted: BusinessData?.data?.kyc || false,
  };
};
