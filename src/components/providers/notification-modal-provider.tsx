// src/components/NotificationProvider.tsx
"use client";
import { CustomNotificationModal } from "@/components/CustomNotificationModal";
import { queryKey } from "@/constants/query-key";
import { useNotificationModal } from "@/hooks/useNotificationHook";
import { notificationService } from "@/lib/notification";
import { markSeen } from "@/lib/realtime/seen";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function NotificationModalProvider() {
  const { notification, isVisible, showNotification, hideNotification } =
    useNotificationModal();
  const queryClient = useQueryClient();

  // Function to handle query invalidation and show notification
  const handleNotificationWithInvalidation = (payload: any) => {
    /**
     * A foreground push for an event the socket already announced.
     *
     * RealtimeProvider is mounted alongside this one, so an open till receives
     * both, and the backend sends the same notification_id on each. Whichever
     * arrives first raises the modal; this drops the second rather than
     * stacking a duplicate on top of it.
     *
     * Queries are still invalidated on the way out: a push that lost the race
     * is a repeat alert, not a repeat of the change behind it, and the socket
     * path may have skipped a key this one covers.
     */
    const alreadyAlerted = !markSeen(payload?.data?.notification_id);

    console.log("Invalidating queries for new notification:", payload);
    queryClient.invalidateQueries({
      queryKey: [queryKey.transactions.getAllTransactions],
      exact: false, // This will match all queries that start with this key
    });

    if (alreadyAlerted) return;

    // Show the notification modal after invalidating queries
    showNotification(payload);
  };

  useEffect(() => {
    // Returned by setupForegroundListener so the subscription is torn down on
    // unmount rather than leaking one per remount.
    let unsubscribe: (() => void) | undefined;

    const initNotifications = async () => {
      try {
        await notificationService.init();
        const hasPermission = await notificationService.requestPermission();

        if (hasPermission) {
          const token = await notificationService.getToken();
          if (token) {
            // Register our function that invalidates queries first, then shows modal
            notificationService.setModalCallback(
              handleNotificationWithInvalidation
            );

            // The only foreground FCM listener in the app.
            unsubscribe = notificationService.setupForegroundListener();
          }
        }
      } catch (error) {
        console.error("❌ Failed to initialize notifications:", error);
      }
    };

    initNotifications();

    return () => unsubscribe?.();
  }, [queryClient]);

  const handleNotificationAction = (action: string, data?: any) => {
    console.log(`Notification action: ${action}`, data);

    // Handle different actions based on your app's needs
    switch (action) {
      case "view":
        // Navigate to specific page or open relevant content
        if (data?.userId) {
          // router.push(`/messages/${data.userId}`);
          console.log("Navigate to user messages:", data.userId);
        }
        break;
      default:
        break;
    }
  };

  return (
    <CustomNotificationModal
      notification={notification}
      isVisible={isVisible}
      onClose={hideNotification}
      onAction={handleNotificationAction}
    />
  );
}
