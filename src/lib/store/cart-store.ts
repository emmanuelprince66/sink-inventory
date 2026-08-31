import { isRewardLine } from "@/app/(dashboard)/pos/loyaltyReward";
import { CartItem } from "@/app/(dashboard)/pos/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Per-sale flow state. Every cart tab gets its own copy so payment method,
// customer, attendant, etc. selected in Sale 1 do NOT bleed into Sale 2.
export interface CartSlotState {
  customer: any | null;
  /**
   * A reward the customer chose to redeem on this sale, from their loyalty
   * wallet. Only its id is sent — the backend prices the item at zero, deducts
   * the stock and marks the reward REDEEMED — so the rest is kept purely to
   * show what is being applied without a second lookup.
   */
  loyaltyReward: any | null;
  attendant: any | null;
  paymentMethod: string;
  selectedBank: string;
  selectedAccount: string;
  selectedDate: Date | undefined;
  dueDate: Date | undefined;
  isChecked: boolean;
  partialAmount: string;
  partialPaymentMethod: string;
  splitPayments: any[];
  tempSplitPayment: { method: string; amount: string; bank: string };
  remainingAmount: number;
  saleResponse: any | null;
  showReceipt: boolean;
  showPrintReceiptView: boolean;
}

const emptyState = (): CartSlotState => ({
  customer: null,
  loyaltyReward: null,
  attendant: null,
  paymentMethod: "",
  selectedBank: "",
  selectedAccount: "",
  selectedDate: new Date(),
  dueDate: undefined,
  isChecked: false,
  partialAmount: "",
  partialPaymentMethod: "",
  splitPayments: [],
  tempSplitPayment: { method: "", amount: "", bank: "" },
  remainingAmount: 0,
  saleResponse: null,
  showReceipt: false,
  showPrintReceiptView: false,
});

interface CartSlot {
  items: CartItem[];
  saleCompleted: boolean;
  state: CartSlotState;
}

interface CartStore {
  // Multi-cart state
  carts: Record<string, CartSlot>;
  cartOrder: string[];
  activeCartId: string;

  // Active-cart mirrors (for backwards-compat with existing consumers)
  cartItems: CartItem[];
  saleCompleted: boolean;

  // Tab management
  createCart: () => string;
  closeCart: (cartId: string) => void;
  setActiveCart: (cartId: string) => void;

  // Per-sale flow state — operates on the active slot
  updateActiveCartState: (updates: Partial<CartSlotState>) => void;
  resetActiveCartState: () => void;

  // Active cart actions (operate on the active slot)
  setSaleCompleted: (completed: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  updateCartItemPrice: (id: string, price: number) => void;
  /** Full reset of the slot — items, customer, payment, the lot. */
  clearCart: () => void;
  /**
   * Empties the basket but keeps who is being served. The customer is chosen
   * before anything is rung up now, so a cashier starting the basket over is
   * not saying they have a different person in front of them. Any redemption
   * does go, since the line it put in the cart is gone with it.
   */
  clearCartItems: () => void;
  /** Drops every line a loyalty reward added, leaving what was rung up. */
  clearRewardLines: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  /**
   * What the redeemed lines are worth at their normal price — the amount to
   * take off the total, since the backend zeroes those lines on the sale.
   */
  getLoyaltyRewardValue: () => number;
  getAutomaticDiscountAmount: () => number;
  getTotalPrice: () => number;
  getEligibleItems: () => CartItem[];
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  incrementDecimalQuantity: (itemId: string) => void;
  decrementDecimalQuantity: (itemId: string) => void;
  getItemDiscountDisplay: (item: CartItem) => {
    totalItemDiscount: number;
    perUnitDiscount: number;
  } | null;
}

const generateCartId = () =>
  `cart_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const DEFAULT_CART_ID = "cart_default";

const emptySlot = (): CartSlot => ({
  items: [],
  saleCompleted: false,
  state: emptyState(),
});

// Updates a single cart slot and refreshes the active mirrors if it's the active one.
const updateSlot = (
  state: CartStore,
  cartId: string,
  updater: (slot: CartSlot) => CartSlot,
): Partial<CartStore> => {
  const current = state.carts[cartId] || emptySlot();
  const next = updater(current);
  const carts = { ...state.carts, [cartId]: next };

  if (cartId === state.activeCartId) {
    return {
      carts,
      cartItems: next.items,
      saleCompleted: next.saleCompleted,
    };
  }
  return { carts };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      carts: { [DEFAULT_CART_ID]: emptySlot() },
      cartOrder: [DEFAULT_CART_ID],
      activeCartId: DEFAULT_CART_ID,
      cartItems: [],
      saleCompleted: false,

      createCart: () => {
        const id = generateCartId();
        set((state) => ({
          carts: { ...state.carts, [id]: emptySlot() },
          cartOrder: [...state.cartOrder, id],
          activeCartId: id,
          cartItems: [],
          saleCompleted: false,
        }));
        return id;
      },

      closeCart: (cartId) => {
        set((state) => {
          // Don't allow closing the last cart — reset it instead
          if (state.cartOrder.length <= 1) {
            return {
              carts: { [cartId]: emptySlot() },
              cartOrder: [cartId],
              activeCartId: cartId,
              cartItems: [],
              saleCompleted: false,
            };
          }
          const newOrder = state.cartOrder.filter((id) => id !== cartId);
          const newCarts = { ...state.carts };
          delete newCarts[cartId];

          let newActiveId = state.activeCartId;
          if (state.activeCartId === cartId) {
            // pick neighbor (prev if exists else first)
            const idx = state.cartOrder.indexOf(cartId);
            newActiveId = newOrder[Math.max(0, idx - 1)] || newOrder[0];
          }

          const activeSlot = newCarts[newActiveId] || emptySlot();
          return {
            carts: newCarts,
            cartOrder: newOrder,
            activeCartId: newActiveId,
            cartItems: activeSlot.items,
            saleCompleted: activeSlot.saleCompleted,
          };
        });
      },

      setActiveCart: (cartId) => {
        set((state) => {
          const slot = state.carts[cartId];
          if (!slot) return state;
          return {
            activeCartId: cartId,
            cartItems: slot.items,
            saleCompleted: slot.saleCompleted,
          };
        });
      },

      setSaleCompleted: (completed) =>
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            saleCompleted: completed,
          })),
        ),

      updateActiveCartState: (updates) => {
        // Coerce any date-shaped strings back to Date — defensive in case
        // a rehydrated value sneaks through before the revive runs.
        const coerced: Partial<CartSlotState> = { ...updates };
        if ("selectedDate" in coerced && typeof coerced.selectedDate === "string") {
          coerced.selectedDate = new Date(coerced.selectedDate);
        }
        if ("dueDate" in coerced && typeof coerced.dueDate === "string") {
          coerced.dueDate = new Date(coerced.dueDate);
        }
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            state: { ...(slot.state ?? emptyState()), ...coerced },
          })),
        );
      },

      resetActiveCartState: () =>
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            state: emptyState(),
          })),
        ),

      addToCart: (item) => {
        const state = get();
        const slot = state.carts[state.activeCartId] || emptySlot();
        if (slot.saleCompleted) return;

        set((s) =>
          updateSlot(s, s.activeCartId, (slot) => {
            const existingItem = slot.items.find(
              (cartItem) => cartItem.id === item.id,
            );
            if (existingItem) {
              return {
                ...slot,
                items: slot.items.map((cartItem) =>
                  cartItem.id === item.id
                    ? {
                        ...cartItem,
                        cartQuantity:
                          cartItem.cartQuantity + (item.cartQuantity || 1),
                      }
                    : cartItem,
                ),
              };
            }
            return {
              ...slot,
              items: [
                ...slot.items,
                { ...item, cartQuantity: item.cartQuantity || 1 },
              ],
            };
          }),
        );
      },

      removeFromCart: (id) =>
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            items: slot.items.filter((item) => item.id !== id),
          })),
        ),

      updateCartItemQuantity: (id, quantity) => {
        if (quantity < 0.5) {
          get().removeFromCart(id);
          return;
        }
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            items: slot.items.map((item) =>
              item.id === id ? { ...item, cartQuantity: quantity } : item,
            ),
          })),
        );
      },

      updateCartItemPrice: (id, price) =>
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            items: slot.items.map((item) => {
              if (item.id === id) {
                if (item.type === "SERVICE") {
                  return { ...item, amount: price };
                } else {
                  return { ...item, selling_price: price };
                }
              }
              return item;
            }),
          })),
        ),

      clearCart: () =>
        set((state) =>
          updateSlot(state, state.activeCartId, () => emptySlot()),
        ),

      clearCartItems: () =>
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            items: [],
            saleCompleted: false,
            state: { ...(slot.state ?? emptyState()), loyaltyReward: null },
          })),
        ),

      clearRewardLines: () =>
        set((state) =>
          updateSlot(state, state.activeCartId, (slot) => ({
            ...slot,
            items: slot.items.filter((item) => !isRewardLine(item)),
          })),
        ),

      getTotalItems: () =>
        get().cartItems.reduce((total, item) => total + item.cartQuantity, 0),

      getSubtotal: () =>
        get().cartItems.reduce((total, item) => {
          const price = item.amount || item.selling_price || 0;
          return total + price * (item.cartQuantity || 1);
        }, 0),

      getLoyaltyRewardValue: () =>
        get().cartItems.reduce((total, item) => {
          if (!isRewardLine(item)) return total;
          const price = item.amount || item.selling_price || 0;
          return total + price * (item.cartQuantity || 1);
        }, 0),

      getAutomaticDiscountAmount: () =>
        get().cartItems.reduce((totalDiscount, item) => {
          if (
            item.type === "PRODUCT" &&
            item.discount_threshold &&
            item.discount &&
            (item.cartQuantity || 1) >= item.discount_threshold
          ) {
            return totalDiscount + item.discount * (item.cartQuantity || 1);
          }
          return totalDiscount;
        }, 0),

      getTotalPrice: () =>
        get().getSubtotal() - get().getAutomaticDiscountAmount(),

      getEligibleItems: () =>
        get().cartItems.filter(
          (item) =>
            item.type === "PRODUCT" &&
            item.discount_threshold &&
            item.discount &&
            (item.cartQuantity || 1) >= item.discount_threshold,
        ),

      incrementQuantity: (itemId) => {
        const item = get().cartItems.find((item) => item.id === itemId);
        if (!item) return;
        const availableQuantity = item.quantity ?? 999;
        const currentQuantity = item.cartQuantity || 1;
        if (currentQuantity < availableQuantity) {
          get().updateCartItemQuantity(itemId, currentQuantity + 1);
        }
      },

      decrementQuantity: (itemId) => {
        const item = get().cartItems.find((item) => item.id === itemId);
        if (!item) return;
        const currentQuantity = item.cartQuantity || 1;
        if (currentQuantity > 1) {
          get().updateCartItemQuantity(itemId, currentQuantity - 1);
        }
      },

      incrementDecimalQuantity: (itemId) => {
        const item = get().cartItems.find((item) => item.id === itemId);
        if (!item) return;
        const availableQuantity = item.quantity ?? 999;
        const currentQuantity = item.cartQuantity || 0.5;
        const newQuantity = parseFloat((currentQuantity + 0.5).toFixed(1));
        if (newQuantity <= availableQuantity) {
          get().updateCartItemQuantity(itemId, newQuantity);
        }
      },

      decrementDecimalQuantity: (itemId) => {
        const item = get().cartItems.find((item) => item.id === itemId);
        if (!item) return;
        const currentQuantity = item.cartQuantity || 0.5;
        const newQuantity = parseFloat((currentQuantity - 0.5).toFixed(1));
        get().updateCartItemQuantity(
          itemId,
          newQuantity >= 0.5 ? newQuantity : 0.5,
        );
      },

      getItemDiscountDisplay: (item) => {
        if (
          item.type === "PRODUCT" &&
          item.discount_threshold &&
          item.discount &&
          (item.cartQuantity || 1) >= item.discount_threshold
        ) {
          const totalItemDiscount = item.discount * (item.cartQuantity || 1);
          return {
            totalItemDiscount,
            perUnitDiscount: item.discount,
          };
        }
        return null;
      },
    }),
    {
      name: "cart-storage",
      version: 2,
      migrate: (persistedState: any, version) => {
        // v1 → v2: backfill per-sale `state` on every cart slot
        if (version < 2 && persistedState?.carts) {
          const carts: Record<string, CartSlot> = {};
          Object.entries(persistedState.carts).forEach(
            ([id, slot]: [string, any]) => {
              carts[id] = {
                items: slot?.items ?? [],
                saleCompleted: slot?.saleCompleted ?? false,
                state: slot?.state ?? emptyState(),
              };
            },
          );
          return { ...persistedState, carts };
        }
        return persistedState;
      },
      // Revive Date fields that lost their type on JSON serialization.
      // Without this, `selectedDate.toISOString()` throws because the value
      // is a string after rehydration.
      onRehydrateStorage: () => (state) => {
        if (!state?.carts) return;
        const reviveDate = (v: unknown): Date | undefined => {
          if (!v) return undefined;
          if (v instanceof Date) return v;
          if (typeof v === "string") {
            const d = new Date(v);
            return isNaN(d.getTime()) ? undefined : d;
          }
          return undefined;
        };

        Object.values(state.carts).forEach((slot: CartSlot) => {
          if (!slot?.state) return;
          slot.state.selectedDate = reviveDate(slot.state.selectedDate);
          slot.state.dueDate = reviveDate(slot.state.dueDate);
          if (Array.isArray(slot.state.splitPayments)) {
            slot.state.splitPayments = slot.state.splitPayments.map(
              (p: any) => ({
                ...p,
                dueDate: p?.dueDate ? reviveDate(p.dueDate) : p?.dueDate,
              }),
            );
          }
        });
      },
    },
  ),
);

// Stable fallback so `useActiveCartState` doesn't reallocate on every render.
const EMPTY_STATE_FALLBACK: CartSlotState = emptyState();

/**
 * Convenience hook: subscribe to the active cart's per-sale state and get a
 * setter that mutates only that slot's state. Use this in any component with
 * per-sale form fields (payment method, customer, attendant, etc.).
 */
export const useActiveCartState = () => {
  const state = useCartStore(
    (s) => s.carts[s.activeCartId]?.state ?? EMPTY_STATE_FALLBACK,
  );
  const update = useCartStore((s) => s.updateActiveCartState);
  const reset = useCartStore((s) => s.resetActiveCartState);
  return { state, update, reset };
};
