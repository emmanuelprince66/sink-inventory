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

  if (error) {
    return (
      <div className="bg-error-2 border border-error-1/30 text-error-1 px-4 py-3 rounded-xl text-sm">
        <strong>Connection Error:</strong> {error}
        {connectionAttempts > 0 && (
          <div className="text-xs mt-1">
            Reconnection attempts: {connectionAttempts}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-extrabold text-grey-1 flex items-center gap-2">
          Notifications
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? "bg-success-1" : "bg-error-1"
            }`}
          />
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-3 py-1.5 cursor-pointer bg-white border border-grey-5 text-grey-2 rounded-full text-xs font-bold hover:bg-grey-6 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-grey-4 text-sm text-center py-6">
            No notifications
          </p>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={notification.id || index}
              className="bg-secondary-6 border-l-4 border-primary-green-300 p-4 rounded-lg"
            >
              {notification.title && (
                <h4 className="font-bold text-grey-1 text-sm">
                  {notification.title}
                </h4>
              )}
              <p className="text-grey-2 text-sm">{notification.message}</p>
              <div className="text-xs text-grey-4 mt-1">
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
