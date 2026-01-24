import { Button } from "@/components/ui/button";
import { formatToNaira } from "@/utils/formatMoney";
import { Check, Minus, Plus } from "lucide-react";
import React, { useState } from "react";

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
  parentProductId?: string;
  parentProductName?: string;
  parentProductVariations?: Variation[];
}

interface CartItem extends Variation {
  cartQuantity: number;
  type?: string;
  category?: string;
  amount?: number;
  image?: string;
}

interface VariationChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: CartItem | null;
  availableVariations?: Variation[];
  onChangeVariation: (
    currentItemId: string,
    newVariation: Variation,
    quantity: number,
  ) => void;
}

const VariationChangeModal: React.FC<VariationChangeModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  availableVariations,
  onChangeVariation,
}) => {
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen || !currentItem) return null;

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      "IN-STOCK": "bg-green-100 text-green-800",
      LOW: "bg-yellow-100 text-yellow-800",
      "OUT-OF-STOCK": "bg-red-100 text-red-800",
    };
    return statusColors[status?.toUpperCase()] || "bg-gray-100 text-gray-800";
  };

  const handleConfirm = (): void => {
    if (selectedVariation) {
      onChangeVariation(currentItem.id, selectedVariation, quantity);
      onClose();
      setSelectedVariation(null);
      setQuantity(1);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg w-full flex flex-col">
        <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-start sm:items-center gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base">
              Change Variation
            </h3>
            <p className="text-xs text-gray-1000 truncate">
              Current: {currentItem.name}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {availableVariations?.map((variation) => {
              const isOutOfStock =
                variation.quantity === 0 || variation.status === "OUT-OF-STOCK";
              const isSelected = selectedVariation?.id === variation.id;

              return (
                <div
                  key={variation.id}
                  onClick={() =>
                    !isOutOfStock && setSelectedVariation(variation)
                  }
                  className={`border border-gray-100 rounded-lg p-3 cursor-pointer transition-all ${
                    isOutOfStock
                      ? "opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "border-green-500 bg-green-50"
                        : "hover:border-green-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-medium text-sm truncate flex-1">
                          {variation.name}
                        </h4>
                        {isSelected && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-1000 truncate">
                        SKU: {variation.sku}
                      </p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusColor(
                        variation.status,
                      )}`}
                    >
                      {variation.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm font-semibold text-green-600 truncate">
                      {formatToNaira(variation.selling_price)}
                    </p>
                    <p className="text-xs text-gray-1000 whitespace-nowrap">
                      Qty: {variation.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedVariation && (
          <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 sm:p-2 rounded hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(selectedVariation.quantity, quantity + 1),
                    )
                  }
                  className="p-1.5 sm:p-2 rounded hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
            >
              Confirm Change
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariationChangeModal;
