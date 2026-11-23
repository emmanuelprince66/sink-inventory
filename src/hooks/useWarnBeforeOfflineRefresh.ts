"use client";

import { usePosOffline } from "@/lib/offline/offlineMode";
import { useEffect } from "react";

/**
 * Asks before the page is refreshed or closed while the POS is offline.
 *
 * Sales taken offline are safe — they live on this device and survive a
 * refresh. The risk is the page itself: with no connection a refresh can fail
 * to load the app at all, which leaves the till on the browser's own error
 * page until the connection is back. Browsers show their own wording
 * ("Leave site? Changes may not be saved"); a custom message isn't allowed.
 */
export const useWarnBeforeOfflineRefresh = () => {
  const offline = usePosOffline();

  useEffect(() => {
    if (!offline) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers need returnValue set to show the prompt.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [offline]);
};
