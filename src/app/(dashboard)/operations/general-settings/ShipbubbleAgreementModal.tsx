"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ExternalLink,
  Lock,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ShipbubbleAgreementModalProps {
  open: boolean;
  onClose: () => void;
  /** Fired when the merchant accepts the terms and clicks Connect. */
  onConnect: () => void;
  /** Disable the Connect button while the parent is saving. */
  loading?: boolean;
}

// Plain copy — easy to adjust later without touching layout.
const TERMS: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: <Truck className="w-4 h-4" />,
    title: "Pickup at your store",
    body: "Shipbubble riders will collect parcels from the pickup address you configure. Make sure someone is available during your business hours.",
  },
  {
    icon: <Wallet className="w-4 h-4" />,
    title: "Delivery charges",
    body: "Shipping fees are calculated at checkout and paid by the customer. You can also subsidise them yourself from the General Settings page.",
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    title: "Liability & insurance",
    body: "Items are insured for declared value during transit. Fragile or restricted items must be flagged when packaging.",
  },
  {
    icon: <Lock className="w-4 h-4" />,
    title: "Data sharing",
    body: "We share the order destination, weight and package size with Shipbubble so they can quote and dispatch your shipments.",
  },
];

const ShipbubbleAgreementModal = ({
  open,
  onClose,
  onConnect,
  loading,
}: ShipbubbleAgreementModalProps) => {
  const [agreed, setAgreed] = useState(false);

  // Reset on every open so a previous "agreed" doesn't bleed across sessions.
  useEffect(() => {
    if (!open) setAgreed(false);
  }, [open]);

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      title="Connect Shipbubble"
      description="Accept the terms below to start automating your shipping with Shipbubble."
      size="lg"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
          <Truck className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between w-full">
          <a
            href="https://shipbubble.com/terms"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
          >
            Read full terms <ExternalLink className="w-3 h-3" />
          </a>
          <div className="flex gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 flex-1 sm:flex-none"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConnect}
              disabled={!agreed || loading}
              className={cn(
                "flex-1 sm:flex-none text-white",
                "bg-gradient-to-r from-rose-600 to-rose-700",
                "hover:from-rose-700 hover:to-rose-800",
                "disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed",
              )}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {loading ? "Connecting..." : "I agree & Connect"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Brand banner */}
        <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-rose-100 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-rose-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Shipbubble</h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Connects your store to 50+ delivery partners across Nigeria and
                Africa. Live rates at checkout, instant dispatch, real-time
                tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Terms list */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            By connecting, you agree to:
          </p>
          {TERMS.map((term) => (
            <div
              key={term.title}
              className="relative pl-3 py-2.5 pr-3 rounded-lg border border-slate-100 bg-slate-50/60"
            >
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-rose-300 rounded-r" />
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 w-7 h-7 rounded-md bg-white border border-rose-100 flex items-center justify-center text-rose-600">
                  {term.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {term.title}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {term.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement checkbox */}
        <label
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
            agreed
              ? "border-emerald-500 bg-emerald-50/60"
              : "border-slate-200 hover:border-slate-300",
          )}
        >
          <Checkbox
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
          />
          <span className="text-xs text-slate-800 leading-relaxed">
            I have read and agree to the Shipbubble{" "}
            <span className="font-semibold underline">terms of service</span>{" "}
            and{" "}
            <span className="font-semibold underline">privacy policy</span>.
            I'm authorised to bind my business to this agreement.
          </span>
        </label>
      </div>
    </CustomModal>
  );
};

export default ShipbubbleAgreementModal;
