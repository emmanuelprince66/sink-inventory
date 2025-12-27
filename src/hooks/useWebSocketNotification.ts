// hooks/useSSENotificationsAlt.ts
// This version passes the token as a URL parameter since EventSource has limited header support
import { useRef, useState } from "react";

interface Notification {
  id?: string;
  message?: string;
  type?: string;
  timestamp?: string;
  title?: string;
  status?: string;
  code?: number;
  reason?: string;
}

interface SSEHookReturn {
  notifications: Notification[];
  isConnected: boolean;
  error: string | null;
  clearNotifications: () => void;
  connectionAttempts: number;
}

export const useSSENotifications = (token: string): SSEHookReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  // const connect = () => {
  //   if (!token) {
  //     setError("Bearer token is required");
  //     return;
  //   }

  //   try {
  //     // Close existing connection
  //     if (eventSourceRef.current) {
  //       eventSourceRef.current.close();
  //     }

  //     // Pass token as URL parameter since EventSource has limited header support
  //     const url = `/api/noti?token=${encodeURIComponent(token)}`;
  //     eventSourceRef.current = new EventSource(url);

  //     // Handle connection opened
  //     eventSourceRef.current.onopen = (event) => {
  //       console.log("SSE connected:", event);
  //       setIsConnected(true);
  //       setError(null);
  //       setConnectionAttempts(0);
  //     };

  //     // Handle incoming messages
  //     eventSourceRef.current.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data);
  //         console.log("Received SSE message:", data);

  //         // Handle connection status messages
  //         if (data.type === "connection") {
  //           if (data.status === "connected") {
  //             setIsConnected(true);
  //           } else if (data.status === "disconnected") {
  //             setIsConnected(false);
  //           }
  //           return;
  //         }

  //         // NEW: Ignore heartbeats - they don't belong in notifications
  //         if (data.type === "heartbeat") {
  //           console.log("Heartbeat received - ignoring"); // Optional log for debugging
  //           return;
  //         }

  //         // Handle error messages
  //         if (data.type === "error") {
  //           setError(data.message || "Unknown error occurred");
  //           return;
  //         }

  //         // Handle authentication errors
  //         if (data.type === "auth_error" || data.type === "unauthorized") {
  //           setError("Authentication failed - invalid token");
  //           return;
  //         }

  //         // Handle regular notifications
  //         const notification: Notification = {
  //           ...data,
  //           timestamp: data.timestamp || new Date().toISOString(),
  //         };

  //         setNotifications((prev) => [notification, ...prev].slice(0, 100)); // Keep last 100
  //       } catch (err) {
  //         console.error("Error parsing SSE message:", err);
  //         console.log("Raw SSE data:", event.data);

  //         // If it's not JSON, treat as plain text notification
  //         const notification: Notification = {
  //           type: "message",
  //           message: event.data,
  //           timestamp: new Date().toISOString(),
  //         };
  //         setNotifications((prev) => [notification, ...prev].slice(0, 100));
  //       }
  //     };

  //     // Handle errors
  //     eventSourceRef.current.onerror = (event) => {
  //       console.error("SSE error:", event);
  //       setIsConnected(false);

  //       // Get the EventSource to check its state
  //       const eventSource = event.target as EventSource;

  //       if (eventSource.readyState === EventSource.CLOSED) {
  //         console.log("SSE connection was closed");
  //       }

  //       // Check if we should attempt reconnection
  //       if (connectionAttempts < maxReconnectAttempts && token) {
  //         const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
  //         console.log(
  //           `Attempting SSE reconnection in ${
  //             delay / 1000
  //           } seconds... (Attempt ${
  //             connectionAttempts + 1
  //           }/${maxReconnectAttempts})`
  //         );

  //         reconnectTimeoutRef.current = setTimeout(() => {
  //           setConnectionAttempts((prev) => prev + 1);
  //           connect();
  //         }, delay);
  //       } else {
  //         setError(
  //           connectionAttempts >= maxReconnectAttempts
  //             ? "Max reconnection attempts reached"
  //             : "Connection failed"
  //         );
  //       }
  //     };
  //   } catch (err) {
  //     console.error("Failed to create SSE connection:", err);
  //     setError("Failed to create SSE connection");
  //   }
  // };

  // useEffect(() => {
  //   if (token) {
  //     connect();
  //   } else {
  //     setError("No token provided");
  //     setIsConnected(false);
  //   }

  //   return () => {
  //     if (reconnectTimeoutRef.current) {
  //       clearTimeout(reconnectTimeoutRef.current);
  //     }
  //     if (eventSourceRef.current) {
  //       eventSourceRef.current.close();
  //     }
  //   };
  // }, [token]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    isConnected,
    error,
    clearNotifications,
    connectionAttempts,
  };
};
