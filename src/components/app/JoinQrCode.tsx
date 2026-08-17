"use client";

import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";

/**
 * The QR on a "Scan to Join" card.
 *
 * The backend's generated qr_url image encodes the bare join token
 * ("<id>:<signature>"), so a phone camera scanning it shows a meaningless
 * string with nothing to open. A join card has to carry the full landing-page
 * URL, so we render the QR ourselves from joinUrl and keep the backend image
 * only as a fallback for campaigns whose token we could not resolve.
 *
 * Rendering it client-side also removes the S3 CORS problem: an inline SVG
 * needs no image proxy to rasterise into html2canvas.
 */
export interface JoinQrCodeProps {
  /** Public landing page, e.g. https://app/loyalty/join/<token>. Preferred. */
  joinUrl?: string | null;
  /** Backend QR image. Only used when joinUrl is unknown. */
  qrUrl?: string | null;
  /** Names the campaign in the img alt text. */
  programmeName?: string;
  /** Sizing/border classes for the box — the QR fills it. */
  className?: string;
  emptyLabel?: string;
}

/**
 * S3 serves the QR publicly but without CORS headers. Loading it directly
 * either fails (with crossOrigin) or taints the canvas so html2canvas cannot
 * export (without it). Proxying through our own route makes it same-origin.
 */
export const proxiedQrImage = (url?: string | null) =>
  url ? `/api/loyalty/qr-image?url=${encodeURIComponent(url)}` : null;

const JoinQrCode = ({
  joinUrl,
  qrUrl,
  programmeName,
  className,
  emptyLabel = "QR not generated",
}: JoinQrCodeProps) => {
  if (joinUrl) {
    return (
      <div className={cn("bg-white p-1", className)}>
        <QRCode
          value={joinUrl}
          // The SVG fills whatever box the caller sized, so one component
          // serves the 96px preview and the 160px card alike.
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          title={`Scan to join ${programmeName ?? "this programme"}`}
        />
      </div>
    );
  }

  if (qrUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={proxiedQrImage(qrUrl) ?? ""}
        alt={`QR code to join ${programmeName ?? "this programme"}`}
        className={cn("bg-white object-contain p-1", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center border border-dashed border-grey-5 px-2 text-center",
        className,
      )}
    >
      <span className="text-[10px] text-grey-3">{emptyLabel}</span>
    </div>
  );
};

export default JoinQrCode;
