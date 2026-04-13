"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { useOrdersHook } from "@/hooks/useOrdersHook";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DownloadOrderReceipt from "../DownloadOrderReceipt";
import UpdateStatusComp from "./UpdateStatus";

type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";
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

  const orderData = OrderIdData?.data;

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
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const CardSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusMap = {
      PAID: { bg: "bg-green-100", text: "text-green-800", label: "Paid" },
      PARTIAL: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Partial",
      },
      UNPAID: { bg: "bg-red-100", text: "text-red-800", label: "Unpaid" },
    };
    const style = statusMap[status] || statusMap.UNPAID;
    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    );
  };

  const getShippingStatusBadge = (status: ShippingStatus) => {
    const statusMap = {
      PENDING: { bg: "bg-gray-100", text: "text-gray-800", label: "Pending" },
      SHIPPED: { bg: "bg-green-100", text: "text-green-800", label: "Shipped" },
      DELIVERED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Delivered",
      },
      RETURNED: { bg: "bg-red-100", text: "text-red-800", label: "Returned" },
    };
    const style = statusMap[status] || statusMap.PENDING;
    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    );
  };

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
        return "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200";
      }

      switch (status) {
        case "PENDING":
          return "bg-gray-200 text-gray-900 border border-gray-400 font-semibold";
        case "SHIPPED":
          return "bg-green-200 text-green-900 border border-green-500 font-semibold";
        case "DELIVERED":
          return "bg-green-200 text-green-900 border border-green-500 font-semibold";
        case "RETURNED":
          return "bg-red-200 text-red-900 border border-red-500 font-semibold";
        default:
          return "bg-gray-200 text-gray-900 border-gray-400 font-semibold";
      }
    };

    return (
      <button
        onClick={() => onClick(status)}
        className={`px-3 py-2 cursor-pointer rounded-md text-sm transition-colors ${getStatusColors(
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 py-6 md:px-6">
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
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Order Details
            </h1>
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share Order</span>
          </button>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Order #{orderData.id?.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(orderData.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                  <span className="text-sm text-gray-600">Payment:</span>
                  {getPaymentStatusBadge(
                    orderData.payment_status as PaymentStatus,
                  )}
                  <span className="text-sm text-gray-600">Shipping:</span>
                  {getShippingStatusBadge(
                    (orderData.delivery?.shipping_status ||
                      orderData.shipping_status) as ShippingStatus,
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Channel & Billing */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Channel
                    </h3>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900">
                        {orderData.channel || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Order Type
                    </h3>
                    <span className="text-sm text-gray-900">
                      {orderData.type || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Customer
                    </h3>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {orderData.customer_info?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Contact Details
                    </h3>
                    <div className="space-y-2">
                      {orderData?.customer_info?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {orderData?.customer_info?.phone}
                          </span>
                        </div>
                      )}
                      {orderData?.customer_info?.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {orderData?.customer_info?.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Created by
                  </h3>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(orderData.created_at) || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Last Edited by
                  </h3>
                  <p className="text-sm text-gray-900">
                    {orderData.last_updated_by || "Not updated"}
                  </p>
                </div>
              </div>

              {orderData.note && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </h3>
                  <p className="text-sm text-gray-600">{orderData.note}</p>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Products ({orderData.products?.length || 0})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        Unit Price
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                        Discount
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
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
                        <tr
                          key={product.id}
                          className="border-b border-gray-100"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {product?.name || "Nil"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right">
                            ₦ {unitPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-center">
                            {quantity}
                          </td>
                          <td className="py-3 px-4 text-sm text-green-600 text-right">
                            ₦ {discount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                            ₦ {total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h3>

              <div className="space-y-3">
                {orderData.payment_history?.map(
                  (payment: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.method || "N/A"}
                        </p>
                        {payment.bank && (
                          <p className="text-sm text-gray-600">
                            Bank: {payment.bank}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {formatDateTime(payment.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Summary
                </h3>
                <DownloadOrderReceipt
                  orderData={orderData}
                  business={BusinessData}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-900">
                    ₦ {parseFloat(orderData.amount || "0").toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Discount</span>
                  <span className="text-green-600">N/A</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="text-gray-900">
                    ₦{" "}
                    {parseFloat(
                      orderData.delivery?.shipping_fee ||
                        orderData.shipping_fee ||
                        "0",
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="text-gray-900">
                    ₦ {parseFloat(orderData.tax || "0").toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total Amount Paid</span>
                    <span className="text-gray-900">
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Status
                </h3>

                <div className="flex gap-1">
                  {getPaymentStatusBadge(
                    orderData.payment_status as PaymentStatus,
                  )}

                  {orderData.payment_status !== "PAID" && (
                    <p
                      onClick={() => setOpenUpdateStatusModal(true)}
                      className="px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100 text-xs border border-gray-300 font-medium "
                    >
                      Update Status
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping
                </h3>
                <div className="flex items-center space-x-2">
                  {getShippingStatusBadge(
                    (orderData.delivery?.shipping_status ||
                      orderData.shipping_status) as ShippingStatus,
                  )}
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                    <span>Action</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Shipping Date
                  </h4>
                  <p className="text-sm text-gray-900">
                    {formatDate(orderData.shipping_date)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Delivery To
                  </h4>
                  <p className="text-sm text-gray-900 mb-1">
                    {orderData.customer_info?.name || "N/A"}
                  </p>
                  {orderData.customer_info?.phone && (
                    <p className="text-sm text-gray-500">
                      {orderData.delivery?.delivery_address?.phone ||
                        orderData.customer_info?.phone}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-900 mb-1">
                    {`${orderData.delivery?.delivery_address?.shipping_address || "N/A"}`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Delivery Location
                  </h4>
                  <p className="text-sm text-gray-900 mb-1">
                    {`${orderData.delivery?.delivery_address?.city || ""}, ${
                      orderData.delivery?.delivery_address?.state || ""
                    }, ${orderData.delivery?.delivery_address?.country || ""}`
                      .replace(/^, |, $|, , /g, "")
                      .trim() || "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
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
                    className="w-full cursor-pointer mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    {editOrderShippingStatusLoading
                      ? "Updating..."
                      : " Update Status"}
                  </Button>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default ViewOrder;
