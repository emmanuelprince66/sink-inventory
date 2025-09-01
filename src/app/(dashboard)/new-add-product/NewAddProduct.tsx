// "use client";

// import { CustomModal } from "@/components/app/CustomModal";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useProductHook } from "@/hooks/useProductHook";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";
// import {
//   CalendarIcon,
//   ChevronDown,
//   Edit,
//   Plus,
//   Trash2,
//   Upload,
//   X,
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useFieldArray } from "react-hook-form";

// interface NewAddProductProps {
//   id?: string;
//   handleOpenNotSubscribeModal?: () => void;
//   page?: any;
// }

// // Define allowed keys for bulkEditField to fix TypeScript error
// type VariationField =
//   | "cost_price"
//   | "selling_price"
//   | "quantity"
//   | "status"
//   | "discount"
//   | "low_stock_threshold";

// // Helper function to format field labels
// const formatFieldLabel = (field: VariationField): string => {
//   const fieldLabels: Record<VariationField, string> = {
//     cost_price: "Cost Price",
//     selling_price: "Selling Price",
//     quantity: "Quantity",
//     status: "Status",
//     discount: "Discount",
//     low_stock_threshold: "Low Stock Threshold",
//   };
//   return fieldLabels[field];
// };

// const NewAddProduct = ({
//   id,
//   handleOpenNotSubscribeModal,
//   page,
// }: NewAddProductProps) => {
//   const {
//     form,
//     onSubmit,
//     loading,
//     CategoriesData,
//     SupplierData,
//     unitTypeOptions,
//     StatusTypeOptions,
//     paymentMethodOptions,
//     isEditMode,
//     ProductData,
//     addProductPending,
//     editProductPending,
//     generateProductVariations,
//   } = useProductHook({ id, handleOpenNotSubscribeModal, page });

//   const [isSheetOpen, setIsSheetOpen] = useState(false);
//   const [selectedVariationType, setSelectedVariationType] = useState("");
//   const [newVariationValues, setNewVariationValues] = useState<string[]>([""]);
//   const [isBulkEditMode, setIsBulkEditMode] = useState(false);
//   const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
//   const [bulkEditField, setBulkEditField] = useState<VariationField | "">("");
//   const [bulkEditValue, setBulkEditValue] = useState("");
//   const [showBulkEditInput, setShowBulkEditInput] = useState(false);
//   const [editingVariationIndex, setEditingVariationIndex] = useState<
//     number | null
//   >(null);
//   const [bulkEditError, setBulkEditError] = useState<string | null>(null);
//   const [showEditAllModal, setShowEditAllModal] = useState(false);
//   const [editAllData, setEditAllData] = useState({
//     cost_price: "",
//     selling_price: "",
//     quantity: "",
//     status: "IN-STOCK",
//     discount: "",
//     low_stock_threshold: "",
//   });

//   const variationType = form.watch("variation_type") || "single";

//   const {
//     fields: variations,
//     append: appendVariation,
//     remove: removeVariation,
//     update: updateVariation,
//   } = useFieldArray({
//     control: form.control,
//     name: "variations",
//   });

//   const { fields: productVariations, replace: replaceProductVariations } =
//     useFieldArray({
//       control: form.control,
//       name: "product_variations",
//     });

//   // Memoize product variations to prevent unnecessary recalculations
//   const memoizedProductVariations = useMemo(() => {
//     if (variationType === "multiple") {
//       return generateProductVariations(variations);
//     }
//     return [];
//   }, [variations, variationType, generateProductVariations]);

//   // Update product variations only when necessary
//   useEffect(() => {
//     if (variationType === "multiple") {
//       // Only replace if the variations have actually changed
//       const currentVariations = form.getValues("product_variations") || [];
//       const newCombinations = generateProductVariations(variations);
//       const mergedVariations = newCombinations.map((newVar) => {
//         const existing = currentVariations.find(
//           (c) => c.combination === newVar.combination
//         );
//         return existing || newVar;
//       });
//       const hasChanges =
//         JSON.stringify(currentVariations) !== JSON.stringify(mergedVariations);
//       if (hasChanges) {
//         replaceProductVariations(mergedVariations);
//       }
//     }
//   }, [
//     variationType,
//     memoizedProductVariations,
//     replaceProductVariations,
//     form,
//     generateProductVariations,
//     variations,
//   ]);

//   const handleAddVariation = (type: string) => {
//     const existingIndex = variations.findIndex((v) => v.name === type);
//     if (existingIndex >= 0) {
//       setNewVariationValues([...variations[existingIndex].values, ""]);
//       setEditingVariationIndex(existingIndex);
//     } else {
//       setNewVariationValues([""]);
//       setEditingVariationIndex(null);
//     }
//     setSelectedVariationType(type);
//     setIsSheetOpen(true);
//   };

//   const handleSaveVariation = () => {
//     const filteredValues = newVariationValues.filter((v) => v.trim());
//     if (!selectedVariationType || filteredValues.length === 0) return;

//     if (editingVariationIndex !== null) {
//       updateVariation(editingVariationIndex, {
//         ...variations[editingVariationIndex],
//         values: filteredValues,
//       });
//     } else {
//       appendVariation({
//         id: Date.now().toString(),
//         name: selectedVariationType,
//         values: filteredValues,
//       });
//     }

//     setIsSheetOpen(false);
//     setSelectedVariationType("");
//     setNewVariationValues([""]);
//     setEditingVariationIndex(null);
//   };

//   const handleDeleteVariation = (index: number) => {
//     removeVariation(index);
//   };

//   const handleEditVariation = (index: number) => {
//     const variation = variations[index];
//     setSelectedVariationType(variation.name);
//     setNewVariationValues([...variation.values, ""]);
//     setEditingVariationIndex(index);
//     setIsSheetOpen(true);
//   };

//   const addVariationValue = () => {
//     setNewVariationValues([...newVariationValues, ""]);
//   };

//   const updateVariationValue = (index: number, value: string) => {
//     const updated = [...newVariationValues];
//     updated[index] = value;
//     setNewVariationValues(updated);
//   };

//   const removeVariationValue = (index: number) => {
//     setNewVariationValues(newVariationValues.filter((_, i) => i !== index));
//   };

//   const handleSelectAllVariations = (checked: boolean) => {
//     if (checked) {
//       setSelectedVariations(productVariations.map((v) => v.id));
//     } else {
//       setSelectedVariations([]);
//     }
//   };

//   const handleSelectVariation = (variationId: string, checked: boolean) => {
//     if (checked) {
//       setSelectedVariations([...selectedVariations, variationId]);
//     } else {
//       setSelectedVariations(
//         selectedVariations.filter((id) => id !== variationId)
//       );
//     }
//   };

//   const handleBulkEdit = (field: VariationField) => {
//     setBulkEditField(field);
//     setBulkEditError(null);
//     const firstSelectedVariation = productVariations.find((v) =>
//       selectedVariations.includes(v.id)
//     );
//     if (firstSelectedVariation) {
//       setBulkEditValue(String(firstSelectedVariation[field]));
//     }
//     setShowBulkEditInput(true);
//   };

//   const handleEditAll = () => {
//     // Pre-populate with first product variation data
//     if (productVariations.length > 0) {
//       const firstVariation = productVariations[0];
//       setEditAllData({
//         cost_price: firstVariation.cost_price || "",
//         selling_price: firstVariation.selling_price || "",
//         quantity: firstVariation.quantity || "",
//         status: firstVariation.status || "IN-STOCK",
//         discount: firstVariation.discount || "",
//         low_stock_threshold: firstVariation.low_stock_threshold || "",
//       });
//     }
//     setShowEditAllModal(true);
//   };

//   const applyEditAll = () => {
//     // Validate all fields
//     const numericFields = [
//       "cost_price",
//       "selling_price",
//       "quantity",
//       "discount",
//       "low_stock_threshold",
//     ];

//     for (const field of numericFields) {
//       const value = editAllData[field as keyof typeof editAllData];
//       if (value && value !== "") {
//         const cleanValue = String(value).replace(/,/g, "");
//         if (!/^\d*\.?\d*$/.test(cleanValue) || Number(cleanValue) <= 0) {
//           setBulkEditError(
//             `Invalid ${formatFieldLabel(
//               field as VariationField
//             )}: Please enter a valid number`
//           );
//           return;
//         }
//       }
//     }

//     // Apply to only selected product variations instead of all
//     productVariations.forEach((variation, index) => {
//       // Only update if this variation is selected
//       if (selectedVariations.includes(variation.id)) {
//         Object.entries(editAllData).forEach(([field, value]) => {
//           if (value !== "") {
//             form.setValue(`product_variations.${index}.${field}` as any, value);
//           }
//         });
//       }
//     });

//     setShowEditAllModal(false);
//     setBulkEditError(null);
//   };

//   const applyBulkEdit = () => {
//     if (!bulkEditField || !bulkEditValue) {
//       setBulkEditError("Please enter a value");
//       return;
//     }

//     // Validate bulk edit value
//     const isNumericField =
//       bulkEditField === "cost_price" ||
//       bulkEditField === "selling_price" ||
//       bulkEditField === "quantity" ||
//       bulkEditField === "discount" ||
//       bulkEditField === "low_stock_threshold";

//     if (isNumericField) {
//       const cleanValue = bulkEditValue.replace(/,/g, "");
//       if (!/^\d*\.?\d*$/.test(cleanValue) || Number(cleanValue) <= 0) {
//         setBulkEditError(
//           "Please enter a valid number greater than 0 for numeric fields"
//         );
//         return;
//       }
//     }

//     if (!bulkEditValue.trim()) {
//       setBulkEditError("Please enter a valid value");
//       return;
//     }

//     productVariations.forEach((variation, index) => {
//       if (selectedVariations.includes(variation.id)) {
//         form.setValue(
//           `product_variations.${index}.${bulkEditField}` as any,
//           bulkEditValue
//         );
//       }
//     });

//     setShowBulkEditInput(false);
//     setBulkEditField("");
//     setBulkEditValue("");
//     setSelectedVariations([]);
//     setBulkEditError(null);
//   };

//   const isSaveDisabled =
//     !selectedVariationType ||
//     newVariationValues.filter((v) => v.trim()).length === 0;

//   const isLoading = loading || addProductPending || editProductPending;

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="max-w-7xl mx-auto"
//         >
//           <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
//             {/* Product Summary */}
//             <div className="order-1 lg:order-2 lg:col-span-3">
//               <Card className="border-gray-200 shadow-sm bg-white sticky top-4 py-5">
//                 <CardHeader>
//                   <CardTitle className="text-lg font-semibold text-gray-900">
//                     Product Summary
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <FormField
//                     control={form.control}
//                     name="image"
//                     render={({ field }) => (
//                       <FormItem>
//                         <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
//                           {field.value instanceof File ? (
//                             <img
//                               src={URL.createObjectURL(field.value)}
//                               alt="Product preview"
//                               className="w-full h-full object-cover rounded-lg"
//                             />
//                           ) : typeof field.value === "string" && field.value ? (
//                             <img
//                               src={field.value}
//                               alt="Product preview"
//                               className="w-full h-full object-cover rounded-lg"
//                             />
//                           ) : (
//                             <span className="text-gray-400">Product Image</span>
//                           )}
//                         </div>
//                       </FormItem>
//                     )}
//                   />

//                   <div>
//                     <h3 className="font-semibold text-gray-900">
//                       {form.watch("item_name") || "Product Name"}
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       SKU: {form.watch("sku") || "Not set"}
//                     </p>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Category:</span>
//                       <span className="text-gray-900">
//                         {CategoriesData?.data?.find(
//                           (cat: any) => cat.id === form.watch("category")
//                         )?.name || "Not selected"}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Unit:</span>
//                       <span className="text-gray-900">
//                         {form.watch("product_unit") || "Not set"}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Variations:</span>
//                       <span className="text-gray-900">
//                         {variations.length > 0
//                           ? `${variations.length} types`
//                           : "Single type"}
//                       </span>
//                     </div>
//                   </div>

//                   {variations.length > 0 && (
//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-900">
//                         Available Variations:
//                       </h4>
//                       {variations.map((variation) => (
//                         <div key={variation.id} className="text-sm">
//                           <span className="text-gray-600">
//                             {variation.name}:{" "}
//                           </span>
//                           <span className="text-gray-900">
//                             {variation.values.join(", ")}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   <div className="pt-4 border-t border-gray-200">
//                     <div className="flex justify-between text-sm font-medium">
//                       <span className="text-gray-600">Total Variants:</span>
//                       <span className="text-green-600">
//                         {productVariations.length || 1}
//                       </span>
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     className="w-full bg-green-600 hover:bg-green-700 text-white"
//                     disabled={isLoading}
//                   >
//                     {isLoading
//                       ? "Saving..."
//                       : isEditMode
//                       ? "Update Product"
//                       : "Save Product"}
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Main Content */}
//             <div className="order-2 lg:order-1 lg:col-span-7 space-y-6">
//               {/* Card 1: Product Information */}
//               <Card className="border-gray-200 shadow-sm bg-white py-5">
//                 <CardHeader>
//                   <CardTitle className="text-lg font-semibold text-gray-900">
//                     Product Information
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="image"
//                       render={({ field }) => (
//                         <FormItem className="md:col-span-2">
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Product Image
//                           </FormLabel>

//                           {/* Show preview if image exists */}
//                           {field.value instanceof File ||
//                           (typeof field.value === "string" && field.value) ? (
//                             <div className="relative mt-1 border-2 border-gray-200 rounded-md p-4">
//                               <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-4">
//                                   <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
//                                     <img
//                                       src={
//                                         field.value instanceof File
//                                           ? URL.createObjectURL(field.value)
//                                           : field.value
//                                       }
//                                       alt="Product preview"
//                                       className="w-full h-full object-cover"
//                                     />
//                                   </div>
//                                   <div>
//                                     <p className="text-sm font-medium text-gray-900">
//                                       {field.value instanceof File
//                                         ? field.value.name
//                                         : "Current image"}
//                                     </p>
//                                     <p className="text-xs text-gray-500">
//                                       {field.value instanceof File
//                                         ? `${(
//                                             field.value.size /
//                                             1024 /
//                                             1024
//                                           ).toFixed(2)} MB`
//                                         : "Uploaded image"}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <div className="flex gap-2">
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     type="button"
//                                     onClick={() =>
//                                       document
//                                         .getElementById("image-upload")
//                                         ?.click()
//                                     }
//                                     className="text-green-600 border-green-600 hover:bg-green-50"
//                                   >
//                                     Change
//                                   </Button>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     type="button"
//                                     onClick={() => field.onChange(undefined)}
//                                     className="text-red-600 border-red-600 hover:bg-red-50"
//                                   >
//                                     <X className="w-4 h-4 mr-1" />
//                                     Remove
//                                   </Button>
//                                 </div>
//                               </div>
//                               <input
//                                 id="image-upload"
//                                 type="file"
//                                 accept="image/*"
//                                 className="hidden"
//                                 onChange={(e) => {
//                                   const file = e.target.files?.[0];
//                                   if (file) field.onChange(file);
//                                 }}
//                               />
//                             </div>
//                           ) : (
//                             /* Show upload area if no image */
//                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
//                               <div className="space-y-1 text-center flex flex-col items-center">
//                                 <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                                 <div className="flex text-sm text-gray-600">
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     type="button"
//                                     onClick={() =>
//                                       document
//                                         .getElementById("image-upload")
//                                         ?.click()
//                                     }
//                                   >
//                                     Upload Image
//                                   </Button>
//                                   <input
//                                     id="image-upload"
//                                     type="file"
//                                     accept="image/*"
//                                     className="hidden"
//                                     onChange={(e) => {
//                                       const file = e.target.files?.[0];
//                                       if (file) field.onChange(file);
//                                     }}
//                                   />
//                                 </div>
//                                 <p className="text-xs text-gray-500">
//                                   PNG, JPG, WEBP up to 5MB
//                                 </p>
//                               </div>
//                             </div>
//                           )}

//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="item_name"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Product Name
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               placeholder="Enter product name"
//                               className="mt-1"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="sku"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             SKU
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               placeholder="Enter SKU"
//                               className="mt-1"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="product_unit"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Product Unit
//                           </FormLabel>
//                           <FormControl>
//                             <Select
//                               onValueChange={field.onChange}
//                               value={field.value}
//                             >
//                               <SelectTrigger className="mt-1 w-full">
//                                 <SelectValue placeholder="Select unit" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {unitTypeOptions.map((option) => (
//                                   <SelectItem
//                                     key={option.value}
//                                     value={option.value}
//                                   >
//                                     {option.label}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="category"
//                       render={({ field }) => (
//                         <FormItem className="w-full">
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Category
//                           </FormLabel>
//                           <FormControl>
//                             <Select
//                               onValueChange={field.onChange}
//                               value={field.value}
//                             >
//                               <SelectTrigger className="mt-1 w-full">
//                                 <SelectValue placeholder="Select category" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {CategoriesData?.data?.map((category: any) => (
//                                   <SelectItem
//                                     key={category.id}
//                                     value={category.id}
//                                   >
//                                     {category.name}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Card 2: Product Variations */}
//               <Card className="border-gray-200 shadow-sm bg-white py-5">
//                 <CardHeader>
//                   <CardTitle className="text-lg font-semibold text-gray-900">
//                     Product Variations
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <FormField
//                     control={form.control}
//                     name="variation_type"
//                     render={({ field }) => (
//                       <FormItem>
//                         <Tabs
//                           value={field.value || "single"}
//                           onValueChange={(value) => {
//                             field.onChange(value);
//                           }}
//                         >
//                           <TabsList className="grid w-48 grid-cols-2 mb-4 h-9">
//                             <TabsTrigger value="single" className="text-sm">
//                               One Type
//                             </TabsTrigger>
//                             <TabsTrigger value="multiple" className="text-sm">
//                               Multiple
//                             </TabsTrigger>
//                           </TabsList>

//                           <TabsContent value="single" className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                               <FormField
//                                 control={form.control}
//                                 name="cost_price"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-sm font-medium text-gray-700">
//                                       Cost Price
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter cost price"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name="selling_price"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-sm font-medium text-gray-700">
//                                       Selling Price
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter selling price"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name="stock_quantity"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-sm font-medium text-gray-700">
//                                       Quantity
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter quantity"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name="stock_status"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-sm font-medium text-gray-700">
//                                       Status
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Select
//                                         onValueChange={field.onChange}
//                                         value={field.value}
//                                       >
//                                         <SelectTrigger className="mt-1 w-full">
//                                           <SelectValue placeholder="Select status" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                           {StatusTypeOptions.map((option) => (
//                                             <SelectItem
//                                               key={option.value}
//                                               value={option.value}
//                                             >
//                                               {option.label}
//                                             </SelectItem>
//                                           ))}
//                                         </SelectContent>
//                                       </Select>
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name="discount_value"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-sm font-medium text-gray-700">
//                                       Discount (%)
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter discount"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name="low_stock_tresh"
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-sm font-medium text-gray-700">
//                                       Low Stock Threshold
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter threshold"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                             </div>
//                           </TabsContent>

//                           <TabsContent value="multiple" className="space-y-4">
//                             {variations.length === 0 ? (
//                               <div className="text-center py-8">
//                                 <p className="text-gray-500 mb-4">
//                                   Add different colours, sizes etc
//                                 </p>
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button
//                                       variant="outline"
//                                       className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
//                                     >
//                                       <Plus className="w-4 h-4 mr-2" />
//                                       Add
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent>
//                                     <DropdownMenuItem
//                                       onClick={() =>
//                                         handleAddVariation("Color")
//                                       }
//                                     >
//                                       Color
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onClick={() => handleAddVariation("Size")}
//                                     >
//                                       Size
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onClick={() =>
//                                         handleAddVariation("Material")
//                                       }
//                                     >
//                                       Material
//                                     </DropdownMenuItem>
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </div>
//                             ) : (
//                               <div className="space-y-3">
//                                 {variations.map((variation, index) => (
//                                   <div
//                                     key={variation.id}
//                                     className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
//                                   >
//                                     <div>
//                                       <span className="font-medium text-gray-900">
//                                         {variation.name}:{" "}
//                                       </span>
//                                       <div className="flex flex-wrap gap-1 mt-1">
//                                         {variation.values.map(
//                                           (value, vIndex) => (
//                                             <Badge
//                                               key={vIndex}
//                                               variant="secondary"
//                                               className="bg-green-100 text-green-800"
//                                             >
//                                               {value}
//                                             </Badge>
//                                           )
//                                         )}
//                                       </div>
//                                     </div>
//                                     <div className="flex gap-2">
//                                       <Button
//                                         variant="ghost"
//                                         className="text-green-600 hover:bg-green-50"
//                                         size="sm"
//                                         type="button"
//                                         onClick={() =>
//                                           handleEditVariation(index)
//                                         }
//                                       >
//                                         <Edit className="w-4 h-4" />
//                                       </Button>
//                                       <Button
//                                         variant="ghost"
//                                         className="text-red-600 hover:bg-red-50"
//                                         size="sm"
//                                         type="button"
//                                         onClick={() =>
//                                           handleDeleteVariation(index)
//                                         }
//                                       >
//                                         <Trash2 className="w-4 h-4" />
//                                       </Button>
//                                     </div>
//                                   </div>
//                                 ))}

//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button
//                                       variant="outline"
//                                       className="w-full text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
//                                     >
//                                       <Plus className="w-4 h-4 mr-2" />
//                                       Add More
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent>
//                                     <DropdownMenuItem
//                                       onClick={() =>
//                                         handleAddVariation("Color")
//                                       }
//                                     >
//                                       Color
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onClick={() => handleAddVariation("Size")}
//                                     >
//                                       Size
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem
//                                       onClick={() =>
//                                         handleAddVariation("Material")
//                                       }
//                                     >
//                                       Material
//                                     </DropdownMenuItem>
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </div>
//                             )}
//                           </TabsContent>
//                         </Tabs>
//                       </FormItem>
//                     )}
//                   />
//                 </CardContent>
//               </Card>

//               {/* Card 3: Manage Products */}
//               {variationType === "multiple" && productVariations.length > 0 && (
//                 <Card className="border-gray-200 shadow-sm bg-white py-5">
//                   <CardHeader className="flex flex-row items-center justify-between">
//                     <CardTitle className="text-lg font-semibold text-gray-900">
//                       Manage Products
//                     </CardTitle>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       type="button"
//                       onClick={() => setIsBulkEditMode(!isBulkEditMode)}
//                       className="text-green-600 border-green-600 hover:bg-green-50"
//                     >
//                       {isBulkEditMode ? "Exit Bulk Edit" : "Bulk Edit"}
//                     </Button>
//                   </CardHeader>
//                   <CardContent>
//                     {isBulkEditMode && (
//                       <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center gap-2">
//                             <Checkbox
//                               checked={
//                                 selectedVariations.length ===
//                                 productVariations.length
//                               }
//                               onCheckedChange={handleSelectAllVariations}
//                             />
//                             <span className="text-sm font-medium">
//                               Select All ({selectedVariations.length} selected)
//                             </span>
//                           </div>
//                           {selectedVariations.length > 0 && (
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button
//                                   size="sm"
//                                   className="bg-green-600 hover:bg-green-700 cursor-pointer"
//                                 >
//                                   Edit Selected{" "}
//                                   <ChevronDown className="w-4 h-4 ml-1 cursor-pointer" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent>
//                                 <DropdownMenuItem onClick={handleEditAll}>
//                                   Edit All
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => handleBulkEdit("cost_price")}
//                                 >
//                                   Cost Price
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() =>
//                                     handleBulkEdit("selling_price")
//                                   }
//                                 >
//                                   Selling Price
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => handleBulkEdit("quantity")}
//                                 >
//                                   Quantity
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => handleBulkEdit("status")}
//                                 >
//                                   Status
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => handleBulkEdit("discount")}
//                                 >
//                                   Discount
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() =>
//                                     handleBulkEdit("low_stock_threshold")
//                                   }
//                                 >
//                                   Low Stock Threshold
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           )}
//                         </div>

//                         {showBulkEditInput && (
//                           <div className="flex justify-between items-start gap-2 mt-3 p-3 bg-white rounded border border-gray-200">
//                             <div className="flex flex-col items-start gap-1">
//                               <div className="flex items-center gap-2">
//                                 <label className="text-sm font-medium whitespace-nowrap">
//                                   {formatFieldLabel(
//                                     bulkEditField as VariationField
//                                   )}
//                                   :
//                                 </label>
//                                 {bulkEditField === "status" ? (
//                                   <Select
//                                     value={bulkEditValue}
//                                     onValueChange={setBulkEditValue}
//                                   >
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Select" />
//                                     </SelectTrigger>
//                                     <SelectContent className="w-full">
//                                       {StatusTypeOptions.map((option) => (
//                                         <SelectItem
//                                           key={option.value}
//                                           value={option.value}
//                                         >
//                                           {option.label}
//                                         </SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                                 ) : (
//                                   <Input
//                                     value={bulkEditValue}
//                                     onChange={(e) => {
//                                       setBulkEditValue(e.target.value);
//                                       setBulkEditError(null);
//                                     }}
//                                     placeholder={
//                                       bulkEditField === "cost_price" ||
//                                       bulkEditField === "selling_price" ||
//                                       bulkEditField === "quantity" ||
//                                       bulkEditField === "discount" ||
//                                       bulkEditField === "low_stock_threshold"
//                                         ? "Enter value >= 0"
//                                         : "Enter value"
//                                     }
//                                     className="w-full"
//                                   />
//                                 )}
//                               </div>
//                               {bulkEditError && (
//                                 <p className="text-[10px] text-red-600">
//                                   {bulkEditError}
//                                 </p>
//                               )}
//                             </div>

//                             <div className="flex gap-2">
//                               <Button
//                                 size="sm"
//                                 type="button"
//                                 onClick={applyBulkEdit}
//                                 className="bg-green-600 hover:bg-green-700"
//                               >
//                                 Apply All
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="border-gray-300 text-gray-700 hover:bg-gray-50"
//                                 type="button"
//                                 onClick={() => {
//                                   setShowBulkEditInput(false);
//                                   setBulkEditError(null);
//                                 }}
//                               >
//                                 Cancel
//                               </Button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     <Accordion type="multiple" className="space-y-2">
//                       {productVariations.map((variation, index) => (
//                         <AccordionItem
//                           key={variation.id}
//                           value={variation.id}
//                           className="border border-gray-200 rounded-lg"
//                         >
//                           <AccordionTrigger className="px-4 py-3 hover:no-underline">
//                             <div className="flex items-center gap-3 w-full">
//                               {isBulkEditMode && (
//                                 <Checkbox
//                                   checked={selectedVariations.includes(
//                                     variation.id
//                                   )}
//                                   onCheckedChange={(checked) =>
//                                     handleSelectVariation(
//                                       variation.id,
//                                       checked as boolean
//                                     )
//                                   }
//                                   onClick={(e) => e.stopPropagation()}
//                                 />
//                               )}
//                               <span className="font-medium text-gray-900">
//                                 {variation.combination}
//                               </span>
//                             </div>
//                           </AccordionTrigger>
//                           <AccordionContent className="px-4 pb-4">
//                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                               <FormField
//                                 control={form.control}
//                                 name={`product_variations.${index}.cost_price`}
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-xs font-medium text-gray-700">
//                                       Cost Price
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter cost price"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name={`product_variations.${index}.selling_price`}
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-xs font-medium text-gray-700">
//                                       Selling Price
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter selling price"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name={`product_variations.${index}.quantity`}
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-xs font-medium text-gray-700">
//                                       Quantity
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter quantity"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name={`product_variations.${index}.status`}
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-xs font-medium text-gray-700">
//                                       Status
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Select
//                                         onValueChange={field.onChange}
//                                         value={field.value}
//                                       >
//                                         <SelectTrigger className="mt-1 h-8 w-full">
//                                           <SelectValue placeholder="Select status" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                           {StatusTypeOptions.map((option) => (
//                                             <SelectItem
//                                               key={option.value}
//                                               value={option.value}
//                                             >
//                                               {option.label}
//                                             </SelectItem>
//                                           ))}
//                                         </SelectContent>
//                                       </Select>
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name={`product_variations.${index}.discount`}
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-xs font-medium text-gray-700">
//                                       Discount
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter discount"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                               <FormField
//                                 control={form.control}
//                                 name={`product_variations.${index}.low_stock_threshold`}
//                                 render={({ field }) => (
//                                   <FormItem>
//                                     <FormLabel className="text-xs font-medium text-gray-700">
//                                       Low Stock Threshold
//                                     </FormLabel>
//                                     <FormControl>
//                                       <Input
//                                         placeholder="Enter threshold"
//                                         className="mt-1"
//                                         {...field}
//                                       />
//                                     </FormControl>
//                                     <FormMessage className="text-xs" />
//                                   </FormItem>
//                                 )}
//                               />
//                             </div>
//                           </AccordionContent>
//                         </AccordionItem>
//                       ))}
//                     </Accordion>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Card 4: Supplies & Payment */}
//               <Card className="border-gray-200 shadow-sm bg-white py-5">
//                 <CardHeader>
//                   <CardTitle className="text-lg font-semibold text-gray-900">
//                     Supplies & Payment
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="supplier"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Supplier
//                           </FormLabel>
//                           <FormControl>
//                             <Select
//                               onValueChange={field.onChange}
//                               value={field.value}
//                             >
//                               <SelectTrigger className="mt-1 w-full">
//                                 <SelectValue placeholder="Select supplier" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {SupplierData?.data?.results?.data?.map(
//                                   (supplier: any) => (
//                                     <SelectItem
//                                       key={supplier.id}
//                                       value={supplier.id}
//                                     >
//                                       {supplier.name}
//                                     </SelectItem>
//                                   )
//                                 )}
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="payment_method"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Payment Method
//                           </FormLabel>
//                           <FormControl>
//                             <Select
//                               onValueChange={field.onChange}
//                               value={field.value}
//                             >
//                               <SelectTrigger className="mt-1 w-full">
//                                 <SelectValue placeholder="Select payment method" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {paymentMethodOptions.map((option) => (
//                                   <SelectItem
//                                     key={option.value}
//                                     value={option.value}
//                                   >
//                                     {option.label}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {(form.watch("payment_method") === "CREDIT" ||
//                       form.watch("payment_method") === "PART") && (
//                       <FormField
//                         control={form.control}
//                         name="due_date"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-col">
//                             <FormLabel>Due Date</FormLabel>
//                             <Popover>
//                               <PopoverTrigger asChild>
//                                 <FormControl>
//                                   <Button
//                                     variant={"outline"}
//                                     className={cn(
//                                       "w-full pl-3 text-left font-normal border border-primary-green-300",
//                                       !field.value && "text-muted-foreground"
//                                     )}
//                                   >
//                                     {field.value ? (
//                                       format(new Date(field.value), "PPP")
//                                     ) : (
//                                       <span>Pick a due date</span>
//                                     )}
//                                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                   </Button>
//                                 </FormControl>
//                               </PopoverTrigger>
//                               <PopoverContent
//                                 className="w-auto p-0"
//                                 align="start"
//                               >
//                                 <Calendar
//                                   className="bg-white"
//                                   mode="single"
//                                   selected={
//                                     field.value
//                                       ? new Date(field.value)
//                                       : undefined
//                                   }
//                                   onSelect={(date) =>
//                                     field.onChange(
//                                       date ? date.toISOString() : ""
//                                     )
//                                   }
//                                   disabled={(date) => date < new Date()}
//                                   initialFocus
//                                 />
//                               </PopoverContent>
//                             </Popover>
//                             <FormMessage className="text-xs" />
//                           </FormItem>
//                         )}
//                       />
//                     )}

//                     {form.watch("payment_method") === "PART" && (
//                       <FormField
//                         control={form.control}
//                         name="amount_paid"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-sm font-medium text-gray-700">
//                               Amount Paid
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="number"
//                                 placeholder="Enter amount paid"
//                                 className="mt-1"
//                                 {...field}
//                                 min="0.01"
//                                 step="0.01"
//                               />
//                             </FormControl>
//                             <FormMessage className="text-xs" />
//                           </FormItem>
//                         )}
//                       />
//                     )}

//                     <FormField
//                       control={form.control}
//                       name="type"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-sm font-medium text-gray-700">
//                             Discount Type
//                           </FormLabel>
//                           <FormControl>
//                             <Select
//                               onValueChange={field.onChange}
//                               value={field.value}
//                             >
//                               <SelectTrigger className="mt-1 w-full">
//                                 <SelectValue placeholder="Select discount type" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="percentage">
//                                   Percentage
//                                 </SelectItem>
//                                 <SelectItem value="fixed">
//                                   Fixed Amount
//                                 </SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage className="text-xs" />
//                         </FormItem>
//                       )}
//                     />

//                     {form.watch("type") === "percentage" && (
//                       <FormField
//                         control={form.control}
//                         name="percentage_discount"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-sm font-medium text-gray-700">
//                               Percentage Discount
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="number"
//                                 placeholder="Enter percentage discount"
//                                 className="mt-1"
//                                 {...field}
//                                 min="0"
//                                 max="100"
//                                 step="0.01"
//                               />
//                             </FormControl>
//                             <FormMessage className="text-xs" />
//                           </FormItem>
//                         )}
//                       />
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </form>
//       </Form>

//       {/* Edit All Modal */}
//       <CustomModal
//         isOpen={showEditAllModal}
//         onClose={() => {
//           setShowEditAllModal(false);
//           setBulkEditError(null);
//         }}
//         trigger={true}
//         title="Edit All Variations"
//         description="Update all product variations at once"
//       >
//         <div className="grid gap-4 py-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 Cost Price
//               </label>
//               <Input
//                 value={editAllData.cost_price}
//                 onChange={(e) => {
//                   setEditAllData({
//                     ...editAllData,
//                     cost_price: e.target.value,
//                   });
//                   setBulkEditError(null);
//                 }}
//                 placeholder="Enter cost price"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 Selling Price
//               </label>
//               <Input
//                 value={editAllData.selling_price}
//                 onChange={(e) => {
//                   setEditAllData({
//                     ...editAllData,
//                     selling_price: e.target.value,
//                   });
//                   setBulkEditError(null);
//                 }}
//                 placeholder="Enter selling price"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 Quantity
//               </label>
//               <Input
//                 value={editAllData.quantity}
//                 onChange={(e) => {
//                   setEditAllData({ ...editAllData, quantity: e.target.value });
//                   setBulkEditError(null);
//                 }}
//                 placeholder="Enter quantity"
//               />
//             </div>
//             <div className="w-full">
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 Status
//               </label>
//               <Select
//                 value={editAllData.status}
//                 onValueChange={(value) => {
//                   setEditAllData({ ...editAllData, status: value });
//                   setBulkEditError(null);
//                 }}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {StatusTypeOptions.map((option) => (
//                     <SelectItem key={option.value} value={option.value}>
//                       {option.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 Discount
//               </label>
//               <Input
//                 value={editAllData.discount}
//                 onChange={(e) => {
//                   setEditAllData({ ...editAllData, discount: e.target.value });
//                   setBulkEditError(null);
//                 }}
//                 placeholder="Enter discount"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1 block">
//                 Low Stock Threshold
//               </label>
//               <Input
//                 value={editAllData.low_stock_threshold}
//                 onChange={(e) => {
//                   setEditAllData({
//                     ...editAllData,
//                     low_stock_threshold: e.target.value,
//                   });
//                   setBulkEditError(null);
//                 }}
//                 placeholder="Enter threshold"
//               />
//             </div>
//           </div>

//           {bulkEditError && (
//             <p className="text-xs text-red-600 mt-2">{bulkEditError}</p>
//           )}

//           <div className="flex gap-3 mt-6">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowEditAllModal(false);
//                 setBulkEditError(null);
//               }}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={applyEditAll}
//               className="flex-1 bg-green-600 hover:bg-green-700"
//             >
//               Apply to All
//             </Button>
//           </div>
//         </div>
//       </CustomModal>

//       {/* Variation Sheet */}
//       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//         <SheetContent
//           side="right"
//           className="w-[300px] md:w-[500px] bg-white shadow-xl p-5"
//         >
//           <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-green-200">
//             <SheetTitle className="text-lg font-semibold">Add types</SheetTitle>
//           </SheetHeader>

//           <div className="py-6 space-y-6">
//             {selectedVariationType && (
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                   <h3 className="font-medium">{selectedVariationType}</h3>
//                 </div>

//                 <div className="ml-4 space-y-3">
//                   {newVariationValues.map((value, index) => (
//                     <div key={index} className="space-y-2">
//                       <div className="flex items-center justify-between">
//                         <label className="text-sm text-green-600 font-medium">
//                           {selectedVariationType} {index + 1}
//                         </label>
//                         {newVariationValues.length > 1 && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             type="button"
//                             onClick={() => removeVariationValue(index)}
//                             className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
//                           >
//                             <X className="w-4 h-4" />
//                           </Button>
//                         )}
//                       </div>
//                       <Input
//                         value={value}
//                         onChange={(e) =>
//                           updateVariationValue(index, e.target.value)
//                         }
//                         placeholder={`Enter ${selectedVariationType.toLowerCase()}`}
//                         className="text-sm bg-white border-green-200 focus:border-green-400 focus:ring-green-400"
//                       />
//                     </div>
//                   ))}

//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     type="button"
//                     onClick={addVariationValue}
//                     className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1 h-auto font-medium"
//                   >
//                     <Plus className="w-4 h-4 mr-1" />
//                     Add {selectedVariationType}
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex gap-3 pt-6 border-t border-green-200">
//             <Button
//               variant="outline"
//               type="button"
//               onClick={() => setIsSheetOpen(false)}
//               className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={handleSaveVariation}
//               disabled={isSaveDisabled}
//               className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:bg-green-300"
//             >
//               Save types
//             </Button>
//           </div>
//         </SheetContent>
//       </Sheet>
//     </div>
//   );
// };

// export default NewAddProduct;

const NewAddProduct = ({ id }: { id: any }) => {
  return <div>NewAddProduct</div>;
};

export default NewAddProduct;
