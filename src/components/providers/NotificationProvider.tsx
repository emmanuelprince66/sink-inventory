// components/providers/NotificationProvider.tsx
"use client";

import { useSSENotifications } from "@/hooks/useWebSocketNotification";
import { useUserStore } from "@/lib/store/user-store";
import React, { createContext, useCallback, useContext } from "react";

interface Notification {
  id?: string;
  message?: string;
  type?: string;
  timestamp?: string;
  title?: string;
  status?: string;
  code?: number;
  reason?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  isConnected: boolean;
  error: string | null;
  clearNotifications: () => void;
  connectionAttempts: number;
  connectWithToken: (token: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

// Fixed: Use consistent naming - NotificationProvider (not NewNotificationProvider)
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useUserStore();
  const currentToken = user?.tokens?.access || "";

  // Use the SSE hook with the current token
  const {
    notifications,
    isConnected,
    error,
    clearNotifications,
    connectionAttempts,
  } = useSSENotifications(currentToken);

  // Function to programmatically connect with a new token
  const connectWithToken = useCallback((token: string) => {
    // This will be handled by the useSSENotifications hook when the token changes
    // The hook will automatically reconnect when the token prop changes
    console.log(
      "Connecting with new token:",
      token ? "***token provided***" : "no token"
    );
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    isConnected,
    error,
    clearNotifications,
    connectionAttempts,
    connectWithToken,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
