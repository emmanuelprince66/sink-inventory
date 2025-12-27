"use client";

import { Building2, CreditCard, Info, Pencil } from "lucide-react";
import { useState } from "react";

const PaymentMethods = () => {
  const [activeTab, setActiveTab] = useState<"online" | "offline">("online");
  const [chargeOption, setChargeOption] = useState<"customer" | "myself">(
    "customer"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Payment Methods
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Connect the payment methods that suits your business
          </p>
        </div>

        {/* Tabs */}
        {/* <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("online")}
            className={`pb-4 px-1 text-base md:text-lg font-medium transition-colors relative ${
              activeTab === "online"
                ? "text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Online
            {activeTab === "online" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("offline")}
            className={`pb-4 px-1 text-base md:text-lg font-medium transition-colors relative ${
              activeTab === "offline"
                ? "text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Offline
            {activeTab === "offline" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        </div> */}

        {/* Content */}
        {activeTab === "online" && (
          <div className="space-y-8">
            {/* Available on Website Checkout */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Pencil className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    Available on Website Checkout
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                    Accept instant payments on your website and storefront
                    checkout with ease. Sync360 enables you to receive payments
                    through:
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm md:text-base">
                        <span className="font-medium">Card payments</span> (1.5%
                        transaction fee)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm md:text-base">
                        <span className="font-medium">
                          Virtual account transfers
                        </span>{" "}
                        (1% transaction fee)
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Payments are processed instantly and settled seamlessly,
                    giving your customers a smooth checkout experience while you
                    stay in full control.
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Charges */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Transaction Charges
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                Who pays the transaction fee?
              </p>

              <div className="mb-6">
                <p className="text-gray-900 font-medium text-base md:text-lg mb-4">
                  You decide.
                </p>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                  With Sync360, transaction fees can be:
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    <p className="text-gray-700 text-sm md:text-base">
                      Paid by your business, or
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    <p className="text-gray-700 text-sm md:text-base">
                      Passed on to your customers at checkout
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  This flexibility allows you to manage pricing, margins, and
                  customer experience the way that works best for your business.
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setChargeOption("myself")}
                  className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all text-left ${
                    chargeOption === "myself"
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        chargeOption === "myself"
                          ? "border-gray-400 bg-white"
                          : "border-gray-300"
                      }`}
                    >
                      {chargeOption === "myself" && (
                        <div className="w-2.5 h-2.5 rounded-sm bg-gray-400" />
                      )}
                    </div>
                    <span className="text-gray-900 font-medium text-sm md:text-base">
                      Myself
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setChargeOption("customer")}
                  className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all text-left ${
                    chargeOption === "customer"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        chargeOption === "customer"
                          ? "border-green-600 bg-white"
                          : "border-gray-300"
                      }`}
                    >
                      {chargeOption === "customer" && (
                        <svg
                          className="w-4 h-4 text-green-600"
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
                      className={`font-medium text-sm md:text-base ${
                        chargeOption === "customer"
                          ? "text-green-700"
                          : "text-gray-900"
                      }`}
                    >
                      Customer
                    </span>
                  </div>
                </button>
              </div>

              {/* Info Box */}
              {chargeOption === "customer" && (
                <div className="mt-6 flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-900 text-sm leading-relaxed">
                    Checking this will allow you to pass transaction charges to
                    your customers. This will be added to your customer's
                    payment at checkout.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "offline" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Offline payment methods coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
