"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useShipbubbleHook } from "@/hooks/useShipbubbleHook";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Map,
  Package,
  Save,
  Settings as SettingsIcon,
  Truck,
  Weight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import ShipbubbleAgreementModal from "./ShipbubbleAgreementModal";
import ShipbubbleSettingsModal from "./ShipbubbleSettingsModal";
import ShippingLocationSheet from "./ShippingLocationSheet";

const AutomatedShipping = () => {
  const [automated, setAutomated] = useState(true);
  const [defaultWeight, setDefaultWeight] = useState("2");
  const [showShippingLocation, setShowShippingLocation] = useState(false);
  const [showShipbubbleSettings, setShowShipbubbleSettings] = useState(false);
  const [showShipbubbleAgreement, setShowShipbubbleAgreement] = useState(false);

  const {
    isConfigured,
    isShipbubbleActive,
    setActive,
    isSaving: isSavingShipbubble,
  } = useShipbubbleHook();

  // Toggle is the backend flag `shipbubble_settings.is_active`:
  //  • OFF (any state) → PATCH is_active=false
  //  • ON + not configured → open agreement → after accept, prompt the user to
  //    set up Shipbubble in the Configure modal (we can't activate without
  //    a complete payload)
  //  • ON + configured → PATCH is_active=true straight away
  const handleShipbubbleToggle = (next: boolean) => {
    if (!next) {
      setActive(false);
      return;
    }
    if (!isConfigured) {
      setShowShipbubbleAgreement(true);
      return;
    }
    setActive(true);
  };

  const handleAgreementAccept = () => {
    setShowShipbubbleAgreement(false);
    if (isConfigured) {
      setActive(true);
    } else {
      // Need the merchant to enter pickup / category / box-size before we can
      // send a valid shipbubble_settings payload — open the Configure modal.
      setShowShipbubbleSettings(true);
    }
  };

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

          {/* Step 3 — Default Weight */}
          <StepTile
            step={3}
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

          {/* Step 4 — Integrations */}
          <StepTile
            step={4}
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
                checked={isShipbubbleActive}
                disabled={isSavingShipbubble}
                onToggle={handleShipbubbleToggle}
                onConfigure={() => setShowShipbubbleSettings(true)}
                isConfigured={isConfigured}
              />
              <PartnerCard
                name="Chowdeck"
                tagline="Fast, reliable same-day deliveries in select cities"
                logoTone="bg-amber-100 text-amber-700"
                icon={<Package className="w-5 h-5" />}
                checked={false}
                onToggle={() => {}}
                comingSoon
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
      <ShipbubbleSettingsModal
        open={showShipbubbleSettings}
        onClose={() => setShowShipbubbleSettings(false)}
      />
      <ShipbubbleAgreementModal
        open={showShipbubbleAgreement}
        onClose={() => setShowShipbubbleAgreement(false)}
        onConnect={handleAgreementAccept}
        loading={isSavingShipbubble}
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
  disabled?: boolean;
  onToggle: (v: boolean) => void;
  onConfigure?: () => void;
  isConfigured?: boolean;
  comingSoon?: boolean;
}
const PartnerCard = ({
  name,
  tagline,
  logoTone,
  icon,
  checked,
  disabled,
  onToggle,
  onConfigure,
  isConfigured,
  comingSoon,
}: PartnerCardProps) => (
  <div
    className={cn(
      "relative rounded-xl border transition-all p-4",
      comingSoon
        ? "bg-slate-50/60 border-slate-200"
        : checked
          ? "bg-white border-emerald-300 shadow-sm shadow-emerald-100/70"
          : "bg-white border-slate-200 hover:border-slate-300",
    )}
  >
    {comingSoon && (
      <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-sm">
        Coming soon
      </span>
    )}
    <div className={cn("flex items-start justify-between mb-3", comingSoon && "opacity-50")}>
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center",
          comingSoon ? "bg-slate-200 text-slate-400" : logoTone,
        )}
      >
        {icon}
      </div>
      {!comingSoon && (
        <Switch
          checked={checked}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
      )}
    </div>
    <h5
      className={cn(
        "text-sm font-bold flex items-center gap-1.5",
        comingSoon ? "text-slate-500" : "text-slate-900",
      )}
    >
      {name}
      {onConfigure && isConfigured && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
          Connected
        </span>
      )}
    </h5>
    <p
      className={cn(
        "text-xs mt-1 mb-3 leading-relaxed",
        comingSoon ? "text-slate-400" : "text-slate-500",
      )}
    >
      {tagline}
    </p>
    {!comingSoon && (
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
        {onConfigure && (
          <button
            onClick={onConfigure}
            className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
          >
            <SettingsIcon className="w-3 h-3" />
            {isConfigured ? "Configure" : "Set up"}
          </button>
        )}
        {onConfigure && <span className="text-slate-300">•</span>}
        <button className="text-slate-500 hover:text-slate-700 font-medium">
          Get help
        </button>
      </div>
    )}
  </div>
);

export default AutomatedShipping;
