// src/components/CustomNotificationModal.tsx
"use client";
import { Bell, X } from "lucide-react";
import React from "react";
import { CustomModal } from "./app/CustomModal";

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

interface CustomNotificationModalProps {
  notification: NotificationPayload | null;
  isVisible: boolean;
  onClose: () => void;
  onAction?: (action: string, data?: any) => void;
}

export const CustomNotificationModal: React.FC<
  CustomNotificationModalProps
> = ({ notification, isVisible, onClose, onAction }) => {
  if (!notification) return null;

  return (
    <CustomModal
      isOpen={isVisible}
      onClose={onClose}
      title={notification.title}
    >
      <div className="space-y-4">
        {/* Notification Header */}
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
          <div className="flex-shrink-0">
            {notification.icon ? (
              <img
                src={notification.icon}
                alt="Notification icon"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-green-800 font-medium text-sm">
              New Notification
            </p>
          </div>
        </div>

        {/* Notification Body */}
        <div className="px-1">
          <p className="text-gray-700 text-sm leading-relaxed">
            {notification.body}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end w-full pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    </CustomModal>
  );
};
