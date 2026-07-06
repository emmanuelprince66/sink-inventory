"use client";

import { cn } from "@/lib/utils";
import { Lightbulb, MapPin, Zap } from "lucide-react";
import { useState } from "react";
import AutomatedShipping from "./AutomatedShipping";
import DeliveryAndPickup from "./DeliveryAndPickup";

type ShippingView = "delivery" | "automated";

const VIEWS: {
  key: ShippingView;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  tip: string;
}[] = [
  {
    key: "delivery",
    label: "Delivery & Pickup",
    shortLabel: "Delivery",
    icon: <MapPin className="w-4 h-4" />,
    tip: "Tailor shipping settings to give customers flexible delivery options.",
  },
  {
    key: "automated",
    label: "Automated Shipping",
    shortLabel: "Automated",
    icon: <Zap className="w-4 h-4" />,
    tip: "Automated shipping works with online payment methods only.",
  },
];

const ShippingTab = () => {
  const [view, setView] = useState<ShippingView>("delivery");
  const activeView = VIEWS.find((v) => v.key === view) || VIEWS[0];

  return (
    <div className="space-y-5">
      {/* Segmented control — green underline accent, distinct from pill tabs */}
      <div className="relative">
        <div className="flex items-stretch gap-1 border-b border-slate-200">
          {VIEWS.map((v) => {
            const isActive = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  "relative flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors",
                  isActive
                    ? "text-emerald-700"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-md transition-colors",
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {v.icon}
                </span>
                <span className="hidden sm:inline">{v.label}</span>
                <span className="sm:hidden">{v.shortLabel}</span>
                {isActive && (
                  <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-quote style alert — left bar, soft tone, not the typical amber box */}
      <div className="relative pl-4 py-3 pr-4 bg-emerald-50/50 rounded-r-lg overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l" />
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-900/80 leading-relaxed">
            {activeView.tip}
          </p>
        </div>
      </div>

      {view === "delivery" ? <DeliveryAndPickup /> : <AutomatedShipping />}
    </div>
  );
};

export default ShippingTab;
