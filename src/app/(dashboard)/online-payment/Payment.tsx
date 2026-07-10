"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { usePayment } from "@/hooks/usePayment";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Globe,
  Info,
  Loader2,
  Pencil,
} from "lucide-react";
import Description from "./Description";

const PaymentMethods = () => {
  const {
    BusinessData,
    BusinessDataLoading,
    showConfirmKycModal,
    setShowConfirmKycModal,
    onlinePaymentEnabled,
    chargeOption,
    isSaving,
    handleOnlinePaymentToggle,
    handleChargeOptionChange,
    handleSaveChanges,
    hasChanges,
    isKycCompleted,
  } = usePayment();

  // Loading state
  if (BusinessDataLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-green-300 animate-spin" />
          <p className="text-grey-3 text-sm">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-grey-1">
          Payment Methods
        </h1>
        <p className="text-grey-3 text-sm mt-1">
          Configure secure payment options for your customers
        </p>
      </div>

      <div className="space-y-4">
        {/* Online Payment Toggle Section */}
        <div className="bg-white rounded-2xl border border-border-tint p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-6 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-primary-green-300" />
                </div>
                <h2 className="text-lg font-extrabold text-grey-1">
                  Online Payment
                </h2>
              </div>
              <p className="text-grey-3 text-sm leading-relaxed mb-4">
                Enable seamless online payments through your store URL. Your
                customers can make instant purchases using their preferred
                payment methods directly on your website. This feature
                provides a professional checkout experience with secure
                payment processing, real-time transaction tracking, and
                automatic payment confirmations.
              </p>
              <div className="flex items-start gap-2 p-3 bg-warning-2 rounded-lg border border-warning-1/20">
                <Info className="w-4 h-4 text-warning-1 flex-shrink-0 mt-0.5" />
                <p className="text-warning-1 text-xs leading-relaxed">
                  <span className="font-bold">KYC Verification Required:</span>{" "}
                  To enable online payments, you must complete your business
                  verification (KYC). This ensures secure transactions and
                  builds customer trust.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <Switch
                checked={onlinePaymentEnabled}
                onCheckedChange={handleOnlinePaymentToggle}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  onlinePaymentEnabled ? "text-primary-green-300" : "text-grey-4",
                )}
              >
                {onlinePaymentEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* KYC Status Badge */}
          {isKycCompleted ? (
            <div className="mt-6 flex items-center gap-2 p-3 bg-success-2 rounded-lg w-fit">
              <CheckCircle2 className="w-4 h-4 text-success-1" />
              <span className="text-success-1 text-sm font-bold">
                KYC Verified
              </span>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2 p-3 bg-warning-2 rounded-lg w-fit">
              <AlertCircle className="w-4 h-4 text-warning-1" />
              <span className="text-warning-1 text-sm font-bold">
                KYC Not Completed
              </span>
            </div>
          )}
        </div>

        {/* Available on Website Checkout - Always visible */}
        <div className="bg-white rounded-2xl border border-border-tint p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center flex-shrink-0">
              <Pencil className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-grey-1 mb-3">
                Available Payment Options
              </h2>
              <p className="text-grey-3 text-sm leading-relaxed mb-4">
                Accept instant payments on your website and storefront
                checkout with ease. Sync360 enables you to receive payments
                through:
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-4 p-4 bg-grey-6 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-white border border-grey-5 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-grey-2" />
                  </div>
                  <div>
                    <p className="text-grey-1 font-bold text-sm mb-0.5">
                      Card
                    </p>
                    <p className="text-grey-3 text-xs">
                      1.5% transaction fee per payment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-grey-6 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-white border border-grey-5 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-grey-2" />
                  </div>
                  <div>
                    <p className="text-grey-1 font-bold text-sm mb-0.5">
                      Bank Transfer
                    </p>
                    <p className="text-grey-3 text-xs">
                      1% transaction fee per transfer
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-grey-3 text-sm leading-relaxed">
                Payments are processed instantly and settled seamlessly,
                giving your customers a smooth checkout experience while you
                stay in full control.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Charges - Always visible */}
        <div className="bg-white rounded-2xl border border-border-tint p-6">
          <h2 className="text-lg font-extrabold text-grey-1 mb-1">
            Transaction Charges
          </h2>
          <p className="text-grey-3 text-sm mb-4">
            Who pays the transaction fee?
          </p>

          <div className="mb-6">
            <p className="text-grey-1 font-extrabold text-base mb-3">
              You decide.
            </p>
            <p className="text-grey-3 text-sm leading-relaxed mb-3">
              With Sync360, transaction fees can be:
            </p>
            <div className="space-y-2 mb-4 ml-1">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-green-300 mt-2 flex-shrink-0" />
                <p className="text-grey-2 text-sm">
                  Absorbed by your business, or
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-green-300 mt-2 flex-shrink-0" />
                <p className="text-grey-2 text-sm">
                  Passed on to your customers at checkout
                </p>
              </div>
            </div>
            <p className="text-grey-3 text-sm leading-relaxed">
              This flexibility allows you to manage pricing, margins, and
              customer experience the way that works best for your business.
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleChargeOptionChange("myself")}
              className={cn(
                "flex-1 px-5 py-4 rounded-xl border-2 transition-all text-left cursor-pointer",
                chargeOption === "myself"
                  ? "border-primary-green-300 bg-secondary-6"
                  : "border-border-tint bg-white hover:border-grey-5",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    chargeOption === "myself"
                      ? "border-primary-green-300 bg-white"
                      : "border-grey-5",
                  )}
                >
                  {chargeOption === "myself" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-green-300" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-bold text-sm",
                    chargeOption === "myself"
                      ? "text-primary-green-300"
                      : "text-grey-2",
                  )}
                >
                  Myself (Business)
                </span>
              </div>
            </button>

            <button
              onClick={() => handleChargeOptionChange("customer")}
              className={cn(
                "flex-1 px-5 py-4 rounded-xl border-2 transition-all text-left cursor-pointer",
                chargeOption === "customer"
                  ? "border-primary-green-300 bg-secondary-6"
                  : "border-border-tint bg-white hover:border-grey-5",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    chargeOption === "customer"
                      ? "border-primary-green-300 bg-white"
                      : "border-grey-5",
                  )}
                >
                  {chargeOption === "customer" && (
                    <Check className="w-3 h-3 text-primary-green-300" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-bold text-sm",
                    chargeOption === "customer"
                      ? "text-primary-green-300"
                      : "text-grey-2",
                  )}
                >
                  Customer
                </span>
              </div>
            </button>
          </div>

          {/* Info Box */}
          {chargeOption === "customer" && (
            <div className="mt-4 flex gap-3 p-4 bg-secondary-6 rounded-xl border border-border-tint">
              <Info className="w-4 h-4 text-primary-green-300 flex-shrink-0 mt-0.5" />
              <p className="text-primary-green-100 text-sm leading-relaxed">
                Selecting this option will pass transaction charges to your
                customers. The applicable fee will be added to their total at
                checkout, ensuring transparent pricing.
              </p>
            </div>
          )}
        </div>

        {/* Save Button - Only show if there are changes */}
        {hasChanges && (
          <div className="flex justify-end pb-4">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner color="text-white" size="sm" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* KYC Modal */}
      <CustomModal
        isOpen={showConfirmKycModal}
        onClose={() => setShowConfirmKycModal(false)}
        title=""
      >
        <Description />
      </CustomModal>
    </div>
  );
};

export default PaymentMethods;
