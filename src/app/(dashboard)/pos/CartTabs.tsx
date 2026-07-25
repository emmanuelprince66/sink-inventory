"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { Plus, X } from "lucide-react";

const CartTabs = () => {
  const cartOrder = useCartStore((s) => s.cartOrder);
  const activeCartId = useCartStore((s) => s.activeCartId);
  const carts = useCartStore((s) => s.carts);
  const createCart = useCartStore((s) => s.createCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const setActiveCart = useCartStore((s) => s.setActiveCart);

  return (
    <div className="shrink-0 flex items-center gap-2 px-2 py-2 bg-grey-6 border-b border-grey-5 overflow-x-auto">
      {cartOrder.map((cartId, idx) => {
        const slot = carts[cartId];
        const itemCount = slot?.items?.length ?? 0;
        const isActive = cartId === activeCartId;
        const label = `Sale ${idx + 1}`;

        return (
          <div
            key={cartId}
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-base cursor-pointer transition-colors shrink-0 ${
              isActive
                ? "bg-primary-green-300 text-white font-extrabold shadow-sm"
                : "bg-white border border-grey-5 text-grey-2 font-extrabold hover:bg-grey-6"
            }`}
            onClick={() => setActiveCart(cartId)}
          >
            <span>{label}</span>
            {itemCount > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-grey-6 text-grey-3"
                }`}
              >
                {itemCount}
              </span>
            )}
            {cartOrder.length > 1 && (
              <button
                type="button"
                aria-label={`Close ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  closeCart(cartId);
                }}
                className={`flex items-center justify-center w-3 h-3 rounded-full opacity-60 hover:opacity-100 transition-opacity cursor-pointer ${
                  isActive
                    ? "text-white hover:bg-error-1"
                    : "text-grey-3 hover:bg-error-2 hover:text-error-1"
                }`}
              >
                <X size={8} strokeWidth={3} />
              </button>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        onClick={() => createCart()}
        className="ml-1 gap-1.5 h-9 px-4 text-sm font-bold shrink-0"
        aria-label="New sale"
      >
        <Plus size={16} strokeWidth={2.5} />
        New Sale
      </Button>
    </div>
  );
};

export default CartTabs;
