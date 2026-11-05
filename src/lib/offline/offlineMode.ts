import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncExternalStore } from "react";

/**
 * Whether the POS can reach the server. It decides this by itself, so there's
 * nothing for a cashier to switch.
 *
 * The browser only knows about the network, so it still says "online" on Wi-Fi
 * with no internet. The sign in that case is a request failing or hanging. That
 * marks the server unreachable, and sales go straight to this device instead of
 * making each customer wait for a timeout.
 *
 * It then stays offline for a while before checking again (two minutes, longer
 * if it keeps flipping), because a quick check can pass while sales are still
 * too slow, and every flip back costs the next customer a 10-second wait. Two
 * good checks in a row bring it back, or any sale syncing successfully.
 */
const CHECK_EVERY_MS = 20_000;
// Longer than the server's own 8s wait on the API, so a slow reply still counts.
const CHECK_TIMEOUT_MS = 10_000;
const GOOD_CHECKS_NEEDED = 2;
const FIRST_HOLD_MS = 2 * 60_000;
const LONGEST_HOLD_MS = 10 * 60_000;
/** Going offline again this soon after coming back means a shaky connection. */
const FLAP_WINDOW_MS = 5 * 60_000;

let unreachable = false;
let goodChecks = 0;
let checking = false;
let holdUntil = 0;
let holdMs = FIRST_HOLD_MS;
let recoveredAt = 0;
let checkTimer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const setUnreachable = (value: boolean) => {
  if (value === unreachable) return;
  unreachable = value;
  listeners.forEach((listener) => listener());
};

// The network itself came back, which is a real change: check straight away
// rather than waiting out the hold.
const onBrowserOnline = () => {
  holdUntil = 0;
  checkConnection();
};

const stopChecking = () => {
  clearInterval(checkTimer);
  checkTimer = undefined;
  window.removeEventListener("online", onBrowserOnline);
};

async function checkConnection() {
  // One at a time, or two overlapping checks would both count as "in a row".
  if (checking || Date.now() < holdUntil) return;
  if (!navigator.onLine) {
    goodChecks = 0;
    return;
  }
  checking = true;
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
    checking = false;
  }
  if (goodChecks >= GOOD_CHECKS_NEEDED) markServerReachable();
}

/** A request got through, so the server can be reached again. */
export const markServerReachable = () => {
  goodChecks = 0;
  if (checkTimer !== undefined) stopChecking();
  if (!unreachable) return;
  recoveredAt = Date.now();
  setUnreachable(false);
};

/** A request couldn't reach the server, whatever the browser says. */
export const markServerUnreachable = () => {
  goodChecks = 0;
  if (!unreachable) {
    const flapping = recoveredAt && Date.now() - recoveredAt < FLAP_WINDOW_MS;
    holdMs = flapping ? Math.min(holdMs * 2, LONGEST_HOLD_MS) : FIRST_HOLD_MS;
    holdUntil = Date.now() + holdMs;
  }
  setUnreachable(true);
  if (checkTimer === undefined) {
    checkTimer = setInterval(checkConnection, CHECK_EVERY_MS);
    window.addEventListener("online", onBrowserOnline);
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
