"use client";

import { usePosOffline } from "@/lib/offline/offlineMode";
import { useCallback, useEffect, useRef, useState } from "react";

/** F5, Ctrl/Cmd+R and their "hard reload" variants. */
const isReloadShortcut = (event: KeyboardEvent) =>
  event.key === "F5" ||
  ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r");

/**
 * Asks before the page is refreshed or closed while the POS is offline.
 *
 * Sales taken offline are safe — they live on this device and survive a
 * refresh. The risk is the page itself: with no connection a refresh can fail
 * to load the app at all, which leaves the till on the browser's own error
 * page until the connection is back.
 *
 * Two layers, because browsers don't allow custom text in their own prompt:
 * - The reload keys (F5, Ctrl/Cmd+R — how cashiers almost always refresh) are
 *   caught here and open the POS's own dialog, which can explain the risk.
 * - The toolbar reload button and closing the tab can't be intercepted, so
 *   those still get the browser's generic "Reload site?" prompt.
 */
export const useWarnBeforeOfflineRefresh = () => {
  const offline = usePosOffline();
  const [open, setOpen] = useState(false);
  // Set when the cashier chose "Reload anyway" in our dialog, so the
  // browser's prompt doesn't ask a second time.
  const confirmed = useRef(false);

  useEffect(() => {
    if (!offline) {
      setOpen(false);
      return;
    }
    const warn = (event: BeforeUnloadEvent) => {
      if (confirmed.current) return;
      event.preventDefault();
      // Older browsers need returnValue set to show the prompt.
      event.returnValue = "";
    };
    const onKey = (event: KeyboardEvent) => {
      if (!isReloadShortcut(event)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("beforeunload", warn);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("keydown", onKey);
    };
  }, [offline]);

  const reloadAnyway = useCallback(() => {
    confirmed.current = true;
    window.location.reload();
  }, []);

  return { open, close: () => setOpen(false), reloadAnyway };
};
