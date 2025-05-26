"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
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
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import { format } from "date-fns";
import { ArrowBigLeftDash, CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import PrintReceiptView from "./PrintReceiptView";

const ReceiptPage = ({
  cart,
  attendant,
  clearCartFunc,
  customer,
  setShowReceipt,
}: {
  cart: any;
  attendant: any;
  customer: any;
  clearCartFunc: any;
  setShowReceipt: any;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const business_id = useBusinessStore((state) => state.business_id);
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [createSaleResponse, setCreateSaleResponse] = useState(null);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBankForSplitPayment, setSelectedBankForSplitPayment] =
    useState("");
  const [partialAmount, setPartialAmount] = useState("");
  const [partialPaymentMethod, setPartialPaymentMethod] = useState(""); // New state for partial payment method
  const [splitPayments, setSplitPayments] = useState<
    Array<{
      method: string;
      amount: number;
      bank?: string;
      dueDate?: Date;
    }>
  >([]);
  const [tempSplitPayment, setTempSplitPayment] = useState({
    method: "",
    amount: "",
    bank: "",
  });

  // console.log("tempSplitPayment", tempSplitPayment);

  // console.log("partial_payment", partialPaymentMethod);

  const { showToast } = useToast();

  // console.log("sales response", createSaleResponse);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const [sureModal, setSureModal] = useState(false);

  const closeSureModal = () => setSureModal(false);
  const openSureModal = () => setSureModal(true);
  const [splitPaymentError, setSplitPaymentError] = useState(""); // For split payment errors
  const [showPrintReceiptView, setShowPrintReceiptView] = useState(false);
  // console.log("selectedBankForSplitPayment", selectedBankForSplitPayment);

  const {
    BusinessData,
    createSale,
    createSalePending,
    BankDataLoading,
    BankData,
    BusinessDataLoading,
  } = useCheckoutHook({
    closeSureModal,
    setShowPrintReceiptView,
    setCreateSaleResponse,
  });

  // Get the first business from the array
  const business = BusinessData?.data?.[0] || {};

  // Calculate total
  const total = cart.reduce((sum: number, item: any) => {
    return (
      sum + (item.amount || item.selling_price || 0) * (item.cartQuantity || 1)
    );
  }, 0);

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
      0
    );
    setRemainingAmount(total - paidAmount);
  }, [splitPayments, total]);

  // Define payment method options based on customer presence
  const paymentMethodOptions = customer
    ? [
        { label: "Cash", value: "CASH" },
        { label: "Mycliq", value: "MYCLIQ" },
        { label: "Credit", value: "CREDIT" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Bank Transfer", value: "BANK" },
        { label: "Advance", value: "ADVANCE" },
      ]
    : [
        { label: "Cash", value: "CASH" },
        { label: "Mycliq", value: "MYCLIQ" },
        { label: "Bank Transfer", value: "BANK" },
      ];

  // For split payments, filter out methods already used
  const availableSplitPaymentMethods = paymentMethodOptions.filter(
    (option) =>
      !splitPayments.some((payment) => payment.method === option.value) &&
      option.value !== "PARTIAL" // Remove partial option for split payments
  );

  const handleAddSplitPayment = () => {
    setSplitPaymentError(""); // Reset error message

    // Validate inputs
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

    // Bank validation for bank transfer
    if (tempSplitPayment.method === "BANK" && !tempSplitPayment.bank) {
      setSplitPaymentError("Bank selection is required for bank transfers");
      return;
    }

    // Due date validation for credit payments
    if (tempSplitPayment.method === "CREDIT" && !dueDate) {
      setSplitPaymentError("Due date is required for credit payments");
      return;
    }

    // Add to split payments
    const newPayment = {
      method: tempSplitPayment.method,
      amount: amount,
      ...(tempSplitPayment.bank && { bank: tempSplitPayment.bank }),
      ...(dueDate && { dueDate }),
    };

    console.log("newPayment", newPayment);

    setSplitPayments([...splitPayments, newPayment]);

    // Reset temp values
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
      // For split payments
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
      // For single payment
      // Validate based on payment method
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
            "Valid partial amount is required (greater than 0 and less than total)"
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

  const handleSubmitPayment = () => {
    const payload = createPayload();
    if (payload) {
      // Construct the final payload according to the API structure
      const apiPayload: any = {
        date: selectedDate
          ? format(selectedDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),

        description: "Sales transaction", // You can customize this
        products: cart.map((item: any) => ({
          id: item.id,
          quantity: item.cartQuantity || 1,
          unit_price: item.selling_price || 0,
        })),
        ...(customer?.id && { customer: customer.id }),
        ...(attendant?.id && { attendant: attendant.id }),
      };

      if (isChecked) {
        // For split payments
        apiPayload.method = "MULTIPLE";

        apiPayload.bank = selectedBankForSplitPayment;
        apiPayload.multiple_payments = splitPayments.map((payment) => ({
          name: payment.method,
          amount: payment.amount.toString(),
          // ...(payment.bank && { bank: payment.bank }),
          ...(payment.dueDate && {
            due_date: format(payment.dueDate, "yyyy-MM-dd"),
          }),
        }));
        apiPayload.amount_paid = total.toString();
      } else {
        // For single payment
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

      console.log("API Payload:", apiPayload);

      createSale({
        apiPayload,
        businessId: business_id,
      });

      // Here you would submit the payload to your API endpoint
      // Example: submitToApi(apiPayload);
    }
  };
  // Determine if the submit button should be disabled
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
          setShowReceipt={setShowReceipt}
          setShowPrintReceiptView={setShowPrintReceiptView}
          createSaleResponse={createSaleResponse}
          cart={cart}
          business={business}
          clearCartFunc={clearCartFunc}
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
                  // disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full">
            <p className="text-xs mb-1">Sales Summary</p>

            <div className="w-full bg-primary-green-200 p-4 rounded-lg flex items-center gap-4">
              {business?.logo && (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />
              )}
              <div>
                <p className="text-sm ">Store : {business?.name}</p>
                <p className=" text-sm">
                  Address: {business?.city}, {business?.state},{" "}
                  {business?.country}
                </p>
                {business?.owner?.phone && (
                  <p className=" text-sm">Phone: {business.owner.phone}</p>
                )}
                {business?.owner?.email && (
                  <p className=" text-sm">Email: {business.owner.email}</p>
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
                    <th className="p-2 border border-primary-green-300">#</th>
                    <th className="p-2 border border-primary-green-300">
                      Item
                    </th>
                    <th className="p-2 border border-primary-green-300">Qty</th>
                    <th className="p-2 border border-primary-green-300">
                      Price
                    </th>
                    <th className="p-2 border border-primary-green-300">
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
                      <td className="p-2 border border-primary-green-300">
                        {index + 1}
                      </td>
                      <td className="p-2 border border-primary-green-300">
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.category && (
                              <p className="text-xs text-gray-500">
                                {item.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 border border-primary-green-300">
                        {item.cartQuantity || 1}
                      </td>
                      <td className="p-2 border border-primary-green-300">
                        ₦
                        {item.amount?.toLocaleString() ||
                          item.selling_price?.toLocaleString() ||
                          "0"}
                      </td>
                      <td className="p-2 border border-primary-green-300">
                        {(item.amount || item.selling_price || 0) *
                          (item.cartQuantity || 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-primary-green-200 font-bold">
                    <td
                      colSpan={4}
                      className="p-2 border border-primary-green-300 text-right"
                    >
                      Total:
                    </td>
                    <td className="p-2 border border-primary-green-300">
                      {formatToNaira(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* customer details */}
          <p className="text-xs mb-1">Customer details</p>

          {customer ? (
            <div className=" w-full bg-primary-green-200 p-4 rounded-lg">
              <p>{customer.name || "N/A"}</p>
            </div>
          ) : (
            <div className=" w-full bg-primary-green-200 p-4 rounded-lg">
              <p>No customer selected</p>
            </div>
          )}

          {/* customer details */}
          <p className="text-xs mb-1">Attendant responsible</p>
          {attendant && (
            <div className=" w-full bg-primary-green-200 p-4 rounded-lg">
              <p>{attendant.name || "N/A"}</p>
            </div>
          )}
          {/* Split Bill Toggle */}
          <div className="w-full bg-primary-green-200 flex flex-end p-4 rounded-lg">
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
                className="sr-only peer" // Hide default input
              />
              {/* Switch Track */}
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              {/* Optional Label */}
              <span className="ml-2 text-sm font-medium text-gray-700">
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

              {/* Conditional fields based on payment method selection */}
              {paymentMethod === "BANK" && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs">Select Bank</p>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
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
              {/* Remaining Amount Display */}
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

              {/* Split Payment Form */}
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

                {/* Conditional fields for split payment */}
                {tempSplitPayment.method === "BANK" && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs">Select Bank</p>
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
                        {BankData?.data?.map((bank: any) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.bank_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              {/* Split Payments Summary */}
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
                              (opt) => opt.value === payment.method
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
              Pay {formatToNaira(total)}
            </Button>
          </div>

          <CustomModal
            isOpen={sureModal} // FIXED: Removed the negation
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
        </div>
      )}
    </>
  );
};

export default ReceiptPage;
