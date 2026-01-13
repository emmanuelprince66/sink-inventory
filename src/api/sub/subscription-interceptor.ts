// lib/api/subscription-interceptor.ts

import {
  SubscriptionNotificationType,
  useSubscriptionStore,
} from "@/lib/store/subscription-store";

// Map backend error codes to notification types
const ERROR_CODE_MAP: Record<string | number, SubscriptionNotificationType> = {
  "1": "subscription_expired", // User is not subscribed at all
  "2": "feature_limit_reached", // Current plan limit reached for this feature
  "3": "upgrade_required", // Generic upgrade required
  UPGRADE_REQUIRED: "upgrade_required",
  SUBSCRIPTION_EXPIRED: "subscription_expired",
  FEATURE_LIMIT_REACHED: "feature_limit_reached",
  FREE_PLAN_LIMIT: "feature_limit_reached",
  PLAN_EXPIRED: "subscription_expired",
};

interface BackendError {
  code?: string | number;
  message?: string | number;
  hint?: string;
  subscription_status?: string;
  error?: string | number;
}

/**
 * Checks if an error from the backend indicates a subscription issue
 * and triggers the appropriate notification modal
 *
 * Error codes:
 * "1" - User is not subscribed (no active subscription)
 * "2" - Feature limit reached for current plan (e.g., max customers, products, etc.)
 * "3" - Generic upgrade required
 */
export const handleSubscriptionError = (error: any): boolean => {
  const showNotification = useSubscriptionStore.getState().showNotification;

  // Extract error data - handle multiple formats
  const errorData: BackendError =
    error?.response?.data || error?.data || error || {};

  // Check various possible fields where backend might send the code
  // Priority order: message -> error -> code -> hint -> subscription_status
  const errorCode =
    errorData.message ||
    errorData.error ||
    errorData.code ||
    errorData.hint ||
    errorData.subscription_status;

  if (!errorCode) return false;

  // Convert to string for comparison
  const errorCodeStr = String(errorCode);

  // Check if this is a subscription-related error
  const notificationType = ERROR_CODE_MAP[errorCodeStr];

  if (notificationType) {
    // Add context about what feature was being accessed
    const enhancedErrorData = {
      ...errorData,
      errorCode: errorCodeStr,
    };

    showNotification(notificationType, enhancedErrorData);
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
