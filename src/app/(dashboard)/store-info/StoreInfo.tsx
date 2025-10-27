"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreHook } from "@/hooks/useStoreHook";
import { Building2, DollarSign, Edit, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import StoreEditForm from "./StoreEditForm";

interface StoreData {
  logo: string;
  storeName: string;
  businessName: string;
  businessSector: string;
  tagline: string | null;
  description: string | null;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  currency: string;
}

const initialStoreData: StoreData = {
  logo: "/placeholder.svg?height=120&width=120",
  storeName: "",
  businessName: "",
  businessSector: "",
  tagline: null,
  description: null,
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  currency: "",
};

const SkeletonItem = ({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <Skeleton className="h-5 w-5 mt-0.5 bg-[#eef4ef]" />
    <div className="space-y-1 flex-1">
      <Skeleton className="h-4 w-24 bg-[#eef4ef]" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full bg-[#eef4ef]" />
      ))}
    </div>
  </div>
);

const SkeletonProfileCard = () => (
  <Card className="h-fit p-4 border border-gray-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 bg-[#eef4ef]" />
        <Skeleton className="h-6 w-32 bg-[#eef4ef]" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex justify-center">
        <Skeleton className="w-32 h-32 rounded-lg bg-[#eef4ef]" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto bg-[#eef4ef]" />
        <Skeleton className="h-6 w-32 mx-auto bg-[#eef4ef]" />
      </div>
      <div className="text-center">
        <Skeleton className="h-6 w-80 mx-auto bg-[#eef4ef]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 bg-[#eef4ef]" />
        <Skeleton className="h-20 w-full bg-[#eef4ef]" />
      </div>
    </CardContent>
  </Card>
);

const SkeletonInfoCard = () => (
  <Card className="h-fit p-4 border-gray-200">
    <CardHeader>
      <CardTitle>
        <Skeleton className="h-6 w-32 bg-[#eef4ef]" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <SkeletonItem lines={1} />
      <SkeletonItem lines={3} className="space-y-0.5" />
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 mt-0.5 bg-[#eef4ef]" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-20 bg-[#eef4ef]" />
          <Skeleton className="h-6 w-12 bg-[#eef4ef]" />
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32 bg-[#eef4ef]" />
          <Skeleton className="h-6 w-48 bg-[#eef4ef]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function StoreInfo() {
  const { BusinessData, BusinessDataLoading, business_id } = useStoreHook();
  console.log("BusinessData", BusinessData);

  const findBusiness = BusinessData?.data;

  console.log("findBusiness", findBusiness);

  const [storeData, setStoreData] = useState<StoreData>(initialStoreData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (findBusiness) {
      setStoreData({
        logo: findBusiness.logo || "/placeholder.svg?height=120&width=120",
        storeName: findBusiness.name || "",
        businessName: findBusiness.name || "",
        businessSector: findBusiness.type || "",
        tagline: findBusiness.tag_line || null,
        description: findBusiness.description || null,
        phone: findBusiness.owner?.phone || "",
        address: findBusiness.street || "",
        city: findBusiness.city || "",
        state: findBusiness.state || "",
        country: findBusiness.country || "",
        zipCode: "",
        currency: findBusiness.currency || "",
      });
    }
  }, [findBusiness]);

  const handleSave = (updatedData: StoreData) => {
    setStoreData(updatedData);
    setIsEditing(false);
  };

  // if (!BusinessDataLoading) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
  //         <div className="space-y-2">
  //           <Skeleton className="h-8 w-48 bg-[#eef4ef]" />
  //           <Skeleton className="h-4 w-72 bg-[#eef4ef]" />
  //         </div>
  //         <Skeleton className="h-10 w-40 bg-[#eef4ef]" />
  //       </div> */}
  //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //         <SkeletonProfileCard />
  //         <SkeletonInfoCard />
  //       </div>
  //     </div>
  //   );
  // }

  if (isEditing) {
    return (
      <StoreEditForm
        storeData={storeData}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Store Information
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your store details and business information
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="w-fit">
          <Edit className="w-4 h-4 mr-2" />
          Edit Store Information
        </Button>
      </div>

      {/* Cards Container */}

      {BusinessDataLoading ? (
        <div className="container mx-auto p-6">
          {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-[#eef4ef]" />
            <Skeleton className="h-4 w-72 bg-[#eef4ef]" />
          </div>
          <Skeleton className="h-10 w-40 bg-[#eef4ef]" />
        </div> */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonProfileCard />
            <SkeletonInfoCard />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Profile Card */}
          <Card className="h-fit p-4 border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Store Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Image */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={storeData.logo}
                    alt="Store Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{storeData.businessName}</h2>
                <Badge variant="secondary" className="text-sm">
                  {storeData.businessSector}
                </Badge>
              </div>

              {/* Store Tagline */}
              <div className="text-center">
                <p className="text-lg font-medium text-primary italic">
                  "{storeData.tagline || ""}"
                </p>
              </div>

              {/* Store Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  About Us
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {storeData.description || "No description available."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Store Information Card */}
          <Card className="h-fit p-4 border-gray-200">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Contact Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {storeData.phone || "No phone number available."}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Address</p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{storeData.address || "No address available."}</p>
                    <p>
                      {storeData.city}, {storeData.state} {storeData.zipCode}
                    </p>
                    <p>{storeData.country}</p>
                  </div>
                </div>
              </div>

              {/* Store Currency */}
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Store Currency</p>
                  <Badge variant="outline" className="text-sm">
                    {storeData.currency}
                  </Badge>
                </div>
              </div>

              {/* Store Name */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Store Display Name</p>
                  <p className="text-lg font-semibold">{storeData.storeName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
