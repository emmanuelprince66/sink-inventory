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
import { ChevronRight } from "lucide-react";
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
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-900">
            Delivery Settings
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Delivery Timelines */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  Delivery Timelines
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Set up delivery dates and times to inform your customers
                  about your operational days and also when they can expect
                  their orders.
                </p>
              </div>
              <Switch
                checked={deliveryTimelines}
                onCheckedChange={setDeliveryTimelines}
              />
            </div>

            {deliveryTimelines && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Calendar
                    </label>
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
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Select Days (Optional)
                    </label>
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
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-slate-900">
                      Add time for delivery window
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      This allows your customers see the times or processing
                      times for your products
                    </p>
                  </div>
                  <Switch
                    checked={deliveryWindow}
                    onCheckedChange={setDeliveryWindow}
                  />
                </div>
              </>
            )}
          </div>

          {/* Same day delivery checkboxes */}
          <div className="p-5">
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noSameDay}
                  onChange={(e) => setNoSameDay(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-slate-700">
                  No same day delivery
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlySameDay}
                  onChange={(e) => setOnlySameDay(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-slate-700">
                  Only same day delivery
                </span>
              </label>
            </div>
          </div>

          {/* Processing + reminder */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Set processing days
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={processingDays}
                  onChange={(e) => setProcessingDays(e.target.value)}
                  placeholder="1"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                  days
                </span>
              </div>
              <p className="text-[11px] text-green-600 mt-1.5 flex items-start gap-1">
                <span className="shrink-0">ⓘ</span>
                Define the number of days it takes to prepare an order before
                it's ready for dispatch
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Set reminder
              </label>
              <Select value={reminder} onValueChange={setReminder}>
                <SelectTrigger>
                  <SelectValue />
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
              <p className="text-[11px] text-green-600 mt-1.5 flex items-start gap-1">
                <span className="shrink-0">ⓘ</span>
                Enable reminders to help you stay on track with your delivery
                schedule.
              </p>
            </div>
          </div>

          {/* Customer pickup */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  Customer Pick-up Location
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Display your store's address, phone number, and opening hours
                  at checkout, allowing customers to choose to pick up their
                  orders.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={customerPickup}
                  onCheckedChange={setCustomerPickup}
                />
                <button
                  onClick={() => setShowPickupSheet(true)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Click the save button to effect changes.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Save
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

export default DeliveryAndPickup;
