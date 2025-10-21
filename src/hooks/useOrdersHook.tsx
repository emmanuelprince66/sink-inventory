import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import {
  UseCreateOrderMutation,
  useFetchAllOrdersQuery,
  useFetchOrderByIdQuery,
  useUpdateOrderShippingStatusMutation,
} from "@/api/orders/orders";
import { useFetchAllShippingQuery } from "@/api/shipping/shipping";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./toast/useToast";

export const useOrdersHook = ({
  page,
  searchInput,
  handleOpenNotSubscribeModal,
  id,
}: {
  page?: number;
  searchInput?: string;
  id?: string;
  handleOpenNotSubscribeModal?: () => void;
}) => {
  const { user } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();

  const params = useParams();
  const orderId = (params.id as string) || id;

  const business_id = useBusinessStore((state: any) => state.business_id);
  const isUserSubscribed = useIsUserSubscribeStore(
    (state: any) => state.is_subscribed
  );
  const queryClient = useQueryClient();

  // Component States
  const [customer, setCustomer] = useState<any | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {}
  );
  const [shippingFee, setShippingFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [selectedSalesChannel, setSelectedSalesChannel] = useState("");
  const [shippingDate, setShippingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [shippingStatus, setShippingStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);

  // Data fetching for inventory
  const {
    data: InventoryData,
    isLoading: InventoryDataLoading,
    refetch: refetchInventory,
    isRefetching: isRefetchingInventory,
  } = useGetInventoryQuery({
    params: {
      page,
      limit: 20,
      id: business_id,
      search: searchInput,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: BankData, isLoading: BankDataLoading } = useFetchBankQuery(
    business_id,
    { enabled: !!business_id }
  );

  // Filter out OUT-OF-STOCK products
  const filteredInventoryData = InventoryData?.data?.results?.data?.filter(
    (product: any) => product.status !== "OUT-OF-STOCK"
  );

  // update shipping status

  const {
    mutate: editOrderShippingStatus,
    isPending: editOrderShippingStatusLoading,
    isSuccess: editOrderShippingStatusSuccess,
  } = useUpdateOrderShippingStatusMutation({
    orderId: orderId,
  });

  const handleUpdateOrderStatus = (status: string) => {
    const payload = {
      status: status,
    };
    console.log("payload", payload);
    editOrderShippingStatus({ orderId, payload });
  };
  // fetch order by id

  const {
    data: OrderIdData,
    isLoading: OrderIdDataLoading,
    refetch: OrderIdDataRefetch,
  } = useFetchOrderByIdQuery(orderId, { enabled: !!orderId });

  // Data fetching for orders
  const {
    data: OrderData,
    isLoading: OrderDataLoading,
    refetch: refetchOrderData,
    isRefetching: isRefetchingOrderData,
  } = useFetchAllOrdersQuery({
    params: {
      page,
      limit: 20,
      id: business_id,
      search: searchInput,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch customers
  const { data: CustomersData, isLoading: CustomersLoading } =
    useGetCustomerQuery({
      params: { id: business_id },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5,
    });

  // Mutation for creating order
  const { mutate: CreateOrder, isPending: CreateOrderLoading } =
    UseCreateOrderMutation({
      businessId: business_id,
      onSuccess: (data) => {
        showToast(data.message, "success");

        queryClient.invalidateQueries({
          queryKey: [queryKey.orders.getAllOrders],
        });
        router.push(`/orders`); // Redirect to orders list
      },
    });

  // Product management functions
  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    setProductErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });
  };

  const getAvailableQuantity = (productId: string) => {
    const product = filteredInventoryData?.find((p: any) => p.id === productId);
    return product?.quantity || 0;
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    const availableQty = getAvailableQuantity(productId);

    if (quantity > availableQty) {
      setProductErrors((prev) => ({
        ...prev,
        [productId]: `Only ${availableQty} units available`,
      }));
    } else {
      setProductErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    }

    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  const getProductPrice = (product: any) => {
    return product.selling_price || product.amount || 0;
  };

  // Get discount for a product based on quantity and threshold
  const getProductDiscount = (product: any) => {
    const quantity = product.quantity || 1;
    const discountThreshold = product.discount_threshold;
    const discountAmount = product.discount || 0;

    // Only apply discount if threshold is set and quantity meets/exceeds it
    if (
      discountThreshold &&
      quantity >= discountThreshold &&
      discountAmount > 0
    ) {
      return discountAmount;
    }

    return 0;
  };

  // Check if product qualifies for discount
  const isDiscountApplied = (product: any) => {
    return getProductDiscount(product) > 0;
  };

  // Calculation functions
  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, product) => {
      const price = getProductPrice(product);
      const quantity = product.quantity || 1;
      return sum + price * quantity;
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((sum, product) => {
      const discount = getProductDiscount(product);
      const quantity = product.quantity || 1;
      return sum + discount * quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    return subtotal - totalDiscount + shippingFee + tax;
  };

  // Check if there are any quantity errors
  const hasQuantityErrors = () => {
    return Object.keys(productErrors).length > 0;
  };

  // Manual validation before submission
  const validateForm = (selectedBank?: string) => {
    // Check for subscription
    if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
      handleOpenNotSubscribeModal?.();
      return false;
    }

    // Check for quantity errors
    if (hasQuantityErrors()) {
      showToast("Please fix quantity errors before submitting", "error");
      return false;
    }

    // Check business_id
    if (!business_id) {
      showToast("Business ID is missing", "error");
      return false;
    }

    // Validate required fields
    if (!selectedSalesChannel || selectedSalesChannel.trim() === "") {
      showToast("Channel is required", "error");
      return false;
    }

    if (!customer || !customer.id) {
      showToast("Customer is required", "error");
      return false;
    }

    if (!paymentStatus) {
      showToast("Payment Status is required", "error");
      return false;
    }

    if (!shippingDate || shippingDate.trim() === "") {
      showToast("Shipping Date is required", "error");
      return false;
    }

    if (!selectedProducts || selectedProducts.length === 0) {
      showToast("At least one product is required", "error");
      return false;
    }

    if (selectedProducts && Array.isArray(selectedProducts)) {
      if (selectedProducts.length > 0 && !shippingFee) {
        showToast("Shipping Fee is required", "error");
        return false;
      }
    }

    // Validate payment method for PAID status
    if (paymentStatus === "PAID") {
      if (!selectedPaymentMethod || selectedPaymentMethod.trim() === "") {
        showToast("Payment Method is required for paid orders", "error");
        return false;
      }

      // If BANK is selected, validate bank selection
      if (
        selectedPaymentMethod === "BANK" &&
        (!selectedBank || selectedBank.trim() === "")
      ) {
        showToast("Please select a bank for bank transfer", "error");
        return false;
      }
    }

    // Validate payment method for PARTIAL status
    if (paymentStatus === "PARTIAL") {
      if (!selectedPaymentMethod || selectedPaymentMethod.trim() === "") {
        showToast("Payment Method is required for partial payment", "error");
        return false;
      }

      if (!amountPaid || amountPaid <= 0) {
        showToast("Amount paid is required for partial payment", "error");
        return false;
      }

      if (amountPaid >= calculateTotal()) {
        showToast("Partial amount must be less than total amount", "error");
        return false;
      }

      // If BANK is selected, validate bank selection
      if (
        selectedPaymentMethod === "BANK" &&
        (!selectedBank || selectedBank.trim() === "")
      ) {
        showToast("Please select a bank for bank transfer", "error");
        return false;
      }
    }

    return true;
  };

  // Form submission
  const onSubmit = async (selectedBank?: string) => {
    console.log("onSubmit called");

    // Run validation
    if (!validateForm(selectedBank)) {
      return;
    }

    // Prepare products array
    const products = selectedProducts.map((p) => ({
      id: p.id,
      unit_price: getProductPrice(p),
      discount: getProductDiscount(p),
      quantity: p.quantity || 1,
      type: p.type || "",
    }));

    // Build payload
    const payload: any = {
      channel: selectedSalesChannel,
      customer: customer.id,
      payment_status: paymentStatus,
      shipping_date: shippingDate,
      products: products,
      shipping_fee: shippingFee,
      tax: tax,
    };

    // Add payment method and amount_paid for PAID status
    if (paymentStatus === "PAID") {
      payload.payment_method = selectedPaymentMethod;
      payload.amount_paid = calculateTotal(); // Set amount_paid to total for PAID status

      // Add bank if BANK payment method is selected
      if (selectedPaymentMethod === "BANK" && selectedBank) {
        payload.bank = selectedBank;
      }
    }

    // Add payment fields for PARTIAL status
    if (paymentStatus === "PARTIAL") {
      payload.payment_method = selectedPaymentMethod;
      payload.amount_paid = amountPaid;

      // Add bank if BANK payment method is selected
      if (selectedPaymentMethod === "BANK" && selectedBank) {
        payload.bank = selectedBank;
      }
    }

    // Don't add payment_method or amount_paid for UNPAID status

    if (shippingStatus) {
      payload.shipping_status = shippingStatus;
    }

    if (notes && notes.trim() !== "") {
      payload.note = notes;
    }

    // console.log("bank", selectedBank);

    console.log("payload", payload);

    CreateOrder({ payload, businessId: business_id });
  };

  // shipping
  const {
    data: ShippingData,
    isLoading: allShippingDataLoading,
    error: ShippingError,
    refetch,
  } = useFetchAllShippingQuery({
    business_id,
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  // Options for select inputs
  const salesChannelOptions = [
    { label: "Online", value: "ONLINE" },
    { label: "Retail", value: "RETAIL" },
    { label: "Wholesale", value: "WHOLESALE" },
    { label: "Phone", value: "PHONE" },
    { label: "Whatsapp", value: "WHATSAPP" },
  ];

  const shippingStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Shipped", value: "SHIPPED" },
  ];

  return {
    // Data
    InventoryData,
    filteredInventoryData,
    OrderData,
    CustomersData,
    BankData,

    // Loading states
    OrderDataLoading: OrderDataLoading || isRefetchingOrderData,
    InventoryDataLoading: InventoryDataLoading || isRefetchingInventory,
    CustomersLoading,
    CreateOrderLoading,
    BankDataLoading,

    // States
    customer,
    setCustomer,
    selectedProducts,
    setSelectedProducts,
    productErrors,
    shippingFee,
    setShippingFee,
    tax,
    setTax,
    selectedSalesChannel,
    setSelectedSalesChannel,
    shippingDate,
    setShippingDate,
    paymentStatus,
    setPaymentStatus,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    shippingStatus,
    setShippingStatus,
    notes,
    OrderIdData,
    OrderIdDataLoading,
    setNotes,
    amountPaid,
    setAmountPaid,

    // Functions
    removeProduct,
    updateProductQuantity,
    getProductPrice,
    getAvailableQuantity,
    getProductDiscount,
    isDiscountApplied,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTotal,
    hasQuantityErrors,
    validateForm,
    editOrderShippingStatusLoading,
    handleUpdateOrderStatus,

    // shipping
    ShippingData,
    allShippingDataLoading,

    // Form
    onSubmit,

    // Options
    salesChannelOptions,
    shippingStatusOptions,
  };
};
