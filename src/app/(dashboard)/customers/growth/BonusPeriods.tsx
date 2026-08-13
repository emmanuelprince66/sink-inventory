"use client";

import { useCreateBonusPeriodMutation } from "@/api/loyalty/create-bonus-period";
import { useDeleteBonusPeriodMutation } from "@/api/loyalty/delete-bonus-period";
import { useFetchBonusPeriodsQuery } from "@/api/loyalty/fetch-bonus-periods";
import { useUpdateBonusPeriodMutation } from "@/api/loyalty/update-bonus-period";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type { LoyaltyBonusPeriod } from "@/types/loyalty";
import { Flame, Pause, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const DAYS = [
  { value: "MONDAY", short: "M" },
  { value: "TUESDAY", short: "T" },
  { value: "WEDNESDAY", short: "W" },
  { value: "THURSDAY", short: "T" },
  { value: "FRIDAY", short: "F" },
  { value: "SATURDAY", short: "S" },
  { value: "SUNDAY", short: "S" },
] as const;

type DayValue = (typeof DAYS)[number]["value"];

const BonusPeriods = ({ programId }: { programId: string }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [multiplier, setMultiplier] = useState("2");
  const [days, setDays] = useState<DayValue[]>([]);

  const { data, isLoading } = useFetchBonusPeriodsQuery({
    params: { programId },
  });

  const periods = toList<LoyaltyBonusPeriod>(data?.data as never);

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKey.loyalty.getBonusPeriods],
    });
  };

  const { mutate: createPeriod, isPending: creating } =
    useCreateBonusPeriodMutation({
      programId,
      onSuccess: () => {
        refresh();
        setShowForm(false);
        setName("");
        setMultiplier("2");
        setDays([]);
      },
    });

  const toggleDay = (day: DayValue) =>
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );

  const submit = () => {
    if (!name.trim() || !multiplier.trim()) return;
    createPeriod({
      name: name.trim(),
      multiplier,
      days_of_week: days,
      is_active: true,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-grey-5">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning-1" />
          <h4 className="text-sm font-extrabold text-grey-1">
            Bonus Periods ({periods.length})
          </h4>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-grey-6/60 border-b border-grey-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-grey-2 mb-1 block">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Double Points Weekend"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-grey-2 mb-1 block">
                Multiplier
              </label>
              <Input
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                type="number"
                min={1}
                step="0.5"
                className="bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-grey-2 mb-1.5 block">
              Active days
            </label>
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={cn(
                    "w-9 h-9 rounded-full text-xs font-bold cursor-pointer transition-colors",
                    days.includes(d.value)
                      ? "bg-primary-green-300 text-white"
                      : "bg-white border border-grey-5 text-grey-3 hover:bg-grey-6",
                  )}
                  title={d.value}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={creating || !name.trim()}
              className="gap-2"
            >
              {creating && <Spinner className="w-4 h-4" />}
              Add bonus period
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="w-full flex justify-center py-8">
          <Spinner className="text-primary-green-300" />
        </div>
      ) : periods.length === 0 ? (
        <p className="text-sm text-grey-3 text-center py-8">
          No bonus periods — add one to multiply rewards on chosen days.
        </p>
      ) : (
        periods.map((period) => (
          <BonusPeriodRow key={period.id} period={period} onDeleted={refresh} />
        ))
      )}
    </div>
  );
};

const BonusPeriodRow = ({
  period,
  onDeleted,
}: {
  period: LoyaltyBonusPeriod;
  onDeleted: () => void;
}) => {
  const { mutate: deletePeriod, isPending } = useDeleteBonusPeriodMutation({
    bonusPeriodId: period.id ?? "",
    onSuccess: onDeleted,
  });

  const isActive = period.is_active !== false;
  const { mutate: updatePeriod, isPending: toggling } =
    useUpdateBonusPeriodMutation({
      bonusPeriodId: period.id ?? "",
      onSuccess: onDeleted,
    });

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-grey-6 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-grey-1 truncate">{period.name}</p>
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning-2 text-warning-1">
            {Number(period.multiplier ?? 1)}x
          </span>
          {!isActive && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-grey-6 text-grey-3">
              Paused
            </span>
          )}
        </div>
        <p className="text-[11px] text-grey-3 mt-0.5">
          {period.days_of_week?.length
            ? period.days_of_week
                .map((d) => d.charAt(0) + d.slice(1, 3).toLowerCase())
                .join(", ")
            : "Every day"}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => updatePeriod({ is_active: !isActive })}
          disabled={toggling || !period.id}
          title={isActive ? "Pause bonus period" : "Resume bonus period"}
          className="p-2 rounded-lg text-grey-2 hover:bg-grey-6 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {toggling ? (
            <Spinner className="w-4 h-4" />
          ) : isActive ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => deletePeriod()}
          disabled={isPending || !period.id}
          title="Delete bonus period"
          className="p-2 rounded-lg text-error-1 hover:bg-error-2/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default BonusPeriods;
