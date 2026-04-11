"use client";

import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useComboHook } from "@/hooks/useComboHook";
import { useDebounce } from "@/hooks/useDebounce";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface InventoryProduct {
  id: string;
  name: string;
  image?: string | null;
  selling_price?: number | null;
  cost_price?: number | null;
  quantity?: number;
  unit?: string | null;
  category?: string | null;
  variations?: Array<{
    id: string;
    name: string;
    selling_price: number;
    cost_price: number;
    quantity: number;
  }>;
}

interface ComboItem {
  // For variations, this id is the variation id; for plain products, the product id
  id: string;
  productId: string; // parent product id (same as id when no variation)
  name: string;
  image: string | null;
  selling_price: number;
  cost_price: number;
  stock: number;
  unit: string;
  category: string;
  hasVariation: boolean;
  variationName?: string;
  comboQty: number;
  comboPrice: number;
}

const CreateCombo = ({
  initialData,
  isEditMode = false,
  comboId,
}: {
  initialData?: any;
  isEditMode?: boolean;
  comboId?: string;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { handleCreateCombo, handleEditCombo, creatingCombo, editingCombo } =
    useComboHook({ comboId });

  const [comboName, setComboName] = useState("");
  const [comboDescription, setComboDescription] = useState("");
  const [sellOnline, setSellOnline] = useState(false);
  const [comboImage, setComboImage] = useState<File | null>(null);
  const [comboImagePreview, setComboImagePreview] = useState<string | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<ComboItem[]>([]);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetPage, setSheetPage] = useState(1);
  const [pendingSelections, setPendingSelections] = useState<
    Record<string, ComboItem>
  >({});
  // Variation picker — when a product with variations is tapped
  const [variationPickerProduct, setVariationPickerProduct] =
    useState<InventoryProduct | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const searchTerm =
    debouncedSearch.length === 0 || debouncedSearch.length >= 3
      ? debouncedSearch
      : "";

  // Fetch inventory products (only PRODUCT type)
  const { data: inventoryData, isLoading: inventoryLoading } =
    useGetInventoryQuery({
      params: {
        id: business_id || "",
        type: "PRODUCT",
        search: searchTerm,
        page: sheetPage,
        limit: 20,
      },
      enabled: !!business_id && isSheetOpen,
    });

  const inventoryProducts: InventoryProduct[] =
    inventoryData?.data?.results?.data || [];
  const totalPages = inventoryData?.data?.pages || 1;

  // Hydrate from initial data when editing
  useEffect(() => {
    if (initialData && isEditMode) {
      setComboName(initialData.name || "");
      setComboDescription(initialData.description || "");
      setSellOnline(!!initialData.sell_online);
      if (initialData.image_url || initialData.image) {
        setComboImagePreview(initialData.image_url || initialData.image);
      }
      const items: ComboItem[] = (initialData.items || []).map((it: any) => ({
        id: it.product,
        productId: it.product,
        name: it.product_name,
        image: it.product_image || null,
        selling_price: Number(it.original_price) || 0,
        cost_price: Number(it.cost_price) || 0,
        stock: Number(it.stock) || 0,
        unit: "",
        category: "",
        hasVariation: false,
        comboQty: it.quantity,
        comboPrice: it.price,
      }));
      setSelectedItems(items);
    }
  }, [initialData, isEditMode]);

  // Filter out already selected items from sheet
  const filteredProducts = useMemo(() => {
    const selectedIds = new Set(selectedItems.map((item) => item.id));
    return inventoryProducts.filter((p) => {
      // For products with variations, check each variation
      if (p.variations && p.variations.length > 0) {
        return p.variations.some((v) => !selectedIds.has(v.id));
      }
      return !selectedIds.has(p.id);
    });
  }, [inventoryProducts, selectedItems]);

  const totalOriginalValue = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.selling_price * item.comboQty,
        0,
      ),
    [selectedItems],
  );

  const comboSellingTotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.comboPrice * item.comboQty,
        0,
      ),
    [selectedItems],
  );

  const totalCostValue = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.cost_price * item.comboQty,
        0,
      ),
    [selectedItems],
  );

  const savings = totalOriginalValue - comboSellingTotal;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }
    setComboImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setComboImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setComboImage(null);
    setComboImagePreview(null);
  };

  // Build a ComboItem from a product (no variation)
  const buildComboItemFromProduct = (p: InventoryProduct): ComboItem => ({
    id: p.id,
    productId: p.id,
    name: p.name,
    image: p.image || null,
    selling_price: Number(p.selling_price) || 0,
    cost_price: Number(p.cost_price) || 0,
    stock: Number(p.quantity) || 0,
    unit: p.unit || "",
    category: p.category || "",
    hasVariation: false,
    comboQty: 1,
    comboPrice: Number(p.selling_price) || 0,
  });

  // Build a ComboItem from a variation
  const buildComboItemFromVariation = (
    p: InventoryProduct,
    variation: NonNullable<InventoryProduct["variations"]>[number],
  ): ComboItem => ({
    id: variation.id,
    productId: p.id,
    name: `${p.name} - ${variation.name}`,
    image: p.image || null,
    selling_price: Number(variation.selling_price) || 0,
    cost_price: Number(variation.cost_price) || 0,
    stock: Number(variation.quantity) || 0,
    unit: p.unit || "",
    category: p.category || "",
    hasVariation: true,
    variationName: variation.name,
    comboQty: 1,
    comboPrice: Number(variation.selling_price) || 0,
  });

  const togglePendingProduct = (p: InventoryProduct) => {
    if (p.variations && p.variations.length > 0) {
      // Open variation picker
      setVariationPickerProduct(p);
      return;
    }
    setPendingSelections((prev) => {
      const next = { ...prev };
      if (next[p.id]) {
        delete next[p.id];
      } else {
        next[p.id] = buildComboItemFromProduct(p);
      }
      return next;
    });
  };

  const togglePendingVariation = (
    p: InventoryProduct,
    variation: NonNullable<InventoryProduct["variations"]>[number],
  ) => {
    setPendingSelections((prev) => {
      const next = { ...prev };
      if (next[variation.id]) {
        delete next[variation.id];
      } else {
        next[variation.id] = buildComboItemFromVariation(p, variation);
      }
      return next;
    });
  };

  const addPendingItems = () => {
    const newItems = Object.values(pendingSelections);
    setSelectedItems((prev) => [...prev, ...newItems]);
    setPendingSelections({});
    setSearchQuery("");
    setVariationPickerProduct(null);
    setIsSheetOpen(false);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setPendingSelections({});
    setSearchQuery("");
    setVariationPickerProduct(null);
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, comboQty: Math.min(qty, item.stock || qty) }
          : item,
      ),
    );
  };

  const updateItemPrice = (id: string, price: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, comboPrice: Math.max(0, price) } : item,
      ),
    );
  };

  const buildPayload = (): FormData => {
    const formData = new FormData();
    formData.append("name", comboName);
    if (comboDescription) formData.append("description", comboDescription);
    formData.append("sell_online", sellOnline ? "true" : "false");
    if (comboImage) formData.append("image", comboImage);

    const itemsPayload = selectedItems.map((item) => ({
      product: item.id,
      quantity: item.comboQty,
      price: item.comboPrice,
    }));
    formData.append("items", JSON.stringify(itemsPayload));

    return formData;
  };

  const handleSubmit = () => {
    const payload = buildPayload();
    if (isEditMode && comboId) {
      handleEditCombo(comboId, payload);
    } else {
      handleCreateCombo(payload);
    }
  };

  const isValid =
    comboName.trim() && selectedItems.length >= 2 && comboSellingTotal > 0;
  const isSubmitting = creatingCombo || editingCombo;

  const pendingCount = Object.keys(pendingSelections).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/inventory">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEditMode ? "Edit Combo" : "Create Combo Product"}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Bundle multiple products into a single sellable combo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Combo Details */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">
              Combo Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Combo Name
              </label>
              <Input
                placeholder="e.g. Big Combo, Family Pack, Lunch Special"
                value={comboName}
                onChange={(e) => setComboName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Description
              </label>
              <Textarea
                placeholder="Optional description"
                value={comboDescription}
                onChange={(e) => setComboDescription(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="sellOnline"
                type="checkbox"
                checked={sellOnline}
                onChange={(e) => setSellOnline(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="sellOnline"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Available to sell online
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Combo Image
              </label>
              {comboImagePreview ? (
                <div className="relative w-full max-w-xs">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <Image
                      src={comboImagePreview}
                      alt="Combo preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <label className="flex-1 cursor-pointer">
                      <span className="inline-flex items-center justify-center w-full h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        Change
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={removeImage}
                      className="flex items-center justify-center h-9 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-green-400 transition-colors text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-green-600">
                      Upload image
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG or WebP (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Items */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-green-600" />
                Combo Items
                {selectedItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {selectedItems.length}
                  </span>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSheetOpen(true)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-1">
                  No items added yet
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Add at least 2 products to create a combo
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSheetOpen(true)}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Products
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          <p className="text-xs text-slate-400">
                            Original: {formatToNaira(item.selling_price)}
                          </p>
                          <span className="text-xs text-slate-300">·</span>
                          <p className="text-xs text-slate-400">
                            Cost: {formatToNaira(item.cost_price)}
                          </p>
                          <span className="text-xs text-slate-300">·</span>
                          <p className="text-xs text-slate-500">
                            Stock: {item.stock}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="shrink-0">
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Price
                        </label>
                        <input
                          type="number"
                          value={item.comboPrice}
                          onChange={(e) =>
                            updateItemPrice(
                              item.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-20 h-8 text-center text-sm font-medium border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          min={0}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Qty
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateItemQty(item.id, item.comboQty - 1)
                            }
                            className="w-7 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3 text-slate-600" />
                          </button>
                          <input
                            type="number"
                            value={item.comboQty}
                            onChange={(e) =>
                              updateItemQty(
                                item.id,
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-12 h-8 text-center text-sm font-medium border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            min={1}
                          />
                          <button
                            onClick={() =>
                              updateItemQty(item.id, item.comboQty + 1)
                            }
                            className="w-7 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3 text-slate-600" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0 self-end sm:self-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        {selectedItems.length > 0 && (
          <Card className="shadow-sm border-0 ring-1 ring-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Original Total ({selectedItems.length} items)
                  </span>
                  <span className="font-medium text-slate-500">
                    {formatToNaira(totalOriginalValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Cost Price</span>
                  <span className="font-medium text-slate-500">
                    {formatToNaira(totalCostValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-900 font-semibold">
                    Combo Selling Price
                  </span>
                  <span className="font-bold text-green-700 text-base">
                    {formatToNaira(comboSellingTotal)}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center gap-2 text-sm pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      Customer saves {formatToNaira(savings)}
                    </span>
                    <span className="text-slate-500">
                      ({Math.round((savings / totalOriginalValue) * 100)}% off)
                    </span>
                  </div>
                )}
                {comboSellingTotal <= totalCostValue &&
                  comboSellingTotal > 0 && (
                    <p className="text-xs text-red-600 font-medium pt-1">
                      Warning: Combo price is at or below cost price
                    </p>
                  )}
                {comboSellingTotal > totalCostValue && (
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-slate-600">Profit per combo</span>
                    <span className="font-semibold text-green-700">
                      {formatToNaira(comboSellingTotal - totalCostValue)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Edit individual item prices above to adjust the combo selling
                price.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Inventory Impact */}
        {selectedItems.length > 0 && comboSellingTotal > 0 && (
          <Card className="shadow-sm border border-blue-100 bg-blue-50/50">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">
                Inventory Impact per Sale
              </h4>
              <p className="text-xs text-blue-600 mb-3">
                When 1 combo is sold, the following stock will be deducted:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white/70 rounded-md px-3 py-2 text-sm"
                  >
                    <span className="text-slate-700 truncate pr-2">
                      {item.name}
                    </span>
                    <span className="font-medium text-blue-700 shrink-0">
                      -{item.comboQty}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-base"
          >
            {isSubmitting ? (
              <Spinner />
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Combo"
            )}
          </Button>
          <Link href="/inventory">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 border-slate-200"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Picker Sheet */}
      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) closeSheet();
          else setIsSheetOpen(true);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[500px] bg-white shadow-xl p-0 overflow-hidden flex flex-col"
        >
          {variationPickerProduct ? (
            // Variation picker view
            <>
              <SheetHeader className="p-5 border-b border-slate-200 flex flex-row items-center gap-3 space-y-0">
                <button
                  onClick={() => setVariationPickerProduct(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <SheetTitle className="text-base font-semibold">
                  {variationPickerProduct.name} - Variations
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {variationPickerProduct.variations?.map((v) => {
                  const isChecked = !!pendingSelections[v.id];
                  const alreadyAdded = selectedItems.some(
                    (s) => s.id === v.id,
                  );
                  return (
                    <button
                      key={v.id}
                      disabled={alreadyAdded}
                      onClick={() =>
                        togglePendingVariation(variationPickerProduct, v)
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed"
                          : isChecked
                            ? "bg-green-50 ring-1 ring-green-200"
                            : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          isChecked
                            ? "bg-green-600 border-green-600"
                            : "border-slate-300"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {v.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Stock: {v.quantity}
                          {alreadyAdded && " · Added"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatToNaira(v.selling_price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            // Product list view
            <>
              <SheetHeader className="p-5 border-b border-slate-200 space-y-0">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-semibold">
                    Select Products
                  </SheetTitle>
                  {pendingCount > 0 && (
                    <span className="text-xs font-medium text-green-600">
                      {pendingCount} selected
                    </span>
                  )}
                </div>
              </SheetHeader>

              <div className="p-4 border-b border-slate-100">
                <SearchInput
                  placeholder="Search products..."
                  value={searchQuery}
                  onValueChange={(v) => {
                    setSearchQuery(v);
                    setSheetPage(1);
                  }}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {inventoryLoading ? (
                  <div className="py-12 flex justify-center">
                    <Spinner />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-500">
                      No products found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredProducts.map((product) => {
                      const hasVariations =
                        !!product.variations && product.variations.length > 0;
                      const isChecked = !!pendingSelections[product.id];
                      return (
                        <button
                          key={product.id}
                          onClick={() => togglePendingProduct(product)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                            isChecked
                              ? "bg-green-50 ring-1 ring-green-200"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {!hasVariations && (
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? "bg-green-600 border-green-600"
                                  : "border-slate-300"
                              }`}
                            >
                              {isChecked && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {hasVariations
                                ? `${product.variations?.length} variations`
                                : `Stock: ${product.quantity || 0}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-2">
                            {!hasVariations && (
                              <p className="text-sm font-semibold text-slate-900">
                                {formatToNaira(
                                  Number(product.selling_price) || 0,
                                )}
                              </p>
                            )}
                            {hasVariations && (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 px-2 py-3 border-t border-slate-100 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSheetPage((p) => Math.max(1, p - 1))}
                      disabled={sheetPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-slate-500">
                      Page {sheetPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSheetPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={sheetPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="p-4 border-t border-slate-200">
            <Button
              onClick={addPendingItems}
              disabled={pendingCount === 0}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              Add{" "}
              {pendingCount > 0
                ? `${pendingCount} ${pendingCount === 1 ? "Item" : "Items"}`
                : "Items"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CreateCombo;
