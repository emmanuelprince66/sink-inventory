"use client";
import { PhoneInput } from "@/components/app/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
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
import { MAX_BANNERS, useStoreHook } from "@/hooks/useStoreHook";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Image as ImageIconLucide,
  Palette,
  Save,
  Truck,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import WorkingHours from "./WorkingHours";

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 text-error-1 text-xs mt-1">
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
    toggleDeliveryDay,
    toggleWorkingDay,
    handleSubmit,
    handleLogoChange,
    handleBannerChange,
    logoPreview,
    handleCancel,
    bannerItems,
    removeBanner,
    moveBanner,
    logoInputRef,
    bannerInputRef,
    CURRENCY_OPTIONS,
    BUSINESS_SECTOR_OPTIONS,
    DELIVERY_DAYS_OPTIONS,
    storeThemeOptions,
    storeThemesLoading,
  } = useStoreHook({ setIsEditing });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsEditing(false)}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
          Edit Store Information
        </h1>
      </div>

      <div className="space-y-4 w-full">
        {/* Image Uploads Section */}
        <Card className="overflow-hidden rounded-2xl border-border-tint py-0">
          <CardHeader className="border-b border-border-tint py-4">
            <CardTitle className="flex items-center gap-2 text-grey-1 text-base font-extrabold">
              <ImageIconLucide className="w-5 h-5 text-primary-green-300" />
              Store Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Banners */}
            <div className="space-y-3">
              <Label htmlFor="bannerUpload" className="text-sm font-bold">
                Store Banners
                <span className="text-xs font-normal text-grey-3 ml-2">
                  (Up to {MAX_BANNERS} · Recommended: 1200x300px)
                </span>
              </Label>
              <p className="text-xs text-grey-3">
                Banners rotate in your storefront&apos;s hero. The first one is
                your main banner.
              </p>
              {bannerItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {bannerItems.map((item, index) => {
                    const prev = bannerItems[index - 1];
                    const next = bannerItems[index + 1];
                    const canMoveLeft =
                      !!prev && Boolean(prev.file) === Boolean(item.file);
                    const canMoveRight =
                      !!next && Boolean(next.file) === Boolean(item.file);
                    return (
                      <div
                        key={item.id}
                        className="group relative h-32 overflow-hidden rounded-lg border border-grey-5 bg-grey-6"
                      >
                        <Image
                          src={item.url}
                          alt={`Banner ${index + 1}`}
                          fill
                          unoptimized={Boolean(item.file)}
                          className="object-cover"
                        />
                        <div className="absolute left-2 top-2 flex gap-1">
                          {index === 0 && (
                            <span className="rounded-full bg-primary-green-300 px-2 py-0.5 text-[10px] font-bold text-white">
                              Main
                            </span>
                          )}
                          {item.file && (
                            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-grey-2">
                              New
                            </span>
                          )}
                        </div>
                        <div className="absolute right-2 top-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveBanner(item.id, -1)}
                            disabled={!canMoveLeft || isSubmitting}
                            aria-label={`Move banner ${index + 1} earlier`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-grey-2 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBanner(item.id, 1)}
                            disabled={!canMoveRight || isSubmitting}
                            aria-label={`Move banner ${index + 1} later`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-grey-2 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBanner(item.id)}
                            disabled={isSubmitting}
                            aria-label={`Remove banner ${index + 1}`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-error-1 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-grey-5 bg-grey-6 text-xs text-grey-3">
                  <ImageIconLucide className="mb-1 h-5 w-5 text-grey-4" />
                  No banners yet
                </div>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBannerChange}
                className="hidden"
                id="bannerUpload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-grey-5 text-grey-2 hover:bg-secondary-6 hover:border-primary-green-300"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isSubmitting || bannerItems.length >= MAX_BANNERS}
              >
                <Upload className="w-4 h-4 mr-2" />
                {bannerItems.length >= MAX_BANNERS
                  ? `Maximum of ${MAX_BANNERS} banners`
                  : "Add Banners"}
              </Button>
              <ErrorMessage message={errors.headerImage} />
            </div>
            {/* Store Logo */}
            <div className="space-y-3">
              <Label htmlFor="logo" className="text-sm font-bold">
                Store Logo
                <span className="text-xs font-normal text-grey-3 ml-2">
                  (Recommended: 400x400px)
                </span>
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border-tint bg-white shadow-sm">
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
                  className="border-grey-5 text-grey-2 hover:bg-secondary-6 hover:border-primary-green-300"
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
        <Card className="rounded-2xl border-border-tint py-0">
          <CardHeader className="border-b border-border-tint py-4">
            <CardTitle className="text-grey-1 text-base font-extrabold">
              Store Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Store Name and Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="font-bold">
                  Store Name <span className="text-error-1">*</span>
                </Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) =>
                    handleInputChange("storeName", e.target.value)
                  }
                  placeholder="Enter store name"
                  className={errors.storeName ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.storeName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="font-bold">
                  Business Name <span className="text-error-1">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                  placeholder="Enter business name"
                  className={errors.businessName ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.businessName} />
              </div>
            </div>
            {/* Business Sector - Full Width */}
            <div className="space-y-2 w-full">
              <Label htmlFor="businessSector" className="font-bold">
                Business Sector <span className="text-error-1">*</span>
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
                    errors.businessSector ? "border-error-1 w-full" : "w-full"
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
              <Label htmlFor="tagline" className="font-bold">
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
              <p className="text-xs text-grey-3">
                {formData.tagline?.length || 0}/150 characters
              </p>
              <ErrorMessage message={errors.tagline} />
            </div>
            {/* Store Description - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold">
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
                className={errors.description ? "border-error-1" : ""}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                <ErrorMessage message={errors.description} />
                <p className="text-xs text-grey-3">
                  {formData.description?.length || 0} characters
                </p>
              </div>
            </div>
            {/* Store Currency - Full Width */}
            <div className="space-y-2 w-full">
              <Label htmlFor="currency" className="font-bold">
                Store Currency <span className="text-error-1">*</span>
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={
                    errors.currency ? "border-error-1 w-full" : "w-full"
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
        {/* Store Theme Section */}
        <Card className="rounded-2xl bg-white z-100 border-border-tint py-0">
          <CardHeader className="border-b border-border-tint py-4">
            <CardTitle className="flex items-center gap-2 text-grey-1 text-base font-extrabold">
              <Palette className="w-5 h-5 text-primary-green-300" />
              Store Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <p className="text-sm text-grey-3 mb-4">
              Pick your brand color. We use it as the accent customers see
              across your storefront, and shades are generated from it
              automatically.
            </p>
            {storeThemesLoading ? (
              <div className="h-16 w-64 rounded-xl border border-border-tint bg-grey-6 animate-pulse" />
            ) : (
              <ColorPicker
                value={formData.storeTheme}
                onChange={(hex) => handleInputChange("storeTheme", hex)}
                disabled={isSubmitting}
                presets={storeThemeOptions}
              />
            )}
            <ErrorMessage message={errors.storeTheme} />
          </CardContent>
        </Card>
        {/* Contact & Address Section */}
        <Card className="rounded-2xl border-border-tint py-0">
          <CardHeader className="border-b border-border-tint py-4">
            <CardTitle className="text-grey-1 text-base font-extrabold">
              Contact & Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Contact Phone and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold">
                  Contact Phone <span className="text-error-1">*</span>
                </Label>
                <PhoneInput
                  id="phone"
                  international
                  defaultCountry="NG"
                  value={formData.phone || undefined}
                  onChange={(value) => handleInputChange("phone", value || "")}
                  placeholder="Enter phone number"
                  className={errors.phone ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.phone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="font-bold">
                  WhatsApp Number
                </Label>
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={formData.whatsappNumber || undefined}
                  onChange={(value) =>
                    handleInputChange("whatsappNumber", value || "")
                  }
                  placeholder="Enter WhatsApp number"
                  className={errors.whatsappNumber ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.whatsappNumber} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="font-bold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="store@example.com"
                  className={errors.email ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.email} />
              </div>
            </div>
            {/* Address - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="address" className="font-bold">
                Street Address <span className="text-error-1">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street, Suite 100"
                className={errors.address ? "border-error-1" : ""}
                disabled={isSubmitting}
              />
              <ErrorMessage message={errors.address} />
            </div>
            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="font-bold">
                  Country <span className="text-error-1">*</span>
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country"
                  className={errors.country ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.country} />
              </div>
              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="font-bold">
                  State/Province <span className="text-error-1">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state/province"
                  className={errors.state ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.state} />
              </div>
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="font-bold">
                  City <span className="text-error-1">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  className={errors.city ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.city} />
              </div>
              {/* Zip Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="font-bold">
                  Zip/Postal Code
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="12345"
                  className={errors.zipCode ? "border-error-1" : ""}
                  disabled={isSubmitting}
                />
                <ErrorMessage message={errors.zipCode} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Shipping Defaults */}
        <Card className="rounded-2xl border-border-tint py-0">
          <CardHeader className="border-b border-border-tint py-4">
            <CardTitle className="flex items-center gap-2 text-grey-1 text-base font-extrabold">
              <Truck className="w-5 h-5 text-primary-green-300" />
              Delivery & Shipping Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Working Days */}
            <div className="space-y-2">
              <Label className="font-bold">Working Days</Label>
              <p className="text-sm text-grey-3">
                Select the days your store is open. This drives store hours
                shown to customers and dispatch availability.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {DELIVERY_DAYS_OPTIONS.map((day) => {
                  const isSelected = formData.workingDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWorkingDay(day.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-bold transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary-green-300 border-primary-green-300 text-white hover:bg-primary-green-300/90"
                          : "bg-white border-border-tint text-grey-2 hover:border-primary-green-300 hover:bg-secondary-6",
                        isSubmitting && "opacity-60 cursor-not-allowed",
                      )}
                      aria-pressed={isSelected}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
              {formData.workingDays.length > 0 && (
                <p className="text-xs text-grey-3 mt-1">
                  {formData.workingDays.length} day
                  {formData.workingDays.length === 1 ? "" : "s"} selected
                </p>
              )}
              <ErrorMessage message={errors.workingDays} />
            </div>

            {/* Delivery Days */}
            <div className="space-y-2">
              <Label className="font-bold">Delivery Days</Label>
              <p className="text-sm text-grey-3">
                Select the days your store delivers orders. Customers will only
                be able to choose these days at checkout.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {DELIVERY_DAYS_OPTIONS.map((day) => {
                  const isSelected = formData.deliveryDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDeliveryDay(day.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-bold transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary-green-300 border-primary-green-300 text-white hover:bg-primary-green-300/90"
                          : "bg-white border-border-tint text-grey-2 hover:border-primary-green-300 hover:bg-secondary-6",
                        isSubmitting && "opacity-60 cursor-not-allowed",
                      )}
                      aria-pressed={isSelected}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
              {formData.deliveryDays.length > 0 && (
                <p className="text-xs text-grey-3 mt-1">
                  {formData.deliveryDays.length} day
                  {formData.deliveryDays.length === 1 ? "" : "s"} selected
                </p>
              )}
              <ErrorMessage message={errors.deliveryDays} />
            </div>

            {/* Default Package Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="font-bold">
                Default Package Weight
              </Label>
              <p className="text-sm text-grey-3">
                Used as a fallback when a product doesn't have its own weight.
                Shipping rates are calculated from this value.
              </p>
              <div className="relative max-w-xs">
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="2"
                  className={cn("pr-12", errors.weight ? "border-error-1" : "")}
                  disabled={isSubmitting}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-grey-3">
                  Kg
                </span>
              </div>
              <ErrorMessage message={errors.weight} />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <WorkingHours />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sticky bottom-4 bg-white p-4 rounded-2xl border border-border-tint shadow-md">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-grey-5 text-grey-2 hover:bg-grey-6"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
