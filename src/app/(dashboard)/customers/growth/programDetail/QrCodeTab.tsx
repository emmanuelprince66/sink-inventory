"use client";

import JoinQrCode from "@/components/app/JoinQrCode";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import type { LoyaltyProgram } from "@/types/loyalty";
import { downloadElementAsPng } from "@/utils/captureElement";
import { Copy, Download, Printer } from "lucide-react";
import { useRef, useState } from "react";
import type { ProgramDetailData } from "./useProgramDetail";

const QrCodeTab = ({
  detail,
  program,
}: {
  detail: ProgramDetailData;
  program: LoyaltyProgram | null;
}) => {
  const { qr, joinUrl, copyJoinUrl } = detail;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  // Captures the card block on screen rather than linking the backend's
  // qr_url image — that image encodes the bare token, so a downloaded copy of
  // it would be a QR nobody's phone can act on.
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
    <div className="space-y-3">
      <div ref={cardRef} className="rounded-2xl bg-grey-1 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
          Loyalty Programme
        </p>
        <h4 className="mt-1 text-base font-extrabold text-white">
          {program?.name}
        </h4>
        <p className="mt-0.5 text-[11px] text-white/60">
          {program?.trigger_summary}
        </p>

        {/* Encodes joinUrl, not the backend qr_url image — that image carries
            only the bare token, which a phone camera can do nothing with. */}
        <div className="mt-4 flex justify-center">
          <JoinQrCode
            joinUrl={joinUrl}
            qrUrl={qr.qr_url}
            programmeName={program?.name}
            className="h-40 w-40 rounded-xl p-2"
            emptyLabel="QR image not returned — share the link below."
          />
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
