// Example 1: Notification List Component
// components/notifications/notification-list.tsx
"use client";

import { useNotification } from "@/components/providers/notification-provider";
import { formatDistanceToNow } from "date-fns";

export const NotificationCenter = () => {
  const {
    receivedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
  } = useNotification();

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          <div className="space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={clearNotifications}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {receivedNotifications.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No notifications yet</p>
        ) : (
          receivedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                !notification.read
                  ? "bg-blue-50 border-l-4 border-l-blue-500"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.body}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        notification.type === "foreground"
                          ? "bg-green-100 text-green-800"
                          : notification.type === "background"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {notification.type}
                    </span>
                    <span className="ml-2">
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
