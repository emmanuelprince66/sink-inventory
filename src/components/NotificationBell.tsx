"use client";

import { useNotification } from "@/components/providers/notification-provider";
import { Bell } from "lucide-react";
import { useState } from "react";
import { NotificationCenter } from "./notification-center";

export const NotificationBell = () => {
  const { unreadCount } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationCenter />
        </div>
      )}
    </div>
  );
};
