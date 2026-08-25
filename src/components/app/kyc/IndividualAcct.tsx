"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useKycHook } from "@/hooks/useKycHook";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import AccountStatusCard from "./AccountStatusCard";
import { LimitChip, Notice, TierPanel } from "./KycUi";
import Tier1Form from "./Tier1form";
import Tier2Form from "./TierTwoForm";
import TierRail from "./TierRail";
import { INDIVIDUAL_TIERS } from "./tiers";

// Tier 3's address autocomplete drags in country-state-city, which is most of
// this route's weight. Nobody reaches Tier 3 without clearing two tiers first,
// so it loads when they get there rather than on every KYC visit.
const Tier3Form = dynamic(() => import("./TierThreeForm"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-16">
      <Spinner className="text-primary-green-300" />
    </div>
  ),
});

type Tier = 1 | 2 | 3;

const firstUnfinished = (completed: number[]): Tier => {
  if (!completed.includes(1)) return 1;
  if (!completed.includes(2)) return 2;
  return 3;
};

const IndividualTierFlow = () => {
  const [currentTier, setCurrentTier] = useState<Tier>(1);

  // One hook instance for the whole flow — all three tiers share this form,
  // and the account's verified state comes from the same place.
  const kyc = useKycHook();
  const { verification } = kyc;

  // Tiers just submitted in this session, merged with what the account
  // payload reports. The payload is the truth, but it takes a refetch to
  // catch up, and the rail should not go backwards in the meantime.
  const [justSubmitted, setJustSubmitted] = useState<number[]>([]);
  const completedTiers = Array.from(
    new Set([...verification.completedTiers, ...justSubmitted]),
  );

  // Land on the first tier that still needs something, once — after that the
  // rail is the merchant's to steer, so a refetch never yanks them elsewhere.
  const landed = useRef(false);
  useEffect(() => {
    if (landed.current || verification.isLoading) return;
    landed.current = true;
    setCurrentTier(firstUnfinished(verification.completedTiers));
  }, [verification.isLoading, verification.completedTiers]);

  const handleTierComplete = (tier: number) => {
    setJustSubmitted((prev) => (prev.includes(tier) ? prev : [...prev, tier]));
    if (tier < 3) setCurrentTier((tier + 1) as Tier);
  };

  const canAccessTier = (tier: number) =>
    tier === 1 || completedTiers.includes(tier - 1);

  const tierMeta = INDIVIDUAL_TIERS[currentTier - 1];

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <AccountStatusCard verification={verification} />

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
                : `Tier ${Math.max(...completedTiers)} verified`
            }
          >
            {completedTiers.length === 3 ? (
              "You have unlocked the maximum daily transaction limit."
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  You can keep using the account as it is, or continue for a
                  higher limit.
                </span>
                {currentTier < 3 && canAccessTier(currentTier + 1) && (
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
          {/* Hold the form back until the account's state is known — showing
              Tier 1 to someone already on Tier 2 asks for a number the
              provider will reject as a duplicate. */}
          {verification.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-primary-green-300" />
            </div>
          ) : completedTiers.includes(currentTier) ? (
            <Notice tone="success" title="Already verified">
              This tier is complete. Pick the next one from the progress list to
              carry on.
            </Notice>
          ) : !canAccessTier(currentTier) ? (
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
      </div>
    </div>
  );
};

export default IndividualTierFlow;
