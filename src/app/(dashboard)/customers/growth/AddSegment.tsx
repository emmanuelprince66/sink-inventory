"use client";

import { useCreateSegmentMutation } from "@/api/segment/create-segment";
import { useUpdateSegmentMutation } from "@/api/segment/update-segment";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import {
  CONDITION_FIELDS,
  humaniseConditionKey,
  type CustomerSegment,
  type SegmentConditions,
} from "@/types/segment";
import { Plus, X } from "lucide-react";
import { useState } from "react";

// Verified against live default segments:
//   Inactive Customers → { no_purchase_days: 30 }
//   Frequent Buyers    → { purchases: 4, within_days: 30 }
// so conditions is a flat rule → threshold map, and match_type decides whether
// all rules must hold or any one of them.
const SEGMENT_TYPES = [
  { value: "CUSTOM", label: "Custom" },
  { value: "VIP_CUSTOMERS", label: "VIP Customers" },
  { value: "FREQUENT_BUYERS", label: "Frequent Buyers" },
  { value: "NEW_CUSTOMERS", label: "New Customers" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "INACTIVE_CUSTOMERS", label: "Inactive Customers" },
  { value: "REGULAR_BUYERS", label: "Regular Buyers" },
];

const MATCH_TYPES = [
  { value: "ALL", label: "Match ALL conditions" },
  { value: "ANY", label: "Match ANY condition" },
];

type Rule = { key: string; value: string };

const conditionsToRules = (conditions?: SegmentConditions): Rule[] =>
  Object.entries(conditions ?? {}).map(([key, value]) => ({
    key,
    value: String(value),
  }));

const labelFor = (key: string) =>
  CONDITION_FIELDS.find((f) => f.key === key)?.label ??
  humaniseConditionKey(key);

const suffixFor = (key: string) =>
  CONDITION_FIELDS.find((f) => f.key === key)?.suffix;

const AddSegment = ({
  segment,
  onDone,
}: {
  segment?: CustomerSegment | null;
  onDone: () => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const isEdit = Boolean(segment?.id);

  const [name, setName] = useState(segment?.name ?? "");
  const [segmentType, setSegmentType] = useState(
    segment?.segment_type ?? "CUSTOM",
  );
  const [matchType, setMatchType] = useState(segment?.match_type ?? "ALL");
  const [rules, setRules] = useState<Rule[]>(
    conditionsToRules(segment?.conditions),
  );
  const [error, setError] = useState<string | null>(null);

  const { mutate: createSegment, isPending: creating } =
    useCreateSegmentMutation({
      businessId: business_id ?? "",
      onSuccess: onDone,
    });

  const { mutate: updateSegment, isPending: updating } =
    useUpdateSegmentMutation({
      segmentId: segment?.id ?? "",
      onSuccess: onDone,
    });

  const isPending = creating || updating;

  // Only offer rules not already in use — the payload is a map, so a repeated
  // key would silently overwrite rather than add a second condition.
  const availableFields = CONDITION_FIELDS.filter(
    (f) => !rules.some((r) => r.key === f.key),
  );

  const addRule = () => {
    if (!availableFields.length) return;
    setRules((prev) => [...prev, { key: availableFields[0].key, value: "" }]);
  };

  const submit = () => {
    setError(null);

    if (!name.trim()) {
      setError("Give the segment a name.");
      return;
    }
    if (!rules.length) {
      setError("Add at least one condition — a segment with no rules matches nobody.");
      return;
    }
    if (rules.some((r) => r.value.trim() === "")) {
      setError("Every condition needs a value.");
      return;
    }

    const conditions: SegmentConditions = {};
    rules.forEach((r) => {
      const n = Number(r.value);
      conditions[r.key] = Number.isFinite(n) ? n : r.value;
    });

    const payload = {
      name: name.trim(),
      segment_type: segmentType,
      match_type: matchType,
      is_active: true,
      conditions,
    };

    if (isEdit) updateSegment(payload);
    else createSegment(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-bold text-grey-2">Segment name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Big Spenders"
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-bold text-grey-2">Type</Label>
          <Select value={segmentType} onValueChange={setSegmentType}>
            <SelectTrigger className="w-full mt-1.5 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEGMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-bold text-grey-2">Matching</Label>
          <Select value={matchType} onValueChange={setMatchType}>
            <SelectTrigger className="w-full mt-1.5 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATCH_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-grey-5 p-3">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-bold text-grey-2">Conditions</Label>
          <button
            type="button"
            onClick={addRule}
            disabled={!availableFields.length}
            className="flex items-center gap-1 text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add condition
          </button>
        </div>

        {rules.length === 0 ? (
          <p className="text-xs text-grey-3 py-3 text-center">
            No conditions yet — add one to define who joins this segment.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={rule.key} className="flex items-center gap-2">
                <Select
                  value={rule.key}
                  onValueChange={(next) =>
                    setRules((prev) =>
                      prev.map((r, i) => (i === index ? { ...r, key: next } : r)),
                    )
                  }
                >
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Keep the current key selectable even though it is in
                        use, otherwise the trigger renders blank. */}
                    {[
                      ...availableFields,
                      CONDITION_FIELDS.find((f) => f.key === rule.key) ?? {
                        key: rule.key,
                        label: labelFor(rule.key),
                      },
                    ].map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {labelFor(f.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative w-28 shrink-0">
                  <Input
                    value={rule.value}
                    inputMode="numeric"
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, value: e.target.value.replace(/[^\d.]/g, "") }
                            : r,
                        ),
                      )
                    }
                    placeholder="0"
                    className={cn(suffixFor(rule.key) && "pr-11")}
                  />
                  {suffixFor(rule.key) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-grey-3">
                      {suffixFor(rule.key)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRules((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="shrink-0 p-1.5 rounded-lg text-grey-3 hover:bg-grey-6 hover:text-error-1 cursor-pointer"
                  title="Remove condition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-error-1">{error}</p>}

      <Button onClick={submit} disabled={isPending} className="w-full gap-2">
        {isPending && <Spinner className="w-4 h-4" />}
        {isEdit ? "Save changes" : "Create segment"}
      </Button>
    </div>
  );
};

export default AddSegment;
