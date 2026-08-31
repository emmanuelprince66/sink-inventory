"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useActiveCartState, useCartStore } from "@/lib/store/cart-store";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Edit3,
  Gift,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import AttendantDrawer from "./AttendantDrawer";
import RecieptPage from "./RecieptPage";
import VariationChangeModal from "./VariationChangeModal";
import { isRewardLine } from "./loyaltyReward";

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
  allow_tax?: boolean;
}

interface CartItem extends Variation {
  cartQuantity: number;
  type?: string;
  category?: string;
  amount?: number;
  image?: string;
}

interface CheckoutPageProps {
  clearCartFunc: () => void;
  businessData?: any;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  clearCartFunc,
  businessData,
}) => {
  console.log("businessData in checkout", businessData);

  // ---- Per-sale state (lives in active cart slot — isolated per Sale tab) ----
  const { state: cartState, update: updateCartState } = useActiveCartState();
  const customer = cartState.customer;
  const attendant = cartState.attendant;
  const showReceipt = cartState.showReceipt;
  const setAttendant = (v: any | null) => updateCartState({ attendant: v });
  const setShowReceipt = (v: boolean) => updateCartState({ showReceipt: v });
  // ---- end per-sale state ----
  // The customer, their loyalty and any redemption are picked in CustomerBar,
  // above the product grid — a cashier needs those before there is a cart, and
  // this panel does not render until there is one.
  const [isAttendantDrawerOpen, setIsAttendantDrawerOpen] =
    useState<boolean>(false);
  const [bulkQuantityInputs, setBulkQuantityInputs] = useState<
    Record<string, string>
  >({});
  const [bulkQuantityErrors, setBulkQuantityErrors] = useState<
    Record<string, string>
  >({});
  const [priceEditInputs, setPriceEditInputs] = useState<
    Record<string, string>
  >({});
  const [priceEditErrors, setPriceEditErrors] = useState<
    Record<string, string>
  >({});
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [changingVariationItem, setChangingVariationItem] =
    useState<CartItem | null>(null);
  const [showVariationModal, setShowVariationModal] = useState<boolean>(false);
  const { user } = useUserRole();

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
    getLoyaltyRewardValue,
    clearCartItems,
    addToCart,
  } = useCartStore();

  console.log("cartItems in checkout", cartItems);

  const subtotal = getSubtotal();
  const automaticDiscountAmount = getAutomaticDiscountAmount();
  const totalBeforeTax = getTotalPrice();
  const eligibleItems = getEligibleItems();
  /**
   * What the redeemed lines are worth. They sit in the cart at their normal
   * price — the sale sends them like any other item and the backend is what
   * zeroes them — so this is what comes off the amount the cashier collects.
   */
  const loyaltyRewardValue = getLoyaltyRewardValue();

  // VAT calculation logic - Per product basis
  const vatCalculation = useMemo(() => {
    // Check if business has VAT enabled
    const hasVatEnabled =
      businessData?.tax_rate &&
      parseFloat(businessData.tax_rate) > 0 &&
      businessData.tax_rate_last_updated;

    if (!hasVatEnabled) {
      return {
        enabled: false,
        rate: 0,
        amount: 0,
        totalWithVat: totalBeforeTax,
        itemsBreakdown: [],
      };
    }

    const vatRate = parseFloat(businessData.tax_rate);

    // Calculate VAT only for items with allow_tax: true. A redeemed line is
    // left out: the customer pays nothing for it, so there is nothing to tax.
    const itemsBreakdown = cartItems
      .filter((item) => item.allow_tax === true && !isRewardLine(item))
      .map((item) => {
        const itemTotal =
          (item.selling_price || item.amount || 0) * (item.cartQuantity || 1);
        const itemVat = (itemTotal * vatRate) / 100;
        return {
          id: item.id,
          name: item.name,
          itemTotal,
          itemVat,
        };
      });

    const totalVat = itemsBreakdown.reduce(
      (sum, item) => sum + item.itemVat,
      0,
    );
    const totalWithVat = totalBeforeTax + totalVat;

    return {
      enabled: true,
      rate: vatRate,
      amount: totalVat,
      totalWithVat: totalWithVat,
      itemsBreakdown,
    };
  }, [businessData, totalBeforeTax, cartItems]);

  /**
   * What the cashier actually collects.
   *
   * The redeemed line stays in the cart at its normal price so the sale can be
   * sent as an ordinary one, with loyalty_reward_id the only difference. The
   * backend zeroes that line, so the same amount has to come off here or the
   * customer would be asked to pay for their own reward.
   */
  const payableTotal = Math.max(
    0,
    (vatCalculation.enabled ? vatCalculation.totalWithVat : totalBeforeTax) -
      loyaltyRewardValue,
  );

  const hasBulkQuantityErrors = Object.values(bulkQuantityErrors).some(
    (error) => error !== "",
  );
  const hasPriceEditErrors = Object.values(priceEditErrors).some(
    (error) => error !== "",
  );

  // Check if user is pharmacist - they shouldn't see checkout page
  const isPharmacist = user && user.role === "PHARMACIST";

  const handleBulkQuantityChange = (itemId: string, value: string): void => {
    setBulkQuantityInputs((prev) => ({ ...prev, [itemId]: value }));
    const numValue = parseInt(value);
    if (value === "" || isNaN(numValue) || numValue <= 0) {
      setBulkQuantityErrors((prev) => ({
        ...prev,
        [itemId]: "Invalid input",
      }));
    } else {
      setBulkQuantityErrors((prev) => ({ ...prev, [itemId]: "" }));
    }
  };

  const applyBulkQuantity = (itemId: string): void => {
    const inputValue = bulkQuantityInputs[itemId];
    const numValue = parseInt(inputValue);
    if (inputValue && !isNaN(numValue) && numValue > 0) {
      updateCartItemQuantity(itemId, numValue);
      setBulkQuantityInputs((prev) => ({ ...prev, [itemId]: "" }));
      setBulkQuantityErrors((prev) => ({ ...prev, [itemId]: "" }));
    }
  };

  const handlePriceEditChange = (itemId: string, value: string): void => {
    setPriceEditInputs((prev) => ({ ...prev, [itemId]: value }));
    const numValue = parseFloat(value);
    if (value === "" || isNaN(numValue) || numValue <= 0) {
      setPriceEditErrors((prev) => ({ ...prev, [itemId]: "Invalid price" }));
    } else {
      setPriceEditErrors((prev) => ({ ...prev, [itemId]: "" }));
    }
  };

  const applyPriceEdit = (itemId: string): void => {
    const inputValue = priceEditInputs[itemId];
    const numValue = parseFloat(inputValue);
    if (inputValue && !isNaN(numValue) && numValue > 0) {
      updateCartItemPrice(itemId, numValue);
      setPriceEditInputs((prev) => ({ ...prev, [itemId]: "" }));
      setPriceEditErrors((prev) => ({ ...prev, [itemId]: "" }));
      setEditingPriceId(null);
    }
  };

  const cancelPriceEdit = (itemId: string): void => {
    setPriceEditInputs((prev) => ({ ...prev, [itemId]: "" }));
    setPriceEditErrors((prev) => ({ ...prev, [itemId]: "" }));
    setEditingPriceId(null);
  };

  const startPriceEdit = (itemId: string, currentPrice: number): void => {
    setEditingPriceId(itemId);
    setPriceEditInputs((prev) => ({
      ...prev,
      [itemId]: currentPrice.toString(),
    }));
    setPriceEditErrors((prev) => ({ ...prev, [itemId]: "" }));
  };

  const handleCustomQuantity = (itemId: string, value: string): void => {
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
      Math.min(Math.max(roundedValue, 0.5), availableQuantity),
    );
  };

  const handleChangeVariation = (
    currentItemId: string,
    newVariation: Variation,
    quantity: number,
  ): void => {
    const currentItem = cartItems.find((item) => item.id === currentItemId);
    removeFromCart(currentItemId);
    addToCart({
      ...newVariation,
      id: newVariation.id,
      name: `${currentItem?.parentProductName || ""} - ${newVariation.name}`,
      selling_price: newVariation.selling_price,
      amount: newVariation.selling_price,
      cartQuantity: quantity,
      parentProductId: currentItem?.parentProductId,
      parentProductName: currentItem?.parentProductName,
      parentProductVariations: currentItem?.parentProductVariations,
      type: currentItem?.type,
      category: currentItem?.category,
    });
  };

  const openVariationChanger = (item: CartItem): void => {
    setChangingVariationItem(item);
    setShowVariationModal(true);
  };

  // If pharmacist, don't render checkout page
  if (isPharmacist) {
    return null;
  }

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
          subtotal={subtotal}
          // Deliberately the total BEFORE the reward comes off. The printed
          // receipt subtracts the backend's own loyalty_discount from this, so
          // taking it off here as well would deduct the reward twice.
          total={totalBeforeTax}
          loyaltyRewardValue={loyaltyRewardValue}
          vatInfo={vatCalculation}
          businessData={businessData}
        />
      ) : (
        <div className="flex flex-col">
          <div className="p-3 pb-2 border-b border-grey-5 flex flex-col gap-2">
            <p className="text-lg font-extrabold text-grey-1">Checkout</p>
            {/* Who serves the sale. Who it is FOR is set in the customer bar
                above the products, since that has to come first. */}
            {user && user?.role === "OWNER" && (
              <Button
                onClick={() => setIsAttendantDrawerOpen(true)}
                variant="outline"
                className="flex h-10 w-full min-w-0 items-center justify-start gap-2 border-grey-5 transition-colors hover:border-primary-green-300 hover:bg-secondary-6"
              >
                <Users size={16} className="shrink-0" />
                <span className="truncate text-xs">
                  {attendant ? attendant.name : "Add Attendant"}
                </span>
              </Button>
            )}

            <div className="flex justify-between items-center w-full">
              <h2 className="text-xs font-bold text-grey-1">
                Cart Items ({cartItems.length})
              </h2>
              {/* Empties the basket only. clearCartFunc is the full reset and
                  belongs to finishing a sale, not to starting the basket over
                  — it would take the customer out of the bar above too. */}
              <Button
                variant="outline"
                className="flex items-center justify-start h-6 px-2 border-error-1/30 text-error-1 hover:bg-error-2 gap-1"
                onClick={clearCartItems}
              >
                <p className="text-[10px]">Clear Cart</p>
              </Button>
            </div>
          </div>

          <div className="p-4 pb-2">
            <div className="border rounded-xl bg-white overflow-hidden border-grey-5">
              {cartItems.length === 0 ? (
                <div className="p-6 text-center text-grey-4 text-sm">
                  Your cart is empty
                </div>
              ) : (
                <div className="divide-y divide-grey-6">
                  {cartItems.map((item: any) => {
                    // A redeemed line is not something the cashier can edit:
                    // the quantity, the price and the item itself are all
                    // fixed by the reward, so it gets a read-only row that
                    // says what it is and what it would otherwise have cost.
                    if (isRewardLine(item)) {
                      const listPrice = item.selling_price || item.amount || 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 bg-primary-green-500/50 p-3"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary-green-300/40 bg-white">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Gift className="h-5 w-5 text-primary-green-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="truncate text-sm font-bold text-grey-1">
                                {item.name}
                              </h3>
                              <span className="shrink-0 rounded-full bg-primary-green-300 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                                FREE
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[10px] text-grey-3">
                              Loyalty reward
                              {item.rewardLabel ? ` · ${item.rewardLabel}` : ""}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <p className="text-xs font-bold text-primary-green-300">
                                {formatToNaira(0)}
                              </p>
                              {listPrice > 0 && (
                                <p className="text-[10px] text-grey-4 line-through">
                                  {formatToNaira(listPrice)}
                                </p>
                              )}
                              <span className="text-[10px] text-grey-4">
                                × 1
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="shrink-0 cursor-pointer rounded-full p-1.5 text-error-1 hover:bg-error-2"
                            aria-label="Remove this reward from the sale"
                            onClick={() => {
                              removeFromCart(item.id);
                              updateCartState({ loyaltyReward: null });
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    }

                    const discountInfo = getItemDiscountDisplay(item);
                    const bulkError = bulkQuantityErrors[item.id];
                    const priceError = priceEditErrors[item.id];
                    const isEditingPrice = editingPriceId === item.id;
                    const currentPrice = item.selling_price || item.amount || 0;
                    const hasVariations = item.parentProductId;

                    return (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-grey-6/60 transition-colors"
                      >
                        {/* Top row — image, name/SKU/price, remove */}
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-grey-6 flex-shrink-0 border border-grey-5">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h3 className="text-sm font-bold text-grey-1 truncate">
                                {item.name}
                              </h3>
                              {hasVariations && (
                                <button
                                  type="button"
                                  className="shrink-0 p-0.5 rounded hover:bg-secondary-6 cursor-pointer"
                                  onClick={() => openVariationChanger(item)}
                                >
                                  <RefreshCw
                                    size={11}
                                    className="text-success-1"
                                  />
                                </button>
                              )}
                              {item.allow_tax && vatCalculation.enabled && (
                                <span className="shrink-0 text-[9px] px-1.5 py-0.5 bg-info-2 text-info-1 rounded-full font-bold">
                                  +VAT
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-grey-4">
                              SKU: {item.sku}
                            </p>

                            {isEditingPrice ? (
                              <div className="flex items-center flex-wrap gap-1 mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={priceEditInputs[item.id] || ""}
                                  onChange={(e) =>
                                    handlePriceEditChange(
                                      item.id,
                                      e.target.value,
                                    )
                                  }
                                  className={`w-20 text-center text-xs border rounded-md py-1 ${
                                    priceError
                                      ? "border-error-1"
                                      : "border-grey-5"
                                  }`}
                                  autoFocus
                                />
                                <Button
                                  variant="outline"
                                  className="h-6 px-2 text-[10px] border-grey-5 hover:border-primary-green-300 hover:bg-secondary-6"
                                  onClick={() => applyPriceEdit(item.id)}
                                  disabled={
                                    !priceEditInputs[item.id] || !!priceError
                                  }
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  className="h-6 px-2 text-[10px] border-grey-5 hover:border-error-1 hover:bg-error-2"
                                  onClick={() => cancelPriceEdit(item.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-xs font-bold text-primary-green-300">
                                  {formatToNaira(currentPrice)}
                                </p>
                                <button
                                  type="button"
                                  className="p-1 rounded hover:bg-grey-6 cursor-pointer"
                                  onClick={() =>
                                    startPriceEdit(item.id, currentPrice)
                                  }
                                >
                                  <Edit3 size={11} className="text-grey-4" />
                                </button>
                              </div>
                            )}

                            {priceError && (
                              <p className="text-[10px] text-error-1 mt-0.5">
                                {priceError}
                              </p>
                            )}
                            {item.quantity !== undefined && (
                              <p className="text-[10px] text-grey-4 mt-0.5">
                                Available: {item.quantity}
                              </p>
                            )}
                            {item.discount_threshold && (
                              <p className="text-[10px] text-info-1 mt-0.5">
                                Discount threshold: {item.discount_threshold}
                              </p>
                            )}
                            {discountInfo && (
                              <div className="text-[10px] text-success-1 font-bold mt-0.5">
                                <p>
                                  Discount:{" "}
                                  {formatToNaira(discountInfo.perUnitDiscount)}{" "}
                                  per unit
                                </p>
                                <p>
                                  Total Discount: -
                                  {formatToNaira(
                                    discountInfo.totalItemDiscount,
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="shrink-0 text-error-1 p-1.5 rounded-full cursor-pointer hover:bg-error-2"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Controls — qty stepper, bulk qty, decimal qty */}
                        <div className="mt-2.5 flex items-center flex-wrap gap-x-3 gap-y-2">
                          {/* Main integer stepper — the primary, most-used control,
                              deliberately the most visually pronounced element here. */}
                          <div className="flex items-center gap-1 rounded-full border border-grey-5 bg-secondary-6/60 p-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-full border-primary-green-300/30 bg-white hover:border-primary-green-300 hover:bg-secondary-6"
                              onClick={() => decrementQuantity(item.id)}
                              disabled={(item.cartQuantity || 1) <= 1}
                            >
                              <MinusCircle
                                size={16}
                                className="text-primary-green-300"
                              />
                            </Button>

                            <span className="w-8 text-center text-lg font-extrabold text-grey-1">
                              {Math.floor(item.cartQuantity || 1)}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-full border-primary-green-300/30 bg-white hover:border-primary-green-300 hover:bg-secondary-6"
                              onClick={() => incrementQuantity(item.id)}
                              disabled={
                                (item.cartQuantity || 1) >=
                                (item.quantity ?? Infinity)
                              }
                            >
                              <PlusCircle
                                size={16}
                                className="text-primary-green-300"
                              />
                            </Button>
                          </div>

                          {/* Bulk / decimal qty — secondary, less-used controls,
                              deliberately toned down so they don't compete with
                              the main stepper above. */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-normal text-grey-5 whitespace-nowrap">
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
                                  e.target.value,
                                )
                              }
                              className={`w-16 text-center text-xs font-normal text-grey-4 border rounded-md py-1 ${
                                bulkError ? "border-error-1" : "border-grey-6"
                              }`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-normal text-grey-4 border-grey-6 hover:border-primary-green-300 hover:bg-secondary-6"
                              onClick={() => applyBulkQuantity(item.id)}
                              disabled={
                                !bulkQuantityInputs[item.id] || !!bulkError
                              }
                            >
                              Set
                            </Button>
                          </div>

                          {item?.type?.toLocaleLowerCase() === "product" && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-normal text-grey-5 whitespace-nowrap">
                                Decimal Qty:
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 cursor-pointer border-grey-6 hover:border-primary-green-300 hover:bg-secondary-6"
                                onClick={() =>
                                  decrementDecimalQuantity(item.id)
                                }
                                disabled={(item.cartQuantity || 0.5) <= 0.5}
                              >
                                <MinusCircle
                                  size={12}
                                  className="text-grey-4"
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
                                className="w-12 text-center text-xs font-normal text-grey-4 border border-grey-6 rounded-md py-1"
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
                                className="h-6 w-6 cursor-pointer border-grey-6 hover:border-primary-green-300 hover:bg-secondary-6"
                                onClick={() =>
                                  incrementDecimalQuantity(item.id)
                                }
                                disabled={
                                  (item.cartQuantity || 0.5) >=
                                  (item.quantity ?? Infinity)
                                }
                              >
                                <PlusCircle
                                  size={12}
                                  className="text-grey-4"
                                />
                              </Button>
                            </div>
                          )}
                        </div>
                        {bulkError && (
                          <p className="text-[10px] text-error-1 mt-1">
                            {bulkError}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-2.5 pt-3 mt-1 border-t border-grey-5">
            <h2 className="text-xs font-bold text-grey-1 mb-1.5">
              Order Summary
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-grey-3 text-[11px]">
                  Subtotal ({cartItems.length} items)
                </span>
                <span className="font-bold text-[11px] text-grey-1">
                  {formatToNaira(subtotal)}
                </span>
              </div>

              {automaticDiscountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-grey-3 text-[11px]">
                      Discount Applied
                    </span>
                    {eligibleItems.length > 0 && (
                      <div className="text-[9px] text-grey-4">
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
                  <span className="font-bold text-[11px] text-success-1">
                    -{formatToNaira(automaticDiscountAmount)}
                  </span>
                </div>
              )}

              {/* VAT Display */}
              {vatCalculation.enabled && vatCalculation.amount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-grey-3 text-[11px]">
                      Subtotal (before VAT)
                    </span>
                    <span className="font-bold text-[11px] text-grey-1">
                      {formatToNaira(totalBeforeTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-grey-3 text-[11px]">
                        VAT ({vatCalculation.rate}%)
                      </span>
                      {vatCalculation.itemsBreakdown.length > 0 && (
                        <div className="text-[9px] text-grey-4">
                          {vatCalculation.itemsBreakdown.map((item: any) => (
                            <div key={item.id}>
                              {item.name}: {formatToNaira(item.itemVat)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-[11px] text-info-1">
                      +{formatToNaira(vatCalculation.amount)}
                    </span>
                  </div>
                </>
              )}

              {/* Redemption. Shown as its own deduction rather than folded
                  into the item's price, so the receipt and the till agree on
                  what the reward was worth. */}
              {loyaltyRewardValue > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-1">
                    <Gift className="h-3 w-3 shrink-0 text-primary-green-300" />
                    <span className="truncate text-[11px] text-grey-3">
                      Loyalty reward
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-primary-green-300">
                    -{formatToNaira(loyaltyRewardValue)}
                  </span>
                </div>
              )}

              <Separator className="my-1.5 bg-grey-5" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-grey-1">Total</span>
                <span className="font-extrabold text-sm text-primary-green-300">
                  {formatToNaira(payableTotal)}
                </span>
              </div>
              <Button
                className="w-full mt-1 h-9 text-xs font-bold"
                onClick={() => setShowReceipt(true)}
                disabled={
                  cartItems.length === 0 ||
                  hasBulkQuantityErrors ||
                  hasPriceEditErrors
                }
              >
                Complete Order
              </Button>
            </div>
          </div>

          <AttendantDrawer
            open={isAttendantDrawerOpen}
            onOpenChange={setIsAttendantDrawerOpen}
            onAttendantSelect={(selectedAttendant: any) =>
              setAttendant(selectedAttendant)
            }
          />

          {/* Variation Change Modal */}
          {changingVariationItem && (
            <CustomModal
              isOpen={showVariationModal}
              onClose={() => {
                setShowVariationModal(false);
                setChangingVariationItem(null);
              }}
              title=""
            >
              <VariationChangeModal
                isOpen={showVariationModal}
                onClose={() => {
                  setShowVariationModal(false);
                  setChangingVariationItem(null);
                }}
                currentItem={changingVariationItem}
                availableVariations={
                  changingVariationItem.parentProductVariations || []
                }
                onChangeVariation={handleChangeVariation}
              />
            </CustomModal>
          )}
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
