"use client";

import { cn } from "@/lib/utils";
import {
  Bike,
  CheckCircle2,
  Circle,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

interface FlowStep {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const STEPS: FlowStep[] = [
  { key: "ORDER", label: "Order Placed", icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "RIDER_ASSIGNED", label: "Rider Assigned", icon: <Bike className="w-4 h-4" /> },
  { key: "PICKED_UP", label: "Picked Up", icon: <Package className="w-4 h-4" /> },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: <Truck className="w-4 h-4" /> },
  { key: "DELIVERED", label: "Delivered", icon: <CheckCircle2 className="w-4 h-4" /> },
];

interface OrderFlowTimelineProps {
  // Indices of completed steps; the next index is "current".
  // For now this is mock-derived from the order's shipping_status.
  currentStepIndex: number;
  timestamps?: Partial<Record<string, string>>;
}

const OrderFlowTimeline = ({
  currentStepIndex,
  timestamps = {},
}: OrderFlowTimelineProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Delivery Flow
      </h3>

      <ol className="relative space-y-5">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isFuture = idx > currentStepIndex;
          const isLast = idx === STEPS.length - 1;

          return (
            <li key={step.key} className="relative flex gap-3">
              {/* Vertical connector */}
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 w-0.5 h-full -translate-x-1/2",
                    isDone ? "bg-green-400" : "bg-gray-200",
                  )}
                  aria-hidden
                />
              )}

              {/* Dot */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 border-2",
                  isDone &&
                    "bg-green-100 border-green-500 text-green-700",
                  isCurrent &&
                    "bg-blue-100 border-blue-500 text-blue-700 ring-4 ring-blue-100",
                  isFuture && "bg-gray-50 border-gray-300 text-gray-400",
                )}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isDone && "text-gray-900",
                      isCurrent && "text-blue-700",
                      isFuture && "text-gray-400",
                    )}
                  >
                    {step.label}
                  </p>
                  <span
                    className={cn(
                      "text-xs",
                      isDone && "text-gray-500",
                      isCurrent && "text-blue-600 font-medium",
                      isFuture && "text-gray-300",
                    )}
                  >
                    {timestamps[step.key] || (isFuture ? "Pending" : "—")}
                  </span>
                </div>
                {isCurrent && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                    In progress
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

// Helper: derive a current step index from shipping_status (mock mapping).
export const stepIndexFromShipping = (status?: string): number => {
  switch (status) {
    case "DELIVERED":
      return 5;
    case "SHIPPED":
      return 3;
    case "PENDING":
      return 1;
    default:
      return 1;
  }
};

export default OrderFlowTimeline;
