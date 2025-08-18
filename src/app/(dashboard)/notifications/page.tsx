// src/app/app/notifications/page.tsx
"use client";

import { NotificationCenter } from "@/components/notification-center";
import { NotificationSettings } from "@/components/notification-settings";
import { NotificationTester } from "@/components/notification-tester";
import { TestNotification } from "@/components/test-notification";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Push Notifications
        </h1>
        <p className="text-gray-600 mb-6">
          Manage and test push notifications for your application
        </p>

        <div className="space-y-6">
          <NotificationCenter />
        </div>
        <div className="space-y-6">
          <NotificationTester />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Notification Settings */}

          <div>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <NotificationSettings />
          </div>

          {/* Test Notifications */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Testing</h2>
            <TestNotification />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How to Test:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Enable notifications in the Settings card</li>
            <li>Grant permission when browser prompts</li>
            <li>Wait for FCM token to be generated</li>
            <li>Use the Testing card to send notifications</li>
            <li>For background testing: minimize browser and send again</li>
          </ol>
        </div>

        {/* Status Display */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700">Browser Support</h4>
            <p className="text-sm text-gray-600">
              {typeof window !== "undefined" && "Notification" in window
                ? "✅ Supported"
                : "❌ Not Supported"}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700">Service Worker</h4>
            <p className="text-sm text-gray-600">
              {typeof window !== "undefined" && "serviceWorker" in navigator
                ? "✅ Available"
                : "❌ Not Available"}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700">HTTPS</h4>
            <p className="text-sm text-gray-600">
              {typeof window !== "undefined" &&
              (window.location.protocol === "https:" ||
                window.location.hostname === "localhost")
                ? "✅ Secure Context"
                : "❌ Requires HTTPS"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
