"use client";

import {
  ArrowLeft,
  ChevronDown,
  Download,
  Mail,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import { useState } from "react";

// Define types
type OrderStatus = "Completed" | "Pending" | "Cancelled";
type PaymentStatus = "Paid" | "Pending" | "Failed";
type ShippingStatus =
  | "Shipped"
  | "Delivered"
  | "Awaiting Shipping"
  | "Returned";
type StatusType = "order" | "payment" | "shipping";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface Payment {
  subtotal: number;
  shippingFee: number;
  shippingLocation: string;
  taxes: number;
  total: number;
}

interface Transaction {
  method: string;
  amount: number;
  date: string;
}

interface Shipping {
  deliveryTo: string;
  phone: string;
  address: string | null;
}

interface OrderData {
  orderNumber: string;
  date: string;
  status: {
    order: OrderStatus;
    payment: PaymentStatus;
    shipping: ShippingStatus;
  };
  channel: string;
  customer: Customer;
  billing: {
    address: string | null;
  };
  creator: string;
  lastEditor: string;
  products: Product[];
  payment: Payment;
  transaction: Transaction;
  shipping: Shipping;
}

interface ViewOrderProps {
  id?: string;
}

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | ShippingStatus;
  type: StatusType;
}

interface ShippingStatusButtonProps {
  status: ShippingStatus;
  active: boolean;
  onClick: (status: ShippingStatus) => void;
}

const ViewOrder = ({ id = "00008" }: ViewOrderProps) => {
  const [selectedShippingStatus, setSelectedShippingStatus] =
    useState<ShippingStatus>("Shipped");

  // Dummy data with proper typing
  const orderData: OrderData = {
    orderNumber: "00008",
    date: "Jun 16, 2025",
    status: {
      order: "Completed",
      payment: "Paid",
      shipping: "Shipped",
    },
    channel: "WhatsApp",
    customer: {
      name: "Omotosho Olanrewaju",
      phone: "08142699290",
      email: "omotoshoolanrewaju@gmail.com",
    },
    billing: {
      address: null,
    },
    creator: "Oluwatobiloba Olosunde",
    lastEditor: "Oluwatobiloba Olosunde",
    products: [
      {
        id: 1,
        name: "Cupping",
        quantity: 1,
        price: 2000,
        total: 2000,
        image: "🥤",
      },
    ],
    payment: {
      subtotal: 2000,
      shippingFee: 1500,
      shippingLocation: "Oluyole",
      taxes: 0,
      total: 3500,
    },
    transaction: {
      method: "BANK",
      amount: 3500,
      date: "June 16, 2025 5:20 AM",
    },
    shipping: {
      deliveryTo: "Omotosho Olanrewaju",
      phone: "08142699290",
      address: null,
    },
  };

  const StatusBadge = ({ status, type }: StatusBadgeProps) => {
    const getStatusColor = (
      status: OrderStatus | PaymentStatus | ShippingStatus,
      type: StatusType
    ): string => {
      if (type === "payment" && status === "Paid")
        return "bg-green-100   text-green-800";
      if (type === "shipping" && status === "Shipped")
        return "bg-blue-100 text-blue-800";
      if (type === "order" && status === "Completed")
        return "bg-green-100 text-green-800";
      return "bg-gray-100 text-gray-800";
    };

    return (
      <span
        className={`px-2 py-1 cursor-pointer rounded-md text-xs font-medium ${getStatusColor(
          status,
          type
        )}`}
      >
        {status}
      </span>
    );
  };

  const ShippingStatusButton = ({
    status,
    active,
    onClick,
  }: ShippingStatusButtonProps) => {
    return (
      <button
        onClick={() => onClick(status)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-blue-100 text-blue-800 border border-blue-200"
            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
        }`}
      >
        {status}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="p-1 hover:bg-gray-100 rounded-md">
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
                    Order #{orderData.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500">{orderData.date}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                  <span className="text-sm text-gray-600">Order:</span>
                  <StatusBadge status={orderData.status.order} type="order" />
                  <span className="text-sm text-gray-600">Payment:</span>
                  <StatusBadge
                    status={orderData.status.payment}
                    type="payment"
                  />
                  <span className="text-sm text-gray-600">Shipping:</span>
                  <StatusBadge
                    status={orderData.status.shipping}
                    type="shipping"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Channel & Customer */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Channel
                    </h3>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900">
                        {orderData.channel}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Billing Address
                    </h3>
                    <button className="px-3 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50">
                      Add Billing Address
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Customer
                    </h3>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {orderData.customer.name}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Contact Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {orderData.customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {orderData.customer.email}
                        </span>
                      </div>
                      <button className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700">
                        <MessageCircle className="h-4 w-4" />
                        <span>Send message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Created by
                  </h3>
                  <p className="text-sm text-gray-900">{orderData.creator}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Last Edited by
                  </h3>
                  <p className="text-sm text-gray-900">
                    {orderData.lastEditor}
                  </p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Products (1)
              </h3>

              {orderData.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {product.quantity} x ₦ {product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₦ {product.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transactions
              </h3>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {orderData.transaction.method}
                  </p>
                  <p className="text-sm text-gray-500">
                    {orderData.transaction.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₦ {orderData.transaction.amount.toLocaleString()}
                  </p>
                </div>
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
                <button className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                  <Download className="h-4 w-4" />
                  <span>Download Receipt</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="text-gray-900">
                    ₦ {orderData.payment.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Shipping Fee</span>
                    <p className="text-xs text-gray-500">
                      {orderData.payment.shippingLocation}
                    </p>
                  </div>
                  <span className="text-gray-900">
                    ₦ {orderData.payment.shippingFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="text-gray-900">
                    ₦ {orderData.payment.taxes}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">
                      ₦ {orderData.payment.total.toLocaleString()}
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
                <StatusBadge status="Paid" type="payment" />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping
                </h3>
                <div className="flex items-center space-x-2">
                  <StatusBadge status="Shipped" type="shipping" />
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                    <span>Action</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Delivery To
                  </h4>
                  <p className="text-sm text-gray-900 mb-1">
                    {orderData.shipping.deliveryTo}
                  </p>
                  <p className="text-sm text-gray-500">
                    {orderData.shipping.phone}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Address
                  </h4>
                  <button className="px-3 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50">
                    Add Shipping Address
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Select shipping status:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <ShippingStatusButton
                      status="Shipped"
                      active={selectedShippingStatus === "Shipped"}
                      onClick={setSelectedShippingStatus}
                    />
                    <ShippingStatusButton
                      status="Delivered"
                      active={selectedShippingStatus === "Delivered"}
                      onClick={setSelectedShippingStatus}
                    />
                    <ShippingStatusButton
                      status="Awaiting Shipping"
                      active={selectedShippingStatus === "Awaiting Shipping"}
                      onClick={setSelectedShippingStatus}
                    />
                    <ShippingStatusButton
                      status="Returned"
                      active={selectedShippingStatus === "Returned"}
                      onClick={setSelectedShippingStatus}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
