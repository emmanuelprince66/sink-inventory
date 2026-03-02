// components/chat/TawkToChat.tsx
"use client";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
    Tawk_API_Ready?: boolean;
  }
}

export default function TawkToChat() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize Tawk_API before script loads
    window.Tawk_API = window.Tawk_API || {};

    // This runs as soon as Tawk is ready — hide the default bubble immediately
    window.Tawk_API.onLoad = function () {
      window.Tawk_API.hideWidget();
      setIsLoaded(true);
    };

    if (document.getElementById("tawk-script")) return;

    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = "https://embed.tawk.to/682b0e7cd2236a190fe0a0c1/1irk317a3";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);
    window.Tawk_LoadStart = new Date();

    return () => {
      // hide on unmount
      if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);

  const toggleChat = () => {
    if (!window.Tawk_API) return;

    if (isOpen) {
      window.Tawk_API.minimize();
      window.Tawk_API.hideWidget();
      setIsOpen(false);
    } else {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!window.Tawk_API) return;
    window.Tawk_API.onChatMinimized = function () {
      window.Tawk_API.hideWidget();
      setIsOpen(false);
    };
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <div className="fixed bottom-2 right-2 z-50 group">
      <button
        onClick={toggleChat}
        className="relative flex items-center justify-center w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        aria-label="Open live chat"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />

        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}

        {/* Unread dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full" />
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow">
          {isOpen ? "Close chat" : "Chat with us"}
          <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  );
}
