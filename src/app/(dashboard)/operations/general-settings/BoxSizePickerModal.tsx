"use client";

import { BoxSizeOption } from "@/api/shipping/shipbubble";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check, Package } from "lucide-react";
import { useEffect, useState } from "react";

interface BoxSizePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: BoxSizeOption | null;
  onChange: (size: BoxSizeOption) => void;
  /** Options fetched from /order/shipping_dimention/. */
  options: BoxSizeOption[];
  loading?: boolean;
}

const BoxSizePickerModal = ({
  isOpen,
  onClose,
  value,
  onChange,
  options,
  loading,
}: BoxSizePickerModalProps) => {
  const [selectedName, setSelectedName] = useState<string>(value?.name || "");

  // Sync selection when re-opened.
  useEffect(() => {
    if (isOpen) setSelectedName(value?.name || "");
  }, [isOpen, value]);

  const handleSave = () => {
    const picked = options.find((o) => o.name === selectedName);
    if (!picked) return;
    onChange(picked);
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Shipping Box Size"
      description="Pick a default parcel size — used when a product hasn't set its own weight."
      size="xl"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-slate-700" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedName}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Save selection
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-slate-100" />
          ))}
        </div>
      ) : options.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            No box sizes available
          </p>
          <p className="text-xs text-slate-500 mt-1">
            We couldn't load the box catalogue. Try closing and re-opening this
            modal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => (
            <BoxOptionCard
              key={opt.name}
              option={opt}
              selected={selectedName === opt.name}
              onSelect={() => setSelectedName(opt.name)}
            />
          ))}
        </div>
      )}
    </CustomModal>
  );
};

// ─── Card ────────────────────────────────────────────────────────────────────

interface BoxOptionCardProps {
  option: BoxSizeOption;
  selected: boolean;
  onSelect: () => void;
}
const BoxOptionCard = ({ option, selected, onSelect }: BoxOptionCardProps) => {
  const [imgError, setImgError] = useState(false);
  return (
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
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
        {imgError || !option.description_image_url ? (
          <Package className="w-6 h-6 text-slate-400" />
        ) : (
          // Plain <img> intentionally — the cloudinary host isn't whitelisted
          // for next/image and these thumbnails are small.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={option.description_image_url}
            alt={option.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-slate-900 text-sm sm:text-base">
          {option.name}
        </p>
        <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
          Max Weight: {option.max_weight} Kg
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          H:{option.height}cm · L:{option.length}cm · W:{option.width}cm
        </p>
      </div>
    </button>
  );
};

export default BoxSizePickerModal;
