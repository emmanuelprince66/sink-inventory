"use client";

import { Button } from "@/components/ui/button";
import { Link2, Truck } from "lucide-react";
import { useState } from "react";
import ShipbubbleSettingsModal from "../general-settings/ShipbubbleSettingsModal";

const ConnectedApps = () => {
  const [showShipbubbleModal, setShowShipbubbleModal] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Connected Apps
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Supercharge your business with the tools you use everyday
        </p>
      </div>

      {/* Shipbubble card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Truck className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Shipbubble
            </h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Connect for advanced shipping settings
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShipbubbleModal(true)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            Connect
          </Button>
        </div>
      </div>

      <ShipbubbleSettingsModal
        open={showShipbubbleModal}
        onClose={() => setShowShipbubbleModal(false)}
      />
    </div>
  );
};

export default ConnectedApps;
