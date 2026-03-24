"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  "1": {
    title: "Subscription Required",
    description:
      "You need an active subscription to access this feature. Please subscribe to continue.",
  },
  "2": {
    title: "Plan Limit Reached",
    description:
      "You've reached the limit for this feature on your current plan. Upgrade to continue.",
  },
  "3": {
    title: "Upgrade Required",
    description:
      "This feature is not available on your current plan. Please upgrade to access it.",
  },
};

const FALLBACK = {
  title: "Something Went Wrong",
  description: "Unable to load this feature. Please try again.",
};

interface FeatureUnavailableProps {
  /** Error code from backend: "1" | "2" | "3" */
  errorCode?: string | number | null;
  /** Override the default title */
  title?: string;
  /** Override the default description */
  description?: string;
  /** Where the settings button should navigate to */
  settingsPath?: string;
  /** Label for the settings button */
  settingsLabel?: string;
  /** Called when retry is clicked — if omitted, retry button is hidden */
  onRetry?: () => void;
}

const FeatureUnavailable = ({
  errorCode,
  title,
  description,
  settingsPath = "/settings",
  settingsLabel,
  onRetry,
}: FeatureUnavailableProps) => {
  const router = useRouter();

  const isSubscriptionError = ["1", "2", "3"].includes(String(errorCode ?? ""));
  const content = ERROR_MESSAGES[String(errorCode ?? "")] ?? FALLBACK;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-5 border border-dashed border-red-200 rounded-lg bg-red-50 text-center w-full">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-red-700">
          {title ?? content.title}
        </p>
        <p className="text-xs text-red-500 max-w-xs">
          {description ?? content.description}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {onRetry && !isSubscriptionError && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-100 text-xs gap-1"
            onClick={onRetry}
          >
            <RefreshCcw className="w-3 h-3" />
            Retry
          </Button>
        )}

        <Button
          size="sm"
          className="bg-primary-green-300 hover:bg-primary-green-400 text-white text-xs gap-1"
          onClick={() => router.push(settingsPath)}
        >
          <Settings className="w-3 h-3" />
          {settingsLabel ??
            (isSubscriptionError ? "Go to Settings" : "Settings")}
        </Button>
      </div>
    </div>
  );
};

export default FeatureUnavailable;
