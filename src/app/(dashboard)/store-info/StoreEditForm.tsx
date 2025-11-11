"use client";
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
import { useStoreHook } from "@/hooks/useStoreHook";
import {
  AlertCircle,
  ArrowLeft,
  Image as ImageIconLucide,
  Save,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
      <AlertCircle className="w-3 h-3" />
      <span>{message}</span>
    </div>
  );
};

export default function StoreEditForm({ setIsEditing }: any) {
  const {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleLogoChange,
    handleBannerChange,
    logoPreview,
    handleCancel,
    bannerPreview,
    logoInputRef,
    bannerInputRef,
    CURRENCY_OPTIONS,
    BUSINESS_SECTOR_OPTIONS,
  } = useStoreHook({ setIsEditing });

  console.log("StoreEditForm rendered");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 w-full">
      <div className="container mx-auto p-1 md:p-6 max-w-full md:max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <p className="text-md md:text-3xl font-bold tracking-tight bg-gradient-to-r from-green-900 to-green-600 bg-clip-text text-transparent">
              Edit Store Information
            </p>
            <p className="text-muted-foreground  text-sm md:text-base mt-2 text-base">
              Update your store details and business information
            </p>
          </div>
        </div>
        <div className="space-y-8 w-full ">
          {/* Image Uploads Section */}
          <Card className="border border-gray-200 shadow-lg overflow-hidden w-full">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 pt-5">
              <CardTitle className="flex items-center gap-2">
                <ImageIconLucide className="w-5 h-5 text-green-600" />
                Store Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Header Image */}
              <div className="space-y-3">
                <Label
                  htmlFor="headerImage"
                  className="text-base font-semibold"
                >
                  Header Image
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Recommended: 1200x300px)
                  </span>
                </Label>
                <div className="space-y-3">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors bg-gradient-to-r from-green-50 to-emerald-50">
                    <Image
                      src={bannerPreview || "/placeholder.svg"}
                      alt="Header Image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="bannerUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-green-50 hover:border-green-300"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Header Image
                  </Button>
                  <ErrorMessage message={errors.headerImage} />
                </div>
              </div>
              {/* Store Logo */}
              <div className="space-y-3">
                <Label htmlFor="logo" className="text-base font-semibold">
                  Store Logo
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Recommended: 400x400px)
                  </span>
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-md">
                    <Image
                      src={logoPreview || "/placeholder.svg"}
                      alt="Store Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logoUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 hover:border-green-300"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Logo
                  </Button>
                </div>
                <ErrorMessage message={errors.logo} />
              </div>
            </CardContent>
          </Card>
          {/* Store Profile Section */}
          <Card className="border border-gray-200 shadow-lg pt-5">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle>Store Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Store Name and Business Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="font-semibold">
                    Store Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) =>
                      handleInputChange("storeName", e.target.value)
                    }
                    placeholder="Enter store name"
                    className={errors.storeName ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.storeName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="font-semibold">
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    placeholder="Enter business name"
                    className={errors.businessName ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.businessName} />
                </div>
              </div>
              {/* Business Sector - Full Width */}
              <div className="space-y-2 w-full">
                <Label htmlFor="businessSector" className="font-semibold">
                  Business Sector <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.businessSector}
                  onValueChange={(value) =>
                    handleInputChange("businessSector", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={
                      errors.businessSector ? "border-red-500 w-full" : "w-full"
                    }
                  >
                    <SelectValue placeholder="Select business sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SECTOR_OPTIONS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorMessage message={errors.businessSector} />
              </div>
              {/* Store Tagline - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="tagline" className="font-semibold">
                  Store Tagline
                </Label>
                <Input
                  id="tagline"
                  value={formData.tagline || ""}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  placeholder="Enter a catchy tagline for your store"
                  maxLength={150}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.tagline?.length || 0}/150 characters
                </p>
                <ErrorMessage message={errors.tagline} />
              </div>
              {/* Store Description - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">
                  Store Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your store and what makes it unique"
                  rows={5}
                  className={errors.description ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <ErrorMessage message={errors.description} />
                  <p className="text-xs text-muted-foreground">
                    {formData.description?.length || 0} characters
                  </p>
                </div>
              </div>
              {/* Store Currency - Full Width */}
              <div className="space-y-2 w-full">
                <Label htmlFor="currency" className="font-semibold">
                  Store Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={
                      errors.currency ? "border-red-500 w-full" : "w-full"
                    }
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorMessage message={errors.currency} />
              </div>
            </CardContent>
          </Card>
          {/* Contact & Address Section */}
          <Card className="border border-gray-200 shadow-lg pt-5">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle>Contact & Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Contact Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold">
                    Contact Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="store@example.com"
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.email} />
                </div>
              </div>
              {/* Address - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="address" className="font-semibold">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street, Suite 100"
                  className={errors.address ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.address} />
              </div>
              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="font-semibold">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    placeholder="Enter country"
                    className={errors.country ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.country} />
                </div>
                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state" className="font-semibold">
                    State/Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state/province"
                    className={errors.state ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.state} />
                </div>
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-semibold">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    className={errors.city ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.city} />
                </div>
                {/* Zip Code */}
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="font-semibold">
                    Zip/Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    placeholder="12345"
                    className={errors.zipCode ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.zipCode} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sticky bottom-6 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="hover:bg-gray-50"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
