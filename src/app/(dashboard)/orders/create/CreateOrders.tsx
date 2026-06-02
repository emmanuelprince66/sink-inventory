"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useOrdersHook } from "@/hooks/useOrdersHook";
import {
  AlertCircle,
  ArrowBigLeft,
  BadgePercent,
  Bike,
  Minus,
  Package,
  Phone,
  Plus,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";
import CustomerDrawer from "../../pos/CustomersDrawer";
import AssignDeliveryModal, {
  DeliveryPartner,
} from "../AssignDeliveryModal";
import ProductDrawer from "./ProductDrawer";
import ShippingDrawer from "./ShippingDrawer";

const CreateOrders = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isShippingDrawerOpen, setIsShippingDrawerOpen] = useState(false);
  const [isSelectProductDrawerOpen, setIsSelectProductDrawerOpen] =
    useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<any>(null);
  const [selectedBank, setSelectedBank] = useState("");
  // UI-only — not added to submit payload yet.
  const [openAssignDelivery, setOpenAssignDelivery] = useState(false);
  const [assignedPartner, setAssignedPartner] = useState<DeliveryPartner | null>(
    null,
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [confirmedDeliveryPrice, setConfirmedDeliveryPrice] = useState<
    number | null
  >(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  const resetDeliveryAssignment = () => {
    setAssignedPartner(null);
    setDeliveryAddress("");
    setConfirmedDeliveryPrice(null);
    setIsCalculatingPrice(false);
  };

  const handleSaveDeliveryAddress = () => {
    if (!assignedPartner || !deliveryAddress.trim()) return;
    setIsCalculatingPrice(true);
    // Simulated backend round-trip — replace with the real "calculate price" API
    // call once the endpoint exists. For now we just lock in the partner's
    // estimated cost as the "calculated" price.
    setTimeout(() => {
      setConfirmedDeliveryPrice(assignedPartner.estimatedCost);
      setIsCalculatingPrice(false);
    }, 800);
  };

  const {
    InventoryData,
    InventoryDataLoading,
    salesChannelOptions,
    onSubmit,
    CreateOrderLoading,
    customer,
    setCustomer,
    selectedProducts,
    setSelectedProducts,
    productErrors,
    shippingFee,
    setShippingFee,
    tax,
    setTax,
    filteredInventoryData,
    selectedSalesChannel,
    ShippingData,
    allShippingDataLoading,
    setSelectedSalesChannel,
    shippingDate,
    setShippingDate,
    paymentStatus,
    setPaymentStatus,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    notes,
    setNotes,
    amountPaid,
    setAmountPaid,
    removeProduct,
    updateProductQuantity,
    getProductPrice,
    getProductDiscount,
    isDiscountApplied,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTotal,
    hasQuantityErrors,
    BankData,
    BankDataLoading,
    selectedVariations,
    handleVariationSelect,
    getSelectedVariation,
    hasVariations,
  } = useOrdersHook({
    page,
    searchInput,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedBank);
  };

  return (
    <div className="space-y-4 sm:space-y-6 mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-6">
      <ArrowBigLeft
        className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8"
        onClick={() => window.history.back()}
      />
      <h2 className="text-lg sm:text-xl font-semibold">Order Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {/* Customer Dropdown */}
          <div className="space-y-2 w-full">
            <Label>Customer *</Label>
            <div
              className="hover:border-green-300 cursor-pointer rounded-md border border-gray-200 bg-white px-3 sm:px-4 h-10 flex items-center"
              onClick={() => setIsCustomerDrawerOpen(true)}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-xs sm:text-sm">
                  {customer ? customer.name : "Add Customer"}
                </span>

                {customer?.name && (
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 p-1 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomer(null);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-500 hover:text-red-900" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Date */}
          <div className="space-y-2 w-full">
            <Label htmlFor="shippingDate">Shipping Date *</Label>
            <div className="relative">
              <Input
                className="bg-white border border-gray-200 h-10 text-sm cursor-pointer"
                type="date"
                id="shippingDate"
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sales Channel */}
        <div className="space-y-2 w-full">
          <Label htmlFor="salesChannel">Sales Channel *</Label>
          <Select
            value={selectedSalesChannel}
            onValueChange={setSelectedSalesChannel}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select a sales channel" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {salesChannelOptions.map((channel: any) => (
                <SelectItem
                  className="cursor-pointer"
                  key={channel.value}
                  value={channel.value}
                >
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Section */}
        <div className="space-y-4 w-full">
          <Label>Products *</Label>
          <div
            className="hover:border-green-300 cursor-pointer rounded-md border border-gray-200 bg-white p-3 sm:p-4"
            onClick={() => setIsSelectProductDrawerOpen(true)}
          >
            <p className="text-xs sm:text-sm text-gray-600">
              {selectedProducts.length > 0
                ? `${selectedProducts.length} product(s) selected`
                : "Click to select products"}
            </p>
          </div>

          {selectedProducts.length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {selectedProducts.map((product) => (
                <div key={product.id} className="p-3 sm:p-4 space-y-3">
                  {/* Product Header with Variation Badge */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm sm:text-base truncate">
                              {product.name}
                            </h4>
                            {hasVariations(product) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                                <Package className="w-3 h-3" />
                                Has Variations
                              </span>
                            )}
                          </div>
                          {!hasVariations(product) && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                              ₦{getProductPrice(product).toLocaleString()} per
                              unit
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="border border-red-500 hover:bg-red-50 flex-shrink-0"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      </Button>
                    </div>

                    {/* Variation Selection Section */}
                    {hasVariations(product) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-600" />
                          <Label className="text-sm font-medium text-green-900">
                            Select Variation{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        <Select
                          value={selectedVariations[product.id] || ""}
                          onValueChange={(value) =>
                            handleVariationSelect(product.id, value)
                          }
                        >
                          <SelectTrigger className="w-full bg-white border-green-300">
                            <SelectValue placeholder="Choose a variation..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {product.variations.map((variation: any) => (
                              <SelectItem
                                key={variation.id}
                                value={variation.id}
                                className="cursor-pointer hover:bg-green-50"
                              >
                                <div className="flex items-center justify-between w-full gap-4">
                                  <span className="font-medium">
                                    {variation.name}
                                  </span>
                                  <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span>Stock: {variation.quantity}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-green-600">
                                      ₦
                                      {variation.selling_price?.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedVariations[product.id] && (
                          <div className="text-xs mt-2 text-green-700 bg-green-100 p-2 rounded border border-green-200">
                            Selected: {getSelectedVariation(product)?.name} - ₦
                            {getProductPrice(product).toLocaleString()} per unit
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity Input - Only show if variation is selected or no variations */}
                    {(!hasVariations(product) ||
                      selectedVariations[product.id]) && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600 mb-1 block">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity || 1}
                            className={`w-full text-sm ${
                              productErrors[product.id]
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }`}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 1;
                              updateProductQuantity(product.id, quantity);
                            }}
                            disabled={
                              hasVariations(product) &&
                              !selectedVariations[product.id]
                            }
                          />
                          {productErrors[product.id] && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {productErrors[product.id]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discount Information */}
                  {selectedVariations[product.id] &&
                    isDiscountApplied(product) && (
                      <div className="flex items-center gap-2 bg-green-50 p-2 rounded-md border border-green-200">
                        <BadgePercent className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-xs text-green-700 font-medium">
                            Discount Applied!
                          </p>
                          <p className="text-xs text-green-600">
                            ₦{getProductDiscount(product).toLocaleString()} off
                            per unit
                            {getSelectedVariation(product)
                              ?.discount_threshold && (
                              <span className="text-gray-600">
                                {" "}
                                (Buy{" "}
                                {
                                  getSelectedVariation(product)
                                    .discount_threshold
                                }
                                + items)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total saved:</p>
                          <p className="text-sm font-semibold text-green-600">
                            ₦
                            {(
                              getProductDiscount(product) *
                              (product.quantity || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Show threshold info when not yet reached */}
                  {selectedVariations[product.id] &&
                    !isDiscountApplied(product) &&
                    getSelectedVariation(product)?.discount_threshold &&
                    getSelectedVariation(product)?.discount > 0 && (
                      <div className="flex items-center gap-2 bg-green-50 p-2 rounded-md border border-green-200">
                        <BadgePercent className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-700">
                          Buy{" "}
                          {getSelectedVariation(product).discount_threshold -
                            (product.quantity || 1)}{" "}
                          more to get ₦
                          {getSelectedVariation(
                            product,
                          ).discount.toLocaleString()}{" "}
                          off per unit
                        </p>
                      </div>
                    )}
                </div>
              ))}

              {/* Order Summary Section */}
              <div className="p-3 sm:p-4 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Bill Summary
                  </h3>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {selectedProducts.length}{" "}
                    {selectedProducts.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Subtotal:</span>
                  <span className="text-sm">
                    ₦{calculateSubtotal().toLocaleString()}
                  </span>
                </div>

                {calculateTotalDiscount() > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Discount:</span>
                    <span className="text-sm text-green-600">
                      -₦{calculateTotalDiscount().toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tax:</span>
                    <div className="flex items-center gap-2">
                      {tax > 0 ? (
                        <>
                          <span className="text-sm">
                            ₦{tax.toLocaleString()}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setTax(0)}
                            className="border-red-500 text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          placeholder="0.00"
                          className="w-24 h-8 text-xs"
                          onChange={(e) =>
                            setTax(parseFloat(e.target.value) || 0)
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Shipping:</span>
                    <div className="flex items-center gap-2">
                      {shippingFee > 0 ? (
                        <>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold">
                              ₦{shippingFee.toLocaleString()}
                            </span>
                            {selectedShippingMethod?.location && (
                              <span className="text-xs text-gray-500">
                                {selectedShippingMethod.location}
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShippingFee(0);
                              setSelectedShippingMethod(null);
                            }}
                            className="border-red-500 text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsShippingDrawerOpen(true)}
                          className="border-green-500 text-green-500 hover:bg-green-50 h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Partner row (UI-only) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Delivery Partner:</span>
                    <div className="flex items-center gap-2">
                      {assignedPartner ? (
                        <>
                          <span className="text-sm text-gray-700">
                            {assignedPartner.name}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenAssignDelivery(true)}
                            className="border-gray-300 h-6 px-2 text-xs"
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetDeliveryAssignment}
                            className="border-red-500 text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenAssignDelivery(true)}
                          className="border-green-500 text-green-600 hover:bg-green-50 h-7 px-2 text-xs"
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          Assign Delivery
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-base sm:text-lg">
                    ₦{calculateTotal().toLocaleString()}
                  </span>
                </div>

                {/* Logistics card — visible once a partner is assigned */}
                {assignedPartner && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Logistics
                      </h4>
                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        {assignedPartner.rating}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 bg-white rounded-md p-3 border border-gray-200">
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                        {assignedPartner.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {assignedPartner.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignedPartner.serviceType}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {assignedPartner.contact}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bike className="w-3 h-3" />
                            {assignedPartner.eta}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">est. cost</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₦{assignedPartner.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Delivery address input — UI-only. On save we simulate
                        the backend call that returns the calculated price. */}
                    <div className="mt-3 bg-white rounded-md p-3 border border-gray-200 space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Delivery location / address
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={deliveryAddress}
                          onChange={(e) => {
                            setDeliveryAddress(e.target.value);
                            if (confirmedDeliveryPrice !== null) {
                              // Address edited after saving — invalidate the
                              // calculated price so the user re-saves.
                              setConfirmedDeliveryPrice(null);
                            }
                          }}
                          placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos"
                          className="flex-1 text-xs sm:text-sm"
                          disabled={isCalculatingPrice}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveDeliveryAddress}
                          disabled={
                            !deliveryAddress.trim() ||
                            isCalculatingPrice ||
                            confirmedDeliveryPrice !== null
                          }
                          className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 px-3"
                        >
                          {isCalculatingPrice
                            ? "Calculating..."
                            : confirmedDeliveryPrice !== null
                              ? "Saved"
                              : "Save"}
                        </Button>
                      </div>

                      {confirmedDeliveryPrice !== null && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            Calculated price:
                          </span>
                          <span className="text-sm font-semibold text-green-700">
                            ₦{confirmedDeliveryPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1.5 italic">
                      Delivery cost not added to total yet — will be wired once
                      backend supports it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Status Tabs - Keep existing code */}
        <div className="space-y-4 w-full">
          <Label>Payment Status *</Label>
          <Tabs
            value={paymentStatus.toLowerCase()}
            onValueChange={(value) => {
              setPaymentStatus(value.toUpperCase() as any);
              setSelectedPaymentMethod("");
              setSelectedBank("");
              setAmountPaid(0);
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="paid" className="text-xs sm:text-sm">
                Paid
              </TabsTrigger>
              <TabsTrigger value="unpaid" className="text-xs sm:text-sm">
                Unpaid
              </TabsTrigger>
              <TabsTrigger value="partial" className="text-xs sm:text-sm">
                Partially Paid
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paid" className="pt-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2 w-full">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={(value) => {
                      setSelectedPaymentMethod(value);
                      if (value !== "BANK") {
                        setSelectedBank("");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPaymentMethod === "BANK" && (
                  <div className="space-y-2 w-full">
                    <Label htmlFor="bankSelect">Select Bank *</Label>
                    {BankData?.data?.length > 0 ? (
                      <Select
                        value={selectedBank}
                        onValueChange={setSelectedBank}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {BankData.data.map((bank: any) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              <div className="flex flex-col items-start ">
                                <span className="font-medium">
                                  {bank.bank_name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500 text-center">
                          No bank accounts available. Please add a bank account
                          in settings.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="partial" className="pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-green-900">
                    ₦{calculateTotal().toLocaleString()}
                  </span>
                </div>
                {amountPaid > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Remaining Balance:</span>
                    <span className="font-semibold text-green-700">
                      ₦{(calculateTotal() - amountPaid).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid *</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    min="0"
                    max={calculateTotal()}
                    value={amountPaid || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value <= calculateTotal()) {
                        setAmountPaid(value);
                      }
                    }}
                    placeholder="Enter amount paid"
                    className="w-full"
                  />
                  {amountPaid > 0 && amountPaid >= calculateTotal() && (
                    <p className="text-xs text-red-500">
                      Partial amount must be less than total amount
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={(value) => {
                      setSelectedPaymentMethod(value);
                      if (value !== "BANK") {
                        setSelectedBank("");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPaymentMethod === "BANK" && (
                  <div className="space-y-2 w-full">
                    <Label htmlFor="bankSelect">Select Bank *</Label>
                    {BankData?.data?.length > 0 ? (
                      <Select
                        value={selectedBank}
                        onValueChange={setSelectedBank}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {BankData.data.map((bank: any) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              <div className="flex flex-col items-start ">
                                <span className="font-medium">
                                  {bank.bank_name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500 text-center">
                          No bank accounts available. Please add a bank account
                          in settings.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unpaid" className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {hasQuantityErrors() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Quantity Error</p>
              <p className="text-xs text-red-600 mt-1">
                Please adjust product quantities to available stock levels
                before submitting.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="w-full sm:w-[200px] h-10 sm:h-12"
            disabled={CreateOrderLoading || hasQuantityErrors()}
          >
            {CreateOrderLoading ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>

      <ProductDrawer
        open={isSelectProductDrawerOpen}
        page={page}
        setPage={setPage}
        filteredInventoryData={filteredInventoryData}
        onOpenChange={setIsSelectProductDrawerOpen}
        onProductSelect={(products) => {
          const productsWithQuantity = products.map((p: any) => ({
            ...p,
            quantity: 1,
          }));
          setSelectedProducts(productsWithQuantity);
          setIsSelectProductDrawerOpen(false);
        }}
        products={InventoryData}
        setSearchInput={setSearchInput}
        isLoading={InventoryDataLoading}
      />

      <CustomerDrawer
        open={isCustomerDrawerOpen}
        onOpenChange={setIsCustomerDrawerOpen}
        onCustomerSelect={(selectedCustomer: any) => {
          setCustomer(selectedCustomer);
        }}
      />

      <ShippingDrawer
        open={isShippingDrawerOpen}
        onOpenChange={setIsShippingDrawerOpen}
        onShippingSelect={(selectedShipping: any) => {
          if (selectedShipping?.cost) {
            setShippingFee(selectedShipping.cost);
            setSelectedShippingMethod(selectedShipping);
          }
        }}
        shippingData={ShippingData?.data || []}
        isLoading={allShippingDataLoading}
        onAddShipping={() => {
          setIsShippingDrawerOpen(false);
          console.log("Navigate to create shipping method");
        }}
      />

      <AssignDeliveryModal
        isOpen={openAssignDelivery}
        onClose={() => setOpenAssignDelivery(false)}
        onAssigned={(partner) => {
          setAssignedPartner(partner);
          // Changing partner invalidates the previous calculated price.
          setConfirmedDeliveryPrice(null);
        }}
      />
    </div>
  );
};

export default CreateOrders;
