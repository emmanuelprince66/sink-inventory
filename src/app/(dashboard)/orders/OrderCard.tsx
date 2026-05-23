"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bike, Clock, Phone, Star, Truck } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { MOCK_PARTNERS } from "./AssignDeliveryModal";
import { OrderInfo } from "./type";

const paymentStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PARTIAL: "bg-yellow-100 text-yellow-800",
  UNPAID: "bg-red-100 text-red-800",
  DEFAULT: "bg-gray-100 text-gray-800",
};

const shippingStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  RETURNED: "bg-red-100 text-red-800",
  DEFAULT: "bg-gray-100 text-gray-800",
};

// Mock rider list — stable per order id until backend ships rider fields.
const MOCK_RIDERS = [
  { name: "Emeka Obi", phone: "+234 803 111 2233" },
  { name: "Bola Adeyemi", phone: "+234 805 444 5566" },
  { name: "Yusuf Bala", phone: "+234 808 777 8899" },
  { name: "Chinwe Eze", phone: "+234 814 222 3344" },
  { name: "Ifeanyi Okeke", phone: "+234 816 555 6677" },
];
const hashSeed = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
};

interface OrderCardProps {
  order: OrderInfo;
  type: "INSTORE" | "OUTSTORE";
  onAssignDelivery?: (orderId: string) => void;
}

const OrderCard = ({ order, type, onAssignDelivery }: OrderCardProps) => {
  const isOutstore = type === "OUTSTORE";
  const seed = hashSeed(order.id || "fallback");
  const partner = isOutstore ? MOCK_PARTNERS[seed % MOCK_PARTNERS.length] : null;
  const rider = isOutstore ? MOCK_RIDERS[seed % MOCK_RIDERS.length] : null;

  const paymentStyle =
    paymentStyles[order.payment_status] || paymentStyles.DEFAULT;
  const shippingStyle =
    shippingStyles[order.shipping_status] || shippingStyles.DEFAULT;

  const amount = order.amount || order.total_price || "0";

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Top row: order id + status + amount */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              #{order.id?.slice(0, 8) || "—"}
            </span>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                paymentStyle,
              )}
            >
              {order.payment_status || "—"}
            </span>
            {isOutstore && (
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  shippingStyle,
                )}
              >
                {order.shipping_status || "PENDING"}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1 truncate">
            {order.customer_info?.name || "Walk-in customer"}
          </p>
          {order.customer_info?.phone && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {order.customer_info.phone}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            ₦{Number(amount).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-0.5">
            <Clock className="w-3 h-3" />
            {order.created_at
              ? moment(order.created_at).format("MMM DD, h:mm A")
              : "—"}
          </p>
        </div>
      </div>

      {/* Delivery partner + rider (outstore only) */}
      {isOutstore && partner && rider && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Partner
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-700 flex-shrink-0">
                {partner.logo}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 leading-tight truncate">
                  {partner.name}
                </p>
                <p className="text-[10px] text-amber-600 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  {partner.rating}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Rider
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Bike className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 leading-tight truncate">
                  {rider.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {rider.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100 flex-wrap">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
          {isOutstore ? "Out-store" : "In-store"}
        </span>
        <div className="flex gap-2">
          {isOutstore && onAssignDelivery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignDelivery(order.id)}
              className="text-xs"
            >
              <Truck className="w-3 h-3 mr-1" />
              Assign
            </Button>
          )}
          <Link href={`/orders/${order.id}`}>
            <Button size="sm" className="text-xs">
              View More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
