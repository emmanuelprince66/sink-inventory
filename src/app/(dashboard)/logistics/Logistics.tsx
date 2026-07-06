"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Star,
  Timer,
  Truck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import AssignDeliveryModal, {
  DeliveryPartner,
  MOCK_PARTNERS,
} from "../orders/AssignDeliveryModal";

// Mock delivery records — replace with API once logistics endpoint exists.
type DeliveryStage =
  | "AWAITING_PICKUP"
  | "RIDER_ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

interface DeliveryRecord {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  partner: DeliveryPartner;
  rider: { name: string; phone: string; plate: string };
  fee: number;
  stage: DeliveryStage;
  eta: string;
  placedAt: string;
}

const STAGE_META: Record<
  DeliveryStage,
  { label: string; className: string }
> = {
  AWAITING_PICKUP: {
    label: "Awaiting Pickup",
    className: "bg-yellow-100 text-yellow-800",
  },
  RIDER_ASSIGNED: {
    label: "Rider Assigned",
    className: "bg-purple-100 text-purple-800",
  },
  PICKED_UP: { label: "Picked Up", className: "bg-blue-100 text-blue-800" },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "bg-indigo-100 text-indigo-800",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-100 text-green-800",
  },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
};

const MOCK_RIDERS = [
  { name: "Emeka Obi", phone: "+234 803 111 2233", plate: "LAG-243-AB" },
  { name: "Bola Adeyemi", phone: "+234 805 444 5566", plate: "ABJ-118-CD" },
  { name: "Yusuf Bala", phone: "+234 808 777 8899", plate: "KAN-901-EF" },
  { name: "Chinwe Eze", phone: "+234 814 222 3344", plate: "LAG-557-GH" },
  { name: "Ifeanyi Okeke", phone: "+234 816 555 6677", plate: "ENU-203-JK" },
];

const MOCK_DELIVERIES: DeliveryRecord[] = [
  {
    id: "DEL-1001",
    orderId: "ORD-A8F2",
    customerName: "Funke Adebayo",
    address: "14 Allen Avenue, Ikeja, Lagos",
    partner: MOCK_PARTNERS[0],
    rider: MOCK_RIDERS[0],
    fee: 2500,
    stage: "OUT_FOR_DELIVERY",
    eta: "25 mins",
    placedAt: "10:24 AM",
  },
  {
    id: "DEL-1002",
    orderId: "ORD-B3C9",
    customerName: "Kenneth Uche",
    address: "Plot 7, Wuse Zone 4, Abuja",
    partner: MOCK_PARTNERS[2],
    rider: MOCK_RIDERS[1],
    fee: 3200,
    stage: "PICKED_UP",
    eta: "1 hr 10 mins",
    placedAt: "09:50 AM",
  },
  {
    id: "DEL-1003",
    orderId: "ORD-D71E",
    customerName: "Halima Sani",
    address: "23 Ahmadu Bello Way, Kano",
    partner: MOCK_PARTNERS[1],
    rider: MOCK_RIDERS[2],
    fee: 1800,
    stage: "RIDER_ASSIGNED",
    eta: "Pickup in 20 mins",
    placedAt: "11:05 AM",
  },
  {
    id: "DEL-1004",
    orderId: "ORD-EE40",
    customerName: "Tola Bankole",
    address: "5 Marina Road, Lagos Island",
    partner: MOCK_PARTNERS[4],
    rider: MOCK_RIDERS[3],
    fee: 1500,
    stage: "AWAITING_PICKUP",
    eta: "Pending dispatch",
    placedAt: "11:42 AM",
  },
  {
    id: "DEL-1005",
    orderId: "ORD-FA12",
    customerName: "Samuel Etim",
    address: "12 Marian Road, Calabar",
    partner: MOCK_PARTNERS[2],
    rider: MOCK_RIDERS[4],
    fee: 4100,
    stage: "DELIVERED",
    eta: "Completed",
    placedAt: "Yesterday",
  },
  {
    id: "DEL-1006",
    orderId: "ORD-09BC",
    customerName: "Aisha Mohammed",
    address: "8 Hospital Road, Maiduguri",
    partner: MOCK_PARTNERS[3],
    rider: MOCK_RIDERS[0],
    fee: 6500,
    stage: "FAILED",
    eta: "Customer unreachable",
    placedAt: "Yesterday",
  },
];

const STAGE_FILTERS: { key: "ALL" | DeliveryStage; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "AWAITING_PICKUP", label: "Awaiting Pickup" },
  { key: "RIDER_ASSIGNED", label: "Rider Assigned" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "FAILED", label: "Failed" },
  { key: "CANCELLED", label: "Cancelled" },
];

interface KpiProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}
const Kpi = ({ title, value, icon, accent }: KpiProps) => (
  <CustomCard className={cn("p-4 border", accent)}>
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-white/70">{icon}</div>
      <div>
        <p className="text-xs text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </CustomCard>
);

const Logistics = () => {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"ALL" | DeliveryStage>("ALL");
  const [openAssign, setOpenAssign] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string | undefined>();

  const filtered = useMemo(() => {
    return MOCK_DELIVERIES.filter((d) => {
      if (stageFilter !== "ALL" && d.stage !== stageFilter) return false;
      if (search.trim().length >= 2) {
        const q = search.toLowerCase();
        return (
          d.orderId.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.rider.name.toLowerCase().includes(q) ||
          d.partner.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, stageFilter]);

  const kpis = useMemo(() => {
    const today = MOCK_DELIVERIES;
    return {
      active: today.filter((d) =>
        ["PICKED_UP", "OUT_FOR_DELIVERY", "RIDER_ASSIGNED"].includes(d.stage),
      ).length,
      awaiting: today.filter((d) => d.stage === "AWAITING_PICKUP").length,
      outForDelivery: today.filter((d) => d.stage === "OUT_FOR_DELIVERY")
        .length,
      delivered: today.filter((d) => d.stage === "DELIVERED").length,
      failed: today.filter((d) => d.stage === "FAILED").length,
      avgTime: "42 mins",
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Logistics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track active deliveries, riders, and partner performance.
          </p>
        </div>
        <Button
          onClick={() => {
            setAssignTarget(undefined);
            setOpenAssign(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Truck className="w-4 h-4 mr-2" />
          Assign Delivery
        </Button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Kpi
          title="Active Deliveries"
          value={kpis.active}
          icon={<Truck className="w-4 h-4 text-blue-600" />}
          accent="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <Kpi
          title="Awaiting Pickup"
          value={kpis.awaiting}
          icon={<Package className="w-4 h-4 text-yellow-600" />}
          accent="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
        />
        <Kpi
          title="Out for Delivery"
          value={kpis.outForDelivery}
          icon={<Bike className="w-4 h-4 text-indigo-600" />}
          accent="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
        />
        <Kpi
          title="Delivered Today"
          value={kpis.delivered}
          icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          accent="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <Kpi
          title="Failed Deliveries"
          value={kpis.failed}
          icon={<XCircle className="w-4 h-4 text-red-600" />}
          accent="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        />
        <Kpi
          title="Avg. Delivery Time"
          value={kpis.avgTime}
          icon={<Timer className="w-4 h-4 text-purple-600" />}
          accent="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      {/* Stage filter tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            {STAGE_FILTERS.map((tab) => {
              const isActive = stageFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStageFilter(tab.key)}
                  className={cn(
                    "px-4 py-3 text-xs sm:text-sm font-medium cursor-pointer border-b-2 transition-all whitespace-nowrap",
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <SearchInput
            placeholder="Search by order, customer, rider, or partner..."
            value={search}
            onValueChange={setSearch}
          />
        </div>

        {/* Delivery cards */}
        <div className="p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">
              No deliveries match the current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((d) => (
                <DeliveryCard
                  key={d.id}
                  delivery={d}
                  onReassign={() => {
                    setAssignTarget(d.orderId);
                    setOpenAssign(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AssignDeliveryModal
        isOpen={openAssign}
        onClose={() => setOpenAssign(false)}
        orderId={assignTarget}
      />
    </div>
  );
};

interface DeliveryCardProps {
  delivery: DeliveryRecord;
  onReassign: () => void;
}
const DeliveryCard = ({ delivery, onReassign }: DeliveryCardProps) => {
  const stage = STAGE_META[delivery.stage];
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {delivery.orderId}
            </span>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                stage.className,
              )}
            >
              {stage.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{delivery.customerName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {delivery.address}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            ₦{delivery.fee.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {delivery.placedAt}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Partner
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-700">
              {delivery.partner.logo}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {delivery.partner.name}
              </p>
              <p className="text-[11px] text-amber-600 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                {delivery.partner.rating}
              </p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Rider
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
              <Bike className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {delivery.rider.name}
              </p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" />
                {delivery.rider.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Timer className="w-3 h-3" />
          <span>{delivery.eta}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReassign}
            className="text-xs"
          >
            Reassign
          </Button>
          <Button size="sm" className="text-xs">
            Track Delivery
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
