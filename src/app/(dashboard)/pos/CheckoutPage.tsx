"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useActiveCartState, useCartStore } from "@/lib/store/cart-store";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Edit3,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Trash2,
  ScanLine,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import AttendantDrawer from "./AttendantDrawer";
import CustomerDrawer from "./CustomersDrawer";
import CustomerLoyaltyModal from "./CustomerLoyaltyModal";
import LoyaltyScanner from "./LoyaltyScanner";
import RecieptPage from "./RecieptPage";
import VariationChangeModal from "./VariationChangeModal";

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
  // A reward belongs to a person, so changing or clearing the customer drops
  // it — otherwise it would be billed to whoever the cashier picks next.
  const setCustomer = (v: any | null) =>
    updateCartState({ customer: v, loyaltyReward: null });
  const setAttendant = (v: any | null) => updateCartState({ attendant: v });
  const setShowReceipt = (v: boolean) => updateCartState({ showReceipt: v });
  // ---- end per-sale state ----
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] =
    useState<boolean>(false);
  // Loyalty scan + the modal it feeds. loyaltyCustomerId is set either by a
  // scan or by "View Loyalty" on a row in the customer drawer.
  const [isLoyaltyScannerOpen, setIsLoyaltyScannerOpen] = useState(false);
  const [loyaltyView, setLoyaltyView] = useState<{
    code: string;
    customer?: any;
  } | null>(null);
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
    addToCart,
  } = useCartStore();

  console.log("cartItems in checkout", cartItems);

  const subtotal = getSubtotal();
  const automaticDiscountAmount = getAutomaticDiscountAmount();
  const totalBeforeTax = getTotalPrice();
  const eligibleItems = getEligibleItems();

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

    // Calculate VAT only for items with allow_tax: true
    const itemsBreakdown = cartItems
      .filter((item) => item.allow_tax === true)
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
          total={totalBeforeTax}
          vatInfo={vatCalculation}
          businessData={businessData}
        />
      ) : (
        <div className="flex flex-col">
          <div className="p-3 pb-2 border-b border-grey-5 flex flex-col gap-2">
            <p className="text-lg font-extrabold text-grey-1">Checkout</p>
            {/* Row 1: pick a customer, or scan their loyalty card.
                Row 2: attendant, full width. */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex h-10 min-w-0 items-center justify-start gap-2 border-grey-5 transition-colors hover:border-primary-green-300 hover:bg-secondary-6"
                  onClick={() => setIsCustomerDrawerOpen(true)}
                >
                  <UserPlus size={16} className="shrink-0" />
                  <span className="truncate text-xs">
                    {customer ? customer.name : "Add Customer"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="flex h-10 min-w-0 items-center justify-start gap-2 border-grey-5 transition-colors hover:border-primary-green-300 hover:bg-secondary-6"
                  onClick={() => setIsLoyaltyScannerOpen(true)}
                >
                  <ScanLine size={16} className="shrink-0" />
                  <span className="truncate text-xs">Scan Loyalty</span>
                </Button>
              </div>

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
            </div>

            <div className="flex justify-between items-center w-full">
              <h2 className="text-xs font-bold text-grey-1">
                Cart Items ({cartItems.length})
              </h2>
              <Button
                variant="outline"
                className="flex items-center justify-start h-6 px-2 border-error-1/30 text-error-1 hover:bg-error-2 gap-1"
                onClick={clearCartFunc}
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

              <Separator className="my-1.5 bg-grey-5" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-grey-1">Total</span>
                <span className="font-extrabold text-sm text-primary-green-300">
                  {formatToNaira(
                    vatCalculation.enabled
                      ? vatCalculation.totalWithVat
                      : totalBeforeTax,
                  )}
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

          <CustomerDrawer
            open={isCustomerDrawerOpen}
            onOpenChange={setIsCustomerDrawerOpen}
            onCustomerSelect={(selectedCustomer: any) =>
              setCustomer(selectedCustomer)
            }
            onViewLoyalty={(selectedCustomer: any) =>
              selectedCustomer?.loyalty_code &&
              setLoyaltyView({
                code: selectedCustomer.loyalty_code,
                customer: selectedCustomer,
              })
            }
          />

          {/* Scanning a loyalty card resolves the code to a customer, then
              hands off to the same loyalty modal the drawer opens. */}
          <LoyaltyScanner
            open={isLoyaltyScannerOpen}
            onOpenChange={setIsLoyaltyScannerOpen}
            onResolved={(code: string, matched?: any) =>
              setLoyaltyView({ code, customer: matched })
            }
          />

          <CustomerLoyaltyModal
            loyaltyCode={loyaltyView?.code ?? null}
            customer={loyaltyView?.customer}
            open={Boolean(loyaltyView)}
            onClose={() => setLoyaltyView(null)}
            onAddToSale={(selected: any) => {
              setCustomer(selected);
              setIsCustomerDrawerOpen(false);
            }}
            appliedRewardId={cartState.loyaltyReward?.id ?? null}
            onApplyReward={(reward: any | null, wallet: any) => {
              // Customer and reward move together in one update: setCustomer
              // deliberately clears the reward, so calling both in sequence
              // would wipe the one just applied.
              const owner =
                cartState.customer ??
                loyaltyView?.customer ??
                (wallet
                  ? {
                      name: wallet.name,
                      phone: wallet.phone,
                      loyalty_code: wallet.loyalty_code,
                    }
                  : null);

              updateCartState({
                loyaltyReward: reward,
                // A reward can only be redeemed against its owner, so applying
                // one puts them on the sale if they are not already there.
                ...(reward ? { customer: owner } : {}),
              });
            }}
          />
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
