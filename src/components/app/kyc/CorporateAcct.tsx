"use client";

import { Button } from "@/components/ui/button";
import { useKycHook } from "@/hooks/useKycHook";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import CorporateTier1Form from "./CorporateTierOneForm";
import CorporateTier2Form from "./CorporateTierTwoForm";
import AccountStatusCard from "./AccountStatusCard";
import { LimitChip, Notice, TierPanel } from "./KycUi";
import TierRail from "./TierRail";
import { CORPORATE_TIERS } from "./tiers";

type Tier = 1 | 2;

const CorporateAcct = () => {
  const [currentTier, setCurrentTier] = useState<Tier>(1);
  const [completedTiers, setCompletedTiers] = useState<number[]>([]);

  // One hook instance for both tiers — Tier 2 re-submits everything Tier 1
  // collected, so they have to share the same form.
  const kyc = useKycHook();

  const handleTierComplete = (tier: number) => {
    setCompletedTiers((prev) => (prev.includes(tier) ? prev : [...prev, tier]));
    if (tier < 2) setCurrentTier((tier + 1) as Tier);
  };

  const canAccessTier = (tier: number) =>
    tier === 1 || completedTiers.includes(tier - 1);

  const tierMeta = CORPORATE_TIERS[currentTier - 1];

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <AccountStatusCard verification={kyc.verification} />

        <div className="rounded-2xl border border-border-tint bg-primary-green-700 p-4">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-grey-2">
            Verification progress
          </h2>
          <TierRail
            tiers={CORPORATE_TIERS}
            currentTier={currentTier}
            completedTiers={completedTiers}
            canAccessTier={canAccessTier}
            onSelect={(tier) => setCurrentTier(tier as Tier)}
          />
        </div>
      </aside>

      <div className="space-y-5">
        {completedTiers.length > 0 && (
          <Notice
            tone="success"
            title={
              completedTiers.includes(2)
                ? "Corporate account fully verified"
                : "Tier 1 submitted"
            }
          >
            {completedTiers.includes(2) ? (
              "Your documents are with our review team. We will email you as soon as they clear."
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  You can start using the account now, or continue to full
                  document verification.
                </span>
                {currentTier === 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="light"
                    onClick={() => setCurrentTier(2)}
                  >
                    Continue to Tier 2
                    <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            )}
          </Notice>
        )}

        <TierPanel
          tier={currentTier}
          title={tierMeta.title}
          description={tierMeta.description}
          aside={<LimitChip limit={tierMeta.limit} />}
        >
          {!canAccessTier(currentTier) ? (
            <Notice tone="locked" title="Locked">
              Complete Tier 1 before starting Tier 2.
            </Notice>
          ) : currentTier === 1 ? (
            <CorporateTier1Form
              kyc={kyc}
              onComplete={() => handleTierComplete(1)}
            />
          ) : (
            <CorporateTier2Form
              kyc={kyc}
              onComplete={() => handleTierComplete(2)}
            />
          )}
        </TierPanel>
      </div>
    </div>
  );
};

export default CorporateAcct;
