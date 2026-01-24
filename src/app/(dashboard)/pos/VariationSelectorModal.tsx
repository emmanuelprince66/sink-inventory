"use client";

import { formatToNaira } from "@/utils/formatMoney";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

// Types
interface Variation {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price: number;
  quantity: number;
  cost_price?: number;
  discount?: number;
  discount_threshold?: number;
  expiry_date?: string;
  low_stock_threshold?: number;
  sold?: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price?: number;
  amount?: number;
  quantity?: number;
  image?: string;
  type: string;
  category?: string;
  variations?: Variation[];
  unit?: string;
  discount?: number;
  discount_threshold?: number;
}

interface VariationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddVariations: (variations: any[]) => void;
}

const VariationSelectorModal: React.FC<VariationSelectorModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddVariations,
}) => {
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, number>
  >({});

  if (!isOpen || !product) return null;

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      "IN-STOCK": "bg-green-100 text-green-800",
      LOW: "bg-yellow-100 text-yellow-800",
      "OUT-OF-STOCK": "bg-red-100 text-red-800",
    };
    return statusColors[status?.toUpperCase()] || "bg-gray-100 text-gray-800";
  };

  const handleQuantityChange = (variationId: string, change: number): void => {
    setSelectedVariations((prev) => {
      const currentQty = prev[variationId] || 0;
      const variation = product.variations?.find((v) => v.id === variationId);
      const maxQty = variation?.quantity || 0;
      const newQty = Math.max(0, Math.min(currentQty + change, maxQty));

      if (newQty === 0) {
        const { [variationId]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [variationId]: newQty };
    });
  };

  const handleAddToCart = (): void => {
    const variationsToAdd = Object.entries(selectedVariations)
      .filter(([_, qty]) => qty > 0)
      .map(([variationId, quantity]) => {
        const variation = product.variations?.find((v) => v.id === variationId);
        return {
          ...variation,
          cartQuantity: quantity,
          parentProductId: product.id,
          parentProductName: product.name,
          type: product.type,
          category: product.category,
          // CRITICAL: Include all variations so user can switch between them later
          parentProductVariations: product.variations,
        };
      });

    if (variationsToAdd.length > 0) {
      onAddVariations(variationsToAdd);
      setSelectedVariations({});
      onClose();
    }
  };

  const totalSelected = Object.values(selectedVariations).reduce(
    (sum, qty) => sum + qty,
    0,
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-gray-500">
          Select variations to add to cart
        </p>
      </div>

      {/* Variations List */}
      <div className="max-h-[60vh] overflow-y-auto mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {product.variations?.map((variation) => {
            const isOutOfStock =
              variation.quantity === 0 || variation.status === "OUT-OF-STOCK";
            const selectedQty = selectedVariations[variation.id] || 0;
            const maxQuantity = variation.quantity || 0;

            return (
              <div
                key={variation.id}
                className={`border rounded-lg p-3 ${
                  isOutOfStock
                    ? "border-gray-200 bg-gray-50 opacity-60"
                    : selectedQty > 0
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                } transition-all`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{variation.name}</h3>
                    <p className="text-xs text-gray-500">
                      SKU: {variation.sku}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      variation.status,
                    )}`}
                  >
                    {variation.status}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-green-600">
                    {formatToNaira(variation.selling_price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Available: {variation.quantity}
                  </p>
                </div>

                {variation.discount && variation.discount_threshold && (
                  <p className="text-xs text-blue-600 mb-2">
                    {variation.discount}% off on {variation.discount_threshold}+
                    items
                  </p>
                )}

                {/* Quantity Controls */}
                {!isOutOfStock && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(variation.id, -1)}
                        disabled={selectedQty === 0}
                        className="p-1 rounded-full  hover:bg-gray-200 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {selectedQty}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(variation.id, 1)}
                        disabled={selectedQty >= maxQuantity}
                        className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedQty > 0 && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                )}

                {isOutOfStock && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Out of Stock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-600">
            Total items selected:{" "}
            <span className="font-semibold">{totalSelected}</span>
          </p>
          <p className="text-sm font-semibold text-green-600">
            {formatToNaira(
              Object.entries(selectedVariations).reduce(
                (total, [variationId, qty]) => {
                  const variation = product.variations?.find(
                    (v) => v.id === variationId,
                  );
                  return total + (variation?.selling_price || 0) * qty;
                },
                0,
              ),
            )}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={totalSelected === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 cursor-pointer text-white py-2 rounded-lg font-medium transition-colors"
        >
          Add to Cart ({totalSelected})
        </button>
      </div>
    </div>
  );
};

export default VariationSelectorModal;
