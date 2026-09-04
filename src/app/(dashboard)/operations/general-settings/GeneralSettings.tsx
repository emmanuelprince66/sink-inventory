"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Truck } from "lucide-react";
import { useState } from "react";
import BnplCard from "./BnplCard";
import ShippingTab from "./ShippingTab";

// Payment Add-ons was disabled while BNPL activation only flipped local state
// and toasted success without persisting anything. It now writes enable_bnpl
// through PATCH /business/<id>/ and reads the saved value back, so the toggle
// reflects what the backend actually holds.

type SectionKey = "shipping" | "addons";

const SECTIONS: {
  key: SectionKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "shipping",
    label: "Shipping & Delivery",
    description: "Pickup, dispatch and automated logistics",
    icon: <Truck className="w-5 h-5" />,
  },
  {
    key: "addons",
    label: "Payment Add-ons",
    description: "Optional checkout features",
    icon: <CreditCard className="w-5 h-5" />,
  },
];

const GeneralSettings = () => {
  const [active, setActive] = useState<SectionKey>("shipping");

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Left section rail + right content — no separate outer page title;
          the active section's own name ("Shipping & Delivery" etc.) is the
          page heading. */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* Section navigation */}
        <aside className="lg:sticky lg:top-4 bg-white border border-grey-5 rounded-2xl p-2 h-fit lg:h-full">
          {/* Horizontal scroll on mobile, vertical stack on desktop */}
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {SECTIONS.map((s) => {
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={cn(
                    "w-full text-left rounded-xl transition-all cursor-pointer",
                    "flex items-center gap-3 px-4 py-3.5 shrink-0 lg:shrink",
                    isActive
                      ? "bg-primary-green-300 text-white"
                      : "text-grey-2 hover:bg-secondary-6/60",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      isActive ? "text-white" : "text-grey-3",
                    )}
                  >
                    {s.icon}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold whitespace-nowrap lg:whitespace-normal",
                      isActive ? "text-white" : "text-grey-2",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active section content — title/subtitle sit directly on the page,
            not inside a card; only the step tiles and save bar are cards. */}
        <div className="min-w-0">
          {active === "shipping" && (
            <SectionHeading
              title="Shipping & Delivery"
              subtitle="Manage how orders are dispatched and delivered to your customers."
            >
              <ShippingTab />
            </SectionHeading>
          )}

          {active === "addons" && (
            <SectionHeading
              title="Payment Add-ons"
              subtitle="Optional payment products you can offer your customers at checkout."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BnplCard />
              </div>
            </SectionHeading>
          )}
        </div>
      </div>
    </div>
  );
};

interface SectionHeadingProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}
const SectionHeading = ({ title, subtitle, children }: SectionHeadingProps) => (
  <div>
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-grey-1">
          {title}
        </h2>
        <p className="text-sm text-grey-3 mt-1">{subtitle}</p>
      </div>
      <span className="shrink-0 inline-flex w-2 h-2 rounded-full bg-primary-green-300 mt-3" />
    </div>
    {children}
  </div>
);

export default GeneralSettings;
