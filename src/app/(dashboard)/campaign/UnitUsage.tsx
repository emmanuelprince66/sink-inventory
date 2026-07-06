"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import moment from "moment";
import { useState } from "react";

type MessageType = "SMS" | "WHATSAPP";

interface UsageRow {
  id: string;
  phone: string;
  messageType: MessageType;
  messageLabel: string;
  body: string;
  unit: number;
  sentAt: string;
}

// Mock usage log — replace with API data once the endpoint exists.
const MOCK_USAGE: UsageRow[] = [
  {
    id: "u-001",
    phone: "+234 803 111 2233",
    messageType: "SMS",
    messageLabel: "Thank You Message",
    body: "Thank you for your purchase! Your order #A8F2 has been received.",
    unit: 10,
    sentAt: "2026-05-25T09:30:00Z",
  },
  {
    id: "u-002",
    phone: "+234 805 444 5566",
    messageType: "SMS",
    messageLabel: "Order Confirmation",
    body: "Your order #B3C9 has been confirmed and is being processed.",
    unit: 8,
    sentAt: "2026-05-25T10:15:00Z",
  },
  {
    id: "u-003",
    phone: "+234 808 777 8899",
    messageType: "WHATSAPP",
    messageLabel: "Promotion",
    body: "Get 20% off this weekend on all bakery items. Use code SWEET20.",
    unit: 4,
    sentAt: "2026-05-25T11:05:00Z",
  },
  {
    id: "u-004",
    phone: "+234 814 222 3344",
    messageType: "SMS",
    messageLabel: "Reminder",
    body: "Reminder: your invoice #FA12 is due tomorrow.",
    unit: 10,
    sentAt: "2026-05-24T16:42:00Z",
  },
  {
    id: "u-005",
    phone: "+234 816 555 6677",
    messageType: "SMS",
    messageLabel: "Thank You Message",
    body: "Thank you for shopping with us — your loyalty means everything.",
    unit: 10,
    sentAt: "2026-05-24T15:20:00Z",
  },
  {
    id: "u-006",
    phone: "+234 803 999 1122",
    messageType: "WHATSAPP",
    messageLabel: "Delivery Update",
    body: "Your delivery is on the way and should arrive within 30 minutes.",
    unit: 4,
    sentAt: "2026-05-23T12:00:00Z",
  },
];

const typeBadgeClass = (type: MessageType) =>
  type === "SMS"
    ? "bg-blue-100 text-blue-700"
    : "bg-green-100 text-green-700";

const UnitUsage = () => {
  const [selected, setSelected] = useState<UsageRow | null>(null);

  const totalUnits = MOCK_USAGE.reduce((sum, r) => sum + r.unit, 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            Total messages sent
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {MOCK_USAGE.length}
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            Units used
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">{totalUnits}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            Avg. units / message
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {MOCK_USAGE.length
              ? (totalUnits / MOCK_USAGE.length).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      {/* Usage table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 w-12">
                  No
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                  Phone
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                  Type of message
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Unit
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USAGE.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {row.phone}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          typeBadgeClass(row.messageType),
                        )}
                      >
                        {row.messageType}
                      </span>
                      <span className="text-xs text-gray-700">
                        [{row.messageLabel}]
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                    {row.unit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(row)}
                      className="text-xs h-7 px-2"
                    >
                      View more
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {MOCK_USAGE.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            No campaign usage yet.
          </div>
        )}
      </div>

      <CustomModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Message Details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selected.phone}
                </p>
                <p className="text-xs text-gray-500">
                  Sent {moment(selected.sentAt).format("MMM DD, YYYY • h:mm A")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border border-gray-200 rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Channel
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selected.messageType}
                </p>
              </div>
              <div className="border border-gray-200 rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Units used
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selected.unit}
                </p>
              </div>
              <div className="border border-gray-200 rounded-md p-3 col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Template
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selected.messageLabel}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
                Message body
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                {selected.body}
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default UnitUsage;
