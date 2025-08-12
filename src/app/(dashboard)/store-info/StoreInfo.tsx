"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Edit, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import StoreEditForm from "./StoreEditForm";

// Mock store data
const initialStoreData = {
  logo: "/placeholder.svg?height=120&width=120",
  storeName: "Tech Haven",
  businessName: "Tech Haven Electronics LLC",
  businessSector: "Electronics & Technology",
  tagline: "Your Gateway to Innovation",
  description:
    "We specialize in cutting-edge electronics, gadgets, and technology solutions. From smartphones to smart home devices, we bring you the latest innovations at competitive prices.",
  phone: "+1 (555) 123-4567",
  address: "123 Innovation Drive",
  city: "San Francisco",
  state: "California",
  country: "United States",
  zipCode: "94105",
  currency: "USD",
};

export default function StoreInfo() {
  const [storeData, setStoreData] = useState(initialStoreData);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedData: typeof initialStoreData) => {
    setStoreData(updatedData);
    setIsEditing(false);
  };

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
                  src={storeData.logo || "/placeholder.svg"}
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
                "{storeData.tagline}"
              </p>
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                About Us
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {storeData.description}
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
                  {storeData.phone}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Address</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>{storeData.address}</p>
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
    </div>
  );
}
