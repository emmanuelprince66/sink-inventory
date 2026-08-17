"use client";

import { useFetchLoyaltyProgramDetailQuery } from "@/api/loyalty/fetch-loyalty-program-detail";
import { useFetchLoyaltyProgramQrQuery } from "@/api/loyalty/fetch-loyalty-program-qr";
import { Spinner } from "@/components/app/Spinner";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import {
  loyaltyJoinUrl,
  loyaltyJoinUrlForThisBrowser,
} from "@/utils/loyaltyJoinUrl";
import LoyaltyQrCard from "./wizard/LoyaltyQrCard";

// Shows the same card artwork the merchant gets after creating a programme,
// so what they hand a customer is identical wherever they opened it from.
const ProgramQrModal = ({ programId }: { programId: string }) => {
  const businessData = useBusinessDataStore((state: any) => state.businessData);
  const { data: qrRes, isLoading: qrLoading } = useFetchLoyaltyProgramQrQuery({
    params: { programId },
  });
  const { data, isLoading } = useFetchLoyaltyProgramDetailQuery({
    params: { programId },
  });

  if (qrLoading || isLoading) {
    return (
      <div className="w-full flex justify-center py-16">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  const qr = qrRes?.data ?? data?.data?.qr_details;
  const info = data?.data?.program_info;

  if (!qr?.token) {
    return (
      <p className="text-sm text-grey-3 text-center py-10">
        No QR code has been generated for this campaign yet.
      </p>
    );
  }

  // Only a visit-based streak maps onto stamp dots; a spend target is money.
  const visitCondition = info?.conditions?.find((c) => c.type === "VISIT");
  const streakLength = Number(visitCondition?.threshold ?? 0) || 0;

  return (
    <LoyaltyQrCard
      programmeName={info?.name ?? "Loyalty programme"}
      businessName={businessData?.name}
      rewardSummary={info?.reward_summary}
      triggerSummary={info?.trigger_summary}
      streakLength={streakLength}
      qrUrl={qr.qr_url}
      joinUrl={loyaltyJoinUrl(qr.token)}
      previewUrl={loyaltyJoinUrlForThisBrowser(qr.token)}
    />
  );
};

export default ProgramQrModal;
