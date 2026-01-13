// lib/store/useSubscriptionStore.ts
import { create } from "zustand";

export type SubscriptionNotificationType =
  | "upgrade_required"
  | "subscription_expired"
  | "feature_limit_reached"
  | null;

interface SubscriptionNotification {
  type: SubscriptionNotificationType;
  title: string;
  message: string;
  ctaText: string;
  ctaAction: () => void;
  additionalInfo?: string;
}

interface SubscriptionStore {
  notification: SubscriptionNotification | null;
  isModalOpen: boolean;

  // Actions
  showNotification: (
    type: SubscriptionNotificationType,
    additionalData?: any
  ) => void;
  closeNotification: () => void;
  handleUpgrade: () => void;
  handleSubscribe: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  notification: null,
  isModalOpen: false,

  showNotification: (type, additionalData) => {
    if (!type) return;

    const notifications = {
      subscription_expired: {
        // Error code "1" - User is not subscribed at all
        type: "subscription_expired" as const,
        title: "Subscription Required",
        message:
          "You need an active subscription to perform this action. Subscribe now to unlock all features and grow your business.",
        ctaText: "Subscribe Now",
        ctaAction: () => get().handleSubscribe(),
        additionalInfo: "No active subscription found.",
      },
      feature_limit_reached: {
        // Error code "2" - Current plan limit reached for specific feature
        type: "feature_limit_reached" as const,
        title: "Plan Limit Reached",
        message:
          "You've reached the maximum limit for this feature on your current plan. Upgrade to a higher plan to continue adding more.",
        ctaText: "Upgrade Plan",
        ctaAction: () => get().handleUpgrade(),
        additionalInfo:
          additionalData?.message || "Current plan limit reached.",
      },
      upgrade_required: {
        // Error code "3" - Generic upgrade required
        type: "upgrade_required" as const,
        title: "Upgrade Required",
        message:
          "This feature is not available on your current plan. Upgrade now to unlock this functionality and do more.",
        ctaText: "Upgrade Plan",
        ctaAction: () => get().handleUpgrade(),
        additionalInfo: additionalData?.message,
      },
    };

    set({
      notification: notifications[type] as SubscriptionNotification,
      isModalOpen: true,
    });
  },

  closeNotification: () => {
    set({
      notification: null,
      isModalOpen: false,
    });
  },

  handleUpgrade: () => {
    // Navigate to upgrade page for existing subscribers
    console.log("Navigating to upgrade page...");
    // Example: router.push('/subscription/upgrade');
    get().closeNotification();
  },

  handleSubscribe: () => {
    // Navigate to subscription page for non-subscribers
    console.log("Navigating to subscription page...");
    // Example: router.push('/subscription/plans');
    get().closeNotification();
  },
}));
