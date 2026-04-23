"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Info, Package, Truck } from "lucide-react";
import { useState } from "react";
import ConnectShipbubbleModal from "./ConnectShipbubbleModal";
import PickupLocationSheet from "./PickupLocationSheet";
import ShipbubbleSettingsModal from "./ShipbubbleSettingsModal";
import ShippingLocationSheet from "./ShippingLocationSheet";

const AutomatedShipping = () => {
  const [automated, setAutomated] = useState(true);
  const [shipbubble, setShipbubble] = useState(false);
  const [chowdeck, setChowdeck] = useState(false);
  const [defaultWeight, setDefaultWeight] = useState("2");
  const [showShippingLocation, setShowShippingLocation] = useState(false);
  const [showDispatchPickup, setShowDispatchPickup] = useState(false);
  const [showShipbubbleSettings, setShowShipbubbleSettings] = useState(false);
  const [showConnectShipbubble, setShowConnectShipbubble] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-900">
            Automated Shipping Settings
          </h3>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg p-3">
            <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700">
              To use automated shipping, please ensure you've added weights to
              all your products. You can also set up manual shipping as a
              fallback.
            </p>
          </div>

          {/* Automated Shipping toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900">
                Automated Shipping
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Turn on automated shipping to automatically calculate delivery
                costs for your customers.
              </p>
            </div>
            <Switch checked={automated} onCheckedChange={setAutomated} />
          </div>

          {automated && (
            <>
              {/* Choose Location */}
              <button
                onClick={() => setShowShippingLocation(true)}
                className="w-full flex items-center justify-between gap-3 py-4 border-t border-slate-100 text-left hover:bg-slate-50 -mx-5 px-5 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Choose Location for Automated Shipping
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    This allows you to select specific locations you deliver
                    to, the distance or world wide shipping.
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>

              {/* Dispatch Pickup */}
              <button
                onClick={() => setShowDispatchPickup(true)}
                className="w-full flex items-center justify-between gap-3 py-4 border-t border-slate-100 text-left hover:bg-slate-50 -mx-5 px-5 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Dispatch Pick-up Location
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    When Automated Shipping is on, dispatch riders will only
                    come for pickups during your business hours.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    ⓘ Dispatch riders will only come during your store's
                    business hours.{" "}
                    <span className="underline font-medium">
                      View store business hours
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>

              {/* Default Weight */}
              <div className="py-4 border-t border-slate-100 -mx-5 px-5">
                <h4 className="text-sm font-semibold text-slate-900">
                  Default Package Weight
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  This is the weight we'll use for any product that doesn't
                  have its own weight. Shipping costs are calculated based on
                  weight, so this should reflect your average individual
                  product weight
                </p>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Default Weight
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={defaultWeight}
                    onChange={(e) => setDefaultWeight(e.target.value)}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    Kg
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 border-green-200 text-green-600 hover:bg-green-50"
                >
                  Update Weight For All Your Products
                </Button>
              </div>

              {/* Integrations */}
              <div className="py-4 border-t border-slate-100 -mx-5 px-5">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  Choose a Shipping Integrations
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Connect your Shipbubble account to automate your deliveries
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Shipbubble */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-red-600" />
                      </div>
                      <Switch
                        checked={shipbubble}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setShowConnectShipbubble(true);
                          } else {
                            setShipbubble(false);
                          }
                        }}
                      />
                    </div>
                    <h5 className="text-sm font-semibold text-slate-900 mb-1">
                      Shipbubble
                    </h5>
                    <p className="text-xs text-slate-500 mb-3">
                      Nationwide and international delivery with 50+ partners
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        onClick={() => setShowShipbubbleSettings(true)}
                        className="text-green-600 hover:underline font-medium"
                      >
                        Learn More
                      </button>
                      <span className="text-slate-300">·</span>
                      <button className="text-green-600 hover:underline font-medium">
                        Get Help
                      </button>
                    </div>
                  </div>

                  {/* Chowdeck */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-yellow-600" />
                      </div>
                      <Switch
                        checked={chowdeck}
                        onCheckedChange={setChowdeck}
                      />
                    </div>
                    <h5 className="text-sm font-semibold text-slate-900 mb-1">
                      Chowdeck
                    </h5>
                    <p className="text-xs text-slate-500 mb-3">
                      Fast, affordable, reliable same day deliveries in select
                      cities
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <button className="text-green-600 hover:underline font-medium">
                        Learn More
                      </button>
                      <span className="text-slate-300">·</span>
                      <button className="text-green-600 hover:underline font-medium">
                        Get Help
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Click the save button to effect changes.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Save
          </Button>
        </div>
      </div>

      {/* Sheets & Modals */}
      <ShippingLocationSheet
        open={showShippingLocation}
        onClose={() => setShowShippingLocation(false)}
      />
      <PickupLocationSheet
        open={showDispatchPickup}
        onClose={() => setShowDispatchPickup(false)}
      />
      <ShipbubbleSettingsModal
        open={showShipbubbleSettings}
        onClose={() => setShowShipbubbleSettings(false)}
      />
      <ConnectShipbubbleModal
        open={showConnectShipbubble}
        onClose={() => setShowConnectShipbubble(false)}
        onConnect={() => {
          setShipbubble(true);
          setShowConnectShipbubble(false);
        }}
      />
    </div>
  );
};

export default AutomatedShipping;
