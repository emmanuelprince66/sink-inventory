"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useKycHook } from "@/hooks/useKycHook";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AccountStatusCard from "./AccountStatusCard";
import CorporateTier1Form from "./CorporateTierOneForm";
import CorporateTier2Form from "./CorporateTierTwoForm";
import { LimitChip, Notice, TierPanel } from "./KycUi";
import TierRail from "./TierRail";
import { CORPORATE_TIERS } from "./tiers";

type Tier = 1 | 2;

interface CorporateAcctProps {
  /** Owned by KycConfirm so the page reads the account payload once. */
  kyc: ReturnType<typeof useKycHook>;
}

const CorporateAcct = ({ kyc }: CorporateAcctProps) => {
  const [currentTier, setCurrentTier] = useState<Tier>(1);
  const { verification, corporateReview } = kyc;

  // Same shape as the individual flow: the account payload is the truth, and
  // tiers submitted in this session are merged in so the rail does not go
  // backwards while the refetch is in flight.
  const [justSubmitted, setJustSubmitted] = useState<number[]>([]);
  // A submission that has been approved raises the account's tier; one still
  // under review does not, so both are read — otherwise a merchant who filed
  // yesterday is handed the upload form again.
  const completedTiers = Array.from(
    new Set([
      ...verification.corporateCompletedTiers,
      ...(corporateReview.isApproved ? [2] : []),
      ...justSubmitted,
    ]),
  );

  /**
   * Filed and waiting. Takes precedence over the local "just submitted" mark:
   * a submission is not verification, and telling a merchant their documents
   * are approved the moment they upload them is a promise we cannot keep.
   */
  const awaitingReview = corporateReview.isPending;

  // Land once on the first tier that still needs something — a business
  // already on TIER 1 opens on Tier 2, not back at the business details it
  // has already filled in.
  const landed = useRef(false);
  useEffect(() => {
    if (landed.current || verification.isLoading) return;
    landed.current = true;
    setCurrentTier(verification.corporateCompletedTiers.includes(1) ? 2 : 1);
  }, [verification.isLoading, verification.corporateCompletedTiers]);

  const handleTierComplete = (tier: number) => {
    setJustSubmitted((prev) => (prev.includes(tier) ? prev : [...prev, tier]));
    if (tier < 2) setCurrentTier((tier + 1) as Tier);
  };

  const canAccessTier = (tier: number) =>
    tier === 1 || completedTiers.includes(tier - 1);

  const tierMeta = CORPORATE_TIERS[currentTier - 1];
  const resuming = justSubmitted.length === 0 && completedTiers.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <AccountStatusCard verification={verification} />

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
            tone={awaitingReview ? "info" : "success"}
            title={
              awaitingReview
                ? "Documents submitted — under review"
                : completedTiers.includes(2)
                  ? "Corporate account fully verified"
                  : resuming
                    ? "Welcome back — Tier 1 is verified"
                    : "Tier 1 submitted"
            }
          >
            {awaitingReview ? (
              "We will email you as soon as they clear. Your Tier 1 limit stays in place until then."
            ) : completedTiers.includes(2) ? (
              "Your corporate documents have been approved."
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  {resuming
                    ? "Tier 2 adds your CAC documents and director records. Pick up where you left off."
                    : "You can start using the account now, or continue to full document verification."}
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
          {/* Hold the form back until the account's state is known, so a
              business already past Tier 1 never sees it flash. */}
          {verification.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-primary-green-300" />
            </div>
          ) : currentTier === 2 && awaitingReview ? (
            <Notice tone="info" title="Documents are with our review team">
              Filed{" "}
              {corporateReview.submittedAt
                ? new Date(corporateReview.submittedAt).toLocaleDateString(
                    "en-NG",
                    { day: "numeric", month: "long", year: "numeric" },
                  )
                : "recently"}
              {corporateReview.directors.length > 0 &&
                ` · ${corporateReview.directors.length} ${
                  corporateReview.directors.length === 1
                    ? "director"
                    : "directors"
                }`}
              . Nothing further is needed from you — we will email you as soon
              as they clear. Your Tier 1 limit stays in place until then.
            </Notice>
          ) : currentTier === 2 && corporateReview.isRejected ? (
            <>
              <Notice
                tone="warning"
                title="Your documents were sent back"
                className="mb-5"
              >
                Something in the last submission could not be accepted. Check
                your email for what needs changing, then file again below.
              </Notice>
              <CorporateTier2Form
                kyc={kyc}
                onComplete={() => handleTierComplete(2)}
              />
            </>
          ) : completedTiers.includes(currentTier) ? (
            <Notice tone="success" title="Already verified">
              This tier is complete. Pick the next one from the progress list to
              carry on.
            </Notice>
          ) : !canAccessTier(currentTier) ? (
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
