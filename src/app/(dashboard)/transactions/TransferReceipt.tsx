"use client";

import logo from "@/assets/sink2.png";
import { AppStoreGlyph, GooglePlayGlyph } from "@/components/app/StoreGlyphs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useRef, useState } from "react";

export interface TransferReceiptDetails {
  amount: number | string;
  senderName?: string;
  beneficiaryName?: string;
  beneficiaryAccount?: string;
  beneficiaryBank?: string;
  narration?: string;
  transactionId?: string;
  /** ISO string from the API, or nothing — then the transfer just happened. */
  date?: string;
  status?: string;
}

/**
 * Pulls the transaction's reference out of a transfer response.
 *
 * The wallet route wraps the provider's payload twice ({success, data:{...}})
 * and providers disagree on what the reference is called, so every shape we
 * have seen is tried before falling back to a dash — a receipt with one field
 * missing is still worth showing.
 */
export const extractTransactionId = (response: any): string => {
  const payload = response?.data?.data ?? response?.data ?? response;

  return (
    payload?.reference ??
    payload?.txnId ??
    payload?.transaction_id ??
    payload?.transactionId ??
    payload?.sessionId ??
    payload?.id ??
    "-"
  );
};

/** Card colours are literal hex, not theme tokens — see the capture note in
 *  `capture()` below. */
const INK = "#1D1F22";
const MUTED = "#6B7280";
const HAIRLINE = "#EFEFEF";

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-[#F0F0F0] py-3 last:border-b-0">
    <span className="shrink-0 text-[15px] text-[#6B7280]">{label}</span>
    {/* min-w-0 plus anywhere-wrapping: a provider reference is one unbroken
        48-character run, which a flex item will happily push past the card
        edge rather than break on its own. */}
    <span className="min-w-0 text-right text-[15px] font-semibold text-[#1D1F22] [overflow-wrap:anywhere]">
      {value?.trim() ? value : "-"}
    </span>
  </div>
);

/** One of the two black pills under "Generated from Sync360 App." */
const StoreBadge = ({
  glyph,
  line,
  name,
}: {
  glyph: React.ReactNode;
  line: string;
  name: string;
}) => (
  <div className="flex items-center gap-2 rounded-[6px] bg-black px-[12px] py-[7px]">
    {glyph}
    <div className="text-left">
      <div className="text-[8px] leading-none text-white">{line}</div>
      <div className="text-[13px] font-semibold leading-tight text-white">
        {name}
      </div>
    </div>
  </div>
);

const TransferReceipt = ({
  details,
  onBack,
}: {
  details: TransferReceiptDetails;
  onBack: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  const rows = [
    { label: "Transaction Type", value: "Outward" },
    { label: "Sender Name", value: details.senderName },
    { label: "Beneficiary Name", value: details.beneficiaryName },
    { label: "Beneficiary Account", value: details.beneficiaryAccount },
    { label: "Beneficiary Bank", value: details.beneficiaryBank },
    { label: "Transaction Status", value: details.status ?? "Successful" },
    { label: "Narration", value: details.narration },
    { label: "Transaction ID", value: details.transactionId },
    {
      label: "Date & Time",
      value: moment(details.date ?? undefined).format("DD-MM-YYYY [at] hh:mm A"),
    },
  ];

  const fileName = `receipt-${details.transactionId || moment().format("YYYYMMDD-HHmmss")}`;

  /**
   * Paints the card to a canvas.
   *
   * html2canvas-pro rather than plain html2canvas: Tailwind v4 emits oklch()
   * colours, which the original parser chokes on — the same reason the POS
   * receipt draws itself in jsPDF instead of capturing the DOM. The card's own
   * colours are written as hex here so the capture never depends on that
   * support being perfect.
   */
  const capture = async () => {
    const node = cardRef.current;
    if (!node) return null;

    // A half-loaded logo captures as a blank box.
    await Promise.all(
      Array.from(node.querySelectorAll("img")).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve(img);
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
          }),
      ),
    );

    const html2canvas = (await import("html2canvas-pro")).default;

    return html2canvas(node, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
    });
  };

  /** Saves the receipt as a PDF, the way the POS receipt does. */
  const handleDownload = async () => {
    setBusy("download");
    try {
      const canvas = await capture();
      if (!canvas) return;

      const { jsPDF } = await import("jspdf");
      // CSS pixels, so the page is exactly the card — no A4 letterboxing.
      const width = canvas.width / 3;
      const height = canvas.height / 3;

      const pdf = new jsPDF({
        unit: "px",
        format: [width, height],
        orientation: height >= width ? "portrait" : "landscape",
      });
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        0,
        width,
        height,
      );
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Receipt download failed:", error);
      showToast("Couldn't download the receipt.", "error");
    } finally {
      setBusy(null);
    }
  };

  /** The receipt as plain text, for the share targets that take no image. */
  const summaryText = () =>
    [
      "Transaction Receipt",
      `Amount: ${formatToNaira(Number(details.amount) || 0)}`,
      `Transaction Type: Outward`,
      ...rows
        .slice(1)
        .map((row) => `${row.label}: ${row.value?.trim() ? row.value : "-"}`),
      "",
      "Generated from Sync360 App.",
    ].join("\n");

  /**
   * Shares the receipt, best available way first.
   *
   * The image is what someone actually wants to send, but only a share sheet
   * that accepts files can carry it — phones and tablets, essentially. Two
   * steps down from there is the fallback the rest of the app already uses for
   * sharing (see Referral.tsx): put it on the clipboard and say so, rather
   * than leave a dead button.
   */
  const handleShare = async () => {
    setBusy("share");
    try {
      const text = summaryText();
      const canvas = await capture();

      const blob = canvas
        ? await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png", 1.0),
          )
        : null;

      const file = blob
        ? new File([blob], `${fileName}.png`, { type: "image/png" })
        : null;

      // 1. Share sheet, with the receipt image attached.
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Transaction Receipt",
          text,
        });
        return;
      }

      // 2. Share sheet without file support — send the details as text.
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Transaction Receipt", text });
        return;
      }

      // 3. No share sheet at all: clipboard, as elsewhere in the app.
      await navigator.clipboard.writeText(text);
      showToast("Receipt details copied to clipboard", "success");
    } catch (error) {
      // An abort is the person closing the share sheet, not a failure.
      if ((error as Error)?.name === "AbortError") return;
      console.error("Receipt share failed:", error);
      showToast("Couldn't share the receipt.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-[460px]">
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Back"
            className="-ml-1.5 p-1.5 rounded-lg text-grey-2 hover:bg-grey-6 cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[17px] font-bold text-grey-1">
            Transaction Receipt
          </h1>
        </div>

        {/* Everything inside this node is what Download and Share capture.
            Sizes are the reference design's, scaled from its 269px card to
            this one, so the proportions survive the jump off the phone. */}
        <div
          ref={cardRef}
          className="rounded-[18px] border border-[#ECECEC] bg-white p-6 sm:p-[30px]"
        >
          <div className="flex items-center justify-between gap-3">
            {/* The asset carries ~28% transparent padding top and bottom. */}
            <Image
              src={logo}
              alt="Sync360"
              priority
              className="w-[150px] h-auto -my-[20px]"
            />
            <span
              className="text-[13px] font-extrabold uppercase tracking-[0.02em]"
              style={{ color: INK }}
            >
              Transaction Receipt
            </span>
          </div>

          <div className="mt-[30px] h-px" style={{ backgroundColor: HAIRLINE }} />

          <p className="mt-[32px] text-center text-[13px]" style={{ color: MUTED }}>
            Transaction Amount
          </p>
          <p
            className="mt-1.5 text-center text-[32px] font-extrabold tracking-tight"
            style={{ color: INK }}
          >
            {formatToNaira(Number(details.amount) || 0)}
          </p>

          <div className="mt-4">
            {rows.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} />
            ))}
          </div>

          <div className="mt-6 rounded-[12px] border border-[#EEEEEE] p-5">
            <div className="flex items-center justify-center gap-2">
              <Image
                src={logo}
                alt=""
                aria-hidden
                priority
                className="w-[80px] h-auto -my-[11px]"
              />
              <span className="text-[13px]" style={{ color: MUTED }}>
                Generated from Sync360 App.
              </span>
            </div>

            <div className="mt-4 h-px" style={{ backgroundColor: "#F0F0F0" }} />

            <div className="mt-4 flex items-center justify-center gap-2.5">
              <StoreBadge
                glyph={<GooglePlayGlyph className="w-[20px] h-[20px] shrink-0" />}
                line="GET IT ON"
                name="Google Play"
              />
              <StoreBadge
                glyph={<AppStoreGlyph className="w-[20px] h-[20px] shrink-0" />}
                line="Download on the"
                name="App Store"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={busy !== null}
            className="flex-1 h-12 rounded-[10px] border-[#E3E3E3] text-grey-1"
          >
            <Download className="h-4 w-4" />
            {busy === "download" ? "Preparing..." : "Download"}
          </Button>
          <Button
            onClick={handleShare}
            disabled={busy !== null}
            className="flex-1 h-12 rounded-[10px] bg-primary-green-100 border-primary-green-100 text-white hover:bg-primary-green-100/90"
          >
            <Share2 className="h-4 w-4" />
            {busy === "share" ? "Preparing..." : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransferReceipt;
