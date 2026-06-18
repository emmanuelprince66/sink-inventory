"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Layers,
  Package,
  Save,
  Settings as SettingsIcon,
  Truck,
} from "lucide-react";
import { useState } from "react";
import BoxSizePickerModal, { BOX_PRESETS, BoxSize } from "./BoxSizePickerModal";

const ShipbubbleSettingsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [category, setCategory] = useState("hot-food");
  // Default to the first preset so the button always has a populated value.
  const [boxSize, setBoxSize] = useState<BoxSize>(() => {
    const first = BOX_PRESETS[0];
    return {
      id: first.id,
      name: first.name,
      maxWeightKg: first.maxWeightKg,
      height: first.height,
      length: first.length,
      width: first.width,
    };
  });
  const [openBoxPicker, setOpenBoxPicker] = useState(false);

  // Resolve the preset (for the icon / tone) when the chosen box is a preset.
  const preset = BOX_PRESETS.find((p) => p.id === boxSize.id);

  return (
    <>
      <CustomModal
        isOpen={open}
        onClose={onClose}
        title="Shipbubble Settings"
        description="Tune your product category and parcel defaults."
        size="lg"
        headerIcon={
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <SettingsIcon className="w-4 h-4" />
          </div>
        }
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Changes are applied to new shipments only.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 flex-1 sm:flex-none"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step 1 — Shipping Category */}
          <SettingsTile
            step={1}
            icon={<Layers className="w-4 h-4" />}
            title="Shipping Category"
            description="Pick the category that best describes your products so Shipbubble can compute accurate rates."
          >
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-3 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot-food">
                  Hot food, Dry food and supplements
                </SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
              </SelectContent>
            </Select>
          </SettingsTile>

          {/* Step 2 — Box Size */}
          <SettingsTile
            step={2}
            icon={<Package className="w-4 h-4" />}
            title="Package Weight & Size"
            description="Used when a product hasn't set its own weight. Tap below to pick from preset boxes or enter a custom size."
          >
            <button
              type="button"
              onClick={() => setOpenBoxPicker(true)}
              className="mt-3 w-full flex items-center gap-3 sm:gap-4 p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-left"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center border shrink-0",
                  preset?.tone ||
                    "bg-emerald-50 text-emerald-700 border-emerald-100",
                )}
              >
                {preset?.icon || <Package className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {boxSize.name}
                </p>
                <p className="text-xs text-slate-700 mt-0.5">
                  Max Weight: {boxSize.maxWeightKg} Kg
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  H:{boxSize.height}cm · L:{boxSize.length}cm · W:
                  {boxSize.width}cm
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
            </button>
          </SettingsTile>

          {/* Step 3 — Logistics partners */}
          <SettingsTile
            step={3}
            icon={<Truck className="w-4 h-4" />}
            title="Logistics Partners"
            description="Choose which couriers in Shipbubble's network are shown to your customers at checkout."
          >
            <button
              type="button"
              className="mt-3 w-full flex items-center justify-between gap-3 p-3 rounded-lg border-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors text-left"
            >
              <span className="text-sm font-semibold text-slate-800">
                Manage partner list
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </SettingsTile>
        </div>
      </CustomModal>

      <BoxSizePickerModal
        open={openBoxPicker}
        onClose={() => setOpenBoxPicker(false)}
        value={boxSize}
        onChange={setBoxSize}
      />
    </>
  );
};

// ─── shared visual block (same identity as DeliveryAndPickup) ───────────────

interface SettingsTileProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}
const SettingsTile = ({
  step,
  icon,
  title,
  description,
  children,
}: SettingsTileProps) => (
  <div className="relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
    <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-slate-200" />
    <div className="pl-4 pr-3 sm:pl-5 sm:pr-4 py-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center border bg-slate-50 border-slate-200 text-slate-600">
          <span className="text-[8px] font-semibold uppercase tracking-wider opacity-80">
            Step
          </span>
          <span className="text-[10px] font-bold leading-none">
            {String(step).padStart(2, "0")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-slate-500 mt-0.5">{icon}</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default ShipbubbleSettingsModal;
