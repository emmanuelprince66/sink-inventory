"use client";

import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

// Dummy product data
const DUMMY_PRODUCTS = [
  {
    id: "1",
    name: "Jollof Rice",
    image: "",
    selling_price: 500,
    cost_price: 300,
    quantity: 50,
    category: "Food",
    unit: "plate",
  },
  {
    id: "2",
    name: "Fried Rice",
    image: "",
    selling_price: 500,
    cost_price: 300,
    quantity: 40,
    category: "Food",
    unit: "plate",
  },
  {
    id: "3",
    name: "Chicken",
    image: "",
    selling_price: 2000,
    cost_price: 1500,
    quantity: 30,
    category: "Protein",
    unit: "piece",
  },
  {
    id: "4",
    name: "Pepsi 50cl",
    image: "",
    selling_price: 300,
    cost_price: 200,
    quantity: 100,
    category: "Drinks",
    unit: "bottle",
  },
  {
    id: "5",
    name: "Chapman",
    image: "",
    selling_price: 800,
    cost_price: 400,
    quantity: 20,
    category: "Drinks",
    unit: "glass",
  },
  {
    id: "6",
    name: "Plantain",
    image: "",
    selling_price: 400,
    cost_price: 200,
    quantity: 60,
    category: "Food",
    unit: "piece",
  },
  {
    id: "7",
    name: "Coleslaw",
    image: "",
    selling_price: 200,
    cost_price: 100,
    quantity: 45,
    category: "Food",
    unit: "pack",
  },
  {
    id: "8",
    name: "Beef",
    image: "",
    selling_price: 1500,
    cost_price: 1000,
    quantity: 25,
    category: "Protein",
    unit: "piece",
  },
];

interface ComboItem {
  id: string;
  name: string;
  image: string;
  selling_price: number;
  cost_price: number;
  quantity: number;
  category: string;
  unit: string;
  comboQty: number;
  comboPrice: number; // editable per-item selling price for this combo
}

const CreateCombo = () => {
  const [comboName, setComboName] = useState("");
  const [selectedItems, setSelectedItems] = useState<ComboItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<Set<string>>(
    new Set(),
  );

  // Filter products based on search and exclude already selected
  const filteredProducts = useMemo(() => {
    const selectedIds = new Set(selectedItems.map((item) => item.id));
    return DUMMY_PRODUCTS.filter(
      (p) =>
        !selectedIds.has(p.id) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, selectedItems]);

  // Total using original selling prices
  const totalOriginalValue = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.selling_price * item.comboQty,
        0,
      ),
    [selectedItems],
  );

  // Total using combo prices (editable per item)
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

  const togglePendingSelection = (id: string) => {
    setPendingSelections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addSelectedItems = () => {
    const newItems = DUMMY_PRODUCTS.filter((p) =>
      pendingSelections.has(p.id),
    ).map((p) => ({ ...p, comboQty: 1, comboPrice: p.selling_price }));
    setSelectedItems((prev) => [...prev, ...newItems]);
    setPendingSelections(new Set());
    setSearchQuery("");
    setShowProductPicker(false);
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, comboQty: Math.min(qty, item.quantity) }
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

  const handleSubmit = () => {
    // TODO: Wire to API when ready
    const payload = {
      name: comboName,
      selling_price: comboSellingTotal,
      items: selectedItems.map((item) => ({
        product_id: item.id,
        quantity: item.comboQty,
        selling_price: item.comboPrice,
      })),
    };
    console.log("Combo payload:", payload);
  };

  const isValid =
    comboName.trim() && selectedItems.length >= 2 && comboSellingTotal > 0;

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
                Create Combo Product
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Bundle multiple products into a single sellable combo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Combo Name */}
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
                onClick={() => setShowProductPicker(true)}
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
                  onClick={() => setShowProductPicker(true)}
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
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
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
                          Stock: {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Editable Price */}
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

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateItemQty(item.id, item.comboQty - 1)
                        }
                        className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5 text-slate-600" />
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
                        max={item.quantity}
                      />
                      <button
                        onClick={() =>
                          updateItemQty(item.id, item.comboQty + 1)
                        }
                        className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 text-slate-600" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right w-24 shrink-0 hidden sm:block">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatToNaira(item.selling_price * item.comboQty)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                      (
                      {Math.round(
                        (savings / totalOriginalValue) * 100,
                      )}
                      % off)
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

        {/* Inventory Impact Preview */}
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
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-medium text-blue-700">
                      -{item.comboQty} {item.unit}
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
            disabled={!isValid}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-base"
          >
            Create Combo
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

      {/* Product Picker Overlay */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add Products
                </h3>
                {pendingSelections.size > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">
                    {pendingSelections.size} selected
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowProductPicker(false);
                  setSearchQuery("");
                  setPendingSelections(new Set());
                }}
                className="p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <SearchInput
                placeholder="Search products..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500">No products found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts.map((product) => {
                    const isChecked = pendingSelections.has(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => togglePendingSelection(product.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          isChecked
                            ? "bg-green-50 ring-1 ring-green-200"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
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
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full rounded-lg"
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
                            {product.category} · Stock: {product.quantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatToNaira(product.selling_price)}
                          </p>
                          <p className="text-xs text-slate-500">
                            per {product.unit}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Add button */}
            <div className="p-4 border-t border-slate-200">
              <Button
                onClick={addSelectedItems}
                disabled={pendingSelections.size === 0}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                Add {pendingSelections.size > 0 ? `${pendingSelections.size} ` : ""}
                {pendingSelections.size === 1 ? "Product" : "Products"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCombo;
