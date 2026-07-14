"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Truck } from "lucide-react";
import { useState } from "react";
import BnplCard from "./BnplCard";
import ShippingTab from "./ShippingTab";

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
      {/* Header — simple, matches the rest of the app */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-grey-1">
          Operational Settings
        </h1>
        <p className="text-sm text-grey-3 mt-1 max-w-xl">
          Configure how orders are fulfilled, what payment options your
          customers see, and the add-ons that round out checkout.
        </p>
      </div>

      {/* Body — left section rail + right content */}
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

        {/* Active section content */}
        <div className="min-w-0">
          {active === "shipping" && (
            <SectionShell
              title="Shipping & Delivery"
              subtitle="Manage how orders are dispatched and delivered to your customers."
            >
              <ShippingTab />
            </SectionShell>
          )}

          {active === "addons" && (
            <SectionShell
              title="Payment Add-ons"
              subtitle="Optional payment products you can offer your customers at checkout."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BnplCard />
              </div>
            </SectionShell>
          )}
        </div>
      </div>
    </div>
  );
};

interface SectionShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}
const SectionShell = ({ title, subtitle, children }: SectionShellProps) => (
  <section className="bg-white border border-grey-5 rounded-2xl p-4 sm:p-6">
    <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-grey-5">
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-grey-1">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-grey-3 mt-1">{subtitle}</p>
      </div>
      <span className="hidden sm:inline-flex w-2 h-2 rounded-full bg-primary-green-300 mt-2" />
    </div>
    {children}
  </section>
);

export default GeneralSettings;
