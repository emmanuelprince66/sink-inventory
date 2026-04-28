"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import FeatureUnavailable from "@/components/FeatureUnavailable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/toast/useToast";
import { useCheckoutHook } from "@/hooks/useCheckoutHook";
import { useActiveCartState, useCartStore } from "@/lib/store/cart-store";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { format } from "date-fns";
import { ArrowBigLeftDash, CalendarIcon, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AddBankForm } from "../settings/bank/AddBankForm";

// @react-pdf/renderer is browser-only and breaks under Next.js SSR + tab switches.
// Lazy-loading on the client only avoids the "Eo is not a function" runtime error.
const PrintReceiptView = dynamic(() => import("./PrintReceiptView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-10">
      <Spinner />
    </div>
  ),
});

const ReceiptPage = ({
  cart,
  attendant,
  clearCartFunc,
  customer,
  discount,
  discountAmount,
  setShowReceipt,
  vatInfo,
  businessData,
  subtotal,
  total,
}: {
  cart: any;
  attendant: any;
  customer: any;
  clearCartFunc: any;
  vatInfo: any;
  businessData: any;
  discount: any;
  discountAmount: any;
  setShowReceipt: any;
  subtotal: any;
  total: any;
}) => {
  console.log("vatInfo in checkout", vatInfo);

  // ---- Per-sale state (lives in active cart slot — isolated per Sale tab) ----
  const activeCartId = useCartStore((s) => s.activeCartId);
  const { state: cartState, update: updateCartState } = useActiveCartState();
  const selectedDate = cartState.selectedDate;
  const dueDate = cartState.dueDate;
  const isChecked = cartState.isChecked;
  const paymentMethod = cartState.paymentMethod;
  const createSaleResponse = cartState.saleResponse;
  const selectedBank = cartState.selectedBank;
  const selectedBankForSplitPayment = cartState.selectedAccount;
  const partialAmount = cartState.partialAmount;
  const partialPaymentMethod = cartState.partialPaymentMethod;
  const splitPayments = cartState.splitPayments as Array<{
    method: string;
    amount: number;
    bank?: string;
    dueDate?: Date;
  }>;
  const tempSplitPayment = cartState.tempSplitPayment;
  const remainingAmount = cartState.remainingAmount;

  const setSelectedDate = (v: Date | undefined) =>
    updateCartState({ selectedDate: v });
  const setDueDate = (v: Date | undefined) => updateCartState({ dueDate: v });
  const setIsChecked = (v: boolean) => updateCartState({ isChecked: v });
  const setPaymentMethod = (v: string) =>
    updateCartState({ paymentMethod: v });
  const setCreateSaleResponse = (v: any) =>
    updateCartState({ saleResponse: v });
  const setSelectedBank = (v: string) => updateCartState({ selectedBank: v });
  const setSelectedBankForSplitPayment = (v: string) =>
    updateCartState({ selectedAccount: v });
  const setPartialAmount = (v: string) =>
    updateCartState({ partialAmount: v });
  const setPartialPaymentMethod = (v: string) =>
    updateCartState({ partialPaymentMethod: v });
  const setSplitPayments = (
    v:
      | Array<{ method: string; amount: number; bank?: string; dueDate?: Date }>
      | ((
          prev: Array<{
            method: string;
            amount: number;
            bank?: string;
            dueDate?: Date;
          }>,
        ) => Array<{
          method: string;
          amount: number;
          bank?: string;
          dueDate?: Date;
        }>),
  ) => {
    const next = typeof v === "function" ? v(splitPayments) : v;
    updateCartState({ splitPayments: next });
  };
  const setTempSplitPayment = (
    v:
      | { method: string; amount: string; bank: string }
      | ((prev: { method: string; amount: string; bank: string }) => {
          method: string;
          amount: string;
          bank: string;
        }),
  ) => {
    const next = typeof v === "function" ? v(tempSplitPayment) : v;
    updateCartState({ tempSplitPayment: next });
  };
  const setRemainingAmount = (v: number) =>
    updateCartState({ remainingAmount: v });
  // ---- end per-sale state ----

  const { user } = useUserRole();
  const business_id = useBusinessStore((state) => state.business_id);

  const [payloadData, setPayloadData] = useState({});
  console.log("payloadData", payloadData);

  const { showToast } = useToast();
  const [openAddBankModal, setOpenAddBankModal] = useState(false);
  const openAddBankModalFunc = () => setOpenAddBankModal(true);
  const closeAddBankModal = () => setOpenAddBankModal(false);

  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);

  const [sureModal, setSureModal] = useState(false);

  const closeSureModal = () => setSureModal(false);
  const openSureModal = () => {
    if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
      handleOpenNotSubscribeModal?.();
      return;
    }

    // Construct the payload
    const payload: { [key: string]: number } = {};

    console.log("splitPayments", splitPayments);
    console.log("selectedBank", selectedBank);
    console.log("temp", tempSplitPayment);
    if (splitPayments.length === 0 && selectedBank) {
      // Handle case when splitPayments is empty but selectedBank exists
      const bankInfo = BankData.data.find(
        (bank: any) => bank.id === selectedBank,
      );
      if (bankInfo) {
        const bankKey = bankInfo.bank_name.toLowerCase();
        payload[bankKey] = total;
      }
    } else {
      // Original logic for when splitPayments has items
      splitPayments.forEach((payment) => {
        if (payment.method === "CASH") {
          payload["cash"] = payment.amount;
        } else if (payment.method === "BANK" && payment.bank) {
          const bankInfo = BankData.data.find(
            (bank: any) => bank.id === payment.bank,
          );
          if (bankInfo) {
            const bankKey = bankInfo.bank_name.toLowerCase();
            payload[bankKey] = payment.amount;
          }
        }
      });
    }

    setPayloadData(payload);
    setSureModal(true);
  };

  console.log("payload", payloadData);
  const [splitPaymentError, setSplitPaymentError] = useState("");
  // Per-slot — so completing Sale 1 doesn't keep the print receipt mounted
  // when user clicks Sale 2 tab.
  const showPrintReceiptView = cartState.showPrintReceiptView;
  const setShowPrintReceiptView = (v: boolean) =>
    updateCartState({ showPrintReceiptView: v });

  const isUserSubscribed = useIsUserSubscribeStore(
    (state) => state.is_subscribed,
  );

  const {
    BusinessData,
    createSale,
    createSalePending,
    BankDataLoading,
    BankData,
    BankError,
    BusinessDataLoading,
  } = useCheckoutHook({
    closeSureModal,
    setShowPrintReceiptView,
    setCreateSaleResponse,
  });

  console.log("BankError----5-neek55", BankError);

  // Get the first business from the array
  const business = BusinessData?.data || {};

  console.log("createSaleResponse", createSaleResponse);

  // Set initial remaining amount when the component loads or when total changes
  useEffect(() => {
    setRemainingAmount(total);
  }, [total]);

  // Reset payment method fields when customer selection changes
  useEffect(() => {
    setPaymentMethod("");
    setSelectedBank("");
    setPartialAmount("");
    setPartialPaymentMethod("");
    setDueDate(undefined);
  }, [customer]);

  // Update remaining amount when split payments change
  useEffect(() => {
    const paidAmount = splitPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    setRemainingAmount(total - paidAmount);
  }, [splitPayments, total]);

  // Define payment method options based on customer presence
  const paymentMethodOptions = customer
    ? [
        { label: "Cash", value: "CASH" },
        { label: "Credit", value: "CREDIT" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Bank Transfer", value: "BANK" },
        { label: "Advance", value: "ADVANCE" },
      ]
    : [
        { label: "Cash", value: "CASH" },
        { label: "Bank Transfer", value: "BANK" },
      ];

  // For split payments, filter out methods already used
  const availableSplitPaymentMethods = paymentMethodOptions.filter(
    (option) =>
      (option.value !== "BANK"
        ? !splitPayments.some((payment) => payment.method === option.value)
        : true) && option.value !== "PARTIAL",
  );

  const handleAddSplitPayment = () => {
    setSplitPaymentError("");

    if (!tempSplitPayment.method) {
      setSplitPaymentError("Payment method is required");
      return;
    }

    if (!tempSplitPayment.amount || parseFloat(tempSplitPayment.amount) <= 0) {
      setSplitPaymentError("Valid amount is required");
      return;
    }

    const amount = parseFloat(tempSplitPayment.amount);

    if (amount > remainingAmount) {
      setSplitPaymentError("Amount cannot exceed remaining balance");
      return;
    }

    if (tempSplitPayment.method === "BANK" && !tempSplitPayment.bank) {
      setSplitPaymentError("Bank selection is required for bank transfers");
      return;
    }

    if (tempSplitPayment.method === "CREDIT" && !dueDate) {
      setSplitPaymentError("Due date is required for credit payments");
      return;
    }

    const newPayment = {
      method: tempSplitPayment.method,
      amount: amount,
      ...(tempSplitPayment.bank && { bank: tempSplitPayment.bank }),
      ...(dueDate && { dueDate }),
    };

    console.log("newPayment", newPayment);

    setSplitPayments([...splitPayments, newPayment]);

    setTempSplitPayment({
      method: "",
      amount: "",
      bank: "",
    });
    setDueDate(undefined);
  };

  const removeSplitPayment = (index: number) => {
    const updatedPayments = [...splitPayments];
    updatedPayments.splice(index, 1);
    setSplitPayments(updatedPayments);
  };

  // Create the final payload
  const createPayload = () => {
    if (isChecked) {
      if (remainingAmount > 0) {
        showToast("All payments must be covered", "error");
        return null;
      }

      return {
        ...cart,
        attendant: attendant,
        customer: customer,
        payments: splitPayments,
        dueDate: selectedDate ? selectedDate.toISOString() : null,
      };
    } else {
      if (!paymentMethod) {
        showToast("Payment method is required", "error");
        return null;
      }

      if (paymentMethod === "BANK" && !selectedBank) {
        showToast("Bank selection is required", "error");
        return null;
      }

      if (paymentMethod === "CREDIT" && !dueDate) {
        showToast("Due date is required for credit payments", "error");
        return null;
      }

      if (paymentMethod === "PARTIAL") {
        if (
          !partialAmount ||
          parseFloat(partialAmount) <= 0 ||
          parseFloat(partialAmount) >= total
        ) {
          console.log(
            "Valid partial amount is required (greater than 0 and less than total)",
          );

          return null;
        }
        if (!dueDate) {
          showToast("Due date is required for partial payments", "error");
          return null;
        }
        if (!partialPaymentMethod) {
          showToast("Partial payment method is required", "error");
          return null;
        }
        if (partialPaymentMethod === "BANK" && !selectedBank) {
          showToast("Bank selection is required for bank transfer", "error");
          return null;
        }
      }

      return {
        ...cart,
        attendant: attendant,
        customer: customer,
        payment_method: paymentMethod,
        ...(selectedBank && { bank_id: selectedBank }),
        ...(partialAmount && { partial_amount: parseFloat(partialAmount) }),
        ...(dueDate && { due_date: dueDate.toISOString() }),
        ...(partialPaymentMethod && {
          partial_payment_method: partialPaymentMethod,
        }),
        sales_date: selectedDate ? selectedDate.toISOString() : null,
      };
    }
  };

  console.log("cart", cart);

  const handleSubmitPayment = () => {
    const payload = createPayload();

    if (payload) {
      const apiPayload: any = {
        date: selectedDate
          ? format(selectedDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),

        description: "Sales transaction",
        products: cart.map((item: any) => ({
          id: item.id,
          quantity: item.cartQuantity || 1,
          type: item.type,
          unit_price:
            item?.type === "SERVICE" ? item.amount : item?.selling_price,
        })),
        ...(customer?.id && { customer: customer.id }),
        ...(attendant?.id && { attendant: attendant.id }),
      };

      if (isChecked) {
        apiPayload.method = "MULTIPLE";

        apiPayload.bank = selectedBankForSplitPayment;
        apiPayload.multiple_payments = splitPayments.map((payment) => ({
          name: payment.method,
          amount: payment.amount.toString(),
          ...(payment.bank && { bank: payment.bank }),
          ...(payment.dueDate && {
            due_date: format(payment.dueDate, "yyyy-MM-dd"),
          }),
        }));
        apiPayload.amount_paid = total.toString();
      } else {
        apiPayload.method = paymentMethod;
        apiPayload.amount_paid =
          paymentMethod === "PARTIAL" ? partialAmount : total.toString();

        if (paymentMethod === "PARTIAL") {
          apiPayload.partial_method = partialPaymentMethod;
          if (partialPaymentMethod === "BANK") {
            apiPayload.bank = selectedBank;
          }
        }

        if (paymentMethod === "BANK") {
          apiPayload.bank = selectedBank;
        }

        if (dueDate) {
          apiPayload.due_date = format(dueDate, "yyyy-MM-dd");
        }
      }

      console.log("apiPayload", apiPayload);

      createSale({
        apiPayload,
        businessId: business_id,
      });
    }
  };

  const isSubmitDisabled = () => {
    if (isChecked) {
      return remainingAmount > 0;
    } else {
      if (!paymentMethod) return true;
      if (paymentMethod === "BANK" && !selectedBank) return true;
      if (paymentMethod === "CREDIT" && !dueDate) return true;
      if (paymentMethod === "PARTIAL") {
        if (!partialAmount || !dueDate || !partialPaymentMethod) return true;
        if (
          parseFloat(partialAmount) <= 0 ||
          parseFloat(partialAmount) >= total
        )
          return true;
        if (partialPaymentMethod === "BANK" && !selectedBank) return true;
      }
      return false;
    }
  };

  return (
    <>
      {showPrintReceiptView ? (
        <PrintReceiptView
          key={
            (createSaleResponse as any)?.data?.id ??
            (createSaleResponse as any)?.id ??
            activeCartId
          }
          vatInfo={vatInfo}
          setShowReceipt={setShowReceipt}
          setShowPrintReceiptView={setShowPrintReceiptView}
          createSaleResponse={createSaleResponse}
          cart={cart}
          payloadData={payloadData}
          business={business}
          attendant={attendant}
          discount={discount}
          customer={customer}
          total={total}
          subtotal={subtotal}
          clearCartFunc={clearCartFunc}
          discountAmount={discountAmount}
        />
      ) : (
        <div className="w-full flex flex-col items-start gap-3">
          <div
            className="w-10 h-10 rounded-full p-2 bg-green-50 cursor-pointer"
            onClick={() => setShowReceipt(false)}
          >
            <ArrowBigLeftDash color="green" />
          </div>

          <div className="w-full">
            <p className="text-xs mb-1">Sales Date</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full pl-3 text-left font-normal border border-primary-green-300 bg-white"
                >
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a sales date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  className="bg-white"
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full">
            <p className="text-xs mb-1">Sales Summary</p>

            <div className="w-full bg-primary-green-200 p-1 rounded-lg flex items-center gap-4">
              {business?.logo && (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              )}
              <div>
                <p className="text-xs ">Store : {business?.name}</p>
                <p className=" text-xs">
                  Address: {business?.city}, {business?.state},{" "}
                  {business?.country}
                </p>
                {business?.owner?.phone && (
                  <p className=" text-xs">Phone: {business.owner.phone}</p>
                )}
                {business?.owner?.email && (
                  <p className=" text-xs">Email: {business.owner.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="w-full mt-4">
            <p className="text-xs mb-1">Items</p>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary-green-200 text-left">
                    <th className="p-2 text-xs border border-primary-green-300">
                      #
                    </th>
                    <th className="p-2 text-xs border border-primary-green-300">
                      Item Details
                    </th>
                    <th className="p-2 text-xs border border-primary-green-300">
                      Qty
                    </th>
                    <th className="p-2 text-xs border border-primary-green-300">
                      Price
                    </th>
                    <th className="p-2 text-xs border border-primary-green-300">
                      Sub-Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item: any, index: number) => (
                    <tr
                      key={item.id}
                      className="border-b border-primary-green-300"
                    >
                      <td className="p-1 border border-primary-green-300">
                        {index + 1}
                      </td>
                      <td className="p-1 border border-primary-green-300">
                        <div className="flex items-center gap-1">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-5 h-5 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[11px]">
                              {item.name}
                            </p>
                            {item.category && (
                              <p className="text-[10px] text-gray-500">
                                {item.category}
                              </p>
                            )}
                            {item.allow_tax && vatInfo?.enabled && (
                              <span className="text-[8px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                +VAT
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 border text-[10px] border-primary-green-300">
                        {item.cartQuantity || 1}
                      </td>
                      <td className="p-2 text-[10px]  border border-primary-green-300">
                        ₦
                        {item.amount?.toLocaleString() ||
                          item.selling_price?.toLocaleString() ||
                          "0"}
                      </td>
                      <td className="p-2 text-[10px]  border border-primary-green-300">
                        {(item.amount || item.selling_price || 0) *
                          (item.cartQuantity || 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {discount && (
                    <tr className="bg-primary-green-200">
                      <td
                        colSpan={4}
                        className="p-2 border text-[11px] border-primary-green-300 text-right"
                      >
                        Discount (
                        {discount.type === "fixed"
                          ? "Fixed"
                          : `${discount.value}%`}
                        ):
                      </td>
                      <td className="p-2 text-[11px] border border-primary-green-300 text-red-500">
                        -{formatToNaira(discountAmount)}
                      </td>
                    </tr>
                  )}
                  {vatInfo?.enabled && vatInfo?.amount > 0 && (
                    <>
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className="p-2 border text-[11px] border-primary-green-300 text-right text-gray-500"
                        >
                          Subtotal (before VAT):
                        </td>
                        <td className="p-2 text-[11px] border border-primary-green-300 font-semibold">
                          {formatToNaira(total)}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className="p-2 border text-[11px] border-primary-green-300 text-right text-blue-600"
                        >
                          VAT ({vatInfo.rate}%):
                        </td>
                        <td className="p-2 text-[11px] border border-primary-green-300 text-blue-600 font-semibold">
                          +{formatToNaira(vatInfo.amount)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-primary-green-200 font-bold">
                    <td
                      colSpan={4}
                      className="p-2 border text-[11px] border-primary-green-300 text-right"
                    >
                      Total:
                    </td>
                    <td className="p-2 text-[11px] border border-primary-green-300">
                      {formatToNaira(
                        vatInfo?.enabled ? vatInfo.totalWithVat : total,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* customer details */}
          <p className="text-xs mb-1">Customer details</p>

          {customer ? (
            <div className=" w-full bg-primary-green-200 p-2 rounded-lg">
              <p>{customer.name || "N/A"}</p>
            </div>
          ) : (
            <div className=" w-full bg-primary-green-200 p-2 text-xs rounded-lg">
              <p>No customer selected</p>
            </div>
          )}

          {/* attendant details */}
          <p className="text-xs mb-1">Attendant responsible</p>
          {attendant ? (
            <div className=" w-full bg-primary-green-200 p-2 text-xs rounded-lg">
              <p>{attendant.name || "N/A"}</p>
            </div>
          ) : (
            <div className=" w-full bg-primary-green-200 p-2 text-xs rounded-lg">
              <p>No attendant selected</p>
            </div>
          )}

          {/* Split Bill Toggle */}
          <div className="w-full bg-primary-green-200 flex flex-end p-1 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  setIsChecked(!isChecked);
                  setSplitPayments([]);
                  setPaymentMethod("");
                  setSelectedBank("");
                  setPartialAmount("");
                  setPartialPaymentMethod("");
                  setDueDate(undefined);
                  setTempSplitPayment({
                    method: "",
                    amount: "",
                    bank: "",
                  });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              <span className="ml-3 text-sm font-medium text-[10px] text-gray-700">
                Split Bill (Multiple Payment Methods)
              </span>
            </label>
          </div>

          {/* Payment Method Section */}
          {!isChecked && (
            <div className="w-full space-y-4">
              <p className="text-xs mb-1">Payment Method</p>
              <Select
                value={paymentMethod}
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  setSelectedBank("");
                  setPartialAmount("");
                  setPartialPaymentMethod("");
                  setDueDate(undefined);
                }}
              >
                <SelectTrigger className="w-full bg-white border border-primary-green-300">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {paymentMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {paymentMethod === "BANK" && (
                <div className="space-y-2 mt-2">
                  {BankError !== null && BankError !== undefined && (
                    <FeatureUnavailable
                      errorCode={BankError?.data?.error}
                      settingsPath="/settings/"
                      settingsLabel="Manage Subscription"
                    />
                  )}

                  <p className="text-xs">Select Bank</p>
                  {BankData?.data?.length > 0 ? (
                    <Select
                      value={selectedBank}
                      onValueChange={setSelectedBank}
                    >
                      <SelectTrigger className="w-full bg-white border border-primary-green-300">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        {BankData.data.map((bank: any) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.bank_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500 mb-3 text-center">
                        You haven't added any bank accounts yet.
                      </p>
                      <button
                        onClick={openAddBankModalFunc}
                        className="px-4 py-2 cursor-pointer bg-primary-green-100 text-white rounded-md hover:bg-primary-green-300 transition-colors text-sm"
                      >
                        Add Bank
                      </button>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "CREDIT" && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs">Due Date</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal bg-white border border-primary-green-300"
                      >
                        {dueDate ? (
                          format(dueDate, "PPP")
                        ) : (
                          <span>Pick a due date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        className="bg-white"
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {paymentMethod === "PARTIAL" && (
                <div className="space-y-4 mt-2">
                  <div>
                    <p className="text-xs mb-1">Partial Amount</p>
                    <Input
                      type="number"
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-white border border-primary-green-300"
                    />
                    {partialAmount && parseFloat(partialAmount) >= total && (
                      <p className="text-xs text-red-500 mt-1">
                        Partial amount must be less than total amount
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs mb-1">Partial Payment Method</p>
                    <Select
                      value={partialPaymentMethod}
                      onValueChange={(value) => {
                        setPartialPaymentMethod(value);
                        setSelectedBank("");
                      }}
                    >
                      <SelectTrigger className="w-full bg-white border border-primary-green-300">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {partialPaymentMethod === "BANK" && (
                    <div className="space-y-2 mt-2">
                      <p className="text-xs">Select Bank</p>
                      <Select
                        value={selectedBank}
                        onValueChange={setSelectedBank}
                      >
                        <SelectTrigger className="w-full bg-white border border-primary-green-300">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          {BankData?.data?.map((bank: any) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.bank_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <p className="text-xs mb-1">Due Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal bg-white border border-primary-green-300"
                        >
                          {dueDate ? (
                            format(dueDate, "PPP")
                          ) : (
                            <span>Pick a due date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="bg-white"
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Split Bill Section */}
          {isChecked && (
            <div className="w-full space-y-4">
              <div
                className={`w-full p-4 rounded-lg ${
                  remainingAmount > 0
                    ? "bg-orange-100 text-orange-800"
                    : "bg-green-100 text-green-800"
                } font-medium`}
              >
                {remainingAmount > 0
                  ? `Remaining Amount: ₦${remainingAmount.toLocaleString()}`
                  : "All payments have been added ✓"}
              </div>

              <div className="w-full p-4 border border-primary-green-300 rounded-lg space-y-4">
                <p className="font-medium">Add Payment</p>

                <div className="space-y-2">
                  <p className="text-xs">Payment Method</p>
                  <Select
                    value={tempSplitPayment.method}
                    onValueChange={(value) =>
                      setTempSplitPayment({
                        ...tempSplitPayment,
                        method: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full bg-white border border-primary-green-300">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {availableSplitPaymentMethods.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs">Amount</p>
                  <Input
                    type="number"
                    value={tempSplitPayment.amount}
                    onChange={(e) =>
                      setTempSplitPayment({
                        ...tempSplitPayment,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter amount"
                    className="w-full bg-white border border-primary-green-300"
                  />
                  {tempSplitPayment.amount &&
                    parseFloat(tempSplitPayment.amount) > remainingAmount && (
                      <p className="text-xs text-red-500">
                        Amount cannot exceed remaining balance
                      </p>
                    )}
                </div>

                {tempSplitPayment.method === "BANK" && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs">Select Bank</p>
                    {BankData?.data?.length > 0 ? (
                      <Select
                        value={tempSplitPayment.bank}
                        onValueChange={(value) => {
                          setSelectedBankForSplitPayment(value);
                          setTempSplitPayment({
                            ...tempSplitPayment,
                            bank: value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full bg-white border border-primary-green-300">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          {BankData.data.map((bank: any) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.bank_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500 mb-3 text-center">
                          No bank accounts available. Please add a bank account
                          first.
                        </p>
                        <button
                          onClick={openAddBankModalFunc}
                          className="px-4 py-2 cursor-pointer bg-primary-green-100 text-white rounded-md hover:bg-primary-green-300 transition-colors text-sm"
                        >
                          Add Bank
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tempSplitPayment.method === "CREDIT" && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs">Due Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal bg-white border border-primary-green-300"
                        >
                          {dueDate ? (
                            format(dueDate, "PPP")
                          ) : (
                            <span>Pick a due date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="bg-white"
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {splitPaymentError && (
                  <p className="text-xs text-red-500">{splitPaymentError}</p>
                )}

                <Button
                  className="w-full bg-primary-green-300 text-white mt-2"
                  onClick={handleAddSplitPayment}
                >
                  Add Payment
                </Button>
              </div>

              {splitPayments.length > 0 && (
                <div className="w-full p-4 border border-primary-green-300 rounded-lg">
                  <p className="font-medium mb-4">Payment Summary</p>
                  <div className="space-y-2">
                    {splitPayments.map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {paymentMethodOptions.find(
                              (opt) => opt.value === payment.method,
                            )?.label || payment.method}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₦{payment.amount.toLocaleString()}
                          </p>
                          {payment.bank && (
                            <p className="text-xs text-gray-500">
                              Bank: {payment.bank}
                            </p>
                          )}
                          {payment.dueDate && (
                            <p className="text-xs text-gray-500">
                              Due: {format(payment.dueDate, "PPP")}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeSplitPayment(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-5 mb-3 w-full">
            <Button
              className="w-full bg-primary-green-300 text-white"
              onClick={openSureModal}
              disabled={isSubmitDisabled()}
            >
              Pay{" "}
              {/* {formatToNaira(vatInfo?.enabled ? vatInfo.totalWithVat : total)} */}
            </Button>
          </div>

          <CustomModal
            isOpen={sureModal}
            onClose={closeSureModal}
            trigger={false}
            title=""
          >
            <div className="flex w-full items-center flex-col justify-center">
              <p className="text-sm text-gray-500">
                Are you sure you want to make this payment?
              </p>

              <div className="flex gap-3 justify-center mt-4  items-center w-full">
                <Button
                  className="bg-primary-green-300 text-white "
                  onClick={handleSubmitPayment}
                  disabled={createSalePending}
                >
                  {createSalePending ? <Spinner /> : "Yes"}
                </Button>

                <Button
                  variant={"outline"}
                  className="border border-primary-green-300 text-black"
                  onClick={closeSureModal}
                >
                  No
                </Button>
              </div>
            </div>
          </CustomModal>

          <CustomModal
            isOpen={openAddBankModal}
            onClose={closeAddBankModal}
            trigger={false}
            title="Add Bank"
          >
            <AddBankForm closeModal={closeAddBankModal} />
          </CustomModal>
        </div>
      )}

      <CustomModal
        isOpen={showNotSubscribeModal}
        onClose={handleCloseNotSubscribeModal}
        trigger={false}
        title="Subscription Details"
      >
        <div className="w-full ">
          <UserNotSubscribe />
        </div>
      </CustomModal>
    </>
  );
};

export default ReceiptPage;
