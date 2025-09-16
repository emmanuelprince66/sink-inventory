"use client";

import { Notification } from "@/types/notification";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  isConnected: boolean;
  error: string | null;
  notifications: Notification[];
  connect: (token: string) => void;
  disconnect: () => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const handleNotification = useCallback((data: any) => {
    console.log("Notification received:", data);
    const notification: Notification = {
      id: data.id || `notif-${Date.now()}-${Math.random()}`,
      type: data.type || "info",
      title: data.title || "Notification",
      message: data.message || "",
      data: data.data,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev.slice(0, 49)]);
  }, []);

  const connect = useCallback((token: string) => {
    console.log("token-------------3", token);
    if (!token) {
      setError("No token provided");
      return;
    }

    const socket = io("wss://www.api.sync360.africa/ws/user/", {
      reconnectionDelayMax: 10000,
      auth: {
        token: `Bearer ${token}`,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });
  }, []);

  //   const connect = useCallback(
  //     (token: string) => {
  //       if (!token) {
  //         setError("No token provided");
  //         return;
  //       }

  //       // Clean up any existing connection
  //       disconnect();

  //       currentTokenRef.current = token;
  //       reconnectAttemptsRef.current = 0;

  //       // Remove 'Bearer ' prefix if it exists
  //       const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

  //       console.log(
  //         "Connecting with token:",
  //         cleanToken ? "Token present" : "No token"
  //       );

  //       // FIXED: Correct socket connection configuration
  //       socketRef.current = io("", {
  //         path: "/socket.io",
  //         transports: ["websocket", ""],
  //         upgrade: true,
  //         auth: {
  //           token: `Bearer ${cleanToken}`,
  //         },
  //         extraHeaders: {
  //           Authorization: `Bearer ${cleanToken}`,
  //         },
  //         reconnection: true,
  //         reconnectionAttempts: 10,
  //         reconnectionDelay: 1000,
  //         reconnectionDelayMax: 10000,
  //         timeout: 25000,
  //         forceNew: true,
  //         withCredentials: true,
  //         autoConnect: true,
  //       });
  //       const socket = socketRef.current;

  //       // Connection handlers
  //       socket.on("connect", () => {
  //         console.log("Socket connected successfully:", socket.id);
  //         setIsConnected(true);
  //         setError(null);
  //         reconnectAttemptsRef.current = 0;
  //       });

  //       socket.on("disconnect", (reason) => {
  //         console.log("Socket disconnected:", reason);
  //         setIsConnected(false);
  //       });

  //       socket.on("connect_error", (err) => {
  //         console.error("Socket connection error:", err.message);
  //         setError(`Connection error: ${err.message}`);
  //         setIsConnected(false);
  //         reconnectAttemptsRef.current++;
  //       });

  //       // Listen for notifications
  //       socket.on("notification", handleNotification);

  //       socket.on("error", (data) => {
  //         console.error("Socket error:", data);
  //         setError(data.message || "Socket error occurred");
  //       });

  //       socket.on("unauthorized", (error) => {
  //         console.error("Authentication failed:", error);
  //         setError("Authentication failed: Invalid token");
  //         disconnect();
  //       });
  //     },
  //     [handleNotification]
  //   );

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    currentTokenRef.current = null;
    reconnectAttemptsRef.current = 0;
    setIsConnected(false);
    setError(null);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: SocketContextType = {
    isConnected,
    error,
    notifications,
    connect,
    disconnect,
    clearNotifications,
    markAsRead,
    unreadCount,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
