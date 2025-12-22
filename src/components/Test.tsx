// components/test/SubscriptionTest.tsx
"use client";

import { handleSubscriptionError } from "@/api/sub/subscription-interceptor";
import { useSubscriptionStore } from "@/lib/store/subscription-store";

export function SubscriptionTest() {
  const showNotification = useSubscriptionStore(
    (state) => state.showNotification
  );

  // Simulate different backend responses
  const simulateBackendError = (errorCode: string) => {
    const mockError = {
      response: {
        data: {
          hint: errorCode,
          message: "Test error message from backend",
        },
      },
    };

    handleSubscriptionError(mockError);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">
        Test Subscription Notifications
      </h2>

      <div className="space-y-3">
        <button
          onClick={() => simulateBackendError("1")}
          className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700"
        >
          Test Code "1" - Upgrade Required
        </button>

        <button
          onClick={() => simulateBackendError("2")}
          className="block w-full rounded-lg bg-orange-600 px-4 py-3 text-white font-medium hover:bg-orange-700"
        >
          Test Code "2" - Subscription Expired
        </button>

        <button
          onClick={() => simulateBackendError("3")}
          className="block w-full rounded-lg bg-purple-600 px-4 py-3 text-white font-medium hover:bg-purple-700"
        >
          Test Code "3" - Feature Limit Reached
        </button>

        <button
          onClick={() => simulateBackendError("UPGRADE_REQUIRED")}
          className="block w-full rounded-lg bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700"
        >
          Test String Code "UPGRADE_REQUIRED"
        </button>

        <button
          onClick={() => showNotification("subscription_expired")}
          className="block w-full rounded-lg bg-red-600 px-4 py-3 text-white font-medium hover:bg-red-700"
        >
          Direct Call - Subscription Expired
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Backend Response Format:</h3>
        <pre className="text-sm overflow-auto">
          {`{
  "hint": "1" | "2" | "3" | "UPGRADE_REQUIRED" | ...,
  "message": "Error message",
  // OR
  "code": "1" | "2" | "3",
  // OR
  "subscription_status": "expired" | "limit_reached"
}`}
        </pre>
      </div>
    </div>
  );
}
