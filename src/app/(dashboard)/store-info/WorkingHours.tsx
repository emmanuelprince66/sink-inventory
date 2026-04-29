"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";

type HoursMode = "custom" | "weekdays" | "247";

const DAYS: { key: string; label: string }[] = [
  { key: "sun", label: "S" },
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
];

const WorkingHours = ({ readOnly = false }: { readOnly?: boolean }) => {
  const [mode, setMode] = useState<HoursMode>("custom");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
  ]);
  const [isDirty, setIsDirty] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
    setIsDirty(true);
  };

  const handleModeChange = (newMode: HoursMode) => {
    setMode(newMode);
    setIsDirty(true);
    if (newMode === "weekdays") {
      setSelectedDays(["mon", "tue", "wed", "thu", "fri"]);
    } else if (newMode === "247") {
      setSelectedDays(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
    }
  };

  const handleSave = () => {
    // TODO: Wire to API when ready
    console.log("Save business hours:", { mode, selectedDays });
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setMode("custom");
    setSelectedDays(["mon", "tue", "wed", "thu", "fri"]);
    setIsDirty(false);
  };

  const options: {
    key: HoursMode;
    title: string;
    subtitle: string;
  }[] = [
    {
      key: "custom",
      title: "Custom Days",
      subtitle: "Choose specific days",
    },
    {
      key: "weekdays",
      title: "Weekdays (Mon - Fri)",
      subtitle: "Only available on weekdays",
    },
    {
      key: "247",
      title: "24/7",
      subtitle: "Round the clock availability",
    },
  ];

  const activeOption = options.find((o) => o.key === mode);

  // Read-only summary view — used on the storefront preview
  if (readOnly) {
    return (
      <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 pt-5">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <p className="text-xs font-medium text-gray-600 mb-1">Schedule</p>
            <p className="text-base font-semibold text-gray-900">
              {activeOption?.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeOption?.subtitle}
            </p>
          </div>

          {mode !== "247" && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Active Days
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {DAYS.map((day, idx) => {
                  const isSelected = selectedDays.includes(day.key);
                  return (
                    <div
                      key={`${day.key}-${idx}`}
                      className={cn(
                        "w-9 h-9 rounded-full text-sm font-medium border flex items-center justify-center",
                        isSelected
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-slate-50 text-slate-400 border-slate-200",
                      )}
                    >
                      {day.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 pt-5">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Working Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {/* Info banner */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700">
            When Automated Shipping is on, dispatch riders will only come for
            pickups during your business hours.
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold text-slate-900">
            Choose Business Hours
          </h4>
          <p className="text-sm text-slate-500 mt-0.5">
            Your business hours will be used for automated shipping
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((option) => {
            const isSelected = mode === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleModeChange(option.key)}
                className={cn(
                  "relative text-left p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-green-500 bg-green-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-white",
                )}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-green-600 fill-green-100" />
                )}
                <Calendar
                  className={cn(
                    "h-4 w-4 mb-2",
                    isSelected ? "text-green-600" : "text-slate-400",
                  )}
                />
                <p className="text-sm font-semibold text-slate-900">
                  {option.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {option.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Day picker — only for custom mode */}
        {mode === "custom" && (
          <div className="pt-2">
            <p className="text-sm text-slate-600 mb-3">
              Select days of the week
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {DAYS.map((day, idx) => {
                const isSelected = selectedDays.includes(day.key);
                return (
                  <button
                    key={`${day.key}-${idx}`}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={cn(
                      "w-9 h-9 rounded-full text-sm font-medium border transition-all",
                      isSelected
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            disabled={!isDirty}
            onClick={handleDiscard}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={!isDirty}
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHours;
