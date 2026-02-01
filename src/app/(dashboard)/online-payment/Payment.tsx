"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { usePayment } from "@/hooks/usePayment";
import {
  AlertCircle,
  Building2,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-slate-600 text-lg">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3 md:mb-4">
            Payment Methods
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Configure secure payment options for your customers
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Online Payment Toggle Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                    Online Payment
                  </h2>
                </div>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                  Enable seamless online payments through your store URL. Your
                  customers can make instant purchases using their preferred
                  payment methods directly on your website. This feature
                  provides a professional checkout experience with secure
                  payment processing, real-time transaction tracking, and
                  automatic payment confirmations.
                </p>
                <div className="flex items-start gap-2 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-900 text-xs md:text-sm leading-relaxed">
                    <span className="font-semibold">
                      KYC Verification Required:
                    </span>{" "}
                    To enable online payments, you must complete your business
                    verification (KYC). This ensures secure transactions and
                    builds customer trust.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex flex-col items-start md:items-end gap-3">
                <button
                  onClick={() =>
                    handleOnlinePaymentToggle(!onlinePaymentEnabled)
                  }
                  className={`relative inline-flex h-8 w-14 md:h-10 md:w-16 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    onlinePaymentEnabled
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 focus:ring-emerald-500/30"
                      : "bg-slate-300 focus:ring-slate-300/30"
                  }`}
                  role="switch"
                  aria-checked={onlinePaymentEnabled}
                >
                  <span
                    className={`inline-block h-6 w-6 md:h-8 md:w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                      onlinePaymentEnabled
                        ? "translate-x-7 md:translate-x-8"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm md:text-base font-semibold ${
                    onlinePaymentEnabled ? "text-emerald-600" : "text-slate-500"
                  }`}
                >
                  {onlinePaymentEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* KYC Status Badge */}
            {isKycCompleted ? (
              <div className="mt-6 flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 w-fit">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-900 text-sm font-medium">
                  KYC Verified
                </span>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100 w-fit">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-orange-900 text-sm font-medium">
                  KYC Not Completed
                </span>
              </div>
            )}
          </div>

          {/* Available on Website Checkout - Always visible */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                <Pencil className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                  Available Payment Options
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                  Accept instant payments on your website and storefront
                  checkout with ease. Sync360 enables you to receive payments
                  through:
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CreditCard className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm md:text-base mb-1">
                        Card
                      </p>
                      <p className="text-slate-600 text-xs md:text-sm">
                        1.5% transaction fee per payment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Building2 className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm md:text-base mb-1">
                        Bank Transfer
                      </p>
                      <p className="text-slate-600 text-xs md:text-sm">
                        1% transaction fee per transfer
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  Payments are processed instantly and settled seamlessly,
                  giving your customers a smooth checkout experience while you
                  stay in full control.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Charges - Always visible */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              Transaction Charges
            </h2>
            <p className="text-slate-600 text-sm md:text-base mb-6">
              Who pays the transaction fee?
            </p>

            <div className="mb-6">
              <p className="text-slate-900 font-bold text-base md:text-lg mb-4">
                You decide.
              </p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                With Sync360, transaction fees can be:
              </p>
              <div className="space-y-3 mb-6 ml-1">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <p className="text-slate-700 text-sm md:text-base">
                    Absorbed by your business, or
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <p className="text-slate-700 text-sm md:text-base">
                    Passed on to your customers at checkout
                  </p>
                </div>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                This flexibility allows you to manage pricing, margins, and
                customer experience the way that works best for your business.
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleChargeOptionChange("myself")}
                className={`flex-1 px-5 md:px-6 py-4 md:py-5 rounded-xl border-2 transition-all text-left ${
                  chargeOption === "myself"
                    ? "border-slate-400 bg-slate-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      chargeOption === "myself"
                        ? "border-slate-600 bg-white"
                        : "border-slate-300"
                    }`}
                  >
                    {chargeOption === "myself" && (
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <span className="text-slate-900 font-semibold text-sm md:text-base">
                    Myself (Business)
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleChargeOptionChange("customer")}
                className={`flex-1 px-5 md:px-6 py-4 md:py-5 rounded-xl border-2 transition-all text-left ${
                  chargeOption === "customer"
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      chargeOption === "customer"
                        ? "border-emerald-600 bg-white"
                        : "border-slate-300"
                    }`}
                  >
                    {chargeOption === "customer" && (
                      <svg
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`font-semibold text-sm md:text-base ${
                      chargeOption === "customer"
                        ? "text-emerald-700"
                        : "text-slate-900"
                    }`}
                  >
                    Customer
                  </span>
                </div>
              </button>
            </div>

            {/* Info Box */}
            {chargeOption === "customer" && (
              <div className="mt-6 flex gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-900 text-sm leading-relaxed">
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
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </div>
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
