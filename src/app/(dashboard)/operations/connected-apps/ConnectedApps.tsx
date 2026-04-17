"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Facebook,
  Link2,
  Package,
  Truck,
} from "lucide-react";
import { useState } from "react";
import ConnectShipbubbleModal from "../general-settings/ConnectShipbubbleModal";

type TabKey = "all" | "ads" | "shipping";

interface AppCard {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  category: "ads" | "shipping";
  connected?: boolean;
}

const APPS: AppCard[] = [
  {
    key: "facebook-pixel",
    name: "Facebook Pixel",
    description: "Connect to Facebook Pixel",
    icon: <Facebook className="h-5 w-5 text-blue-600" />,
    iconBg: "bg-blue-50",
    category: "ads",
  },
  {
    key: "google-analytics",
    name: "Google Analytics",
    description: "Connect Google Analytics",
    icon: <BarChart3 className="h-5 w-5 text-amber-600" />,
    iconBg: "bg-amber-50",
    category: "ads",
  },
  {
    key: "shipbubble",
    name: "Shipbubble",
    description: "Connect for advanced shipping settings",
    icon: <Truck className="h-5 w-5 text-red-600" />,
    iconBg: "bg-red-50",
    category: "shipping",
  },
  {
    key: "chowdeck",
    name: "Chowdeck",
    description: "Connect for advanced shipping settings",
    icon: <Package className="h-5 w-5 text-yellow-600" />,
    iconBg: "bg-yellow-50",
    category: "shipping",
  },
];

const ConnectedApps = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [showShipbubbleModal, setShowShipbubbleModal] = useState(false);

  const filteredApps =
    activeTab === "all"
      ? APPS
      : APPS.filter((app) => app.category === activeTab);

  const handleConnect = (key: string) => {
    if (key === "shipbubble") {
      setShowShipbubbleModal(true);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Connected Apps
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Supercharge your business with the tools you use everyday
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-4 sm:gap-8">
          {(["all", "ads", "shipping"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                activeTab === tab
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.key}
            className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-white"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  app.iconBg,
                )}
              >
                {app.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {app.name}
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">{app.description}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnect(app.key)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Link2 className="h-3.5 w-3.5 mr-1.5" />
              Connect
            </Button>
          </div>
        ))}
      </div>

      <ConnectShipbubbleModal
        open={showShipbubbleModal}
        onClose={() => setShowShipbubbleModal(false)}
      />
    </div>
  );
};

export default ConnectedApps;
