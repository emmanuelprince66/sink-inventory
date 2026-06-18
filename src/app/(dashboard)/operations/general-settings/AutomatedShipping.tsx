"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Map,
  Package,
  Save,
  Truck,
  Warehouse,
  Weight,
  Zap,
} from "lucide-react";
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
      {/* Lead alert — side-quote style (matches the rest of the redesign) */}
      <div className="relative pl-4 py-3 pr-4 bg-emerald-50/50 rounded-r-lg">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l" />
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-900/80 leading-relaxed">
            Make sure every product has a weight set. You can still keep manual
            shipping methods as a fallback.
          </p>
        </div>
      </div>

      {/* Step 1 — Master toggle */}
      <StepTile
        step={1}
        icon={<Zap className="w-4 h-4" />}
        title="Automated Shipping"
        description="Turn this on to automatically calculate delivery costs for every order."
        right={<Switch checked={automated} onCheckedChange={setAutomated} />}
        active={automated}
      />

      {automated && (
        <>
          {/* Step 2 — Service Area */}
          <StepTile
            step={2}
            icon={<Map className="w-4 h-4" />}
            title="Service Area"
            description="Pick the locations you deliver to — selected cities, a delivery radius, or worldwide."
          >
            <button
              onClick={() => setShowShippingLocation(true)}
              className="mt-3 w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-colors text-left"
            >
              <span className="text-sm font-semibold text-emerald-900">
                Choose shipping locations
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          </StepTile>

          {/* Step 3 — Dispatch Pickup */}
          <StepTile
            step={3}
            icon={<Warehouse className="w-4 h-4" />}
            title="Dispatch Pickup"
            description="Riders pick up orders during your business hours. Set the pickup address here."
          >
            <p className="mt-2 text-[11px] text-emerald-700 flex items-start gap-1.5">
              <span className="shrink-0 inline-block w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />
              Dispatch riders only come during your store's business hours.{" "}
              <button className="underline font-semibold">
                View store hours
              </button>
            </p>
            <button
              onClick={() => setShowDispatchPickup(true)}
              className="mt-3 w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-colors text-left"
            >
              <span className="text-sm font-semibold text-emerald-900">
                Configure dispatch pickup address
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          </StepTile>

          {/* Step 4 — Default Weight */}
          <StepTile
            step={4}
            icon={<Weight className="w-4 h-4" />}
            title="Default Package Weight"
            description="Used as a fallback when a product doesn't have its own weight. Shipping rates depend on this."
          >
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 items-end">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Default Weight
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={defaultWeight}
                    onChange={(e) => setDefaultWeight(e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-emerald-700 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded">
                    Kg
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
              >
                Apply weight to all products
              </Button>
            </div>
          </StepTile>

          {/* Step 5 — Integrations */}
          <StepTile
            step={5}
            icon={<Truck className="w-4 h-4" />}
            title="Logistics Integrations"
            description="Connect a partner network so customers see live shipping rates at checkout."
          >
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PartnerCard
                name="Shipbubble"
                tagline="Nationwide & international delivery with 50+ partners"
                logoTone="bg-rose-100 text-rose-700"
                icon={<Truck className="w-5 h-5" />}
                checked={shipbubble}
                onToggle={(v) => {
                  if (v) setShowConnectShipbubble(true);
                  else setShipbubble(false);
                }}
                onLearnMore={() => setShowShipbubbleSettings(true)}
              />
              <PartnerCard
                name="Chowdeck"
                tagline="Fast, reliable same-day deliveries in select cities"
                logoTone="bg-amber-100 text-amber-700"
                icon={<Package className="w-5 h-5" />}
                checked={chowdeck}
                onToggle={setChowdeck}
              />
            </div>
          </StepTile>
        </>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-3 sm:bottom-4 z-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-200/60">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Changes are saved per section. Tap save to publish.
          </p>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

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

// ─── shared visual blocks (mirror DeliveryAndPickup) ────────────────────────

interface StepTileProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
}
const StepTile = ({
  step,
  icon,
  title,
  description,
  active,
  right,
  children,
}: StepTileProps) => (
  <div
    className={cn(
      "relative bg-white rounded-xl border transition-all",
      active
        ? "border-emerald-300 shadow-md shadow-emerald-100/60"
        : "border-slate-200 hover:border-slate-300",
    )}
  >
    <span
      className={cn(
        "absolute left-0 top-4 bottom-4 w-1 rounded-r transition-colors",
        active ? "bg-emerald-500" : "bg-slate-200",
      )}
    />
    <div className="pl-5 pr-4 sm:pl-6 sm:pr-5 py-4 sm:py-5">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center border",
            active
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white"
              : "bg-slate-50 border-slate-200 text-slate-600",
          )}
        >
          <span className="text-[8px] font-semibold uppercase tracking-wider opacity-80">
            Step
          </span>
          <span className="text-xs font-bold leading-none">
            {String(step).padStart(2, "0")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span
              className={cn(
                "mt-0.5",
                active ? "text-emerald-600" : "text-slate-500",
              )}
            >
              {icon}
            </span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>

        {right && <div className="shrink-0 pl-2">{right}</div>}
      </div>
    </div>
  </div>
);

interface PartnerCardProps {
  name: string;
  tagline: string;
  logoTone: string;
  icon: React.ReactNode;
  checked: boolean;
  onToggle: (v: boolean) => void;
  onLearnMore?: () => void;
}
const PartnerCard = ({
  name,
  tagline,
  logoTone,
  icon,
  checked,
  onToggle,
  onLearnMore,
}: PartnerCardProps) => (
  <div
    className={cn(
      "rounded-xl border transition-all p-4 bg-white",
      checked
        ? "border-emerald-300 shadow-sm shadow-emerald-100/70"
        : "border-slate-200 hover:border-slate-300",
    )}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center",
          logoTone,
        )}
      >
        {icon}
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
    <h5 className="text-sm font-bold text-slate-900">{name}</h5>
    <p className="text-xs text-slate-500 mt-1 mb-3 leading-relaxed">
      {tagline}
    </p>
    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="text-emerald-700 hover:text-emerald-800 font-semibold"
        >
          Configure
        </button>
      )}
      {onLearnMore && <span className="text-slate-300">•</span>}
      <button className="text-slate-500 hover:text-slate-700 font-medium">
        Get help
      </button>
    </div>
  </div>
);

export default AutomatedShipping;
