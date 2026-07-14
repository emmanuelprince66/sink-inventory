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
      {/* Lead alert */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-secondary-6 border border-primary-green-300/15 rounded-lg">
        <Lightbulb className="w-4 h-4 text-primary-green-300 mt-0.5 shrink-0" />
        <p className="text-sm text-primary-green-100 leading-relaxed">
          Make sure every product has a weight set. You can still keep manual
          shipping methods as a fallback.
        </p>
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
              className="mt-3 w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-primary-green-300/30 bg-secondary-6 hover:bg-secondary-6/70 transition-colors text-left cursor-pointer"
            >
              <span className="text-sm font-bold text-primary-green-100">
                Choose shipping locations
              </span>
              <ChevronRight className="w-4 h-4 text-primary-green-300" />
            </button>
          </StepTile>

          {/* Step 3 — Default Weight */}
          <StepTile
            step={3}
            icon={<Weight className="w-4 h-4" />}
            title="Default Package Weight"
            description="Used as a fallback when a product doesn't have its own weight. Shipping rates depend on this."
          >
            <div className="mt-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-grey-3 block mb-1.5">
                Default Weight
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative w-full sm:w-[160px] shrink-0">
                  <Input
                    type="number"
                    value={defaultWeight}
                    onChange={(e) => setDefaultWeight(e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-primary-green-300 px-2 py-0.5 bg-secondary-6 border border-primary-green-300/20 rounded">
                    Kg
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="h-12 w-full sm:w-auto border-primary-green-300/30 text-primary-green-300 hover:bg-secondary-6 hover:border-primary-green-300/50 cursor-pointer"
                >
                  Apply weight to all products
                </Button>
              </div>
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
                logoTone="bg-info-2 text-info-1"
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
                logoTone="bg-warning-2 text-warning-1"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-grey-5 shadow-lg">
          <p className="text-xs text-grey-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-green-300" />
            Changes are saved per section. Tap save to publish.
          </p>
          <Button className="gap-1.5">
            <Save className="w-4 h-4" />
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
const StepTile = ({ step, icon, title, description, right, children }: StepTileProps) => (
  <div className="bg-white rounded-xl border border-grey-5 p-4 sm:p-5">
    <div className="flex items-start gap-4">
      {/* Step number */}
      <div className="shrink-0 flex flex-col items-center leading-none pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Step
        </span>
        <span className="text-xl font-extrabold text-grey-1">
          {String(step).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-primary-green-300">{icon}</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-grey-1">{title}</h4>
              <p className="text-xs text-grey-3 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {right && <div className="shrink-0 pl-2">{right}</div>}
        </div>
        {children}
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
        ? "bg-grey-6/60 border-grey-5"
        : checked
          ? "bg-white border-primary-green-300/40"
          : "bg-white border-grey-5 hover:border-grey-4",
    )}
  >
    {comingSoon && (
      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-grey-3 bg-white border border-grey-5 px-2 py-0.5 rounded-full">
        Coming soon
      </span>
    )}
    <div className={cn("flex items-start justify-between mb-3", comingSoon && "opacity-50")}>
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center",
          comingSoon ? "bg-grey-5 text-grey-4" : logoTone,
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
        comingSoon ? "text-grey-3" : "text-grey-1",
      )}
    >
      {name}
      {onConfigure && isConfigured && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-green-100 bg-secondary-6 border border-primary-green-300/20 px-1.5 py-0.5 rounded">
          Connected
        </span>
      )}
    </h5>
    <p
      className={cn(
        "text-xs mt-1 mb-3 leading-relaxed",
        comingSoon ? "text-grey-4" : "text-grey-3",
      )}
    >
      {tagline}
    </p>
    {!comingSoon && (
      <div className="flex items-center gap-2 pt-3 border-t border-grey-5 text-xs">
        {onConfigure && (
          <button
            onClick={onConfigure}
            className="text-primary-green-300 hover:text-primary-green-100 font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <SettingsIcon className="w-3 h-3" />
            {isConfigured ? "Configure" : "Set up"}
          </button>
        )}
        {onConfigure && <span className="text-grey-4">•</span>}
        <button className="text-grey-3 hover:text-grey-2 font-bold cursor-pointer">
          Get help
        </button>
      </div>
    )}
  </div>
);

export default AutomatedShipping;
