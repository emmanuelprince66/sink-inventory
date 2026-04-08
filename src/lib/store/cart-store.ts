import { CartItem } from "@/app/(dashboard)/pos/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  cartItems: CartItem[];
  saleCompleted: boolean;
  setSaleCompleted: (completed: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  updateCartItemPrice: (id: string, price: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      saleCompleted: false,
      setSaleCompleted: (completed) => set({ saleCompleted: completed }),
      addToCart: (item) => {
        if (get().saleCompleted) return;
        set((state) => {
          const existingItem = state.cartItems.find(
            (cartItem) => cartItem.id === item.id
          );

          if (existingItem) {
            // Item already exists, increment quantity
            return {
              cartItems: state.cartItems.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      cartQuantity:
                        cartItem.cartQuantity + (item.cartQuantity || 1),
                    }
                  : cartItem
              ),
            };
          }

          // New item, add to cart with specified quantity or default to 1
          return {
            cartItems: [
              ...state.cartItems,
              { ...item, cartQuantity: item.cartQuantity || 1 },
            ],
          };
        });
      },
      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        }));
      },
      updateCartItemQuantity: (id, quantity) => {
        if (quantity < 0.5) {
          get().removeFromCart(id);
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, cartQuantity: quantity } : item
          ),
        }));
      },
      updateCartItemPrice: (id, price) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            if (item.id === id) {
              if (item.type === "SERVICE") {
                return { ...item, amount: price };
              } else {
                return { ...item, selling_price: price };
              }
            }
            return item;
          }),
        }));
      },
      clearCart: () => {
        set({ cartItems: [], saleCompleted: false });
      },
      getTotalItems: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.cartQuantity,
          0
        );
      },
      getSubtotal: () => {
        return get().cartItems.reduce((total, item) => {
          const price = item.amount || item.selling_price || 0;
          return total + price * (item.cartQuantity || 1);
        }, 0);
      },
      getAutomaticDiscountAmount: () => {
        return get().cartItems.reduce((totalDiscount, item) => {
          if (
            item.type === "PRODUCT" &&
            item.discount_threshold &&
            item.discount &&
            (item.cartQuantity || 1) >= item.discount_threshold
          ) {
            return totalDiscount + item.discount * (item.cartQuantity || 1);
          }
          return totalDiscount;
        }, 0);
      },
      getTotalPrice: () => {
        return get().getSubtotal() - get().getAutomaticDiscountAmount();
      },
      getEligibleItems: () => {
        return get().cartItems.filter(
          (item) =>
            item.type === "PRODUCT" &&
            item.discount_threshold &&
            item.discount &&
            (item.cartQuantity || 1) >= item.discount_threshold
        );
      },
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
          newQuantity >= 0.5 ? newQuantity : 0.5
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
    }
  )
);
