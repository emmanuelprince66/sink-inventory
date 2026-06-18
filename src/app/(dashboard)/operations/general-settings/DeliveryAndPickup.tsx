"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPinned,
  Save,
  Sparkles,
  Timer,
} from "lucide-react";
import { useState } from "react";
import PickupLocationSheet from "./PickupLocationSheet";

const DeliveryAndPickup = () => {
  const [deliveryTimelines, setDeliveryTimelines] = useState(false);
  const [deliveryWindow, setDeliveryWindow] = useState(false);
  const [noSameDay, setNoSameDay] = useState(false);
  const [onlySameDay, setOnlySameDay] = useState(false);
  const [customerPickup, setCustomerPickup] = useState(false);
  const [processingDays, setProcessingDays] = useState("1");
  const [reminder, setReminder] = useState("1 day to delivery");
  const [showPickupSheet, setShowPickupSheet] = useState(false);

  return (
    <div className="space-y-4">
      {/* Step 1 — Delivery Timelines */}
      <StepTile
        step={1}
        icon={<CalendarRange className="w-4 h-4" />}
        title="Delivery Timelines"
        description="Set up delivery dates and times to inform your customers about your operational days and when to expect orders."
        right={
          <Switch
            checked={deliveryTimelines}
            onCheckedChange={setDeliveryTimelines}
          />
        }
        active={deliveryTimelines}
      >
        {deliveryTimelines && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Calendar">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All days</SelectItem>
                    <SelectItem value="weekdays">Weekdays only</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Select Days (Optional)">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mon">Monday</SelectItem>
                    <SelectItem value="tue">Tuesday</SelectItem>
                    <SelectItem value="wed">Wednesday</SelectItem>
                    <SelectItem value="thu">Thursday</SelectItem>
                    <SelectItem value="fri">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <SubRow
              icon={<Clock className="w-3.5 h-3.5" />}
              title="Add time for delivery window"
              description="Show processing or delivery times to your customers."
              control={
                <Switch
                  checked={deliveryWindow}
                  onCheckedChange={setDeliveryWindow}
                />
              }
            />
          </div>
        )}
      </StepTile>

      {/* Step 2 — Same Day Rules */}
      <StepTile
        step={2}
        icon={<Sparkles className="w-4 h-4" />}
        title="Same-day Delivery Rules"
        description="Optional toggles that constrain when same-day delivery is offered to customers."
      >
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CheckTile
            label="No same-day delivery"
            checked={noSameDay}
            onChange={setNoSameDay}
          />
          <CheckTile
            label="Only same-day delivery"
            checked={onlySameDay}
            onChange={setOnlySameDay}
          />
        </div>
      </StepTile>

      {/* Step 3 — Processing & Reminders */}
      <StepTile
        step={3}
        icon={<Timer className="w-4 h-4" />}
        title="Processing & Reminders"
        description="Tell customers how long you take to prep an order, and keep your team alerted before each delivery."
      >
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Set processing days">
            <div className="relative">
              <Input
                type="number"
                value={processingDays}
                onChange={(e) => setProcessingDays(e.target.value)}
                placeholder="1"
                className="pr-14"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-emerald-700 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded">
                days
              </span>
            </div>
            <Hint>
              Days needed to prepare an order before it's ready for dispatch.
            </Hint>
          </Field>
          <Field label="Set reminder">
            <Select value={reminder} onValueChange={setReminder}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 day to delivery">
                  1 day to delivery
                </SelectItem>
                <SelectItem value="2 days to delivery">
                  2 days to delivery
                </SelectItem>
                <SelectItem value="3 days to delivery">
                  3 days to delivery
                </SelectItem>
              </SelectContent>
            </Select>
            <Hint>Helps you stay on track with your delivery schedule.</Hint>
          </Field>
        </div>
      </StepTile>

      {/* Step 4 — Customer Pickup */}
      <StepTile
        step={4}
        icon={<MapPinned className="w-4 h-4" />}
        title="Customer Pickup Location"
        description="Display your store's address, phone number, and opening hours at checkout so customers can pick up orders."
        right={
          <div className="flex items-center gap-2">
            <Switch
              checked={customerPickup}
              onCheckedChange={setCustomerPickup}
            />
          </div>
        }
        active={customerPickup}
      >
        {customerPickup && (
          <button
            onClick={() => setShowPickupSheet(true)}
            className="mt-3 w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Configure pickup address
              </p>
              <p className="text-xs text-emerald-700/70 mt-0.5">
                Add your physical store details for the checkout pickup option.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-700" />
          </button>
        )}
      </StepTile>

      {/* Save bar — distinct floating-style action strip */}
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

      <PickupLocationSheet
        open={showPickupSheet}
        onClose={() => setShowPickupSheet(false)}
      />
    </div>
  );
};

// ─── shared visual building blocks ──────────────────────────────────────────

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
    {/* Left accent bar — distinct from the typical card outline */}
    <span
      className={cn(
        "absolute left-0 top-4 bottom-4 w-1 rounded-r transition-colors",
        active ? "bg-emerald-500" : "bg-slate-200",
      )}
    />
    <div className="pl-5 pr-4 sm:pl-6 sm:pr-5 py-4 sm:py-5">
      <div className="flex items-start gap-3">
        {/* Numbered step badge — visual identity marker */}
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

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] text-emerald-700 mt-1.5 flex items-start gap-1.5">
    <span className="shrink-0 inline-block w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />
    {children}
  </p>
);

const SubRow = ({
  icon,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
    <div className="flex items-start gap-2.5 flex-1">
      <span className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    {control}
  </div>
);

const CheckTile = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
      checked
        ? "border-emerald-300 bg-emerald-50"
        : "border-slate-200 bg-white hover:border-slate-300",
    )}
  >
    <span
      className={cn(
        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
        checked
          ? "bg-emerald-600 border-emerald-600"
          : "border-slate-300 bg-white",
      )}
    >
      {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />
    <span
      className={cn(
        "text-sm font-medium",
        checked ? "text-emerald-900" : "text-slate-700",
      )}
    >
      {label}
    </span>
  </label>
);

export default DeliveryAndPickup;
