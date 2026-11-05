import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncExternalStore } from "react";

/**
 * Whether the POS can reach the server. It decides this by itself, so there's
 * nothing for a cashier to switch.
 *
 * The browser only knows about the network, so it still says "online" on Wi-Fi
 * with no internet. The sign in that case is a request failing or hanging. That
 * marks the server unreachable, and sales go straight to this device instead of
 * making each customer wait for a timeout. Meanwhile the connection is checked
 * in the background, and a couple of good checks in a row bring it back, so a
 * shaky connection doesn't flip back and forth.
 */
const CHECK_EVERY_MS = 20_000;
const CHECK_TIMEOUT_MS = 5_000;
const GOOD_CHECKS_NEEDED = 2;

let unreachable = false;
let goodChecks = 0;
let checkTimer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const setUnreachable = (value: boolean) => {
  if (value === unreachable) return;
  unreachable = value;
  listeners.forEach((listener) => listener());
};

const stopChecking = () => {
  clearInterval(checkTimer);
  checkTimer = undefined;
  window.removeEventListener("online", checkConnection);
};

async function checkConnection() {
  if (!navigator.onLine) {
    goodChecks = 0;
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const response = await fetch("/api/connection-check", {
      cache: "no-store",
      signal: controller.signal,
    });
    goodChecks = response.ok ? goodChecks + 1 : 0;
  } catch {
    goodChecks = 0;
  } finally {
    clearTimeout(timeout);
  }
  if (goodChecks >= GOOD_CHECKS_NEEDED) {
    stopChecking();
    setUnreachable(false);
  }
}

/** A request couldn't reach the server, whatever the browser says. */
export const markServerUnreachable = () => {
  goodChecks = 0;
  setUnreachable(true);
  if (checkTimer === undefined) {
    checkTimer = setInterval(checkConnection, CHECK_EVERY_MS);
    window.addEventListener("online", checkConnection);
  }
};

/** Called when the server becomes reachable or stops being. */
export const subscribeConnection = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** usePosOffline for code outside React, read at the moment it's called. */
export const isPosOfflineNow = (): boolean =>
  unreachable || (typeof navigator !== "undefined" && !navigator.onLine);

/** Whether the POS should take sales offline right now. */
export const usePosOffline = (): boolean => {
  const isOnline = useOnlineStatus();
  const isUnreachable = useSyncExternalStore(
    subscribeConnection,
    () => unreachable,
    () => false,
  );
  return !isOnline || isUnreachable;
};
