"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Mock data for location selects
const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
];

const states = {
  US: [
    { code: "CA", name: "California" },
    { code: "NY", name: "New York" },
    { code: "TX", name: "Texas" },
    { code: "FL", name: "Florida" },
  ],
  CA: [
    { code: "ON", name: "Ontario" },
    { code: "BC", name: "British Columbia" },
    { code: "AB", name: "Alberta" },
    { code: "QC", name: "Quebec" },
  ],
  UK: [
    { code: "ENG", name: "England" },
    { code: "SCT", name: "Scotland" },
    { code: "WLS", name: "Wales" },
    { code: "NIR", name: "Northern Ireland" },
  ],
  AU: [
    { code: "NSW", name: "New South Wales" },
    { code: "VIC", name: "Victoria" },
    { code: "QLD", name: "Queensland" },
    { code: "WA", name: "Western Australia" },
  ],
};

const cities = {
  CA: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
  NY: ["New York City", "Buffalo", "Rochester", "Syracuse"],
  TX: ["Houston", "Dallas", "Austin", "San Antonio"],
  FL: ["Miami", "Orlando", "Tampa", "Jacksonville"],
  ON: ["Toronto", "Ottawa", "Hamilton", "London"],
  BC: ["Vancouver", "Victoria", "Surrey", "Burnaby"],
  AB: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
  QC: ["Montreal", "Quebec City", "Laval", "Gatineau"],
};

const businessSectors = [
  "Electronics & Technology",
  "Fashion & Apparel",
  "Food & Beverage",
  "Health & Beauty",
  "Home & Garden",
  "Sports & Recreation",
  "Books & Media",
  "Automotive",
  "Arts & Crafts",
  "Other",
];

const currencies = [
  { code: "USD", name: "US Dollar (USD)" },
  { code: "EUR", name: "Euro (EUR)" },
  { code: "GBP", name: "British Pound (GBP)" },
  { code: "CAD", name: "Canadian Dollar (CAD)" },
  { code: "AUD", name: "Australian Dollar (AUD)" },
  { code: "JPY", name: "Japanese Yen (JPY)" },
];

interface StoreData {
  logo: string;
  storeName: string;
  businessName: string;
  businessSector: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  currency: string;
}

interface StoreEditFormProps {
  storeData: any;
  onSave: (data: StoreData) => void;
  onCancel: () => void;
}

export default function StoreEditForm({
  storeData,
  onSave,
  onCancel,
}: StoreEditFormProps) {
  const [formData, setFormData] = useState<StoreData>(storeData);
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Update states when country changes
  useEffect(() => {
    const countryCode = countries.find(
      (c) => c.name === formData.country
    )?.code;
    if (countryCode && states[countryCode as keyof typeof states]) {
      setAvailableStates(states[countryCode as keyof typeof states]);
      // Reset state and city when country changes
      if (formData.country !== storeData.country) {
        setFormData((prev) => ({ ...prev, state: "", city: "" }));
      }
    } else {
      setAvailableStates([]);
    }
  }, [formData.country, storeData.country]);

  // Update cities when state changes
  useEffect(() => {
    const stateCode = availableStates.find(
      (s) => s.name === formData.state
    )?.code;
    if (stateCode && cities[stateCode as keyof typeof cities]) {
      setAvailableCities(cities[stateCode as keyof typeof cities]);
      // Reset city when state changes
      if (formData.state !== storeData.state) {
        setFormData((prev) => ({ ...prev, city: "" }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.state, availableStates, storeData.state]);

  const handleInputChange = (field: keyof StoreData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Store Information
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your store details and business information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Profile Section */}
        <Card className="p-4 border border-gray-200">
          <CardHeader>
            <CardTitle>Store Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Store Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo">Store Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={formData.logo || "/placeholder.svg"}
                    alt="Store Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Logo
                </Button>
              </div>
            </div>

            {/* Store Name and Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) =>
                    handleInputChange("storeName", e.target.value)
                  }
                  placeholder="Enter store name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                  placeholder="Enter business name"
                />
              </div>
            </div>

            {/* Business Sector */}
            <div className="space-y-2">
              <Label htmlFor="businessSector">Business Sector</Label>
              <Select
                value={formData.businessSector}
                onValueChange={(value) =>
                  handleInputChange("businessSector", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business sector" />
                </SelectTrigger>
                <SelectContent>
                  {businessSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Store Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline">Store Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => handleInputChange("tagline", e.target.value)}
                placeholder="Enter store tagline"
              />
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter store description"
                rows={4}
              />
            </div>

            {/* Store Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Store Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card className="p-4 border border-gray-200">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter contact phone"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                  disabled={availableStates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state.code} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  disabled={availableCities.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zip Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="Enter zip code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
