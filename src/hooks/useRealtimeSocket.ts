"use client";

import { buildSocketUrl } from "@/lib/realtime/socketUrl";
import type { RealtimeMessage } from "@/lib/realtime/types";
import { useUserStore } from "@/lib/store/user-store";
import { useCallback, useEffect, useRef, useState } from "react";

/** Backend asks for a ping every 30s to survive proxy idle timeouts. */
const HEARTBEAT_MS = 30_000;
const BASE_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

/**
 * Close codes we must not retry on. 1008 is the policy violation Channels
 * sends when the token is rejected; 4001/4003 are the conventional custom
 * auth-failure codes. Reconnecting on these just spins against a server that
 * has already said no.
 */
const FATAL_CLOSE_CODES = new Set([1008, 4001, 4003]);

export interface RealtimeSocketState {
  isConnected: boolean;
  /** Null until a connection has been attempted. */
  lastError: string | null;
}

/**
 * Owns the WebSocket lifecycle and nothing else — parsing, badges and toasts
 * belong to the caller. Returns connection state; messages arrive through the
 * onMessage callback.
 */
export const useRealtimeSocket = (
  onMessage: (message: RealtimeMessage) => void,
) => {
  const token = useUserStore((state) => state.user?.tokens?.access);

  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  /** Set on unmount/logout so an in-flight close handler stops reconnecting. */
  const disposedRef = useRef(false);
  // onMessage is usually an inline arrow; keeping it in a ref means a new
  // identity each render does not tear the socket down and reconnect.
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  const [state, setState] = useState<RealtimeSocketState>({
    isConnected: false,
    lastError: null,
  });

  const clearTimers = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    heartbeatRef.current = null;
    retryRef.current = null;
  }, []);

  const connect = useCallback(() => {
    if (disposedRef.current) return;

    const url = buildSocketUrl(token);
    if (!url) return;

    // Never stack sockets — an existing OPEN/CONNECTING one wins.
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      setState({ isConnected: false, lastError: "Could not open socket" });
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      attemptsRef.current = 0;
      setState({ isConnected: true, lastError: null });

      heartbeatRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, HEARTBEAT_MS);
    };

    socket.onmessage = (event) => {
      try {
        handlerRef.current(JSON.parse(event.data) as RealtimeMessage);
      } catch {
        // A malformed frame is the server's problem, not a reason to drop the
        // connection — every other event still gets through.
      }
    };

    socket.onerror = () => {
      setState((prev) => ({ ...prev, lastError: "Realtime connection error" }));
    };

    socket.onclose = (event) => {
      clearTimers();
      socketRef.current = null;
      setState((prev) => ({ ...prev, isConnected: false }));

      if (disposedRef.current) return;

      if (FATAL_CLOSE_CODES.has(event.code)) {
        setState({
          isConnected: false,
          lastError: "Realtime authentication rejected",
        });
        return;
      }

      // Exponential backoff with jitter. A flat retry across every open till
      // in a business would land as a synchronised burst on the server the
      // moment it recovers.
      const attempt = attemptsRef.current + 1;
      attemptsRef.current = attempt;
      const backoff = Math.min(BASE_RETRY_MS * 2 ** (attempt - 1), MAX_RETRY_MS);
      const jitter = Math.random() * backoff * 0.3;

      retryRef.current = setTimeout(connect, backoff + jitter);
    };
  }, [token, clearTimers]);

  useEffect(() => {
    disposedRef.current = false;
    connect();

    // A till leaves this tab open for days; browsers throttle background
    // timers, so reconnect promptly when it comes back rather than waiting on
    // a throttled backoff tick.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        !socketRef.current &&
        !disposedRef.current
      ) {
        attemptsRef.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);

    return () => {
      disposedRef.current = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
      clearTimers();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect, clearTimers]);

  return state;
};
