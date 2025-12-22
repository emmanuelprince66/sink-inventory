// lib/api/subscription-interceptor.ts

import {
  SubscriptionNotificationType,
  useSubscriptionStore,
} from "@/lib/store/subscription-store";

// Map backend error codes/hints to notification types
const ERROR_CODE_MAP: Record<string | number, SubscriptionNotificationType> = {
  "1": "upgrade_required",
  "2": "subscription_expired",
  "3": "feature_limit_reached",
  UPGRADE_REQUIRED: "upgrade_required",
  SUBSCRIPTION_EXPIRED: "subscription_expired",
  FEATURE_LIMIT_REACHED: "feature_limit_reached",
  FREE_PLAN_LIMIT: "upgrade_required",
  PLAN_EXPIRED: "subscription_expired",
};

interface BackendError {
  code?: string | number;
  message?: string;
  hint?: string;
  subscription_status?: string;
  error?: string;
}

/**
 * Checks if an error from the backend indicates a subscription issue
 * and triggers the appropriate notification modal
 */
export const handleSubscriptionError = (error: any): boolean => {
  const showNotification = useSubscriptionStore.getState().showNotification;

  // Extract error data
  const errorData: BackendError = error?.response?.data || error?.data || error;

  // Check various possible fields where backend might send the hint
  const hint =
    errorData.hint || errorData.code || errorData.subscription_status;

  if (!hint) return false;

  // Convert hint to string for comparison
  const hintStr = String(hint);

  // Check if this is a subscription-related error
  const notificationType = ERROR_CODE_MAP[hintStr];

  if (notificationType) {
    showNotification(notificationType, errorData);
    return true; // Error was handled as a subscription issue
  }

  return false; // Not a subscription error
};

/**
 * Hook to wrap API mutations with subscription error handling
 */
export const useSubscriptionErrorHandler = () => {
  return {
    onError: (error: any) => {
      const wasSubscriptionError = handleSubscriptionError(error);

      if (!wasSubscriptionError) {
        // Handle other errors normally (show toast, etc.)
        console.error("API Error:", error);
      }

      return wasSubscriptionError;
    },
  };
};
