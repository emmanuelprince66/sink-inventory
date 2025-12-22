// components/chat/TawkToChat.tsx
"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkToChat() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if Tawk.to script is already loaded
    if (window.Tawk_API) {
      setIsLoaded(true);
      return;
    }

    // Load Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/682b0e7cd2236a190fe0a0c1/1irk317a3";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    script.onload = () => {
      setIsLoaded(true);
      // Hide the default Tawk.to widget
      if (window.Tawk_API) {
        window.Tawk_API.onLoad = function () {
          window.Tawk_API.hideWidget();
        };
      }
    };

    document.body.appendChild(script);

    window.Tawk_LoadStart = new Date();

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const toggleChat = () => {
    if (window.Tawk_API) {
      if (isOpen) {
        window.Tawk_API.hideWidget();
      } else {
        window.Tawk_API.showWidget();
        window.Tawk_API.maximize();
      }
      setIsOpen(!isOpen);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Open live chat"
      >
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></span>

        {/* Icon */}
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-300" />
          ) : (
            <MessageCircle className="w-6 h-6 transition-transform duration-300" />
          )}
        </div>

        {/* Unread indicator (optional) */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          {isOpen ? "Close chat" : "Chat with us"}
          <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
