"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

const ShippingLocationSheet = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [allWorldwide, setAllWorldwide] = useState(true);
  const [specificExpanded, setSpecificExpanded] = useState(false);
  const [shipByDistance, setShipByDistance] = useState(false);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[520px] bg-white p-0 overflow-y-auto"
      >
        <SheetHeader className="p-5 space-y-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </button>
          <SheetTitle className="text-2xl font-bold text-slate-900">
            Shipping Location
          </SheetTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage the locations you'd like to ship to. You can only use one
          </p>
        </SheetHeader>

        <div className="px-5 pb-5">
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {/* All locations worldwide */}
            <div className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  All locations worldwide
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  This means you can deliver to anywhere in the world
                </p>
              </div>
              <Switch
                checked={allWorldwide}
                onCheckedChange={(checked) => {
                  setAllWorldwide(checked);
                  if (checked) {
                    setSpecificExpanded(false);
                    setShipByDistance(false);
                  }
                }}
              />
            </div>

            {/* Specific locations */}
            <div className="py-4">
              <button
                onClick={() => {
                  setSpecificExpanded((prev) => !prev);
                  if (!specificExpanded) setAllWorldwide(false);
                }}
                className="w-full flex items-start justify-between gap-4 text-left"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Specific locations
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ship to specific locations
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    specificExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {specificExpanded && (
                <div className="mt-3 pl-1">
                  <p className="text-xs text-slate-500">
                    Configure specific cities, states or countries you ship to.
                  </p>
                </div>
              )}
            </div>

            {/* Distance based */}
            <div className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  Ship based on distance from your store location
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Set the maximum time in hours that the customer's location
                  should be away from your store.
                </p>
              </div>
              <Switch
                checked={shipByDistance}
                onCheckedChange={(checked) => {
                  setShipByDistance(checked);
                  if (checked) setAllWorldwide(false);
                }}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShippingLocationSheet;
