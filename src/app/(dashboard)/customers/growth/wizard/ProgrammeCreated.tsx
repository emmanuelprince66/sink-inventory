"use client";

import { useFetchLoyaltyProgramDetailQuery } from "@/api/loyalty/fetch-loyalty-program-detail";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import type { LoyaltyProgram } from "@/types/loyalty";
import LoyaltyQrCard from "./LoyaltyQrCard";

/**
 * Shown once a programme is created. The card artwork lives in LoyaltyQrCard
 * so this screen and the QR modal always show the same thing.
 *
 * The join token is not in the create response, so the detail endpoint is
 * queried for qr_details.token to build the customer preview link.
 */
const ProgrammeCreated = ({
  program,
  onDone,
}: {
  program: LoyaltyProgram;
  onDone: () => void;
}) => {
  const { data, isLoading } = useFetchLoyaltyProgramDetailQuery({
    params: { programId: program.id ?? "" },
  });

  const token = data?.data?.qr_details?.token;
  const qrUrl = data?.data?.qr_details?.qr_url ?? program.qr_url ?? null;

  // Only a visit streak maps onto stamp dots — a spend target is money.
  const visitCondition = program.conditions?.find((c) => c.type === "VISIT");
  const streakLength = Number(visitCondition?.threshold ?? 0) || 0;

  return (
    <div className="flex flex-col">
      <div className="shrink-0 border-b border-grey-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green-500 text-base">
            🎉
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-grey-1">
              Programme Created!
            </h2>
            <p className="text-[11px] text-grey-3">
              Here&apos;s the card your customers will scan to join.
            </p>
          </div>
        </div>
      </div>

      <div className="py-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : (
          <LoyaltyQrCard
            programmeName={program.name}
            rewardSummary={program.reward_summary}
            triggerSummary={program.trigger_summary}
            streakLength={streakLength}
            qrUrl={qrUrl}
            joinUrl={
              token
                ? `${window.location.origin}/loyalty/join/${token}`
                : undefined
            }
          />
        )}
      </div>

      <div className="shrink-0 border-t border-grey-5 pt-3">
        <Button className="h-11 w-full rounded-xl" onClick={onDone}>
          ✓ Done — View All Programmes
        </Button>
      </div>
    </div>
  );
};

export default ProgrammeCreated;
