// components/modals/SubscriptionNotificationModal.tsx
"use client";

import { useSubscriptionStore } from "@/lib/store/subscription-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CustomModal } from "./CustomModal";

export const SubscriptionNotificationModal = () => {
  const { notification, isModalOpen, closeNotification, setNavigate } =
    useSubscriptionStore();
  const router = useRouter();

  // Register Next.js router with the store so notifications can navigate
  // without a full page reload.
  useEffect(() => {
    setNavigate((path: string) => router.push(path));
  }, [router, setNavigate]);

  if (!notification) return null;

  return (
    <CustomModal
      isOpen={isModalOpen}
      onClose={closeNotification}
      title={notification.title}
      description={notification.message}
    >
      <div className="space-y-4">
        {notification.additionalInfo && (
          <p className="text-sm text-gray-500 italic -mt-2">
            {notification.additionalInfo}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={notification.ctaAction}
            className="w-full cursor-pointer  rounded-lg bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 transition-colors"
          >
            {notification.ctaText}
          </button>

          <button
            onClick={closeNotification}
            className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </CustomModal>
  );
};
