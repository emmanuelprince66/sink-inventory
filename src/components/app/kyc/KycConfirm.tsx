"use client";

import { Briefcase, Check, Shield, User } from "lucide-react";
import { useState } from "react";

import CorporateAcct from "./CorporateAcct";
import IndividualTierFlow from "./IndividualAcct";
import { CORPORATE_TIERS, INDIVIDUAL_TIERS } from "./tiers";

interface KycConfirmProps {
  page: boolean;
}

const KycConfirm = ({ page }: KycConfirmProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedAccountType, setSelectedAccountType] = useState<
    "individual" | "corporate" | null
  >(null);

  const handleContinue = () => {
    setShowIntro(false);
  };

  // ────────────────────────────────────────────────
  // Intro / Welcome Screen
  // ────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div
        className={`
          flex items-center justify-center min-h-[70vh] p-4 sm:p-6
          ${page ? "max-w-md mx-auto" : "w-full"}
        `}
      >
        <div className="bg-white rounded-xl shadow-sm w-full max-w-lg">
          <div className="text-center px-5 pt-8 pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              Let's verify your identity
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              In line with recent CBN regulations, all SYNC360 users must
              complete identity verification before receiving settlements.
            </p>
          </div>

          <div className="px-5 sm:px-8 pb-8">
            <p className="font-medium text-gray-800 mb-5 text-center sm:text-left">
              Choose your account type to get started:
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: User,
                  title: "Individual Account",
                  text: "Progressive verification with tiered limits",
                },
                {
                  icon: Briefcase,
                  title: "Corporate Account",
                  text: "Business verification with CAC documentation",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/30 transition-all cursor-pointer"
                >
                  <div className="p-2.5 bg-green-100 rounded-full shrink-0">
                    <item.icon className="text-green-600" size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 sm:px-8 pb-8">
            <button
              onClick={handleContinue}
              className="w-full bg-green-600 text-white py-3.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-base"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Account Type Selection Screen
  // ────────────────────────────────────────────────
  return (
    <div
      className={`
        mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm
        ${page ? "max-w-2xl w-full" : "w-full"}
      `}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center sm:text-left">
        Choose your account type
      </h1>

      <p className="text-gray-600 mb-6 text-center sm:text-left max-w-xl mx-auto sm:mx-0">
        Select the account type that best suits your needs. You can upgrade your
        tier limits at any time.
      </p>

      {!selectedAccountType ? (
        <div className="space-y-4 sm:space-y-5 mb-8">
          {/* Individual Account */}
          <div
            className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
              selectedAccountType === "individual"
                ? "border-green-500 bg-green-50/60 shadow-sm"
                : "border-gray-200 hover:border-green-300 hover:shadow"
            }`}
            onClick={() => setSelectedAccountType("individual")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    selectedAccountType === "individual"
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <User
                    size={22}
                    className={
                      selectedAccountType === "individual"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                    Individual Account
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Progressive verification tiers
                  </p>
                </div>
              </div>
              {selectedAccountType === "individual" && (
                <Check className="text-green-600" size={24} />
              )}
            </div>

            <div className="mt-4 pl-14 sm:pl-16 space-y-3 text-sm">
              {INDIVIDUAL_TIERS.map((tier) => (
                <div key={tier.tier} className="flex items-start gap-2">
                  <Shield
                    size={16}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  <span className="font-medium text-gray-700">
                    Tier {tier.tier}: {tier.limit} daily ({tier.requirement})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Corporate Account */}
          <div
            className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
              selectedAccountType === "corporate"
                ? "border-green-500 bg-green-50/60 shadow-sm"
                : "border-gray-200 hover:border-green-300 hover:shadow"
            }`}
            onClick={() => setSelectedAccountType("corporate")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    selectedAccountType === "corporate"
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Briefcase
                    size={22}
                    className={
                      selectedAccountType === "corporate"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                    Corporate Account
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    For registered businesses
                  </p>
                </div>
              </div>
              {selectedAccountType === "corporate" && (
                <Check className="text-green-600" size={24} />
              )}
            </div>

            <div className="mt-4 pl-14 sm:pl-16 space-y-3 text-sm">
              {CORPORATE_TIERS.map((tier) => (
                <div key={tier.tier} className="flex items-start gap-2">
                  <Shield
                    size={16}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  <span className="font-medium text-gray-700">
                    Tier {tier.tier}: {tier.limit} daily
                    <span className="block font-normal text-gray-600">
                      {tier.requirement}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedAccountType === "individual" ? (
            <IndividualTierFlow />
          ) : (
            <CorporateAcct />
          )}

          <div className="flex justify-start pt-4">
            <button
              type="button"
              onClick={() => setSelectedAccountType(null)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to account types
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-500">
        Verified by Third Party Providers
      </div>
    </div>
  );
};

export default KycConfirm;
