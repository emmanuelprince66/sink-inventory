"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Edit, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Variation {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariation {
  id: string;
  combination: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string;
  status: string;
  discount: number;
  lowStockThreshold: number;
}

const NewAddProduct = () => {
  const [variationType, setVariationType] = useState<"single" | "multiple">(
    "single"
  );
  const [variations, setVariations] = useState<Variation[]>([]);
  const [productVariations, setProductVariations] = useState<
    ProductVariation[]
  >([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedVariationType, setSelectedVariationType] = useState("");
  const [newVariationValues, setNewVariationValues] = useState<string[]>([""]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [bulkEditField, setBulkEditField] = useState("");
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [showBulkEditInput, setShowBulkEditInput] = useState(false);

  const generateProductVariations = () => {
    if (variations.length === 0) return [];

    if (variations.length === 1) {
      return variations[0].values.map((value, index) => ({
        id: `var-${index}`,
        combination: value,
        costPrice: 0,
        sellingPrice: 0,
        quantity: 0,
        expiryDate: "",
        status: "active",
        discount: 0,
        lowStockThreshold: 5,
      }));
    }

    // Generate all possible combinations for multiple variations
    const combinations: string[] = [];

    const generateCombinations = (
      current: string[],
      variationIndex: number
    ) => {
      if (variationIndex === variations.length) {
        combinations.push(current.join("-"));
        return;
      }

      const currentVariation = variations[variationIndex];
      for (const value of currentVariation.values) {
        generateCombinations([...current, value], variationIndex + 1);
      }
    };

    generateCombinations([], 0);

    return combinations.map((combination, index) => ({
      id: `var-${index}`,
      combination,
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
      expiryDate: "",
      status: "active",
      discount: 0,
      lowStockThreshold: 5,
    }));
  };

  useEffect(() => {
    if (variationType === "multiple") {
      const newProductVariations = generateProductVariations();
      setProductVariations(newProductVariations);
    }
  }, [variations, variationType]);

  const handleAddVariation = (type: string) => {
    const existingVariation = variations.find((v) => v.name === type);
    if (existingVariation) {
      setNewVariationValues([...existingVariation.values, ""]);
    } else {
      setNewVariationValues([""]);
    }
    setSelectedVariationType(type);
    setIsSheetOpen(true);
  };

  const handleSaveVariation = () => {
    const filteredValues = newVariationValues.filter((v) => v.trim());
    if (!selectedVariationType || filteredValues.length === 0) return;

    const existingVariationIndex = variations.findIndex(
      (v) => v.name === selectedVariationType
    );

    if (existingVariationIndex >= 0) {
      // Update existing variation
      const updatedVariations = [...variations];
      updatedVariations[existingVariationIndex] = {
        ...updatedVariations[existingVariationIndex],
        values: filteredValues,
      };
      setVariations(updatedVariations);
    } else {
      // Add new variation
      const newVariation: Variation = {
        id: Date.now().toString(),
        name: selectedVariationType,
        values: filteredValues,
      };
      setVariations([...variations, newVariation]);
    }

    setIsSheetOpen(false);
    setSelectedVariationType("");
    setNewVariationValues([""]);
  };

  const handleDeleteVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  const handleEditVariation = (variation: Variation) => {
    setSelectedVariationType(variation.name);
    setNewVariationValues([...variation.values, ""]);
    setIsSheetOpen(true);
  };

  const addVariationValue = () => {
    setNewVariationValues([...newVariationValues, ""]);
  };

  const updateVariationValue = (index: number, value: string) => {
    const updated = [...newVariationValues];
    updated[index] = value;
    setNewVariationValues(updated);
  };

  const removeVariationValue = (index: number) => {
    setNewVariationValues(newVariationValues.filter((_, i) => i !== index));
  };

  const handleSelectAllVariations = (checked: boolean) => {
    if (checked) {
      setSelectedVariations(productVariations.map((v) => v.id));
    } else {
      setSelectedVariations([]);
    }
  };

  const handleSelectVariation = (variationId: string, checked: boolean) => {
    if (checked) {
      setSelectedVariations([...selectedVariations, variationId]);
    } else {
      setSelectedVariations(
        selectedVariations.filter((id) => id !== variationId)
      );
    }
  };

  const handleBulkEdit = (field: string) => {
    setBulkEditField(field);
    const firstSelectedVariation = productVariations.find((v) =>
      selectedVariations.includes(v.id)
    );
    if (firstSelectedVariation) {
      setBulkEditValue(
        String(firstSelectedVariation[field as keyof ProductVariation])
      );
    }
    setShowBulkEditInput(true);
  };

  const applyBulkEdit = () => {
    if (!bulkEditField || !bulkEditValue) return;

    const updatedVariations = productVariations.map((variation) => {
      if (selectedVariations.includes(variation.id)) {
        return {
          ...variation,
          [bulkEditField]:
            bulkEditField.includes("Price") ||
            bulkEditField === "quantity" ||
            bulkEditField === "discount" ||
            bulkEditField === "lowStockThreshold"
              ? Number.parseFloat(bulkEditValue) || 0
              : bulkEditValue,
        };
      }
      return variation;
    });

    setProductVariations(updatedVariations);

    setTimeout(() => {
      const inputs = document.querySelectorAll(
        `input[data-field="${bulkEditField}"]`
      );
      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement;
        const variationId = htmlInput.getAttribute("data-variation-id");
        const variation = updatedVariations.find((v) => v.id === variationId);
        if (variation && selectedVariations.includes(variationId!)) {
          htmlInput.value = String(
            variation[bulkEditField as keyof ProductVariation]
          );
        }
      });
    }, 0);

    setShowBulkEditInput(false);
    setBulkEditField("");
    setBulkEditValue("");
    setSelectedVariations([]);
  };

  const isSaveDisabled =
    !selectedVariationType ||
    newVariationValues.filter((v) => v.trim()).length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Product Information */}
            <Card className="border-gray-200 shadow-sm bg-white py-5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="image"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Image
                    </Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <Button variant="outline" size="sm">
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="productName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Name
                    </Label>
                    <Input
                      id="productName"
                      placeholder="Enter product name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="sku"
                      className="text-sm font-medium text-gray-700"
                    >
                      SKU
                    </Label>
                    <Input id="sku" placeholder="Enter SKU" className="mt-1" />
                  </div>

                  <div>
                    <Label
                      htmlFor="unit"
                      className="text-sm font-medium text-gray-700"
                    >
                      Product Unit
                    </Label>
                    <Input
                      id="unit"
                      placeholder="e.g., pieces, kg, liters"
                      className="mt-1"
                    />
                  </div>

                  <div className="w-full">
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-gray-700"
                    >
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="food">Food & Beverages</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Product Variations */}
            <Card className="border-gray-200 shadow-sm bg-white py-5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Product Variations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={variationType}
                  onValueChange={(value) =>
                    setVariationType(value as "single" | "multiple")
                  }
                >
                  <TabsList className="grid w-48 grid-cols-2 mb-4 h-9">
                    <TabsTrigger value="single" className="text-sm">
                      One Type
                    </TabsTrigger>
                    <TabsTrigger value="multiple" className="text-sm">
                      Multiple
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Cost Price
                        </Label>
                        <Input placeholder="0.00" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Selling Price
                        </Label>
                        <Input placeholder="0.00" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Quantity
                        </Label>
                        <Input placeholder="0" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Properties
                        </Label>
                        <Input
                          placeholder="Enter product properties"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Expiry Date
                        </Label>
                        <Input
                          type="date"
                          // size="sm"
                          className="mt-1"
                          data-field="expiryDate"
                          data-variation-id={""}
                          defaultValue={""}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Status
                        </Label>
                        <Select defaultValue={""}>
                          <SelectTrigger className="mt-1 h-8 w-full">
                            <SelectValue placeholder="Active" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Discount (%)
                        </Label>
                        <Input
                          placeholder="0"
                          // size="sm"
                          className="mt-1"
                          data-field="discount"
                          data-variation-id={""}
                          defaultValue={""}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">
                          Low Stock Threshold
                        </Label>
                        <Input
                          placeholder="5"
                          // size="sm"
                          className="mt-1"
                          data-field="lowStockThreshold"
                          data-variation-id={""}
                          defaultValue={""}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="multiple" className="space-y-4">
                    {variations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          Add different colours, sizes etc
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleAddVariation("Color")}
                            >
                              Color
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAddVariation("Size")}
                            >
                              Size
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAddVariation("Material")}
                            >
                              Material
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {variations.map((variation) => (
                          <div
                            key={variation.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {variation.name}:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {variation.values.map((value, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                  >
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                className="text-green-600 hover:bg-green-50"
                                size="sm"
                                onClick={() => handleEditVariation(variation)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                size="sm"
                                onClick={() =>
                                  handleDeleteVariation(variation.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add More
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleAddVariation("Color")}
                            >
                              Color
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAddVariation("Size")}
                            >
                              Size
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAddVariation("Material")}
                            >
                              Material
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Card 3: Manage Products */}
            {variationType === "multiple" && productVariations.length > 0 && (
              <Card className="border-gray-200 shadow-sm bg-white py-5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Manage Products
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkEditMode(!isBulkEditMode)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    {isBulkEditMode ? "Exit Bulk Edit" : "Bulk Edit"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isBulkEditMode && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              selectedVariations.length ===
                              productVariations.length
                            }
                            onCheckedChange={handleSelectAllVariations}
                          />
                          <span className="text-sm font-medium">
                            Select All ({selectedVariations.length} selected)
                          </span>
                        </div>
                        {selectedVariations.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 cursor-pointer "
                              >
                                Edit Selected{" "}
                                <ChevronDown className="w-4 h-4 ml-1 cursor-pointer" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => handleBulkEdit("costPrice")}
                              >
                                Cost Price
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBulkEdit("sellingPrice")}
                              >
                                Selling Price
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBulkEdit("quantity")}
                              >
                                Quantity
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBulkEdit("status")}
                              >
                                Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBulkEdit("discount")}
                              >
                                Discount
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleBulkEdit("lowStockThreshold")
                                }
                              >
                                Low Stock Threshold
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {showBulkEditInput && (
                        <div className="flex items-center gap-2 mt-3 p-3 bg-white rounded border border-gray-200">
                          <Label className="text-sm font-medium whitespace-nowrap">
                            {bulkEditField
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                            :
                          </Label>
                          {bulkEditField === "status" ? (
                            <Select
                              value={bulkEditValue}
                              onValueChange={setBulkEditValue}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="w-full">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={bulkEditValue}
                              onChange={(e) => setBulkEditValue(e.target.value)}
                              placeholder="Enter value"
                              className="w-32"
                            />
                          )}
                          <Button
                            size="sm"
                            onClick={applyBulkEdit}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Apply All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowBulkEditInput(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <Accordion type="multiple" className="space-y-2 ">
                    {productVariations.map((variation) => (
                      <AccordionItem
                        key={variation.id}
                        value={variation.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            {isBulkEditMode && (
                              <Checkbox
                                checked={selectedVariations.includes(
                                  variation.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleSelectVariation(
                                    variation.id,
                                    checked as boolean
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <span className="font-medium text-gray-900">
                              {variation.combination}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Cost Price
                              </Label>
                              <Input
                                placeholder="0.00"
                                // size="sm"
                                className="mt-1"
                                data-field="costPrice"
                                data-variation-id={variation.id}
                                defaultValue={variation.costPrice || ""}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Selling Price
                              </Label>
                              <Input
                                placeholder="0.00"
                                // size="sm"
                                className="mt-1"
                                data-field="sellingPrice"
                                data-variation-id={variation.id}
                                defaultValue={variation.sellingPrice || ""}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Quantity
                              </Label>
                              <Input
                                placeholder="0"
                                // size="sm"
                                className="mt-1"
                                data-field="quantity"
                                data-variation-id={variation.id}
                                defaultValue={variation.quantity || ""}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Expiry Date
                              </Label>
                              <Input
                                type="date"
                                // size="sm"
                                className="mt-1"
                                data-field="expiryDate"
                                data-variation-id={variation.id}
                                defaultValue={variation.expiryDate || ""}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Status
                              </Label>
                              <Select defaultValue={variation.status}>
                                <SelectTrigger className="mt-1 h-8 w-full">
                                  <SelectValue placeholder="Active" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">
                                    Inactive
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Discount (%)
                              </Label>
                              <Input
                                placeholder="0"
                                // size="sm"
                                className="mt-1"
                                data-field="discount"
                                data-variation-id={variation.id}
                                defaultValue={variation.discount || ""}
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">
                                Low Stock Threshold
                              </Label>
                              <Input
                                placeholder="5"
                                // size="sm"
                                className="mt-1"
                                data-field="lowStockThreshold"
                                data-variation-id={variation.id}
                                defaultValue={variation.lowStockThreshold || ""}
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Card 4: Supplies & Payment */}
            <Card className="border-gray-200 shadow-sm bg-white py-5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Supplies & Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Supplier
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier1">
                          ABC Suppliers Ltd
                        </SelectItem>
                        <SelectItem value="supplier2">
                          XYZ Trading Co
                        </SelectItem>
                        <SelectItem value="supplier3">
                          Global Imports Inc
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Payment Method
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Summary - 30% */}
          <div className="lg:col-span-3">
            <Card className="border-gray-200 shadow-sm bg-white sticky top-4 py-5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Product Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Sample Product Name
                  </h3>
                  <p className="text-sm text-gray-500">SKU: SAMPLE-001</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">Electronics</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit:</span>
                    <span className="text-gray-900">Pieces</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Variations:</span>
                    <span className="text-gray-900">
                      {variations.length > 0
                        ? `${variations.length} types`
                        : "Single type"}
                    </span>
                  </div>
                </div>

                {variations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Available Variations:
                    </h4>
                    {variations.map((variation) => (
                      <div key={variation.id} className="text-sm">
                        <span className="text-gray-600">
                          {variation.name}:{" "}
                        </span>
                        <span className="text-gray-900">
                          {variation.values.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600">Total Variants:</span>
                    <span className="text-green-600">
                      {productVariations.length || 1}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Save Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-[300px] md:w-[500px]  bg-white shadow-xl p-5"
        >
          <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-green-200">
            <SheetTitle className="text-lg font-semibold ">
              Add types
            </SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Current editing variation */}
            {selectedVariationType && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="font-medium ">{selectedVariationType}</h3>
                </div>

                <div className="ml-4 space-y-3">
                  {newVariationValues.map((value, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-green-600 font-medium">
                          {selectedVariationType} {index + 1}
                        </Label>
                        {newVariationValues.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariationValue(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={value}
                        onChange={(e) =>
                          updateVariationValue(index, e.target.value)
                        }
                        placeholder={`Enter ${selectedVariationType.toLowerCase()}`}
                        className="text-sm bg-white border-green-200 focus:border-green-400 focus:ring-green-400"
                      />
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addVariationValue}
                    className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1 h-auto font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add {selectedVariationType}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-6 border-t border-green-200">
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVariation}
              disabled={isSaveDisabled}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:bg-green-300"
            >
              Save types
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NewAddProduct;
