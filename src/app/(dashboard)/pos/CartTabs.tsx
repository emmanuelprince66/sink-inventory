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
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
      {cartOrder.map((cartId, idx) => {
        const slot = carts[cartId];
        const itemCount = slot?.items?.length ?? 0;
        const isActive = cartId === activeCartId;
        const label = `Sale ${idx + 1}`;

        return (
          <div
            key={cartId}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors shrink-0 ${
              isActive
                ? "bg-white border border-gray-300 text-gray-900 font-medium shadow-sm"
                : "text-gray-600 hover:bg-white/60"
            }`}
            onClick={() => setActiveCart(cartId)}
          >
            <span>{label}</span>
            {itemCount > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
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
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 rounded p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => createCart()}
        className="ml-1 gap-1 text-gray-600 hover:text-gray-900 hover:bg-white/60 h-8 px-2"
        aria-label="New sale"
      >
        <Plus size={14} />
        New sale
      </Button>
    </div>
  );
};

export default CartTabs;
