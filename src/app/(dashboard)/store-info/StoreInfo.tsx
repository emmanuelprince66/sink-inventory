"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreHook } from "@/hooks/useStoreHook";
import { Building2, DollarSign, Edit, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import StoreEditForm from "./StoreEditForm";
import StoreUrlCard from "./StoreUrlCard";

const SkeletonItem = ({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <Skeleton className="h-5 w-5 mt-0.5 bg-gray-100" />
    <div className="space-y-1 flex-1">
      <Skeleton className="h-4 w-24 bg-gray-100" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full bg-gray-100" />
      ))}
    </div>
  </div>
);

const SkeletonProfileCard = () => (
  <Card className="overflow-hidden border border-gray-200 shadow-sm">
    <Skeleton className="h-48 w-full bg-gray-100" />
    <CardContent className="space-y-6 p-6">
      <div className="flex justify-center -mt-16">
        <Skeleton className="w-32 h-32 rounded-xl bg-gray-100 border-4 border-white" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto bg-gray-100" />
        <Skeleton className="h-6 w-32 mx-auto bg-gray-100" />
      </div>
      <div className="text-center">
        <Skeleton className="h-6 w-80 mx-auto bg-gray-100" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 bg-gray-100" />
        <Skeleton className="h-20 w-full bg-gray-100" />
      </div>
    </CardContent>
  </Card>
);

const SkeletonInfoCard = () => (
  <Card className="border-gray-200 shadow-sm">
    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
      <CardTitle>
        <Skeleton className="h-6 w-32 bg-gray-100" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 p-6">
      <SkeletonItem lines={1} />
      <SkeletonItem lines={3} className="space-y-0.5" />
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 mt-0.5 bg-gray-100" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-20 bg-gray-100" />
          <Skeleton className="h-6 w-12 bg-gray-100" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function StoreInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const { BusinessDataLoading, storeData, copySuccess, copyStoreUrl } =
    useStoreHook({ setIsEditing });

  // console.log("storeData", storeData);
  // console.log("isEditing", isEditing);

  return (
    <>
      {isEditing ? (
        <StoreEditForm setIsEditing={setIsEditing} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
          <div className="container mx-auto p-1 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-md md:text-3xl  font-bold tracking-tight bg-gradient-to-r from-green-900 to-green-600 bg-clip-text text-transparent">
                  Store Information
                </h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Manage your store details and business information
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                className="w-fit bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Store Information
              </Button>
            </div>

            {/* Cards Container */}
            {BusinessDataLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonProfileCard />
                <SkeletonInfoCard />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Store Profile Card */}
                <Card className="overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Header Image */}
                  <div className="relative h-48 w-full bg-gradient-to-r from-green-500 to-emerald-600">
                    <Image
                      src={storeData.headerImage}
                      alt="Store Header"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <CardContent className="space-y-6 p-6">
                    {/* Store Logo - Overlapping header */}
                    <div className="flex justify-center -mt-16">
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-xl bg-white">
                        <Image
                          src={storeData.logo}
                          alt="Store Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Business Name */}
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {storeData.businessName}
                      </h2>
                      <Badge
                        variant="secondary"
                        className="text-sm px-4 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                      >
                        {storeData.businessSector}
                      </Badge>
                    </div>

                    {/* Store Tagline */}
                    {storeData.tagline && (
                      <div className="text-center bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-lg font-medium text-gray-700 italic">
                          "{storeData.tagline}"
                        </p>
                      </div>
                    )}

                    {/* Store Description */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-700">
                          About Us
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {storeData.description || "No description available."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Store Information Card */}
                <div className="space-y-6">
                  {/* Store URL Card */}

                  <StoreUrlCard storeData={storeData} />

                  {/* Contact & Details Card */}
                  <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 pt-5">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <CardTitle className="text-gray-900">
                        Contact & Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      {/* Contact Phone */}
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-gray-700">
                            Contact Phone
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {storeData.phone || "No phone number available."}
                          </p>
                        </div>
                      </div>

                      {/* Email */}
                      {storeData.email && (
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-medium text-sm text-gray-700">
                              Email Address
                            </p>
                            <p className="text-sm text-gray-900 font-medium">
                              {storeData.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-gray-700">
                            Address
                          </p>
                          <div className="text-sm text-gray-900 space-y-0.5">
                            <p className="font-medium">
                              {storeData.address || "No address available."}
                            </p>
                            <p>
                              {storeData.city}, {storeData.state}{" "}
                              {storeData.zipCode}
                            </p>
                            <p>{storeData.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Store Currency */}
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-gray-700">
                            Store Currency
                          </p>
                          <Badge
                            variant="outline"
                            className="text-sm border-green-200 bg-green-50 text-green-700"
                          >
                            {storeData.currency}
                          </Badge>
                        </div>
                      </div>

                      {/* Store Name */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="space-y-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                          <p className="font-medium text-sm text-gray-700">
                            Store Display Name
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {storeData.storeName}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
