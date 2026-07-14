"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductHook } from "@/hooks/useProductHook";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRef, useState } from "react";

const EditProduct = ({ id }: { id: string }) => {
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);
  const {
    ProductData,
    onSubmit,
    form,
    loading,
    CategoriesData,
    unitTypeOptions,
    addProductPending,
    editProductPending,
    SupplierData,
    SupplierLoading,
    StatusTypeOptions,
    paymentMethodOptions,
    CategoriesDataLoading,
  } = useProductHook({ id, handleOpenNotSubscribeModal });
  return (
    <>
      {!ProductData || loading ? (
        <div className="w-1/2 mx-auto my-4 pb-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div className="flex flex-col gap-6 items-start">
              <Skeleton className="h-4 w-full bg-grey-5" />
              <Skeleton className="h-6 w-full bg-grey-5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-1/2 mx-auto my-4 pb-6">
          <p className="text-2xl font-bold mb-4">Edit Product</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const [previewUrl, setPreviewUrl] = useState<string | null>(
                    // Initialize with existing image URL if available
                    typeof field.value === "string" ? field.value : null
                  );

                  const fileInputRef = useRef<HTMLInputElement>(null);

                  // Handle both File objects and string URLs
                  const currentPreview = field.value
                    ? typeof field.value === "string" && field.value !== ""
                      ? field.value
                      : field.value instanceof File
                      ? URL.createObjectURL(field.value)
                      : null
                    : null;

                  return (
                    <FormItem className="flex flex-col items-center gap-2">
                      <FormLabel>Product Image</FormLabel>
                      <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {currentPreview ? (
                          <>
                            <img
                              src={currentPreview}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                field.onChange(null);
                                setPreviewUrl(null);
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-500">
                              Click to upload
                            </span>
                          </div>
                        )}
                      </div>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              // Create preview URL for new file
                              setPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {currentPreview ? "Change Image" : "Select Image"}
                      </Button>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              {/* Item Name */}
              <FormField
                control={form.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Item Name...." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Stock Quantity...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* SKU */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Sku</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Sku...." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border border-primary-green-300",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick your expiry date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border border-gray-200"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString() : "")
                          }
                          disabled={(date) => {
                            const today = new Date();
                            // Set time to start of day for accurate comparison
                            today.setHours(0, 0, 0, 0);
                            const compareDate = new Date(date);
                            compareDate.setHours(0, 0, 0, 0);
                            // Disable today and all past dates
                            return compareDate <= today;
                          }}
                          initialFocus
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 10}
                          defaultMonth={new Date()}
                          className="rounded-md border border-gray-200 bg-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full bg-white">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // This will be set by form.reset() in your useEffect
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border border-green-300">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer border border-green-100">
                        {CategoriesDataLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : (
                          CategoriesData?.data?.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Supplier */}
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full bg-white">
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border border-green-300">
                          <SelectValue placeholder="Select a Supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer border border-green-100">
                        {!SupplierLoading
                          ? SupplierData?.data?.results?.data?.map((s: any) => (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                              >
                                {s.name}
                              </SelectItem>
                            ))
                          : "Loading..."}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        placeholder="Enter Stock Quantity...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock Quantity */}
              <FormField
                control={form.control}
                name="stock_status"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full bg-white">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border border-green-300">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer border border-green-100">
                        {StatusTypeOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Low Stock Threshold */}
              <FormField
                control={form.control}
                name="low_stock_tresh"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Low Stock Threshold...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock Status */}
              <FormField
                control={form.control}
                name="stock_status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Stock Status</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Stock Status...." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Unit */}
              {/* <FormField
                control={form.control}
                name="product_unit"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Product Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Product Unit...." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="product_unit"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full bg-white">
                    <FormLabel>Product Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border border-green-300">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer border border-green-100">
                        {unitTypeOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Cost Price */}
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Unit Cost Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Unit Cost Price...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Unit Selling Price</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Selling Value...." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full bg-white">
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border border-green-300">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer border border-green-100">
                        {paymentMethodOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Fields */}
              {form.watch("payment_method") === "CREDIT" && (
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border border-primary-green-300",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a due date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="bg-white"
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date ? date.toISOString() : "")
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("payment_method") === "PART" && (
                <>
                  <FormField
                    control={form.control}
                    name="amount_paid"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Amount Paid</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter amount paid...."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border border-primary-green-300",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a due date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              className="bg-white"
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(date ? date.toISOString() : "")
                              }
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Discount Value */}
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Discount Value...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full bg-white">
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border border-green-300">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer border border-green-100">
                        <SelectItem
                          value="PERCENTAGE"
                          className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                        >
                          Percentage Off
                        </SelectItem>
                        <SelectItem
                          value="FIXED"
                          className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                        >
                          Price Slash
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Percentage Discount */}
              <FormField
                control={form.control}
                name="percentage_discount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Percentage Discount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Percentage Discount...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                disabled={editProductPending}
                type="submit"
                className="w-full h-[48px] mt-4"
              >
                {editProductPending ? <Spinner /> : "Save"}
              </Button>
            </form>
          </Form>

          <CustomModal
            isOpen={showNotSubscribeModal}
            onClose={handleCloseNotSubscribeModal}
            trigger={false}
            title="Subscription Details"
          >
            <div className="w-full ">
              <UserNotSubscribe />
            </div>
          </CustomModal>
        </div>
      )}
    </>
  );
};

export default EditProduct;
