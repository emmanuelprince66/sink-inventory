"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Clock, Phone, UserCheck } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { formatToNaira } from "@/utils/formatMoney";
import { OrderInfo } from "./type";

interface OrderCardProps {
  order: OrderInfo;
  type: "INSTORE" | "OUTSTORE";
  onAssignDelivery?: (orderId: string) => void;
}

// Matches Figma reference: Convert Mobile Screens to Desktop/src/app/App.tsx, OrdersScreen
// (order card grid, ~line 1186) — rounded-2xl, border rgba(27,50,40,.08), p-4, hover:shadow-md.
// ID 14px/800, customer 14px/700, phone/date 12px/500, Partner/Rider label 10px/800 uppercase.
// See sink/docs/FIGMA_VS_CODE_COMPARISON.md for the full checked breakdown.
const OrderCard = ({ order, type, onAssignDelivery }: OrderCardProps) => {
  const isOutstore = type === "OUTSTORE";

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
            {formatToNaira(Number(amount))}
          </p>
          <p className="text-xs font-medium text-grey-4 flex items-center gap-1 justify-end mt-0.5">
            <Clock className="w-3 h-3" />
            {order.created_at
              ? moment(order.created_at).format("MMM DD, h:mm A")
              : "—"}
          </p>
        </div>
      </div>

      {/* Delivery partner + rider block removed — it was fabricating a
          specific named partner/rider per order via a hash of the order id,
          not real assignment data (the order payload has no such fields). */}

      {/* Action row */}
      <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-grey-6">
        <span className="text-[10px] font-bold text-grey-4 uppercase tracking-wide">
          {isOutstore ? "Out-store" : "In-store"}
        </span>
        <div className="flex gap-2">
          {isOutstore && onAssignDelivery && (
            // Disabled — delivery-partner assignment isn't backed by a real
            // endpoint yet (AssignDeliveryModal picks from a mock partner
            // list), so it stays visible but inert until that's real.
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Delivery partner assignment is coming soon"
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
