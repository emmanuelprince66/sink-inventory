"use client";

import { Spinner } from "@/components/app/Spinner";
import { Download } from "lucide-react";
import QRCode from "react-qr-code";
import type { JoinLoyaltyApi } from "./useJoinLoyalty";

/**
 * Shown once the customer has joined. The join response carries the loyalty
 * code, so the card renders immediately — and the QR encodes that code, which
 * is exactly what the till scanner reads. No round trip, no second endpoint.
 */
const JoinSuccessCard = ({ join }: { join: JoinLoyaltyApi }) => {
  const { joined, form, cardRef, saving, downloadCard } = join;

  const loyaltyCode = joined.loyalty_code;
  const enrollment = joined.enrollment;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-12">
      <div className="text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-3 text-2xl font-extrabold text-grey-1">
          {joined.already_joined ? "Welcome back!" : "You're in!"}
        </h1>
        <p className="mt-1.5 text-sm text-grey-3">
          Show this card at the till and we&apos;ll track every visit.
        </p>
      </div>

      <div
        ref={cardRef}
        className="w-full overflow-hidden rounded-2xl border border-grey-5 bg-white"
      >
        <div className="bg-primary-green-300 px-5 py-4 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
            Loyalty Card
          </p>
          <p className="mt-0.5 truncate text-lg font-extrabold text-white">
            {enrollment?.member_name ?? form.fullName}
          </p>
          <p className="truncate text-[11px] text-white/70">
            {joined.program ?? enrollment?.program_name}
          </p>
        </div>

        <div className="flex flex-col items-center px-5 py-5">
          {loyaltyCode && (
            <div className="rounded-xl border border-grey-5 bg-white p-3">
              {/* Scales down on narrow phones rather than forcing the card
                  wider than the viewport. */}
              <QRCode
                value={loyaltyCode}
                size={168}
                style={{ height: "auto", maxWidth: "100%", width: "168px" }}
              />
            </div>
          )}
          <p className="mt-3 break-all text-center font-mono text-base font-extrabold tracking-wider text-grey-1">
            {loyaltyCode}
          </p>
          <p className="mt-0.5 text-[11px] text-grey-3">
            Scan or read out this code
          </p>

          {enrollment?.reward_description && (
            <div className="mt-4 w-full rounded-xl bg-primary-green-500 px-4 py-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary-green-300">
                Your Reward
              </p>
              <p className="mt-0.5 text-base font-extrabold text-grey-1">
                {enrollment.reward_description}
              </p>
              {enrollment.remaining_message && (
                <p className="mt-0.5 text-[11px] text-grey-3">
                  {enrollment.remaining_message}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="border-t border-grey-6 py-2 text-center text-[9px] text-grey-4">
          Powered by Sync360
        </p>
      </div>

      <button
        onClick={downloadCard}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-green-300 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-primary-green-300/90 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
      >
        {saving ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {saving ? "Preparing..." : "Download My Card"}
      </button>

      <p className="text-center text-[11px] text-grey-3">
        Save it to your phone so you always have it with you.
      </p>
    </div>
  );
};

export default JoinSuccessCard;
