"use client";

import JoinQrCode from "@/components/app/JoinQrCode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { captureElementCanvas } from "@/utils/captureElement";
import { Copy, Download, ExternalLink, Printer, Trophy } from "lucide-react";
import { useRef, useState } from "react";

/**
 * The loyalty card a business hands to customers. Shared by the QR modal and
 * the post-create screen so the preview, the download and the print are all
 * the same artwork.
 */
export interface LoyaltyQrCardProps {
  programmeName: string;
  businessName?: string;
  rewardSummary?: string | null;
  triggerSummary?: string | null;
  /** Steps in the streak. Capped on render — a spend target can be huge. */
  streakLength: number;
  qrUrl?: string | null;
  /** Public join URL, when the token is known. */
  joinUrl?: string;
}

const MAX_DOTS = 8;

const LoyaltyQrCard = ({
  programmeName,
  businessName,
  rewardSummary,
  triggerSummary,
  streakLength,
  qrUrl,
  joinUrl,
}: LoyaltyQrCardProps) => {
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "print" | null>(null);

  const dots = Math.min(Math.max(streakLength, 0), MAX_DOTS);

  const copyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard
      .writeText(joinUrl)
      .then(() => showToast("Join link copied", "success"))
      .catch(() => showToast("Could not copy the link", "error"));
  };

  // Shortened in JS rather than relying on CSS `truncate`: the join token is a
  // long opaque string, and text-overflow only clips once an ancestor actually
  // constrains the width — which it wasn't, so the row pushed the modal wide.
  // Trimming the string removes the problem at source. The full URL is still
  // what gets copied.
  const displayUrl =
    joinUrl && joinUrl.length > 44 ? `${joinUrl.slice(0, 44)}…` : joinUrl;

  const renderCanvas = () => captureElementCanvas(cardRef.current);

  const downloadCard = async () => {
    setBusy("download");
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            showToast("Could not generate the card image", "error");
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${programmeName.replace(/[^a-zA-Z0-9]/g, "_")}_loyalty_card.png`;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
          showToast("Card downloaded", "success");
        },
        "image/png",
        1.0,
      );
    } catch {
      showToast("Could not generate the card image", "error");
    } finally {
      setBusy(null);
    }
  };

  /**
   * Prints via print-js, the same library the POS receipt uses. It renders
   * into a hidden iframe rather than a new window, which matters: rasterising
   * the card is async, so by the time a window.open() call ran it had left the
   * user-gesture stack and browsers blocked it as a pop-up.
   */
  const printCard = async () => {
    setBusy("print");
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;

      const printJS = (await import("print-js")).default;
      printJS({
        printable: canvas.toDataURL("image/png"),
        type: "image",
        imageStyle:
          "width:320px;max-width:100%;display:block;margin:0 auto;",
        style: "@page { margin: 12mm } body { margin: 0 }",
        onError: () => showToast("Could not print the card", "error"),
      });
    } catch {
      showToast("Could not prepare the card for printing", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Compact preview — this is all the modal needs to show. The full
          artwork below is rendered off-screen and is what actually gets
          downloaded and printed. */}
      <div className="flex w-full  items-center gap-4 rounded-2xl border border-grey-5 bg-white p-4">
        <JoinQrCode
          joinUrl={joinUrl}
          qrUrl={qrUrl}
          programmeName={programmeName}
          className="h-24 w-24 shrink-0 rounded-lg border border-grey-6"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-grey-1">
            {programmeName}
          </p>
          <p className="mt-0.5 truncate text-xs text-grey-3">
            {businessName || "Your Business"}
          </p>
          <p className="mt-2 truncate text-sm font-extrabold text-primary-green-300">
            {rewardSummary ?? "Reward"}
          </p>
          {triggerSummary && (
            <p className="truncate text-[11px] text-grey-3">
              After {triggerSummary}
            </p>
          )}
        </div>
      </div>

      {/* Off-screen export target. It has to stay in the DOM and laid out —
          html2canvas cannot rasterise display:none — but it must not affect
          layout at all.
          A zero-size overflow-hidden box does that safely. `fixed` does not:
          modals animate with a transform, and a transformed ancestor makes
          `fixed` behave like `absolute` relative to it, so a card parked at
          -10000px became part of the modal's scroll area and overflowed it. */}
      <div
        aria-hidden
        className="pointer-events-none h-0 w-0 overflow-hidden"
      >
        <div
          ref={cardRef}
          className="w-[360px] overflow-hidden rounded-2xl border border-grey-5 bg-white"
        >
        {/* Green header */}
        <div className="relative bg-gradient-to-br from-primary-green-300 to-[#2b7d51] px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
            Loyalty Card
          </p>
          <p className="mt-0.5 truncate pr-12 text-xl font-extrabold text-white">
            {businessName || "Your Business"}
          </p>
          <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Trophy className="h-4 w-4 text-amber-300" />
          </span>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm font-extrabold text-grey-1">{programmeName}</p>

          {/* Progress */}
          {dots > 0 && (
            <>
              <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-grey-4">
                Your Progress
              </p>
              {/* Wraps: ten stamps plus the reward is wider than a phone. */}
              <div className="mt-2 flex flex-wrap items-start gap-1.5">
                {Array.from({ length: dots }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary-green-300/40 text-[11px] font-bold text-primary-green-300">
                      {i + 1}
                    </span>
                    <span className="text-[7px] text-grey-4">Visit {i + 1}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-green-300 text-xs">
                    🎁
                  </span>
                  <span className="text-[7px] text-grey-4">Reward</span>
                </div>
              </div>
            </>
          )}

          {/* Reward */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary-green-300/30 bg-primary-green-500 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary-green-300">
                Your Reward
              </p>
              <p className="mt-0.5 truncate text-lg font-extrabold text-grey-1">
                {rewardSummary ?? "Reward"}
              </p>
              <p className="text-[10px] text-grey-3">
                {triggerSummary
                  ? `After ${triggerSummary}`
                  : "Complete the streak"}
              </p>
            </div>
            <span className="shrink-0 text-2xl" aria-hidden>
              🎉
            </span>
          </div>

          {/* Scan */}
          <div className="mt-3 flex items-center gap-4 rounded-xl bg-grey-6 p-4">
            <JoinQrCode
              joinUrl={joinUrl}
              qrUrl={qrUrl}
              programmeName={programmeName}
              className="h-24 w-24 shrink-0 rounded"
            />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-primary-green-300">
                Scan to Join
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-grey-3">
                Get Rewarded — scan to start earning today!
              </p>
            </div>
          </div>
        </div>

          {/* Green footer */}
          <div className="flex items-center justify-between bg-primary-green-300 px-5 py-2">
            <p className="text-[9px] font-bold text-white/90">
              Powered by Sync360
            </p>
            <p className="text-[9px] text-white/60">
              {triggerSummary ?? "Loyalty"}
            </p>
          </div>
        </div>
      </div>

      {joinUrl && (
        <button
          onClick={copyLink}
          className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-grey-5 bg-white py-2 pl-3.5 pr-2 text-left cursor-pointer hover:bg-grey-6"
          title="Copy the join link"
        >
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] leading-6 text-grey-2">
            {displayUrl}
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-grey-3">
            <Copy className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      <div className="grid w-full  grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          className="h-11 gap-1.5 rounded-xl"
          disabled={busy !== null}
          onClick={downloadCard}
        >
          <Download className="h-4 w-4" />
          {busy === "download" ? "Preparing..." : "Download QR Code"}
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-1.5 rounded-xl"
          disabled={busy !== null}
          onClick={printCard}
        >
          <Printer className="h-4 w-4" />
          {busy === "print" ? "Preparing..." : "Print Card"}
        </Button>
      </div>

      {joinUrl && (
        <div className="w-full ">
          <Button
            variant="outline"
            className="h-11 w-full gap-1.5 rounded-xl"
            onClick={() => window.open(joinUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-4 w-4" />
            Preview Customer Signup Page
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoyaltyQrCard;
