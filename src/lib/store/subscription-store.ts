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
  handleRenew: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  notification: null,
  isModalOpen: false,

  showNotification: (type, additionalData) => {
    if (!type) return;

    const notifications: Record<
      Exclude<SubscriptionNotificationType, null>,
      SubscriptionNotification
    > = {
      upgrade_required: {
        type: "upgrade_required",
        title: "Upgrade to Continue",
        message:
          "You're currently on the free plan. Upgrade now to unlock more features and grow your business.",
        ctaText: "Upgrade Plan",
        ctaAction: () => get().handleUpgrade(),
      },
      subscription_expired: {
        type: "subscription_expired",
        title: "Subscription Expired",
        message:
          "Your subscription has expired. Renew now to continue using all features without interruption.",
        ctaText: "Renew Subscription",
        ctaAction: () => get().handleRenew(),
      },
      feature_limit_reached: {
        type: "feature_limit_reached",
        title: "Upgrade Required",
        message:
          "You've reached the limit of your current plan. Upgrade to access this feature and do more.",
        ctaText: "Upgrade Plan",
        ctaAction: () => get().handleUpgrade(),
        additionalInfo: "Current plan limit reached.",
      },
    };

    set({
      notification: notifications[type],
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
    // Navigate to upgrade page or open upgrade flow
    console.log("Navigating to upgrade page...");
    // Example: router.push('/subscription/upgrade');
    get().closeNotification();
  },

  handleRenew: () => {
    // Navigate to renewal page or open renewal flow
    console.log("Navigating to renewal page...");
    // Example: router.push('/subscription/renew');
    get().closeNotification();
  },
}));
