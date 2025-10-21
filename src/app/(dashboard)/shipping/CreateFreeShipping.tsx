"use client";


interface CreateFreeShippingProps {
  onBack: () => void;
}

const CreateFreeShipping = ({ onBack }: CreateFreeShippingProps) => {
  // const {
  //   formData,
  //   errors,
  //   isCreating,
  //   currencyOptions,
  //   handleInputChange,
  //   handleSubmit,
  //   resetForm,
  // } = useShippingHook();

  // const handleCancel = () => {
  //   resetForm();
  //   onBack();
  // };

  // const handleCreate = () => {
  //   handleSubmit(() => {
  //     resetForm();
  //     onBack();
  //   });
  // };

  return (
    // <Card className="w-full max-w-4xl mx-auto border border-gray-50 shadow-sm py-4">
    //   <CardHeader className="border-b border-gray-200">
    //     <div className="flex items-center gap-3 mb-4">
    //       <Button
    //         variant="ghost"
    //         size="sm"
    //         onClick={handleCancel}
    //         className="flex items-center gap-2 -ml-2"
    //         type="button"
    //         disabled={isCreating}
    //       >
    //         <ArrowLeft className="h-4 w-4" />
    //         Back
    //       </Button>
    //     </div>
    //     <CardTitle className="text-2xl">Create Free Shipping Rule</CardTitle>
    //     <CardDescription>
    //       Set up conditions for free shipping offers to your customers
    //     </CardDescription>
    //   </CardHeader>

    //   <CardContent className="space-y-6 pt-6">
    //     <div className="space-y-2">
    //       <Label htmlFor="location-name" className="text-base font-medium">
    //         Location Name <span className="text-red-500">*</span>
    //       </Label>
    //       <Input
    //         id="location-name"
    //         placeholder="e.g., United States, Europe, Worldwide"
    //         value={formData.location_name}
    //         onChange={(e) => handleInputChange("location_name", e.target.value)}
    //         className={errors.location_name ? "border-red-500" : ""}
    //         disabled={isCreating}
    //       />
    //       {errors.location_name && (
    //         <p className="text-sm text-red-500">{errors.location_name}</p>
    //       )}
    //       <p className="text-sm text-muted-foreground">
    //         Name the region or area where this free shipping applies
    //       </p>
    //     </div>

    //     <div className="grid md:grid-cols-2 gap-6">
    //       <div className="space-y-2">
    //         <Label htmlFor="min-cart-items" className="text-base font-medium">
    //           Minimum Cart Items
    //         </Label>
    //         <Input
    //           id="min-cart-items"
    //           type="number"
    //           min="0"
    //           placeholder="e.g., 3"
    //           value={
    //             formData.min_cart_items !== null &&
    //             formData.min_cart_items !== undefined
    //               ? formData.min_cart_items
    //               : ""
    //           }
    //           onChange={(e) =>
    //             handleInputChange(
    //               "min_cart_items",
    //               e.target.value ? parseInt(e.target.value) : null
    //             )
    //           }
    //           className={errors.min_cart_items ? "border-red-500" : ""}
    //           disabled={isCreating}
    //         />
    //         {errors.min_cart_items && (
    //           <p className="text-sm text-red-500">{errors.min_cart_items}</p>
    //         )}
    //         <p className="text-sm text-muted-foreground">
    //           Minimum number of items required in cart
    //         </p>
    //       </div>

    //       <div className="space-y-2">
    //         <Label htmlFor="min-cart-value" className="text-base font-medium">
    //           Minimum Cart Value
    //         </Label>
    //         <Input
    //           id="min-cart-value"
    //           type="number"
    //           step="0.01"
    //           min="0"
    //           placeholder="e.g., 50.00"
    //           value={formData.min_cart_value ?? ""}
    //           onChange={(e) =>
    //             handleInputChange("min_cart_value", e.target.value || null)
    //           }
    //           className={errors.min_cart_value ? "border-red-500" : ""}
    //           disabled={isCreating}
    //         />
    //         {errors.min_cart_value && (
    //           <p className="text-sm text-red-500">{errors.min_cart_value}</p>
    //         )}
    //         <p className="text-sm text-muted-foreground">
    //           Minimum order amount for free shipping
    //         </p>
    //       </div>
    //     </div>

    //     <div className="space-y-2">
    //       <Label htmlFor="currency" className="text-base font-medium">
    //         Currency
    //       </Label>
    //       <Select
    //         value={formData.currency ?? ""}
    //         onValueChange={(value) =>
    //           handleInputChange("currency", value || null)
    //         }
    //         disabled={isCreating}
    //       >
    //         <SelectTrigger id="currency" className="w-full">
    //           <SelectValue placeholder="Select a currency (optional)" />
    //         </SelectTrigger>
    //         <SelectContent>
    //           {currencyOptions.map((currency) => (
    //             <SelectItem key={currency.value} value={currency.value}>
    //               {currency.label}
    //             </SelectItem>
    //           ))}
    //         </SelectContent>
    //       </Select>
    //       <p className="text-sm text-muted-foreground">
    //         Specify which currency this rule applies to
    //       </p>
    //     </div>

    //     <div className="space-y-2">
    //       <Label htmlFor="description" className="text-base font-medium">
    //         Description
    //       </Label>
    //       <Textarea
    //         id="description"
    //         placeholder="Add details about this free shipping offer..."
    //         className="min-h-[100px] resize-none"
    //         value={formData.description ?? ""}
    //         onChange={(e) =>
    //           handleInputChange("description", e.target.value || null)
    //         }
    //         disabled={isCreating}
    //       />
    //       <p className="text-sm text-muted-foreground">
    //         Optional description shown to customers
    //       </p>
    //     </div>

    //     <div className="flex gap-3 pt-6 border-t">
    //       <Button
    //         onClick={handleCreate}
    //         className="flex-1"
    //         disabled={isCreating}
    //       >
    //         {isCreating ? "Creating..." : "Create Free Shipping Rule"}
    //       </Button>
    //       <Button
    //         variant="outline"
    //         onClick={handleCancel}
    //         className="flex-1"
    //         disabled={isCreating}
    //       >
    //         Cancel
    //       </Button>
    //     </div>
    //   </CardContent>
    // </Card>


    <></>
  );
};

export default CreateFreeShipping;
