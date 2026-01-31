"use client";

import {
  Briefcase,
  Building,
  Check,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { useState } from "react";

import CorporateAcct from "./CorporateAcct";
import IndividualAcct from "./IndividualAcct";

interface KycConfirmProps {
  page: boolean;
}

const KycConfirm = ({ page }: KycConfirmProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedTier, setSelectedTier] = useState<"tier1" | "tier2" | null>(
    null,
  );

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
              You'll need the following to get verified:
            </p>

            <div className="space-y-4">
              {[
                { icon: FileText, text: "Your Bank Verification Number (BVN)" },
                {
                  icon: CreditCard,
                  text: "A valid government-issued ID (NIN, Voter’s Card, or Driver’s License)",
                },
                { icon: Building, text: "CAC Document verification" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-full shrink-0">
                    <item.icon className="text-green-600" size={18} />
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    {item.text}
                  </span>
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
  // Tier Selection + Form Screen
  // ────────────────────────────────────────────────
  return (
    <div
      className={`
        mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm
        ${page ? "max-w-2xl w-full" : "w-full"}
      `}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center sm:text-left">
        Choose a tier to get started
      </h1>

      <p className="text-gray-600 mb-6 text-center sm:text-left max-w-xl mx-auto sm:mx-0">
        In line with recent CBN regulations, all SYNC360 users must complete
        identity verification before receiving settlements.
      </p>

      {!selectedTier ? (
        <div className="space-y-4 sm:space-y-5 mb-8">
          {/* Tier 1 – Individual */}
          <div
            className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
              selectedTier === "tier1"
                ? "border-green-500 bg-green-50/60 shadow-sm"
                : "border-gray-200 hover:border-green-300 hover:shadow"
            }`}
            onClick={() => setSelectedTier("tier1")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    selectedTier === "tier1" ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <User
                    size={22}
                    className={
                      selectedTier === "tier1"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                    Individual Account
                  </h3>
                </div>
              </div>
              {selectedTier === "tier1" && (
                <Check className="text-green-600" size={24} />
              )}
            </div>

            <div className="mt-4 pl-14 sm:pl-16 space-y-2 text-sm sm:text-base">
              <div className="font-medium text-gray-700">
                Account Limit: ₦5,000,000
              </div>
              <div className="text-gray-600">Personal account</div>
              <div className="text-gray-600">BVN required</div>
            </div>
          </div>

          {/* Tier 2 – Corporate */}
          <div
            className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
              selectedTier === "tier2"
                ? "border-green-500 bg-green-50/60 shadow-sm"
                : "border-gray-200 hover:border-green-300 hover:shadow"
            }`}
            onClick={() => setSelectedTier("tier2")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    selectedTier === "tier2" ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Briefcase
                    size={22}
                    className={
                      selectedTier === "tier2"
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
                    Requires CAC certificate
                  </p>
                </div>
              </div>
              {selectedTier === "tier2" && (
                <Check className="text-green-600" size={24} />
              )}
            </div>

            <div className="mt-4 pl-14 sm:pl-16 space-y-2 text-sm sm:text-base">
              <div className="font-medium text-gray-700">
                Account Limit: ₦10,000,000
              </div>
              <div className="text-gray-600">Corporate account number</div>
              <div className="text-gray-600">
                BVN, NIN / Voter’s Card / Driver’s License + CAC verification
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedTier === "tier1" ? <IndividualAcct /> : <CorporateAcct />}

          <div className="flex justify-start pt-4">
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to tiers
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
