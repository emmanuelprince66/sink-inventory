"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Box,
  Check,
  FileText,
  Mail,
  Package,
  Package2,
  PackageOpen,
  PencilRuler,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface BoxSize {
  id: string;
  name: string;
  maxWeightKg: number;
  height: number;
  length: number;
  width: number;
  custom?: boolean;
}

interface BoxOption extends BoxSize {
  icon: React.ReactNode;
  /** Tailwind classes for the icon wrap (background tint). */
  tone: string;
}

// Preset catalogue (matches the screenshot the boss approved).
export const BOX_PRESETS: BoxOption[] = [
  {
    id: "envelope",
    name: "Envelope",
    maxWeightKg: 0.5,
    height: 2,
    length: 25,
    width: 35,
    icon: <Mail className="w-6 h-6" />,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    id: "flyer",
    name: "Flyer",
    maxWeightKg: 2,
    height: 4,
    length: 41,
    width: 31,
    icon: <FileText className="w-6 h-6" />,
    tone: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    id: "small-box",
    name: "Small Box",
    maxWeightKg: 3,
    height: 34,
    length: 10,
    width: 32,
    icon: <Package2 className="w-6 h-6" />,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    id: "big-box",
    name: "Big Box",
    maxWeightKg: 12,
    height: 34,
    length: 32,
    width: 34,
    icon: <Package className="w-6 h-6" />,
    tone: "bg-teal-50 text-teal-700 border-teal-100",
  },
  {
    id: "large-box-1",
    name: "Large Box 1",
    maxWeightKg: 18,
    height: 37,
    length: 42,
    width: 36,
    icon: <PackageOpen className="w-6 h-6" />,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    id: "large-box-2",
    name: "Large Box 2",
    maxWeightKg: 25,
    height: 39,
    length: 48,
    width: 40,
    icon: <PackageOpen className="w-7 h-7" />,
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    id: "large-box-3",
    name: "Large Box 3",
    maxWeightKg: 40,
    height: 45,
    length: 56,
    width: 50,
    icon: <Box className="w-7 h-7" />,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
];

interface BoxSizePickerModalProps {
  open: boolean;
  onClose: () => void;
  value: BoxSize | null;
  onChange: (size: BoxSize) => void;
}

const BoxSizePickerModal = ({
  open,
  onClose,
  value,
  onChange,
}: BoxSizePickerModalProps) => {
  const [selectedId, setSelectedId] = useState<string>(
    value?.id || "small-box",
  );

  // Custom-size form (only visible when "custom" is selected).
  const [customWeight, setCustomWeight] = useState(
    value?.custom ? String(value.maxWeightKg) : "",
  );
  const [customH, setCustomH] = useState(
    value?.custom ? String(value.height) : "",
  );
  const [customL, setCustomL] = useState(
    value?.custom ? String(value.length) : "",
  );
  const [customW, setCustomW] = useState(
    value?.custom ? String(value.width) : "",
  );

  // Reset selection when the modal re-opens with a new value.
  useEffect(() => {
    if (open) {
      setSelectedId(value?.id || "small-box");
      if (value?.custom) {
        setCustomWeight(String(value.maxWeightKg));
        setCustomH(String(value.height));
        setCustomL(String(value.length));
        setCustomW(String(value.width));
      }
    }
  }, [open, value]);

  const isCustomReady =
    parseFloat(customWeight) > 0 &&
    parseFloat(customH) > 0 &&
    parseFloat(customL) > 0 &&
    parseFloat(customW) > 0;

  const handleSave = () => {
    if (selectedId === "custom") {
      if (!isCustomReady) return;
      onChange({
        id: "custom",
        name: "Custom",
        maxWeightKg: parseFloat(customWeight),
        height: parseFloat(customH),
        length: parseFloat(customL),
        width: parseFloat(customW),
        custom: true,
      });
    } else {
      const preset = BOX_PRESETS.find((p) => p.id === selectedId);
      if (!preset) return;
      const { icon: _ic, tone: _tn, ...size } = preset;
      onChange(size);
    }
    onClose();
  };

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      title="Shipping Box Size"
      size="xl"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-slate-700" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-slate-200"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={selectedId === "custom" && !isCustomReady}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Save selection
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BOX_PRESETS.map((p) => (
          <BoxOptionCard
            key={p.id}
            option={p}
            selected={selectedId === p.id}
            onSelect={() => setSelectedId(p.id)}
          />
        ))}

        {/* Custom tile */}
        <button
          type="button"
          onClick={() => setSelectedId("custom")}
          className={cn(
            "text-left bg-white border-2 rounded-xl p-3 sm:p-4 transition-all",
            "flex items-center gap-3 sm:gap-4",
            selectedId === "custom"
              ? "border-emerald-500 ring-4 ring-emerald-100"
              : "border-slate-200 hover:border-slate-300",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center border shrink-0",
              selectedId === "custom"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-slate-50 text-slate-600 border-slate-200",
            )}
          >
            <PencilRuler className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm sm:text-base">
              Custom
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Enter your size</p>
          </div>
        </button>
      </div>

      {/* Inline custom-size editor (only when Custom is selected) */}
      {selectedId === "custom" && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-white border border-emerald-200 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <p className="text-sm font-semibold text-emerald-900">
              Custom box dimensions
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NumberField
              label="Max Weight"
              unit="Kg"
              value={customWeight}
              onChange={setCustomWeight}
            />
            <NumberField
              label="Height"
              unit="cm"
              value={customH}
              onChange={setCustomH}
            />
            <NumberField
              label="Length"
              unit="cm"
              value={customL}
              onChange={setCustomL}
            />
            <NumberField
              label="Width"
              unit="cm"
              value={customW}
              onChange={setCustomW}
            />
          </div>
        </div>
      )}
    </CustomModal>
  );
};

// ─── visual building blocks ──────────────────────────────────────────────────

interface BoxOptionCardProps {
  option: BoxOption;
  selected: boolean;
  onSelect: () => void;
}
const BoxOptionCard = ({ option, selected, onSelect }: BoxOptionCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "relative text-left bg-white border-2 rounded-xl p-3 sm:p-4 transition-all",
      "flex items-center gap-3 sm:gap-4",
      selected
        ? "border-emerald-500 ring-4 ring-emerald-100"
        : "border-slate-200 hover:border-slate-300",
    )}
  >
    {selected && (
      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
    )}
    <div
      className={cn(
        "w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center border shrink-0",
        option.tone,
      )}
    >
      {option.icon}
    </div>
    <div className="min-w-0">
      <p className="font-bold text-slate-900 text-sm sm:text-base">
        {option.name}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
        Max Weight: {option.maxWeightKg} Kg
      </p>
      <p className="text-[11px] text-slate-500 mt-0.5">
        H:{option.height}cm. L:{option.length}cm W:{option.width}cm
      </p>
    </div>
  </button>
);

const NumberField = ({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block mb-1.5">
      {label}
    </label>
    <div className="relative">
      <Input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="pr-10 bg-white"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-700 px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded">
        {unit}
      </span>
    </div>
  </div>
);

export default BoxSizePickerModal;
