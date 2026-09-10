"use client";

import { useBusinessDataStore } from "./useBusinessDataStore";
import { useBusinessStore } from "./useBusinessStore";
import { useIsUserSubscribeStore } from "./useIsUserSubscribeStore";
import { useSelectedBankStore } from "./useSelectedBankStore";
import { useSelectedExpenseAccountStore } from "./useSelectedExpenseAccountStore";
import { useSelectedOrderStore } from "./useSelectedOrderStore";

/**
 * Everything remembered about "the business I am working in right now".
 *
 * All of these persist to localStorage, which is per-browser and not per-user.
 * Signing out cleared the auth cookies and the user store but left these
 * behind, so the next person to sign in on the same browser inherited the
 * previous one's business — the picker opened on it, and every business-scoped
 * query ran against it — until a hard refresh happened to rehydrate something
 * else. That is the "old business shows up for the new user" bug.
 *
 * If a store added later holds something belonging to a business rather than
 * to the browser, it belongs in this function.
 */

/**
 * The cart is deliberately not cleared on sign-out.
 *
 * It holds a half-rung sale keyed by business, and dropping it every time
 * someone signs out would throw away a real basket a cashier is mid-way
 * through. It goes only when the *user* actually changes — a cashier signing
 * back into the same account should find their till as they left it.
 */
const CART_STORAGE_KEY = "cart-storage";

export const resetBusinessScopedStores = ({
  includeCart = false,
}: { includeCart?: boolean } = {}) => {
  // Each store's own clear action, so the reset always matches the shape the
  // store declares rather than a second copy of it written out here.
  useBusinessStore.getState().clearBusinessId();
  useBusinessDataStore.getState().clearBusinessData();
  useSelectedExpenseAccountStore.getState().clearSelectedExpenseAccount();
  useSelectedBankStore.getState().clearSelectedBank();
  useIsUserSubscribeStore.getState().clearIsSubscribed();
  useSelectedOrderStore.getState().clearSelectedOrder();

  // The actions above rewrite the persisted entry with the cleared state,
  // which is enough. Dropping the entries outright as well means a store
  // whose shape changes later cannot rehydrate a stale field we no longer
  // reset by name.
  [
    useBusinessStore,
    useBusinessDataStore,
    useSelectedExpenseAccountStore,
    useSelectedBankStore,
    useIsUserSubscribeStore,
    useSelectedOrderStore,
  ].forEach((store) => {
    try {
      store.persist?.clearStorage?.();
    } catch {
      // In-memory state is already clean above; a browser with storage
      // blocked must not take the sign-out down with it.
    }
  });

  if (includeCart && typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // A stale cart is survivable; a crash here is not.
    }
  }
};
