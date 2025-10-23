"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/cart-store";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Edit3,
  MinusCircle,
  PlusCircle,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import AttendantDrawer from "./AttendantDrawer";
import CustomerDrawer from "./CustomersDrawer";
import RecieptPage from "./RecieptPage";

interface CheckoutPageProps {
  clearCartFunc: () => void;
}

const CheckoutPage = ({ clearCartFunc }: CheckoutPageProps) => {
  const [customer, setCustomer] = useState<any | null>(null);
  const [attendant, setAttendant] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isAttendantDrawerOpen, setIsAttendantDrawerOpen] = useState(false);
  const [bulkQuantityInputs, setBulkQuantityInputs] = useState<{
    [key: string]: string;
  }>({});
  const [bulkQuantityErrors, setBulkQuantityErrors] = useState<{
    [key: string]: string;
  }>({});
  const [priceEditInputs, setPriceEditInputs] = useState<{
    [key: string]: string;
  }>({});
  const [priceEditErrors, setPriceEditErrors] = useState<{
    [key: string]: string;
  }>({});
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const { user } = useUserRole();

  // Get cart items and actions from the store
  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    incrementDecimalQuantity,
    decrementDecimalQuantity,
    updateCartItemQuantity,
    updateCartItemPrice,
    getItemDiscountDisplay,
    getSubtotal,
    getAutomaticDiscountAmount,
    getTotalPrice,
    getEligibleItems,
  } = useCartStore();

  const subtotal = getSubtotal();
  const automaticDiscountAmount = getAutomaticDiscountAmount();
  const total = getTotalPrice();
  const eligibleItems = getEligibleItems();

  // Check if there are any bulk quantity errors
  const hasBulkQuantityErrors = Object.values(bulkQuantityErrors).some(
    (error) => error !== ""
  );

  // Check if there are any price edit errors
  const hasPriceEditErrors = Object.values(priceEditErrors).some(
    (error) => error !== ""
  );

  // Handle bulk quantity input
  const handleBulkQuantityChange = (itemId: string, value: string) => {
    setBulkQuantityInputs((prev) => ({
      ...prev,
      [itemId]: value,
    }));

    // Validate input
    const numValue = parseInt(value);
    if (value === "" || isNaN(numValue) || numValue <= 0) {
      setBulkQuantityErrors((prev) => ({
        ...prev,
        [itemId]: "Invalid input",
      }));
    } else {
      setBulkQuantityErrors((prev) => ({
        ...prev,
        [itemId]: "",
      }));
    }
  };

  // Apply bulk quantity
  const applyBulkQuantity = (itemId: string) => {
    const inputValue = bulkQuantityInputs[itemId];
    const numValue = parseInt(inputValue);

    if (inputValue && !isNaN(numValue) && numValue > 0) {
      updateCartItemQuantity(itemId, numValue);

      // Clear the input after applying
      setBulkQuantityInputs((prev) => ({
        ...prev,
        [itemId]: "",
      }));
      setBulkQuantityErrors((prev) => ({
        ...prev,
        [itemId]: "",
      }));
    }
  };

  // Handle price edit input
  const handlePriceEditChange = (itemId: string, value: string) => {
    setPriceEditInputs((prev) => ({
      ...prev,
      [itemId]: value,
    }));

    // Validate input
    const numValue = parseFloat(value);
    if (value === "" || isNaN(numValue) || numValue <= 0) {
      setPriceEditErrors((prev) => ({
        ...prev,
        [itemId]: "Invalid price",
      }));
    } else {
      setPriceEditErrors((prev) => ({
        ...prev,
        [itemId]: "",
      }));
    }
  };

  // Apply price edit
  const applyPriceEdit = (itemId: string) => {
    const inputValue = priceEditInputs[itemId];
    const numValue = parseFloat(inputValue);

    if (inputValue && !isNaN(numValue) && numValue > 0) {
      updateCartItemPrice(itemId, numValue);

      // Clear the input after applying
      setPriceEditInputs((prev) => ({
        ...prev,
        [itemId]: "",
      }));
      setPriceEditErrors((prev) => ({
        ...prev,
        [itemId]: "",
      }));
      setEditingPriceId(null);
    }
  };

  // Cancel price edit
  const cancelPriceEdit = (itemId: string) => {
    setPriceEditInputs((prev) => ({
      ...prev,
      [itemId]: "",
    }));
    setPriceEditErrors((prev) => ({
      ...prev,
      [itemId]: "",
    }));
    setEditingPriceId(null);
  };

  // Start price edit
  const startPriceEdit = (itemId: string, currentPrice: number) => {
    setEditingPriceId(itemId);
    setPriceEditInputs((prev) => ({
      ...prev,
      [itemId]: currentPrice.toString(),
    }));
    setPriceEditErrors((prev) => ({
      ...prev,
      [itemId]: "",
    }));
  };

  // Decimal quantity handler (strict 0.5 increments only)
  const handleCustomQuantity = (itemId: string, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, "");

    if (!sanitizedValue || isNaN(parseFloat(sanitizedValue))) {
      updateCartItemQuantity(itemId, 0.5);
      return;
    }

    const numValue = parseFloat(sanitizedValue);
    const roundedValue = Math.round(numValue * 2) / 2;

    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    const availableQuantity = item.quantity ?? 999;
    updateCartItemQuantity(
      itemId,
      Math.min(Math.max(roundedValue, 0.5), availableQuantity)
    );
  };

  return (
    <>
      {showReceipt ? (
        <RecieptPage
          cart={cartItems}
          setShowReceipt={setShowReceipt}
          attendant={attendant}
          customer={customer}
          clearCartFunc={clearCartFunc}
          discount={
            automaticDiscountAmount > 0
              ? { type: "fixed" as const, value: automaticDiscountAmount }
              : null
          }
          discountAmount={automaticDiscountAmount}
          subtotal={getTotalPrice()}
          total={total}
        />
      ) : (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg space-y-4">
          {/* Header Section */}
          <div className="flex flex-col space-y-3">
            <p className="text-2xl font-bold text-gray-800">Checkout</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="flex items-center border-gray-200 justify-start gap-2 h-12 hover:border-[#52b661] hover:bg-[#52b661]/10 transition-colors"
                onClick={() => setIsCustomerDrawerOpen(true)}
              >
                <UserPlus size={16} />
                <span className="text-xs">
                  {customer ? customer.name : "Add Customer"}
                </span>
              </Button>
              {user && user?.role === "OWNER" && (
                <Button
                  onClick={() => setIsAttendantDrawerOpen(true)}
                  variant="outline"
                  className="flex items-center border-gray-200 justify-start gap-2 h-12 hover:border-[#52b661] hover:bg-[#52b661]/10 transition-colors"
                >
                  <Users size={16} />
                  <p className="text-xs">
                    {attendant ? attendant.name : "Add Attendant"}
                  </p>
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items Section */}
          <div className="flex flex-col flex-grow">
            <div className="flex justify-between items-center w-full mb-1">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                Cart Items ({cartItems.length})
              </h2>
              <Button
                variant="outline"
                className="flex items-center justify-start border border-red-600 gap-2"
                onClick={clearCartFunc}
              >
                <p className="text-red-600 text-xs">Clear Cart</p>
              </Button>
            </div>

            <div className="flex-grow border rounded-md bg-white overflow-y-auto max-h-[400px] border-[#52b661]/30">
              {cartItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Your cart is empty
                </div>
              ) : (
                <div className="divide-y divide-[#52b661]/10">
                  {cartItems.map((item) => {
                    const discountInfo = getItemDiscountDisplay(item);
                    const bulkError = bulkQuantityErrors[item.id];
                    const priceError = priceEditErrors[item.id];
                    const isEditingPrice = editingPriceId === item.id;
                    const currentPrice = item.selling_price || item.amount || 0;

                    return (
                      <div key={item.id} className="p-1 flex items-start">
                        <div className="h-8 w-8 rounded-md overflow-hidden mr-2 bg-gray-100 flex-shrink-0 border border-[#52b661]/20">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-grow">
                          <h3 className="font-sm text-gray-800">{item.name}</h3>
                          <p className="text-[10px] text-gray-500">
                            SKU: {item.sku}
                          </p>

                          {/* Price Display with Edit functionality */}
                          <div className="flex items-center gap-2">
                            {isEditingPrice ? (
                              <div className="flex items-start flex-col  gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={priceEditInputs[item.id] || ""}
                                  onChange={(e) =>
                                    handlePriceEditChange(
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                  className={`w-20 text-center text-xs border rounded-md py-1 ${
                                    priceError
                                      ? "border-red-500"
                                      : "border-gray-200"
                                  }`}
                                  autoFocus
                                />
                                <div className="flex gap-1 mb-[4px]">
                                  <Button
                                    variant="outline"
                                    className="h-4 px-1 text-[8px] border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                                    onClick={() => applyPriceEdit(item.id)}
                                    disabled={
                                      !priceEditInputs[item.id] || !!priceError
                                    }
                                  >
                                    <p className="text-[9px]">Save</p>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-4 px-1 text-[8px] border-gray-200 hover:border-red-500 hover:bg-red-50"
                                    onClick={() => cancelPriceEdit(item.id)}
                                  >
                                    <p className="text-[9px]">Cancel</p>
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <p className="text-[10px] font-semibold text-[#52b661]">
                                  {formatToNaira(currentPrice)}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-gray-100"
                                  onClick={() =>
                                    startPriceEdit(item.id, currentPrice)
                                  }
                                >
                                  <Edit3 size={10} className="text-gray-400" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {priceError && (
                            <p className="text-[8px] text-red-500">
                              {priceError}
                            </p>
                          )}

                          {item.quantity !== undefined && (
                            <p className="text-[8px] text-gray-500">
                              Available: {item.quantity}
                            </p>
                          )}
                          {item.discount_threshold && (
                            <p className="text-[8px] text-blue-500">
                              Discount threshold: {item.discount_threshold}
                            </p>
                          )}
                          {/* Show enhanced discount applied indicator */}
                          {discountInfo && (
                            <div className="text-[8px] text-green-600 font-semibold">
                              <p>
                                Discount:{" "}
                                {formatToNaira(discountInfo.perUnitDiscount)}{" "}
                                per unit
                              </p>
                              <p>
                                Total Discount: -
                                {formatToNaira(discountInfo.totalItemDiscount)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-2">
                          {/* Original quantity controls (whole numbers) */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 cursor-pointer border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                              onClick={() => decrementQuantity(item.id)}
                              disabled={(item.cartQuantity || 1) <= 1}
                            >
                              <MinusCircle
                                size={3}
                                className="text-[#52b661]"
                              />
                            </Button>

                            <span className="w-8 text-center text-gray-700">
                              {Math.floor(item.cartQuantity || 1)}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                              onClick={() => incrementQuantity(item.id)}
                              disabled={
                                (item.cartQuantity || 1) >=
                                (item.quantity ?? Infinity)
                              }
                            >
                              <PlusCircle size={3} className="text-[#52b661]" />
                            </Button>
                          </div>

                          {/* Bulk Quantity Input */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-500">
                              Bulk Qty:
                            </span>
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 80"
                              value={bulkQuantityInputs[item.id] || ""}
                              onChange={(e) =>
                                handleBulkQuantityChange(
                                  item.id,
                                  e.target.value
                                )
                              }
                              className={`w-16 text-center text-xs border rounded-md py-1 ${
                                bulkError ? "border-red-500" : "border-gray-200"
                              }`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[8px] border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                              onClick={() => applyBulkQuantity(item.id)}
                              disabled={
                                !bulkQuantityInputs[item.id] || !!bulkError
                              }
                            >
                              Set
                            </Button>
                          </div>
                          {bulkError && (
                            <p className="text-[8px] text-red-500">
                              {bulkError}
                            </p>
                          )}

                          {/* Decimal quantity controls (0.5 increments only) */}
                          {item?.type?.toLocaleLowerCase() === "product" && (
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-gray-500">
                                Decimal Qty:
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 cursor-pointer border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                                onClick={() =>
                                  decrementDecimalQuantity(item.id)
                                }
                                disabled={(item.cartQuantity || 0.5) <= 0.5}
                              >
                                <MinusCircle
                                  size={2}
                                  className="text-[#52b661]"
                                />
                              </Button>
                              <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={item.cartQuantity || 0.5}
                                onChange={(e) =>
                                  handleCustomQuantity(item.id, e.target.value)
                                }
                                className="w-12 text-center text-xs border border-gray-200 rounded-md py-1"
                                onBlur={(e) => {
                                  if (
                                    e.target.value === "" ||
                                    parseFloat(e.target.value) < 0.5
                                  ) {
                                    handleCustomQuantity(item.id, "0.5");
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                                onClick={() =>
                                  incrementDecimalQuantity(item.id)
                                }
                                disabled={
                                  (item.cartQuantity || 0.5) >=
                                  (item.quantity ?? Infinity)
                                }
                              >
                                <PlusCircle
                                  size={2}
                                  className="text-[#52b661]"
                                />
                              </Button>
                            </div>
                          )}

                          <div
                            className="text-red-500 p-1 rounded-full cursor-pointer hover:bg-red-50"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={1} className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white rounded-lg shadow-sm p-1 border border-[#52b661]/20">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-xs">
                  Subtotal ({cartItems.length} items)
                </span>
                <span className="font-medium text-xs">
                  {formatToNaira(subtotal)}
                </span>
              </div>

              {/* Enhanced Automatic Discount Section */}
              {automaticDiscountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600 text-xs">
                      Discount Applied
                    </span>
                    {eligibleItems.length > 0 && (
                      <div className="text-[10px] text-gray-500">
                        {eligibleItems.map((item: any) => {
                          const discountInfo = getItemDiscountDisplay(item);
                          return discountInfo ? (
                            <div key={item.id}>
                              {item.name}:{" "}
                              {formatToNaira(discountInfo.perUnitDiscount)} per
                              unit × {item.cartQuantity}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-xs text-green-600">
                    -{formatToNaira(automaticDiscountAmount)}
                  </span>
                </div>
              )}

              <Separator className="my-2 bg-[#52b661]/30" />
              <div className="flex justify-between">
                <span className="font-bold text-sm text-gray-800">Total</span>
                <span className="font-bold text-sm text-[#52b661]">
                  {formatToNaira(total)}
                </span>
              </div>
              <Button
                className="w-full mt-3 py-3 text-base font-semibold bg-[#52b661] hover:bg-[#52b661]/90"
                onClick={() => setShowReceipt(true)}
                disabled={
                  cartItems.length === 0 ||
                  hasBulkQuantityErrors ||
                  hasPriceEditErrors
                }
              >
                <p className="text-sm">Complete Order</p>
              </Button>
            </div>
          </div>

          {/* Drawers */}
          <CustomerDrawer
            open={isCustomerDrawerOpen}
            onOpenChange={setIsCustomerDrawerOpen}
            onCustomerSelect={(selectedCustomer: any) => {
              setCustomer(selectedCustomer);
            }}
          />
          <AttendantDrawer
            open={isAttendantDrawerOpen}
            onOpenChange={setIsAttendantDrawerOpen}
            onAttendantSelect={(selectedAttendant: any) => {
              setAttendant(selectedAttendant);
            }}
          />
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
