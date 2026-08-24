"use client";

import { Button } from "@/components/ui/button";
import { useKycHook } from "@/hooks/useKycHook";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import DemoSkipButton from "./DemoSkipButton";
import { LimitChip, Notice, TierPanel } from "./KycUi";
import Tier1Form from "./Tier1form";
import Tier3Form from "./TierThreeForm";
import Tier2Form from "./TierTwoForm";
import TierRail from "./TierRail";
import { INDIVIDUAL_TIERS } from "./tiers";

type Tier = 1 | 2 | 3;

const IndividualTierFlow = () => {
  const [currentTier, setCurrentTier] = useState<Tier>(1);
  const [completedTiers, setCompletedTiers] = useState<number[]>([]);

  // One hook instance for the whole flow — all three tiers share this form, so
  // each cumulative submit can send everything captured by earlier tiers.
  const kyc = useKycHook();

  const handleTierComplete = (tier: number) => {
    setCompletedTiers((prev) =>
      prev.includes(tier) ? prev : [...prev, tier],
    );
    // Move straight on to the next tier — the merchant just proved they are
    // willing to keep going, and stopping is one click away.
    if (tier < 3) setCurrentTier((tier + 1) as Tier);
  };

  const canAccessTier = (tier: number) =>
    tier === 1 || completedTiers.includes(tier - 1);

  const tierMeta = INDIVIDUAL_TIERS[currentTier - 1];

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-border-tint bg-primary-green-700 p-4">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-grey-2">
            Verification progress
          </h2>
          <TierRail
            tiers={INDIVIDUAL_TIERS}
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
              completedTiers.length === 3
                ? "All tiers verified"
                : `Tier ${Math.max(...completedTiers)} submitted`
            }
          >
            {completedTiers.length === 3 ? (
              "You have unlocked the maximum daily transaction limit."
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  You can start using the account now, or continue for a higher
                  limit.
                </span>
                {canAccessTier(currentTier + 1) && currentTier < 3 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="light"
                    onClick={() => setCurrentTier((currentTier + 1) as Tier)}
                  >
                    Continue to Tier {currentTier + 1}
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
              Complete Tier {currentTier - 1} before starting Tier {currentTier}.
            </Notice>
          ) : currentTier === 1 ? (
            <Tier1Form kyc={kyc} onComplete={() => handleTierComplete(1)} />
          ) : currentTier === 2 ? (
            <Tier2Form kyc={kyc} onComplete={() => handleTierComplete(2)} />
          ) : (
            <Tier3Form kyc={kyc} onComplete={() => handleTierComplete(3)} />
          )}
        </TierPanel>

        {/* ⚠️ DEMO ONLY — delete this block and the import to remove. */}
        <DemoSkipButton
          label={currentTier < 3 ? `Skip to Tier ${currentTier + 1}` : "Mark all tiers done"}
          onSkip={() => handleTierComplete(currentTier)}
        />
      </div>
    </div>
  );
};

export default IndividualTierFlow;
