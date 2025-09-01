// src/components/NotificationProvider.tsx
"use client";
import { CustomNotificationModal } from "@/components/CustomNotificationModal";
import { queryKey } from "@/constants/query-key";
import { useNotificationModal } from "@/hooks/useNotificationHook";
import { notificationService } from "@/lib/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function NotificationModalProvider() {
  const { notification, isVisible, showNotification, hideNotification } =
    useNotificationModal();
  const queryClient = useQueryClient();

  // Function to handle query invalidation and show notification
  const handleNotificationWithInvalidation = (payload: any) => {
    console.log("🔄 Invalidating queries before showing notification");

    // Invalidate your transaction queries

    console.log("Invalidating queries for new notification:", payload);
    queryClient.invalidateQueries({
      queryKey: [queryKey.transactions.getAllTransactions],
      exact: false, // This will match all queries that start with this key
    });
    console.log(
      "Invalidating queries for new notification:===============",
      payload
    );

    // You can add more invalidations here if needed
    // queryClient.invalidateQueries({ queryKey: [queryKey.sales.getAllSales] });
    // queryClient.invalidateQueries({ queryKey: [queryKey.inventory.getAllInventory] });

    // Show the notification modal after invalidating queries
    showNotification(payload);
  };

  useEffect(() => {
    // Initialize notification service
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

            // Setup foreground message listener
            notificationService.setupForegroundListener();
            console.log("✅ Notification service initialized");
          }
        }
      } catch (error) {
        console.error("❌ Failed to initialize notifications:", error);
      }
    };

    initNotifications();
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
