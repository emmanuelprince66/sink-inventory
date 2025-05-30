"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { MinusCircle, PlusCircle, Trash2, UserPlus, Users } from "lucide-react";
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
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCartFunc: () => void;
}

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
  const { user } = useUserRole();

  // console.log("user", user);

  // console.log("customer", customer);
  // Calculate the subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return (
      total + (item.amount || item.selling_price) * (item.cartQuantity || 1)
    );
  }, 0);

  // Calculate tax (assuming 10% for example)
  const taxRate = 0.1;
  const tax = subtotal * taxRate;

  // Calculate total
  // const total = subtotal + tax;
  const total = subtotal;

  // Function to increment item quantity with check against available quantity
  const incrementQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          // Check if current quantity is less than available quantity
          // If quantity is undefined or null, default to a large number like 999
          const availableQuantity = item.quantity ?? 999;
          const currentQuantity = item.cartQuantity || 1;

          // Only increment if we haven't reached the available quantity
          if (currentQuantity < availableQuantity) {
            return { ...item, cartQuantity: currentQuantity + 1 };
          }
        }
        return item;
      })
    );
  };

  // Function to decrement item quantity
  const decrementQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && (item.cartQuantity || 1) > 1
          ? { ...item, cartQuantity: (item.cartQuantity || 1) - 1 }
          : item
      )
    );
  };

  // Function to remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const formatPrice = (price: number) => {
    return `N${price}`;
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
                className="flex items-center justify-start border border-red-600 gap-2  "
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
                      </div>

                      <div className="flex flex-col items-end space-y-2 ml-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 cursor-pointer border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                            onClick={() => decrementQuantity(item.id)}
                            disabled={(item.cartQuantity || 1) <= 1}
                          >
                            <MinusCircle size={3} className="text-[#52b661] " />
                          </Button>

                          <span className="w-8 text-center text-gray-700">
                            {item.cartQuantity || 1}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8  border-gray-200 hover:border-[#52b661] hover:bg-[#52b661]/10"
                            onClick={() => incrementQuantity(item.id)}
                            disabled={
                              (item.cartQuantity || 1) >=
                              (item.quantity ?? Infinity)
                            }
                          >
                            <PlusCircle size={3} className="text-[#52b661]" />
                          </Button>
                        </div>

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

              {/* <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div> */}

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
                <p className="text-sm"> Complete Order</p>
              </Button>
            </div>
          </div>

          {/* Customer Drawer */}
          <CustomerDrawer
            open={isCustomerDrawerOpen}
            onOpenChange={setIsCustomerDrawerOpen}
            onCustomerSelect={(selectedCustomer: any) => {
              setCustomer(selectedCustomer);
              // The drawer will automatically close because of the handleSelectCustomer logic
            }}
          />
          <AttendantDrawer
            open={isAttendantDrawerOpen}
            onOpenChange={setIsAttendantDrawerOpen}
            onAttendantSelect={(selectedAttendant: any) => {
              setAttendant(selectedAttendant);
              // The drawer will automatically close because of the handleSelectCustomer logic
            }}
          />
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
