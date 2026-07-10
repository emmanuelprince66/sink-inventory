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
      {/* Underline tabs — matches the app's established sub-tab pattern */}
      <div className="flex items-center gap-1 border-b border-grey-5 overflow-x-auto">
        {VIEWS.map((v) => {
          const isActive = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-md transition-colors",
                  isActive
                    ? "bg-secondary-6 text-primary-green-300"
                    : "bg-grey-6 text-grey-3",
                )}
              >
                {v.icon}
              </span>
              <span className="hidden sm:inline">{v.label}</span>
              <span className="sm:hidden">{v.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tip banner */}
      <div className="relative pl-4 py-3 pr-4 bg-secondary-6 rounded-r-lg overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-green-300 rounded-l" />
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-primary-green-300 mt-0.5 shrink-0" />
          <p className="text-sm text-primary-green-100 leading-relaxed">
            {activeView.tip}
          </p>
        </div>
      </div>

      {view === "delivery" ? <DeliveryAndPickup /> : <AutomatedShipping />}
    </div>
  );
};

export default ShippingTab;
