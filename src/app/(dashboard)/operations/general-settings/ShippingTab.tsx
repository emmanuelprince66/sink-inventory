"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";
import AutomatedShipping from "./AutomatedShipping";
// import DeliveryAndPickup from "./DeliveryAndPickup";

// ─── DISABLED: Delivery & Pickup ────────────────────────────────────────────
// The whole "Delivery & Pickup" view is UI-only — every toggle is local
// useState, its "Save Changes" button has no onClick, and the pickup-location
// sheet it opens never persists either. Nothing it collects reaches the API,
// so a merchant configuring it would silently lose the lot on refresh.
//
// To restore: uncomment the import, the "delivery" entry in VIEWS, and the
// render branch below — then wire DeliveryAndPickup + PickupLocationSheet to
// their endpoints. See the note at the top of DeliveryAndPickup.tsx for the
// fields that need somewhere to go.

type ShippingView = "delivery" | "automated";

const VIEWS: {
  key: ShippingView;
  label: string;
  shortLabel: string;
  tip: string;
}[] = [
  // {
  //   key: "delivery",
  //   label: "Delivery & Pickup",
  //   shortLabel: "Delivery",
  //   tip: "Tailor shipping settings to give customers flexible delivery options.",
  // },
  {
    key: "automated",
    label: "Automated Shipping",
    shortLabel: "Automated",
    tip: "Automated shipping works with online payment methods only.",
  },
];

const ShippingTab = () => {
  const [view, setView] = useState<ShippingView>("automated");
  const activeView = VIEWS.find((v) => v.key === view) || VIEWS[0];

  return (
    <div className="space-y-5">
      {/* Underline tabs — matches the app's established sub-tab pattern */}
      <div className="flex items-center gap-1 border-b border-grey-5 overflow-x-auto">
        {VIEWS.map((v) => {
          const isActive = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2",
              )}
            >
              <span className="hidden sm:inline">{v.label}</span>
              <span className="sm:hidden">{v.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tip banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-secondary-6 border border-primary-green-300/15 rounded-lg">
        <Info className="w-4 h-4 text-primary-green-300 mt-0.5 shrink-0" />
        <p className="text-sm text-primary-green-100 leading-relaxed">
          {activeView.tip}
        </p>
      </div>

      {/* {view === "delivery" ? <DeliveryAndPickup /> : <AutomatedShipping />} */}
      <AutomatedShipping />
    </div>
  );
};

export default ShippingTab;
