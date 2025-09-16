// Example 1: Using notifications in any component
// components/NotificationDisplay.tsx
"use client";

import { useNotificationContext } from "@/components/providers/NotificationProvider";
import React from "react";

export const NotificationSocketDisplay: React.FC = () => {
  const {
    notifications,
    isConnected,
    error,
    clearNotifications,
    connectionAttempts,
  } = useNotificationContext();

  console.log("notifications", notifications);
  console.log("isConnected", isConnected);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Connection Error:</strong> {error}
        {connectionAttempts > 0 && (
          <div className="text-sm">
            Reconnection attempts: {connectionAttempts}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Notifications {isConnected ? "🟢" : "🔴"}
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-3 py-1 cursor-pointer bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 italic">No notifications</p>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={notification.id || index}
              className="bg-green-50 border-l-4 border-green-400 p-4 rounded"
            >
              {notification.title && (
                <h4 className="font-semibold text-black-900">
                  {notification.title}
                </h4>
              )}
              <p className="text-green-800">{notification.message}</p>
              <div className="text-xs text-green-600 mt-1">
                {notification.timestamp &&
                  new Date(notification.timestamp).toLocaleString()}
                {notification.type && ` • Type: ${notification.type}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
