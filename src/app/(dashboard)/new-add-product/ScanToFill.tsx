"use client";

import {
  fetchImageAsFile,
  imageUrlOf,
  lookupProductByBarcode,
  type CatalogueProduct,
} from "@/api/products/lookup-by-barcode";
import { BarCodeScanner } from "@/app/(dashboard)/pos/BarCodeScanner";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ImageOff, ScanLine, X } from "lucide-react";
import { useState } from "react";

/**
 * Scan a barcode and let the catalogue fill the form in.
 *
 * A barcode names a manufactured product, so the bottle in this merchant's
 * crate is the same bottle another business already photographed and weighed.
 * Scanning it is faster than typing a name, a SKU and a weight, and far faster
 * than taking a photo.
 *
 * What it does NOT do is apply anything on its own. The match is shown first
 * and the merchant presses "Use these details" — a scan that silently
 * overwrote a half-filled form would be worse than no scan at all, and the
 * catalogue is other people's data: close enough to offer, not to trust.
 */

export interface ScannedFill {
  name: string;
  sku: string;
  weight: string;
  productUnit: string;
  description: string;
  /** Null when there was no image, or it could not be fetched. */
  image: File | null;
}

type Stage =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "looking"; code: string }
  | { status: "found"; code: string; product: CatalogueProduct; image: File | null }
  | { status: "missing"; code: string };

const ScanToFill = ({
  onApply,
  className,
}: {
  onApply: (fill: ScannedFill) => void;
  className?: string;
}) => {
  const [stage, setStage] = useState<Stage>({ status: "idle" });

  const handleScan = async (raw: string) => {
    // A camera reading a steady barcode fires repeatedly. The scanner closes on
    // the first hit so this rarely matters, but a second call landing before
    // that would start a second lookup and race the first one's result onto
    // the card.
    if (stage.status === "looking") return;

    const code = (raw || "").trim();
    if (!code) {
      setStage({ status: "idle" });
      return;
    }

    setStage({ status: "looking", code });

    const product = await lookupProductByBarcode(code);
    if (!product) {
      setStage({ status: "missing", code });
      return;
    }

    // The image is fetched up front so the card can show what it is offering.
    // It is also the slowest part, and nothing below depends on it.
    const url = imageUrlOf(product);
    const image = url
      ? await fetchImageAsFile(url, `scanned-${code}`)
      : null;

    setStage({ status: "found", code, product, image });
  };

  const apply = () => {
    if (stage.status !== "found") return;
    const { product, image, code } = stage;

    onApply({
      name: product.name ?? "",
      // The scanned code is the SKU, whatever the catalogue calls its own.
      sku: code,
      weight:
        product.weight === null || product.weight === undefined
          ? ""
          : String(product.weight),
      productUnit: product.unit ?? "",
      description: product.description ?? "",
      image,
    });

    setStage({ status: "idle" });
  };

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-primary-green-300/30",
          "bg-gradient-to-br from-primary-green-300/15 via-secondary-6 to-white p-4 sm:p-5",
          className,
        )}
      >
        {/* Depth without breaking the flat-card language used elsewhere. */}
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary-green-300/25 blur-2xl" />

        {stage.status === "found" ? (
          <div className="relative flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-green-100">
              Found in the catalogue
            </p>

            <div className="flex items-center gap-3">
              {stage.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(stage.image)}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-grey-5 bg-white object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-grey-5 bg-white text-grey-4">
                  <ImageOff className="h-5 w-5" />
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate font-bold text-grey-1">
                  {stage.product.name}
                </p>
                <p className="truncate text-xs text-grey-3">
                  {stage.code}
                  {stage.product.unit ? ` · ${stage.product.unit}` : ""}
                </p>
                {!stage.image && (
                  <p className="mt-0.5 text-[11px] text-grey-3">
                    No photo on this one — you can add your own.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="gap-1.5" onClick={apply}>
                <Check className="h-4 w-4" />
                Use these details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStage({ status: "scanning" })}
              >
                Scan again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStage({ status: "idle" })}
              >
                Dismiss
              </Button>
            </div>

            <p className="text-[11px] leading-relaxed text-grey-3">
              These come from another shop&apos;s listing of the same barcode.
              Check them before saving — you can edit anything after filling.
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-green-300 text-white shadow-sm">
                <ScanLine className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-grey-1">
                  Scan the barcode to fill this in
                </p>
                <p className="mt-0.5 text-xs text-grey-3">
                  {stage.status === "missing"
                    ? `Nothing found for ${stage.code} — fill the form in below, and it will be there for next time.`
                    : "Point your camera at the product's barcode. If we have seen it before, the name, photo and weight come with it."}
                </p>
              </div>
            </div>

            <Button
              type="button"
              className="w-full shrink-0 gap-1.5 sm:w-auto"
              disabled={stage.status === "looking"}
              onClick={() => setStage({ status: "scanning" })}
            >
              {stage.status === "looking" ? (
                <>
                  <Spinner className="h-4 w-4 text-white" />
                  Looking it up…
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4" />
                  {stage.status === "missing" ? "Scan again" : "Scan barcode"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {stage.status === "scanning" && (
        <BarCodeScanner
          onScanResult={handleScan}
          onClose={() => setStage({ status: "idle" })}
        />
      )}
    </>
  );
};

export default ScanToFill;
