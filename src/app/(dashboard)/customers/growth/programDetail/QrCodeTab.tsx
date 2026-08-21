"use client";

import JoinQrCode from "@/components/app/JoinQrCode";
import { useLoyaltyTheme } from "@/utils/storeTheme";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import type { LoyaltyProgram } from "@/types/loyalty";
import { downloadElementAsPng } from "@/utils/captureElement";
import { Download, Gift, Printer } from "lucide-react";
import { useRef, useState } from "react";
import type { ProgramDetailData } from "./useProgramDetail";

/**
 * How many visit rows the card draws.
 *
 * A ten-visit streak makes a card too tall to read in a side panel — and too
 * tall to print on one page. Four rows show the pattern; the reward row below
 * still carries the real target, so nothing about the programme is misstated.
 */
const VISIBLE_STREAK_ROWS = 4;

const QrCodeTab = ({
  detail,
  program,
}: {
  detail: ProgramDetailData;
  program: LoyaltyProgram | null;
}) => {
  const { qr, joinUrl } = detail;
  const theme = useLoyaltyTheme();
  const businessData = useBusinessDataStore((state: any) => state.businessData);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  // Only a visit streak maps onto numbered rows; a spend target is money.
  const visitCondition = program?.conditions?.find((c) => c.type === "VISIT");
  const streakLength = Number(visitCondition?.threshold ?? 0) || 0;
  const rows = Math.min(streakLength || VISIBLE_STREAK_ROWS, VISIBLE_STREAK_ROWS);

  // Captures the card on screen rather than linking the backend's qr_url image
  // — that image encodes the bare token, so a downloaded copy of it would be a
  // QR nobody's phone can act on.
  const download = async () => {
    setSaving(true);
    try {
      await downloadElementAsPng(
        cardRef.current,
        `${(program?.name ?? "loyalty").replace(/[^a-zA-Z0-9]/g, "_")}_qr_card.png`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (!qr?.token) {
    return (
      <p className="py-12 text-center text-sm text-grey-3">
        No QR code has been generated for this campaign yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-grey-4">
        Campaign QR Card
      </p>

      <div
        ref={cardRef}
        className="overflow-hidden rounded-2xl"
        style={{ backgroundColor: theme.deep, color: theme.onDeep }}
      >
        <div className="p-5">
          <p
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: theme.base }}
          >
            Loyalty Programme
          </p>
          <h4 className="mt-1 text-2xl font-extrabold text-white">
            {businessData?.name ?? program?.name}
          </h4>
          <p className="mt-0.5 text-[11px] text-white/60">{program?.name}</p>

          {rows > 0 && (
            <>
              <p
                className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ color: theme.base }}
              >
                Visit Streak
              </p>

              <ol className="mt-3 flex flex-col gap-2.5">
                {Array.from({ length: rows }, (_, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-xs font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white/75">
                      Visit {i + 1}
                    </span>
                  </li>
                ))}

                <li className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.base, color: theme.onBase }}
                  >
                    <Gift className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    Get Rewarded!
                  </span>
                  {/* inline-flex + leading-none: a 10px label in a pill with
                      default line-height sits high in the tag, which reads as
                      the text slipping out of it. */}
                  <span
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-center text-[10px] font-extrabold leading-none"
                    style={{ backgroundColor: theme.base, color: theme.onBase }}
                  >
                    {program?.reward_summary ?? "Reward"}
                  </span>
                </li>
              </ol>
            </>
          )}

          {/* Scan block */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-extrabold text-white">Scan to Join</p>
              <p className="mt-0.5 text-[11px] text-white/50">
                {program?.trigger_summary
                  ? `Earn rewards every ${program.trigger_summary}`
                  : "Scan to start earning"}
              </p>
            </div>
            {/* Encodes joinUrl, not the backend qr_url image — that image
                carries only the bare token, which a camera cannot act on. */}
            <JoinQrCode
              joinUrl={joinUrl}
              qrUrl={qr.qr_url}
              programmeName={program?.name}
              className="h-24 w-24 shrink-0 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/15 px-5 py-2">
          <p className="text-[9px] font-bold text-white/80">
            Powered by Sync360
          </p>
          <p className="text-[9px] text-white/50">
            {program?.trigger_summary ?? "Loyalty"}
          </p>
        </div>
      </div>

      {/* Stacked on the narrowest phones — two buttons with icons and labels
          don't fit side by side at 360px inside a sheet's padding. */}
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
        <Button
          variant="outline"
          className="h-11 gap-1.5 rounded-xl text-xs font-bold"
          style={{ borderColor: theme.surfaceBorder, color: theme.qrFg }}
          onClick={download}
          disabled={saving}
        >
          {saving ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {saving ? "Preparing..." : "Download QR"}
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-1.5 rounded-xl text-xs font-bold"
          onClick={() => window.print()}
        >
          <Printer className="h-3.5 w-3.5" />
          Print Card
        </Button>
      </div>
    </div>
  );
};

export default QrCodeTab;
