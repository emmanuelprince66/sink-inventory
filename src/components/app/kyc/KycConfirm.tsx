import {
  Briefcase,
  Building,
  Check,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { useState } from "react";

// Import your existing components
import CorporateAcct from "./CorporateAcct";
import IndividualAcct from "./IndividualAcct";

const KycConfirm = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedTier, setSelectedTier] = useState<"tier1" | "tier2" | null>(
    null
  );

  const handleContinue = () => {
    setShowIntro(false);
  };

  // Introduction/Welcome Screen
  if (showIntro) {
    return (
      <div className=" flex items-center justify-center p-4 ">
        <div className="bg-white rounded-l w-full ">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Let's verify your identity
            </h2>
            <p className="text-sm text-gray-600">
              In line with recent CBN regulations, all SYNC360 users must
              complete identity verification before receiving settlements. To
              get verified, you’ll need:
            </p>
          </div>

          <div className="flex items-start space-x-6 mb-6">
            <div className="flex-1">
              <p className="font-medium text-gray-800 mb-4">
                You'll need the following to get verified:
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="text-green-600" size={16} />
                  </div>
                  <span className="text-sm text-gray-700">
                    Your Bank Verification Number (BVN)
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CreditCard className="text-green-600" size={16} />
                  </div>
                  <span className="text-sm text-gray-700">
                    A valid government-issued ID (NIN, Voter’s Card, or Driver’s
                    License)
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Building className="text-green-600" size={16} />
                  </div>
                  <span className="text-sm text-gray-700">
                    CAC Document verification 
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Main KYC Selection Screen
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-sm max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Choose a tier to get started
      </h1>

      <p className="text-gray-600 mb-6">
        In line with recent CBN regulations, all SYNC360 users must complete
        identity verification before receiving settlements.
      </p>

      {!selectedTier ? (
        <div className="space-y-4 mb-8">
          {/* Tier 1 Card */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTier === "tier1"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }`}
            onClick={() => setSelectedTier("tier1")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    selectedTier === "tier1"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Individual Account
                  </h3>
                  {/* <p className="text-sm text-gray-500">
                    Account can be opened with just BVN
                  </p> */}
                </div>
              </div>
              {selectedTier === "tier1" && (
                <Check className="text-green-600" size={20} />
              )}
            </div>
            <div className="mt-4 pl-11">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Account Limit 5,000,000</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Get a personal account</span>
                {/* <span className="ml-1">Personal Account</span> */}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">
                  Your Bank Verification Number (BVN)
                </span>
                {/* <span className="ml-1">BVN</span> */}
              </div>
            </div>
          </div>

          {/* Tier 2 Card */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTier === "tier2"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }`}
            onClick={() => setSelectedTier("tier2")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    selectedTier === "tier2"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Corporate Account
                  </h3>
                  <p className="text-sm text-gray-500">
                    Picking this Option means you have a CAC certificate
                  </p>
                </div>
              </div>
              {selectedTier === "tier2" && (
                <Check className="text-green-600" size={20} />
              )}
            </div>
            <div className="mt-4 pl-11">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">
                  Get a Corporate account number
                </span>
                {/* <span className="ml-1">Unlimited</span> */}
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Account limit 10,000,000</span>
                {/* <span className="ml-1">Personal/Business Account</span> */}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">
                  A valid government-issued ID (BVN, NIN, Voter’s Card,
                  CAC verification.
                </span>
                {/* <span className="ml-1">BVN, CAC Verification</span> */}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedTier === "tier1" ? <IndividualAcct /> : <CorporateAcct />}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        Verified by Third Party Providers
      </div>
    </div>
  );
};

export default KycConfirm;
