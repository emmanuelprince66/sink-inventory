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
        <aside className="lg:sticky lg:top-4 self-start">
          {/* Horizontal scroll on mobile, vertical stack on desktop */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1">
            {SECTIONS.map((s) => {
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={cn(
                    "group w-full text-left rounded-xl border transition-all cursor-pointer",
                    "flex items-start gap-3 px-3.5 py-3 shrink-0 lg:shrink",
                    isActive
                      ? "bg-secondary-6 border-primary-green-300/30"
                      : "bg-white border-grey-5 hover:border-primary-green-300/30 hover:bg-secondary-6/40",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive
                        ? "bg-primary-green-300 text-white"
                        : "bg-grey-6 text-grey-3 group-hover:bg-secondary-6 group-hover:text-primary-green-300",
                    )}
                  >
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-bold whitespace-nowrap lg:whitespace-normal",
                        isActive ? "text-primary-green-100" : "text-grey-1",
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="hidden lg:block text-xs text-grey-3 mt-0.5">
                      {s.description}
                    </p>
                  </div>
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
