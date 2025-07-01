"use client";
import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import {
  MinusCircle,
  // Percent,
  PlusCircle,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import AttendantDrawer from "./AttendantDrawer";
import CustomerDrawer from "./CustomersDrawer";
import RecieptPage from "./RecieptPage";

interface CartItem {
  id: string;
  name: string;
  image?: string;
  sku: string;
  selling_price: number;
  cost_price: number;
  category?: string;
  amount?: number;
  quantity?: number;
  status: string;
  type: string;
  sold?: number;
  cartQuantity?: number;
  discount_threshold?: number;
  discount?: number;
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCartFunc: () => void;
}

// Comment out the DiscountModal component
// const DiscountModal = ({
//   open,
//   onOpenChange,
//   onApplyDiscount,
//   subtotal,
//   eligibleItems,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onApplyDiscount: (discount: {
//     type: "fixed" | "percentage";
//     value: number;
//   }) => void;
//   subtotal: number;
//   eligibleItems: CartItem[];
// }) => {
//   const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
//     "fixed"
//   );
//   const [discountValue, setDiscountValue] = useState("");
//   const [error, setError] = useState("");

//   const handleApply = () => {
//     const value = parseFloat(discountValue);
//     if (isNaN(value) || value <= 0) {
//       setError("Please enter a valid discount value");
//       return;
//     }

//     if (discountType === "percentage" && value > 100) {
//       setError("Percentage discount cannot exceed 100%");
//       return;
//     }

//     if (discountType === "fixed" && value > subtotal) {
//       setError("Fixed discount cannot exceed subtotal");
//       return;
//     }

//     // Validate that at least one item meets the discount threshold
//     if (eligibleItems.length === 0) {
//       setError("No items in cart meet the discount threshold requirements");
//       return;
//     }

//     onApplyDiscount({ type: discountType, value });
//     onOpenChange(false);
//     setError("");
//     setDiscountValue("");
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200">
//         <DialogHeader>
//           <DialogTitle>Add Discount</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <RadioGroup
//             defaultValue="fixed"
//             className="flex gap-4 cursor-pointer"
//             onValueChange={(value: "fixed" | "percentage") =>
//               setDiscountType(value)
//             }
//           >
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem value="fixed" id="fixed" />
//               <Label htmlFor="fixed" className="flex items-center gap-2">
//                 ₦ Fixed Amount
//               </Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem value="percentage" id="percentage" />
//               <Label htmlFor="percentage" className="flex items-center gap-2 ">
//                 % Percentage
//               </Label>
//             </div>
//           </RadioGroup>

//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="discountValue" className="text-right">
//               Value
//             </Label>
//             <Input
//               id="discountValue"
//               type="number"
//               min="0"
//               step={discountType === "percentage" ? "1" : "0.01"}
//               value={discountValue}
//               onChange={(e) => setDiscountValue(e.target.value)}
//               className="col-span-3"
//               placeholder={discountType === "percentage" ? "0-100%" : "0.00"}
//             />
//           </div>

//           {eligibleItems.length > 0 && (
//             <div className="text-xs text-gray-500">
//               Eligible items for discount:{" "}
//               {eligibleItems.map((item) => item.name).join(", ")}
//             </div>
//           )}

//           {error && <p className="text-red-500 text-sm">{error}</p>}
//         </div>
//         <div className="flex justify-end w-full gap-2">
//           <Button onClick={handleApply}>Apply Discount</Button>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

const CheckoutPage = ({
  cartItems,
  clearCartFunc,
  setCartItems,
}: CheckoutPageProps) => {
  const [customer, setCustomer] = useState<any | null>(null);
  const [attendant, setAttendant] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isAttendantDrawerOpen, setIsAttendantDrawerOpen] = useState(false);
  // const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // const [discount, setDiscount] = useState<{
  //   type: "fixed" | "percentage";
  //   value: number;
  // } | null>(null);
  const { user } = useUserRole();

  // Calculate the subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return (
      total + (item.amount || item.selling_price) * (item.cartQuantity || 1)
    );
  }, 0);

  // Calculate automatic discount for items that meet threshold
  const automaticDiscountAmount = cartItems.reduce((totalDiscount, item) => {
    if (
      item.type === "PRODUCT" &&
      item.discount_threshold &&
      item.discount &&
      (item.cartQuantity || 1) >= item.discount_threshold
    ) {
      return totalDiscount + item.discount;
    }
    return totalDiscount;
  }, 0);

  // Calculate total (subtract discount from subtotal)
  const total = subtotal - automaticDiscountAmount;

  // Get items eligible for discount (for display purposes)
  const eligibleItems = cartItems.filter(
    (item) =>
      item.type === "PRODUCT" &&
      item.discount_threshold &&
      item.discount &&
      (item.cartQuantity || 1) >= item.discount_threshold
  );

  // Remove the manual discount functions
  // const handleApplyDiscount = (discount: {
  //   type: "fixed" | "percentage";
  //   value: number;
  // }) => {
  //   setDiscount(discount);
  // };

  // const handleRemoveDiscount = () => {
  //   setDiscount(null);
  // };

  // Original increment function (whole numbers only)
  const incrementQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const availableQuantity = item.quantity ?? 999;
          const currentQuantity = item.cartQuantity || 1;

          if (currentQuantity < availableQuantity) {
            return { ...item, cartQuantity: currentQuantity + 1 };
          }
        }
        return item;
      })
    );
  };

  // Original decrement function (whole numbers only)
  const decrementQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && (item.cartQuantity || 1) > 1
          ? { ...item, cartQuantity: (item.cartQuantity || 1) - 1 }
          : item
      )
    );
  };

  // Decimal quantity handler (strict 0.5 increments only)
  const handleCustomQuantity = (itemId: string, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, "");

    if (!sanitizedValue || isNaN(parseFloat(sanitizedValue))) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, cartQuantity: 0.5 } : item
        )
      );
      return;
    }

    const numValue = parseFloat(sanitizedValue);
    const roundedValue = Math.round(numValue * 2) / 2;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const availableQuantity = item.quantity ?? 999;
          return {
            ...item,
            cartQuantity: Math.min(
              Math.max(roundedValue, 0.5),
              availableQuantity
            ),
          };
        }
        return item;
      })
    );
  };

  // Function to increment decimal quantity by 0.5
  const incrementDecimalQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const availableQuantity = item.quantity ?? 999;
          const currentQuantity = item.cartQuantity || 0.5;
          const newQuantity = parseFloat((currentQuantity + 0.5).toFixed(1));

          if (newQuantity <= availableQuantity) {
            return { ...item, cartQuantity: newQuantity };
          }
        }
        return item;
      })
    );
  };

  // Function to decrement decimal quantity by 0.5
  const decrementDecimalQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentQuantity = item.cartQuantity || 0.5;
          const newQuantity = parseFloat((currentQuantity - 0.5).toFixed(1));

          return {
            ...item,
            cartQuantity: newQuantity >= 0.5 ? newQuantity : 0.5,
          };
        }
        return item;
      })
    );
  };

  // Function to remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
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
          subtotal={subtotal}
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
                variant="destructive"
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
                  {cartItems.map((item) => (
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
                        <p className="text-[10px] font-semibold text-[#52b661]">
                          {formatToNaira(
                            item.selling_price || item?.amount || 0
                          )}
                        </p>
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
                        {/* Show discount applied indicator */}
                        {item.discount_threshold &&
                          item.discount &&
                          (item.cartQuantity || 1) >=
                            item.discount_threshold && (
                            <p className="text-[8px] text-green-600 font-semibold">
                              Discount Applied: -{formatToNaira(item.discount)}
                            </p>
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
                            <MinusCircle size={3} className="text-[#52b661]" />
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
                              onClick={() => decrementDecimalQuantity(item.id)}
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
                              onClick={() => incrementDecimalQuantity(item.id)}
                              disabled={
                                (item.cartQuantity || 0.5) >=
                                (item.quantity ?? Infinity)
                              }
                            >
                              <PlusCircle size={2} className="text-[#52b661]" />
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
                  ))}
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

              {/* Automatic Discount Section */}
              {automaticDiscountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600 text-xs">
                      Discount Applied
                    </span>
                    {eligibleItems.length > 0 && (
                      <div className="text-[10px] text-gray-500">
                        Items:{" "}
                        {eligibleItems.map((item) => item.name).join(", ")}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-xs text-green-600">
                    -{formatToNaira(automaticDiscountAmount)}
                  </span>
                </div>
              )}

              {/* Remove the manual discount button */}
              {/* {discount ? (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600 text-xs">
                      Discount (
                      {discount.type === "fixed" ? "Fixed" : "Percentage"})
                    </span>
                    {discount.type === "percentage" && (
                      <span className="text-xs ml-1">({discount.value}%)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-red-500">
                      -{formatToNaira(discountAmount)}
                    </span>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {user?.role === "OWNER" && (
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 text-xs py-2 border-[#52b661]/30 hover:border-[#52b661] hover:bg-[#52b661]/10"
                      onClick={() => setIsDiscountModalOpen(true)}
                      disabled={eligibleItems.length === 0}
                    >
                      <Percent size={14} />
                      Add Discount
                    </Button>
                  )}
                </>
              )} */}

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
                disabled={cartItems.length === 0}
              >
                <p className="text-sm">Complete Order</p>
              </Button>
            </div>
          </div>

          {/* Comment out Discount Modal */}
          {/* <DiscountModal
            open={isDiscountModalOpen}
            onOpenChange={setIsDiscountModalOpen}
            onApplyDiscount={handleApplyDiscount}
            subtotal={subtotal}
            eligibleItems={eligibleItems}
          /> */}

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
