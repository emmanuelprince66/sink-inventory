"use client";

import { Button } from "@/components/ui/button";
import type { LoyaltyProgram } from "@/types/loyalty";
import { Copy, Download, Printer } from "lucide-react";
import type { ProgramDetailData } from "./useProgramDetail";

const QrCodeTab = ({
  detail,
  program,
}: {
  detail: ProgramDetailData;
  program: LoyaltyProgram | null;
}) => {
  const { qr, joinUrl, copyJoinUrl } = detail;

  if (!qr?.token) {
    return (
      <p className="py-12 text-center text-sm text-grey-3">
        No QR code has been generated for this campaign yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-grey-1 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
          Loyalty Programme
        </p>
        <h4 className="mt-1 text-base font-extrabold text-white">
          {program?.name}
        </h4>
        <p className="mt-0.5 text-[11px] text-white/60">
          {program?.trigger_summary}
        </p>

        <div className="mt-4 flex justify-center">
          {qr.qr_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr.qr_url}
              alt={`QR code for ${program?.name ?? "campaign"}`}
              className="h-40 w-40 rounded-xl bg-white object-contain p-2"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-white/30 px-3">
              <p className="text-[11px] text-white/60">
                QR image not returned — share the link below.
              </p>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs font-bold text-white">Scan to join</p>
        <p className="text-[10px] text-white/50">
          Earn {program?.reward_summary ?? "a reward"}
        </p>
      </div>

      <div className="rounded-xl border border-grey-5 bg-white p-3">
        <p className="text-[11px] font-bold text-grey-2">Landing page</p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-grey-3">
            {joinUrl}
          </p>
          <button
            onClick={copyJoinUrl}
            className="shrink-0 rounded-lg p-1.5 text-grey-3 hover:bg-grey-6 cursor-pointer"
            title="Copy join link"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stacked on the narrowest phones — two h-11 buttons with icons and
          labels don't fit side by side at 360px inside a sheet's padding. */}
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
        <Button
          variant="outline"
          className="h-11 gap-1.5 text-xs font-bold"
          onClick={() => qr.qr_url && window.open(qr.qr_url, "_blank")}
          disabled={!qr.qr_url}
        >
          <Download className="h-3.5 w-3.5" />
          Download QR
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-1.5 text-xs font-bold"
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
