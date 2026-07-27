"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HexColorInput, HexColorPicker } from "react-colorful";

export interface ColorPickerPreset {
  key: string;
  label: string;
  primary: string;
}

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  presets?: ColorPickerPreset[];
  className?: string;
}

const DEFAULT_COLOR = "#047857";

export function ColorPicker({
  value,
  onChange,
  disabled,
  presets = [],
  className,
}: ColorPickerProps) {
  const color = value || DEFAULT_COLOR;

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-border-tint p-2.5 pr-5 text-left transition-colors cursor-pointer",
            "hover:border-primary-green-300 hover:bg-secondary-6",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent",
            className,
          )}
        >
          <span
            className="w-11 h-11 rounded-lg border border-black/10 flex-shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="flex flex-col">
            <span className="text-sm font-bold text-grey-2">Brand color</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-grey-3">
              {color}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto bg-white border-gray-100 z-100  p-4"
      >
        <div className="flex flex-col gap-4">
          {/* react-colorful auto-injects its own styles; sized via .sink-color-picker */}
          <HexColorPicker
            color={color}
            onChange={onChange}
            className="sink-color-picker"
          />

          <div className="flex items-center gap-2 rounded-lg border border-border-tint px-3 focus-within:border-primary-green-300">
            <span className="text-sm font-bold text-grey-3">#</span>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed={false}
              className="w-full bg-transparent py-2 text-sm font-semibold uppercase tracking-wide text-grey-1 outline-none"
            />
          </div>

          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border-tint pt-3">
              {presets.map((preset) => {
                const isActive =
                  preset.primary.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={preset.key}
                    type="button"
                    title={preset.label}
                    aria-label={preset.label}
                    onClick={() => onChange(preset.primary)}
                    className={cn(
                      "w-7 h-7 rounded-full border transition-transform cursor-pointer hover:scale-110",
                      isActive
                        ? "border-grey-1 ring-2 ring-offset-1 ring-grey-2"
                        : "border-black/10",
                    )}
                    style={{ backgroundColor: preset.primary }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
