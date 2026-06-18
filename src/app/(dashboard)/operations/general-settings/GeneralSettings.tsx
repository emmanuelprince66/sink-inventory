"use client";

import { cn } from "@/lib/utils";
import {
  CreditCard,
  Settings as SettingsIcon,
  Sparkles,
  Truck,
} from "lucide-react";
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
    <div className="w-full px-3 sm:px-4 pb-12">
      {/* Hero — diagonal split with a soft green corner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-emerald-100 shadow-sm mb-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10" />
        <div className="absolute right-10 top-10 w-32 h-32 rounded-full bg-teal-500/10" />
        <div className="relative px-5 sm:px-7 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Operations
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Operational Settings
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-xl">
                Configure how orders are fulfilled, what payment options your
                customers see, and the add-ons that round out checkout.
              </p>
            </div>
          </div>
        </div>
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
                    "group w-full text-left rounded-xl border transition-all",
                    "flex items-start gap-3 px-3.5 py-3 shrink-0 lg:shrink",
                    isActive
                      ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700",
                    )}
                  >
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap lg:whitespace-normal",
                        isActive ? "text-emerald-900" : "text-slate-800",
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="hidden lg:block text-xs text-slate-500 mt-0.5">
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
  <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
    <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      <span className="hidden sm:inline-flex w-2 h-2 rounded-full bg-emerald-500 mt-2" />
    </div>
    {children}
  </section>
);

export default GeneralSettings;
