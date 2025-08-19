// src/hooks/useNotificationModal.tsx
import { NotificationPayload } from "@/lib/notification";
import { useState } from "react";

export const useNotificationModal = () => {
  const [notification, setNotification] = useState<NotificationPayload | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = (payload: NotificationPayload) => {
    setNotification(payload);
    setIsVisible(true);
  };

  const hideNotification = () => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 200);
  };

  return {
    notification,
    isVisible,
    showNotification,
    hideNotification,
  };
};
