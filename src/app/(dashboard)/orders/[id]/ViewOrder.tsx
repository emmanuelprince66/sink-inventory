"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { InitialsAvatar } from "@/components/app/InitialsAvatar";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrdersHook } from "@/hooks/useOrdersHook";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Share2,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import AssignDeliveryModal, {
  DeliveryPartner,
  MOCK_PARTNERS,
} from "../AssignDeliveryModal";
import DownloadOrderReceipt from "../DownloadOrderReceipt";
import OrderFlowTimeline, { stepIndexFromShipping } from "./OrderFlowTimeline";
import UpdateStatusComp from "./UpdateStatus";

// Mock rider (until backend ships rider fields). Stable per order id.
const MOCK_RIDERS = [
  {
    name: "Emeka Obi",
    phone: "+234 803 111 2233",
    plate: "LAG-243-AB",
    eta: "25 mins",
  },
  {
    name: "Bola Adeyemi",
    phone: "+234 805 444 5566",
    plate: "ABJ-118-CD",
    eta: "40 mins",
  },
  {
    name: "Yusuf Bala",
    phone: "+234 808 777 8899",
    plate: "KAN-901-EF",
    eta: "1 hr 5 mins",
  },
];
const hashSeed = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
};

type ShippingStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";

interface ViewOrderProps {
  id: string;
}

const ViewOrder = ({ id }: ViewOrderProps) => {
  const {
    OrderIdData,
    OrderIdDataLoading,
    handleUpdateOrderStatus,
    BusinessData,
    editOrderShippingStatusLoading,
  } = useOrdersHook({ id });

  console.log("orderIdData", OrderIdData);
  const [openUpdateStatusModal, setOpenUpdateStatusModal] = useState(false);

  const [selectedShippingStatus, setSelectedShippingStatus] =
    useState<ShippingStatus>("PENDING");

  const [openAssignDelivery, setOpenAssignDelivery] = useState(false);
  const [assignedPartner, setAssignedPartner] =
    useState<DeliveryPartner | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const orderData = OrderIdData?.data;

  // Default to first mock partner when none assigned yet — so the UI has data to show.
  const activePartner =
    assignedPartner ||
    (orderData?.id
      ? MOCK_PARTNERS[hashSeed(orderData.id) % MOCK_PARTNERS.length]
      : null);
  const activeRider = orderData?.id
    ? MOCK_RIDERS[hashSeed(orderData.id) % MOCK_RIDERS.length]
    : null;

  const handleContactCustomer = () => {
    const phone = orderData?.customer_info?.phone;
    if (phone) window.open(`tel:${phone}`);
  };
  const handlePrintReceipt = () => window.print();
  // UI-only for now — wire to backend once PROCESSING/CANCELLED statuses are supported.
  const handleMarkProcessing = () => {};
  const handleConfirmCancel = () => setShowCancelConfirm(false);

  // Update selectedShippingStatus when orderData loads
  useEffect(() => {
    if (orderData?.delivery?.shipping_status) {
      setSelectedShippingStatus(
        orderData.delivery.shipping_status as ShippingStatus,
      );
    } else if (orderData?.shipping_status) {
      setSelectedShippingStatus(orderData.shipping_status as ShippingStatus);
    }
  }, [orderData?.delivery?.shipping_status, orderData?.shipping_status]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-grey-6 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-grey-6 rounded w-1/2"></div>
    </div>
  );

  const CardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-grey-5 p-6 animate-pulse">
      <div className="h-6 bg-grey-6 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-grey-6 rounded w-full"></div>
        <div className="h-4 bg-grey-6 rounded w-5/6"></div>
        <div className="h-4 bg-grey-6 rounded w-4/6"></div>
      </div>
    </div>
  );

  const ShippingStatusButton = ({
    status,
    active,
    onClick,
  }: {
    status: ShippingStatus;
    active: boolean;
    onClick: (status: ShippingStatus) => void;
  }) => {
    const labels = {
      PENDING: "Pending",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      RETURNED: "Returned",
    };

    const getStatusColors = (status: ShippingStatus, active: boolean) => {
      if (!active) {
        return "bg-white text-grey-3 hover:bg-grey-6 border border-grey-5";
      }

      switch (status) {
        case "PENDING":
          return "bg-warning-2 text-warning-1 border border-warning-1 font-bold";
        case "SHIPPED":
          return "bg-info-2 text-info-1 border border-info-1 font-bold";
        case "DELIVERED":
          return "bg-success-2 text-success-1 border border-success-1 font-bold";
        case "RETURNED":
          return "bg-error-2 text-error-1 border border-error-1 font-bold";
        default:
          return "bg-grey-6 text-grey-1 border border-grey-5 font-bold";
      }
    };

    return (
      <button
        onClick={() => onClick(status)}
        className={`px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors ${getStatusColors(
          status,
          active,
        )}`}
      >
        {labels[status]}
      </button>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (OrderIdDataLoading) {
    return (
      <div className="px-4 py-6 w-full">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-9 w-20 bg-grey-6 rounded-lg animate-pulse"></div>
          <div className="h-6 w-32 bg-grey-6 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="px-4 py-6 w-full flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-grey-4">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5  px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl  font-extrabold text-grey-1">
            Order Details
          </h1>
        </div>
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-grey-3 hover:bg-grey-6 rounded-lg transition-colors">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share Order</span>
        </button>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-grey-5 p-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setOpenAssignDelivery(true)}
                  className="text-xs"
                >
                  <Truck className="w-3 h-3 mr-1" />
                  Assign Delivery
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      More Actions
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 p-1.5">
                    <DropdownMenuItem
                      onClick={handleMarkProcessing}
                      disabled={editOrderShippingStatusLoading}
                      className="rounded-lg py-1.5 font-semibold text-grey-2 focus:bg-secondary-6 focus:text-grey-2"
                    >
                      Mark as Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="p-0 focus:bg-transparent"
                    >
                      <div>
                        <DownloadOrderReceipt
                          orderData={orderData}
                          business={BusinessData}
                          variant="menu-item"
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handlePrintReceipt}
                      className="rounded-lg py-1.5 font-semibold text-grey-2 focus:bg-secondary-6 focus:text-grey-2"
                    >
                      <Printer className="w-3.5 h-3.5 mr-0.5" />
                      Print Receipt
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleContactCustomer}
                      disabled={!orderData?.customer_info?.phone}
                      className="rounded-lg py-1.5 font-semibold text-grey-2 focus:bg-secondary-6 focus:text-grey-2"
                    >
                      <Phone className="w-3.5 h-3.5 mr-0.5" />
                      Contact Customer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-grey-6" />
                    <DropdownMenuItem
                      onClick={() => setShowCancelConfirm(true)}
                      className="rounded-lg py-1.5 font-semibold text-error-1 focus:bg-error-2/40 focus:text-error-1"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-0.5" />
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl border border-grey-5 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-grey-1 mb-1">
                    Order #{orderData.id?.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-grey-4">
                    {formatDate(orderData.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                  <span className="text-sm font-medium text-grey-3">
                    Payment:
                  </span>
                  <StatusBadge
                    status={orderData.payment_status}
                    type="payment"
                  />
                  <span className="text-sm font-medium text-grey-3">
                    Shipping:
                  </span>
                  <StatusBadge
                    status={
                      orderData.delivery?.shipping_status ||
                      orderData.shipping_status
                    }
                    type="shipping"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Channel & Billing */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-grey-2 mb-2">
                      Channel
                    </h3>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-primary-green-300" />
                      <span className="text-sm text-grey-1">
                        {orderData.channel || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-grey-2 mb-2">
                      Order Type
                    </h3>
                    <span className="text-sm text-grey-1">
                      {orderData.type || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-grey-2 mb-2">
                      Customer
                    </h3>
                    <p className="text-sm font-bold text-grey-1 mb-1">
                      {orderData.customer_info?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-grey-2 mb-2">
                      Contact Details
                    </h3>
                    <div className="space-y-2">
                      {orderData?.customer_info?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-grey-4" />
                          <span className="text-sm text-grey-1">
                            {orderData?.customer_info?.phone}
                          </span>
                        </div>
                      )}
                      {orderData?.customer_info?.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-grey-4" />
                          <span className="text-sm text-grey-1">
                            {orderData?.customer_info?.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-grey-5">
                <div>
                  <h3 className="text-sm font-bold text-grey-2 mb-1">
                    Created by
                  </h3>
                  <p className="text-sm text-grey-1">
                    {formatDateTime(orderData.created_at) || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-grey-2 mb-1">
                    Last Edited by
                  </h3>
                  <p className="text-sm text-grey-1">
                    {orderData.last_updated_by || "Not updated"}
                  </p>
                </div>
              </div>

              {orderData.note && (
                <div className="mt-6 pt-6 border-t border-grey-5">
                  <h3 className="text-sm font-bold text-grey-2 mb-2">Notes</h3>
                  <p className="text-sm text-grey-3">{orderData.note}</p>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl border border-grey-5 p-6">
              <h3 className="text-lg font-extrabold text-grey-1 mb-4">
                Products ({orderData.products?.length || 0})
              </h3>

              <div className="overflow-x-auto rounded-xl border border-grey-5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-grey-6">
                      <th className="text-left py-3 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        Name
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        Unit Price
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        Quantity
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        Discount
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.products?.map((product: any, index: number) => {
                      const unitPrice = parseFloat(product.unit_price || "0");
                      const quantity = parseFloat(product.quantity || "0");
                      const discount = parseFloat(product.discount || "0");
                      const total = unitPrice * quantity - discount;

                      return (
                        <tr key={product.id} className="border-t border-grey-6">
                          <td className="py-3 px-4 text-sm font-medium text-grey-3">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-grey-1">
                            {product?.name || "Nil"}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-grey-1 text-right">
                            ₦ {unitPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-grey-1 text-center">
                            {quantity}
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-success-1 text-right">
                            ₦ {discount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-extrabold text-grey-1 text-right">
                            ₦ {total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery flow timeline (mock timestamps until backend ships event log) */}
            <OrderFlowTimeline
              currentStepIndex={stepIndexFromShipping(
                orderData?.delivery?.shipping_status ||
                  orderData?.shipping_status,
              )}
              timestamps={{
                ORDER: orderData?.created_at
                  ? new Date(orderData.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : undefined,
                RIDER_ASSIGNED: assignedPartner ? "Just now" : undefined,
              }}
            />

            {/* Transactions */}
            <div className="bg-white rounded-2xl border border-grey-5 p-6">
              <h3 className="text-lg font-extrabold text-grey-1 mb-4">
                Payment Information
              </h3>

              <div className="space-y-3">
                {orderData.payment_history?.map(
                  (payment: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-grey-5 rounded-lg"
                    >
                      <div>
                        <p className="font-bold text-grey-1">
                          {payment.method || "N/A"}
                        </p>
                        {payment.bank && (
                          <p className="text-sm text-grey-3">
                            Bank: {payment.bank}
                          </p>
                        )}
                        <p className="text-sm text-grey-4">
                          {formatDateTime(payment.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-grey-1">
                          ₦ {parseFloat(payment.amount || "0").toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-grey-5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-grey-1">
                  Payment Summary
                </h3>
                <DownloadOrderReceipt
                  orderData={orderData}
                  business={BusinessData}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-grey-3">Amount</span>
                  <span className="text-grey-1">
                    ₦ {parseFloat(orderData.amount || "0").toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-grey-3">Total Discount</span>
                  <span className="font-bold text-success-1">N/A</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-grey-3">Shipping Fee</span>
                  <span className="text-grey-1">
                    ₦{" "}
                    {parseFloat(
                      orderData.delivery?.shipping_fee ||
                        orderData.shipping_fee ||
                        "0",
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-grey-3">Taxes</span>
                  <span className="text-grey-1">
                    ₦ {parseFloat(orderData.tax || "0").toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-grey-5 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-grey-1">Total Amount Paid</span>
                    <span className="text-grey-1">
                      ₦{" "}
                      {parseFloat(
                        orderData.amount_paid || "0",
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-2xl border border-grey-5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-grey-1">
                  Payment Status
                </h3>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={orderData.payment_status}
                    type="payment"
                  />

                  {orderData.payment_status !== "PAID" && (
                    <p
                      onClick={() => setOpenUpdateStatusModal(true)}
                      className="px-2 py-1 cursor-pointer rounded-lg hover:bg-grey-6 text-xs border border-grey-5 font-bold text-grey-2"
                    >
                      Update Status
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-grey-5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-grey-1">Shipping</h3>
                <div className="flex items-center space-x-2">
                  <StatusBadge
                    status={
                      orderData.delivery?.shipping_status ||
                      orderData.shipping_status
                    }
                    type="shipping"
                  />
                  <button className="flex items-center space-x-1 text-sm font-bold text-grey-3 hover:text-grey-2">
                    <span>Action</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-grey-2 mb-2">
                    Shipping Date
                  </h4>
                  <p className="text-sm text-grey-1">
                    {formatDate(orderData.shipping_date)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-grey-2 mb-2">
                    Delivery To
                  </h4>
                  <p className="text-sm text-grey-1 mb-1">
                    {orderData.customer_info?.name || "N/A"}
                  </p>
                  {orderData.customer_info?.phone && (
                    <p className="text-sm text-grey-4">
                      {orderData.delivery?.delivery_address?.phone ||
                        orderData.customer_info?.phone}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-grey-2 mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-sm text-grey-1 mb-1">
                    {`${orderData.delivery?.delivery_address?.shipping_address || "N/A"}`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-grey-2 mb-2">
                    Delivery Location
                  </h4>
                  <p className="text-sm text-grey-1 mb-1">
                    {`${orderData.delivery?.delivery_address?.city || ""}, ${
                      orderData.delivery?.delivery_address?.state || ""
                    }, ${orderData.delivery?.delivery_address?.country || ""}`
                      .replace(/^, |, $|, , /g, "")
                      .trim() || "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-grey-2 mb-3">
                    Update shipping status:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <ShippingStatusButton
                      status="PENDING"
                      active={selectedShippingStatus === "PENDING"}
                      onClick={setSelectedShippingStatus}
                    />

                    {orderData?.channel === "OUTSTORE" && (
                      <ShippingStatusButton
                        status="SHIPPED"
                        active={selectedShippingStatus === "SHIPPED"}
                        onClick={setSelectedShippingStatus}
                      />
                    )}

                    <ShippingStatusButton
                      status="DELIVERED"
                      active={selectedShippingStatus === "DELIVERED"}
                      onClick={setSelectedShippingStatus}
                    />
                    <ShippingStatusButton
                      status="RETURNED"
                      active={selectedShippingStatus === "RETURNED"}
                      onClick={setSelectedShippingStatus}
                    />
                  </div>
                  <Button
                    disabled={editOrderShippingStatusLoading}
                    onClick={() =>
                      handleUpdateOrderStatus(selectedShippingStatus)
                    }
                    className="w-full mt-3"
                  >
                    {editOrderShippingStatusLoading
                      ? "Updating..."
                      : "Update Status"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Delivery Company (mock until backend ships it) */}
            {activePartner && (
              <div className="bg-white rounded-2xl border border-grey-5 p-6">
                <h3 className="text-lg font-extrabold text-grey-1 mb-4">
                  Delivery Company
                </h3>
                <div className="flex items-start gap-3">
                  <InitialsAvatar
                    initials={activePartner.logo}
                    tone="dark"
                    size="md"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-grey-1">
                      {activePartner.name}
                    </p>
                    <p className="text-xs font-medium text-grey-4">
                      {activePartner.serviceType}
                    </p>
                    <div className="text-sm font-medium text-grey-2 space-y-0.5 mt-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-grey-4" />
                        <span>{activePartner.contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-grey-4" />
                        <span>{activePartner.support}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-grey-6">
                      <span className="text-xs font-bold text-warning-1">
                        ★ {activePartner.rating} rating
                      </span>
                      <span className="text-sm font-extrabold text-grey-1">
                        ₦{activePartner.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rider Information (mock until backend ships it) */}
            {activeRider && (
              <div className="bg-white rounded-2xl border border-grey-5 p-6">
                <h3 className="text-lg font-extrabold text-grey-1 mb-4">
                  Rider Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar
                      name={activeRider.name}
                      tone="green"
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-bold text-grey-1">
                        {activeRider.name}
                      </p>
                      <p className="text-xs font-medium text-grey-4">
                        {activeRider.plate}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-grey-4">Phone</span>
                      <a
                        href={`tel:${activeRider.phone}`}
                        className="font-bold text-grey-1 hover:text-primary-green-300"
                      >
                        {activeRider.phone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-grey-4">
                        Estimated arrival
                      </span>
                      <span className="font-bold text-grey-1">
                        {activeRider.eta}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* modal */}
      <CustomModal
        isOpen={openUpdateStatusModal}
        onClose={() => setOpenUpdateStatusModal(false)}
        title="Update Order Status"
      >
        <UpdateStatusComp
          orderId={orderData?.id}
          currentStatus={orderData?.payment_status}
          currentAmount={orderData?.amount}
          currentAmountPaid={orderData?.amount_paid}
          onClose={() => setOpenUpdateStatusModal(false)}
        />
      </CustomModal>

      <AssignDeliveryModal
        isOpen={openAssignDelivery}
        onClose={() => setOpenAssignDelivery(false)}
        orderId={orderData?.id}
        onAssigned={(partner) => {
          // UI-only: stash partner locally; backend status auto-change comes later.
          setAssignedPartner(partner);
        }}
      />

      <CustomModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-sm text-grey-3">
            Are you sure you want to cancel order #{orderData?.id?.slice(0, 8)}?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Order
            </Button>
            <Button
              className="flex-1 bg-error-1 hover:bg-error-1/90 border-error-1 text-white"
              onClick={handleConfirmCancel}
              disabled={editOrderShippingStatusLoading}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default ViewOrder;
