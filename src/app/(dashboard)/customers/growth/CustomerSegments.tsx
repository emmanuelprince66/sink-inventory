"use client";

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Crown,
  Heart,
  Plus,
  RotateCcw,
  Star,
  Users,
} from "lucide-react";
import { CUSTOMER_SEGMENTS, CustomerSegment } from "./dummyGrowthData";

const SEGMENT_ICONS: Record<string, React.ReactNode> = {
  vip: <Crown className="w-4 h-4" />,
  frequent: <Star className="w-4 h-4" />,
  new: <Users className="w-4 h-4" />,
  at_risk: <AlertCircle className="w-4 h-4" />,
  inactive: <RotateCcw className="w-4 h-4" />,
  regular: <Heart className="w-4 h-4" />,
};

const TONE_STYLES: Record<
  CustomerSegment["tone"],
  { iconBg: string; badgeBg: string; buttonBg: string }
> = {
  purple: {
    iconBg: "bg-violet-100 text-violet-600",
    badgeBg: "bg-violet-100 text-violet-700",
    buttonBg: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },
  amber: {
    iconBg: "bg-warning-2 text-warning-1",
    badgeBg: "bg-warning-2 text-warning-1",
    buttonBg: "bg-warning-2 text-warning-1 hover:bg-warning-2/70",
  },
  blue: {
    iconBg: "bg-info-2 text-info-1",
    badgeBg: "bg-info-2 text-info-1",
    buttonBg: "bg-info-2 text-info-1 hover:bg-info-2/70",
  },
  red: {
    iconBg: "bg-error-2 text-error-1",
    badgeBg: "bg-error-2 text-error-1",
    buttonBg: "bg-error-2 text-error-1 hover:bg-error-2/70",
  },
  grey: {
    iconBg: "bg-grey-6 text-grey-3",
    badgeBg: "bg-grey-6 text-grey-3",
    buttonBg: "bg-grey-6 text-grey-3 hover:bg-grey-5",
  },
  green: {
    iconBg: "bg-success-2 text-success-1",
    badgeBg: "bg-success-2 text-success-1",
    buttonBg: "bg-success-2 text-success-1 hover:bg-success-2/70",
  },
};

const CustomerSegments = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-grey-3">
          AI-generated customer segments. Click a segment to view its
          customers.
        </p>
        <button className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer">
          <Plus className="w-4 h-4" />
          Create Segment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CUSTOMER_SEGMENTS.map((segment) => {
          const tone = TONE_STYLES[segment.tone];
          return (
            <div
              key={segment.key}
              className="bg-white rounded-2xl border border-grey-5 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    tone.iconBg,
                  )}
                >
                  {SEGMENT_ICONS[segment.key]}
                </div>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    tone.badgeBg,
                  )}
                >
                  {segment.customerCount} customers
                </span>
              </div>

              <h3 className="text-base font-extrabold text-grey-1 mb-3">
                {segment.name}
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-grey-6 rounded-lg py-2 text-center">
                  <p className="text-sm font-extrabold text-grey-1">
                    {segment.revenue}
                  </p>
                  <p className="text-[10px] text-grey-3">Revenue</p>
                </div>
                <div className="bg-grey-6 rounded-lg py-2 text-center">
                  <p className="text-sm font-extrabold text-grey-1">
                    {segment.repeatRate}
                  </p>
                  <p className="text-[10px] text-grey-3">Repeat Rate</p>
                </div>
                <div className="bg-grey-6 rounded-lg py-2 text-center">
                  <p className="text-sm font-extrabold text-grey-1">
                    {segment.avgSpend}
                  </p>
                  <p className="text-[10px] text-grey-3">Avg Spend</p>
                </div>
              </div>

              <button
                className={cn(
                  "w-full flex items-center justify-center gap-1 py-2 rounded-full text-sm font-bold cursor-pointer transition-colors",
                  tone.buttonBg,
                )}
              >
                View Customers
                <span aria-hidden>→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerSegments;
