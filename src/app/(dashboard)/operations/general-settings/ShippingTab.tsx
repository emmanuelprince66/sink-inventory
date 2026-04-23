"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";
import AutomatedShipping from "./AutomatedShipping";
import DeliveryAndPickup from "./DeliveryAndPickup";

type ShippingView = "delivery" | "automated";

const ShippingTab = () => {
  const [view, setView] = useState<ShippingView>("delivery");

  return (
    <div className="space-y-6">
      {/* Pill tabs */}
      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full w-fit border border-slate-200">
        <button
          onClick={() => setView("delivery")}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
            view === "delivery"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          Delivery And Pickup
        </button>
        <button
          onClick={() => setView("automated")}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
            view === "automated"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          Automated Shipping
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
        <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          {view === "delivery"
            ? "Tailor your shipping settings to provide flexible delivery options to your customers."
            : "Automated Shipping works with only Online payment methods, please note."}
        </p>
      </div>

      {view === "delivery" ? <DeliveryAndPickup /> : <AutomatedShipping />}
    </div>
  );
};

export default ShippingTab;
