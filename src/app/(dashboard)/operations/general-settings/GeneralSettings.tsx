"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import ShippingTab from "./ShippingTab";

type TabKey =
  | "inventory"
  | "products"
  | "orders"
  | "shipping"
  | "campaigns"
  | "notifications";

const TABS: { key: TabKey; label: string }[] = [
  { key: "inventory", label: "Inventory" },
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "shipping", label: "Shipping" },
  { key: "campaigns", label: "Campaigns" },
  { key: "notifications", label: "Notifications" },
];

const PlaceholderTab = ({ label }: { label: string }) => (
  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
    <p className="text-sm text-slate-500">
      {label} settings will appear here.
    </p>
  </div>
);

const GeneralSettings = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("shipping");

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Tailor the web app settings to create a seamless experience that
          matches your business needs.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6 overflow-x-auto">
        <div className="flex gap-4 sm:gap-6 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "shipping" ? (
        <ShippingTab />
      ) : (
        <PlaceholderTab
          label={TABS.find((t) => t.key === activeTab)?.label || ""}
        />
      )}
    </div>
  );
};

export default GeneralSettings;
