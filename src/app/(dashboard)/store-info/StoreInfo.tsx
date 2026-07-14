"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DELIVERY_DAYS_OPTIONS, useStoreHook } from "@/hooks/useStoreHook";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Edit,
  Info,
  Mail,
  MapPin,
  Phone,
  Store,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import StoreEditForm from "./StoreEditForm";
import StoreUrlCard from "./StoreUrlCard";

const SkeletonProfileCard = () => (
  <div className="rounded-2xl overflow-hidden border border-border-tint bg-grey-1">
    <div className="h-9 w-full bg-black/20" />
    <div className="px-6 py-8 flex flex-col items-center gap-3">
      <Skeleton className="w-16 h-16 rounded-2xl bg-grey-4" />
      <Skeleton className="h-6 w-40 bg-grey-4" />
      <Skeleton className="h-4 w-24 bg-grey-4" />
      <Skeleton className="h-10 w-full bg-grey-4 rounded-full mt-2" />
      <Skeleton className="h-10 w-full bg-grey-4 rounded-full" />
    </div>
  </div>
);

const SkeletonInfoCard = () => (
  <div className="bg-white rounded-2xl border border-border-tint p-5 space-y-4">
    <Skeleton className="h-5 w-32 bg-grey-5" />
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full bg-grey-5 flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-20 bg-grey-5" />
          <Skeleton className="h-4 w-32 bg-grey-5" />
        </div>
      </div>
    ))}
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-secondary-6 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-grey-3">
        {label}
      </p>
      <p className="text-sm font-extrabold text-grey-1 truncate">{value}</p>
    </div>
  </div>
);

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export default function StoreInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const { BusinessDataLoading, storeData } = useStoreHook({ setIsEditing });

  return (
    <>
      {isEditing ? (
        <StoreEditForm setIsEditing={setIsEditing} />
      ) : (
        <div className="w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
                Store Information
              </p>
              <p className="text-grey-3 mt-1 text-sm">
                Manage your store details and business information
              </p>
            </div>
            <Button onClick={() => setIsEditing(true)} className="w-fit rounded-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit Store Information
            </Button>
          </div>

          {/* Cards Container */}
          {BusinessDataLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SkeletonProfileCard />
              <SkeletonInfoCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                {/* Store Profile Card — browser-mockup style */}
                <div className="rounded-2xl overflow-hidden border border-border-tint bg-grey-1">
                  {/* Browser chrome bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-black/20">
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-error-1" />
                      <span className="w-2.5 h-2.5 rounded-full bg-warning-1" />
                      <span className="w-2.5 h-2.5 rounded-full bg-success-1" />
                    </div>
                    <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-[11px] text-white/60 truncate">
                      {storeData.storeUrl.replace(/^https?:\/\//, "")}
                    </div>
                  </div>

                  <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-xl font-extrabold text-grey-1 overflow-hidden flex-shrink-0 relative">
                      {storeData.logo ? (
                        <Image
                          src={storeData.logo}
                          alt="Store Logo"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        getInitials(storeData.storeName)[0]
                      )}
                    </div>

                    <div>
                      <h2 className="text-white text-xl font-extrabold">
                        {storeData.storeName}
                      </h2>
                      <p className="text-secondary-3 text-sm font-semibold mt-0.5">
                        {storeData.businessSector}
                      </p>
                    </div>

                    {/* Tagline */}
                    {storeData.tagline && (
                      <div className="w-full bg-white/10 rounded-full px-4 py-2.5">
                        <p className="text-white text-sm italic truncate">
                          "{storeData.tagline}"
                        </p>
                      </div>
                    )}

                    {/* Registered business name */}
                    <div className="w-full flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <span className="w-6 h-6 rounded-full bg-primary-green-300 text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                        {getInitials(storeData.businessName)}
                      </span>
                      <span className="text-white text-sm font-semibold truncate">
                        {storeData.businessName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* About Us */}
                <div className="bg-white rounded-2xl border border-border-tint p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary-green-300" />
                    <h3 className="font-extrabold text-grey-1 text-sm">
                      About Us
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-grey-3">
                    {storeData.description || "No description available."}
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Store URL Card */}
                <StoreUrlCard storeData={storeData} />

                {/* Contact & Details Card */}
                <div className="bg-white rounded-2xl border border-border-tint p-5 space-y-4">
                  <h3 className="font-extrabold text-grey-1 text-base">
                    Contact & Details
                  </h3>

                  <InfoRow
                    icon={<Phone className="w-4 h-4 text-primary-green-300" />}
                    label="Contact Phone"
                    value={storeData.phone || "Not set"}
                  />

                  {storeData.email && (
                    <InfoRow
                      icon={<Mail className="w-4 h-4 text-primary-green-300" />}
                      label="Email Address"
                      value={storeData.email}
                    />
                  )}

                  <InfoRow
                    icon={<MapPin className="w-4 h-4 text-primary-green-300" />}
                    label="Address"
                    value={
                      storeData.address
                        ? `${storeData.address}, ${storeData.city}, ${storeData.state}`
                        : "Not set"
                    }
                  />

                  <InfoRow
                    icon={<DollarSign className="w-4 h-4 text-primary-green-300" />}
                    label="Store Currency"
                    value={storeData.currency}
                  />

                  <InfoRow
                    icon={<Store className="w-4 h-4 text-primary-green-300" />}
                    label="Store Display Name"
                    value={storeData.storeName}
                  />
                </div>

                {/* Delivery Days */}
                <div className="bg-white rounded-2xl border border-border-tint p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-primary-green-300" />
                    <h3 className="font-extrabold text-grey-1 text-base">
                      Delivery Days
                    </h3>
                  </div>
                  <p className="text-xs text-grey-3 mb-3">
                    Days your store delivers orders to customers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERY_DAYS_OPTIONS.map((day) => {
                      const isActive =
                        storeData.deliveryDays?.includes(day.value);
                      return (
                        <span
                          key={day.value}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold",
                            isActive
                              ? "bg-primary-green-300 text-white"
                              : "bg-grey-6 text-grey-4",
                          )}
                        >
                          {day.short}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
