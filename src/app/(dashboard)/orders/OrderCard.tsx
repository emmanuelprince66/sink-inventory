"use client";

import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/app/InitialsAvatar";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Clock, Phone, Star, UserCheck } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { MOCK_PARTNERS } from "./AssignDeliveryModal";
import { OrderInfo } from "./type";

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

  const amount = order.amount || order.total_price || "0";

  return (
    <div className="border border-border-tint rounded-2xl p-4 bg-white hover:shadow-md transition-shadow">
      {/* Top row: order id + status + amount */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-grey-1 text-sm">
              #{order.id?.slice(0, 8) || "—"}
            </span>
            <StatusBadge status={order.payment_status} type="payment" />
            {isOutstore && (
              <StatusBadge
                status={order.shipping_status || "PENDING"}
                type="shipping"
              />
            )}
          </div>
          <p className="text-sm font-bold text-grey-1 mt-1 truncate">
            {order.customer_info?.name || "Walk-in customer"}
          </p>
          {order.customer_info?.phone && (
            <p className="text-xs font-medium text-grey-3 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {order.customer_info.phone}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-extrabold text-grey-1">
            ₦{Number(amount).toLocaleString()}
          </p>
          <p className="text-xs font-medium text-grey-4 flex items-center gap-1 justify-end mt-0.5">
            <Clock className="w-3 h-3" />
            {order.created_at
              ? moment(order.created_at).format("MMM DD, h:mm A")
              : "—"}
          </p>
        </div>
      </div>

      {/* Delivery partner + rider (outstore only) */}
      {isOutstore && partner && rider && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-grey-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-grey-4 mb-1">
              Partner
            </p>
            <div className="flex items-center gap-2">
              <InitialsAvatar initials={partner.logo} tone="dark" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-grey-1 leading-tight truncate">
                  {partner.name}
                </p>
                <p className="text-[10px] font-bold text-warning-1 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-warning-1 text-warning-1" />
                  {partner.rating}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-grey-4 mb-1">
              Rider
            </p>
            <div className="flex items-center gap-2">
              <InitialsAvatar name={rider.name} tone="green" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-grey-1 leading-tight truncate">
                  {rider.name}
                </p>
                <p className="text-[10px] font-medium text-grey-4 truncate">
                  {rider.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-grey-6">
        <span className="text-[10px] font-bold text-grey-4 uppercase tracking-wide">
          {isOutstore ? "Out-store" : "In-store"}
        </span>
        <div className="flex gap-2">
          {isOutstore && onAssignDelivery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignDelivery(order.id)}
              className="text-xs flex-1"
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Assign
            </Button>
          )}
          <Link href={`/orders/${order.id}`} className="flex-1">
            <Button size="sm" className="text-xs w-full">
              View More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
