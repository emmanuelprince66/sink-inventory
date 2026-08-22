"use client";

import { useKycHook } from "@/hooks/useKycHook";
import { AlertCircle, CheckCircle, Shield } from "lucide-react";
import { useState } from "react";
import Tier1Form from "./Tier1form";
import Tier3Form from "./TierThreeForm";
import Tier2Form from "./TierTwoForm";
import { INDIVIDUAL_TIERS } from "./tiers";

const IndividualTierFlow = () => {
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(1);
  const [completedTiers, setCompletedTiers] = useState<number[]>([]);

  // One hook instance for the whole flow — all three tiers share this form, so
  // each cumulative submit can send everything captured by earlier tiers.
  const kyc = useKycHook();

  const handleTierComplete = (tier: number) => {
    if (!completedTiers.includes(tier)) {
      setCompletedTiers([...completedTiers, tier]);
    }
  };

  const canAccessTier = (tier: number) => {
    if (tier === 1) return true;
    if (tier === 2) return completedTiers.includes(1);
    if (tier === 3) return completedTiers.includes(2);
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Tier Progress Indicator */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Verification Progress
        </h3>
        <div className="space-y-3">
          {INDIVIDUAL_TIERS.map((item) => (
            <div
              key={item.tier}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                currentTier === item.tier
                  ? "bg-white shadow-sm border-2 border-green-500 cursor-pointer"
                  : completedTiers.includes(item.tier)
                    ? "bg-green-50 border border-green-200 cursor-pointer"
                    : canAccessTier(item.tier)
                      ? "bg-white/50 border border-gray-200 cursor-pointer hover:border-green-300"
                      : "bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed"
              }`}
              onClick={() => {
                if (canAccessTier(item.tier)) {
                  setCurrentTier(item.tier as 1 | 2 | 3);
                }
              }}
            >
              <div>
                {completedTiers.includes(item.tier) ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : currentTier === item.tier ? (
                  <Shield className="text-green-600" size={24} />
                ) : (
                  <Shield className="text-gray-400" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-gray-600">
                  {item.limit} daily • {item.requirement}
                </div>
              </div>
              {!canAccessTier(item.tier) && (
                <div className="text-xs text-gray-500 font-medium">Locked</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier Forms */}
      {currentTier === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-green-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">
              Tier 1: Basic Verification
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Provide your BVN or NIN to unlock a {INDIVIDUAL_TIERS[0].limit}{" "}
            daily transaction limit
          </p>

          <Tier1Form kyc={kyc} onComplete={() => handleTierComplete(1)} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mt-6">
            <AlertCircle className="text-blue-600 shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">After Tier 1 completion:</p>
              <p>
                You can start using your account immediately or upgrade to Tier
                2 for higher limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentTier === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-green-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">
              Tier 2: Enhanced Verification
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Add the other identity number to raise your daily limit to{" "}
            {INDIVIDUAL_TIERS[1].limit}
          </p>

          {!completedTiers.includes(1) ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-yellow-600 shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                Please complete Tier 1 verification before proceeding to Tier 2.
              </div>
            </div>
          ) : (
            <>
              <Tier2Form kyc={kyc} onComplete={() => handleTierComplete(2)} />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mt-6">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p>
                    Your information will be verified against government
                    databases for security purposes.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {currentTier === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-green-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">
              Tier 3: Full Verification
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Confirm your residential address to unlock the maximum daily limit
            of {INDIVIDUAL_TIERS[2].limit}
          </p>

          {!completedTiers.includes(2) ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-yellow-600 shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                Please complete Tier 2 verification before proceeding to Tier 3.
              </div>
            </div>
          ) : (
            <>
              <Tier3Form kyc={kyc} onComplete={() => handleTierComplete(3)} />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mt-6">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p>
                    Start typing and pick your address from the list — selecting
                    a suggestion is what confirms the state we send for
                    verification.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Completion Status */}
      {completedTiers.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-green-800 mb-2">
                {completedTiers.length === 1 && "Tier 1 completed!"}
                {completedTiers.length === 2 && "Tier 2 completed!"}
                {completedTiers.length === 3 && "All tiers completed!"}
              </p>
              <p className="text-sm text-green-700">
                {completedTiers.length < 3
                  ? "You can start using your account now or continue to the next tier for higher limits."
                  : "Congratulations! You have unlocked the maximum transaction limit."}
              </p>
            </div>
          </div>
          {completedTiers.length < 3 && canAccessTier(currentTier + 1) && (
            <button
              onClick={() =>
                setCurrentTier(Math.min(currentTier + 1, 3) as 1 | 2 | 3)
              }
              className="mt-3 w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              Continue to Tier {Math.min(currentTier + 1, 3)}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default IndividualTierFlow;
