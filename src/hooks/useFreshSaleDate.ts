"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { useEffect } from "react";

/**
 * Keeps the till's sale date on today.
 *
 * The cart is persisted so a sale survives a refresh, a navigation away and
 * the end of a shift. The sale date rode along with it: whatever `new Date()`
 * returned when the cart tab was first created got written to localStorage and
 * replayed forever after. A shop that leaves the till open overnight — which
 * is most of them — opened in the morning to yesterday's date already filled
 * in, and every sale rung up before someone noticed was recorded on the wrong
 * day.
 *
 * Mount alone is not enough. The POS is a screen people leave open for hours
 * and come back to, so the check also runs when the tab is focused or made
 * visible again; that is what catches the roll over midnight without a
 * reload.
 *
 * A date the cashier picked themselves is never touched — see
 * `refreshUntouchedSaleDates`.
 */
export const useFreshSaleDate = () => {
  const refresh = useCartStore((state) => state.refreshUntouchedSaleDates);

  useEffect(() => {
    refresh();

    const onVisible = () => {
      // `focus` fires for a window that was never hidden, so the visibility
      // check keeps a background tab from doing this work.
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);
};
