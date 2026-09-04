"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CampaignChannel, CHANNELS } from "./channel";

/**
 * Step one: which channel. The two composers differ enough — one is capped at
 * a single SMS segment, the other has a subject, preview text and a formatted
 * body — that asking up front is cheaper than a channel dropdown that silently
 * rewrites half the form underneath the merchant.
 */
const ChannelPicker = ({
  onSelect,
}: {
  onSelect: (channel: CampaignChannel) => void;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="flex items-center gap-1 text-sm text-grey-3">
        <Link
          href="/campaign"
          className="inline-flex items-center gap-1 font-bold hover:text-primary-green-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Campaigns
        </Link>
        <span className="text-grey-4">/</span>
        <span className="font-bold text-grey-1">New Campaign</span>
      </div>

      {/* Narrow column: two cards side by side read as a choice, whereas the
          full dashboard width would stretch them into banners. */}
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
          Create New Campaign
        </p>
        <p className="text-sm text-grey-3 mt-1">
          Choose how you want to reach your customers. Each channel has its own
          composer and live preview.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CHANNELS.map((option) => {
            const Icon = option.icon;
            const isEmail = option.key === "EMAIL";

            return (
              <div
                key={option.key}
                className="flex flex-col rounded-2xl border border-grey-5 bg-white p-5 transition-colors hover:border-primary-green-300/40"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    isEmail
                      ? "bg-info-2/60 text-info-1"
                      : "bg-secondary-6 text-primary-green-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </span>

                <p className="mt-4 text-lg font-extrabold text-grey-1">
                  {option.label}
                </p>
                <p className="mt-1.5 text-sm text-grey-3">
                  {option.description}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-grey-2">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isEmail ? "text-info-1" : "text-primary-green-300",
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* mt-auto on the wrapper, not the button: both buttons line
                    up even when one card's copy wraps to an extra line. */}
                <div className="mt-auto pt-6">
                  <Button
                    onClick={() => onSelect(option.key)}
                    className={cn(
                      "h-11 w-full gap-2 rounded-xl",
                      isEmail &&
                        "bg-info-1 border-info-1 hover:bg-info-1/90 text-white",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {option.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChannelPicker;
