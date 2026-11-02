import { useSyncExternalStore } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Manual "Offline mode" for the POS. The cashier turns it on when the
 * internet is connected but unreliable (Wi-Fi with no internet, very slow
 * data), which the browser still reports as online. Checkout then saves
 * sales on the device exactly as it does with no connection; syncing keeps
 * trying in the background whenever there is a real connection.
 *
 * Remembered per device so a refresh doesn't switch it off.
 */
const STORAGE_KEY = "pos:offline-mode";
const listeners = new Set<() => void>();

const read = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
};

let manualOffline = typeof window !== "undefined" ? read() : false;

export const setManualOfflineMode = (on: boolean) => {
  manualOffline = on;
  try {
    if (on) localStorage.setItem(STORAGE_KEY, "on");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: still works for this tab.
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Keep other tabs on this device in step.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      manualOffline = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

/** usePosOffline for code outside React, read at the moment it's called. */
export const isPosOfflineNow = (): boolean =>
  manualOffline || (typeof navigator !== "undefined" && !navigator.onLine);

/** Whether the cashier switched Offline mode on. */
export const useManualOfflineMode = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => manualOffline,
    () => false,
  );

/**
 * Whether the POS should take sales offline: no connection, or Offline mode
 * switched on.
 */
export const usePosOffline = (): boolean => {
  const isOnline = useOnlineStatus();
  const manual = useManualOfflineMode();
  return !isOnline || manual;
};
