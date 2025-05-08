"use client";
import { Spinner } from "@/components/app/Spinner";
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
import { useProductHook } from "@/hooks/useProductHook";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const EditProduct = ({ id }: { id: string }) => {
  const {
    ProductData,
    onSubmit,
    form,
    CategoriesData,
    unitTypeOptions,
    addProductPending,
    SupplierData,
    SupplierLoading,
    paymentMethodOptions,
    CategoriesDataLoading,
  } = useProductHook({});
  return (
    <div className="w-1/2 mx-auto my-4 pb-6">
      <p className="text-2xl font-bold mb-4">Edit Product</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

          {/* Expiry Date */}
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
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      className="bg-white"
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
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

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex-1 w-full bg-white">
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full border border-green-300">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white cursor-pointer border border-green-100">
                    {!CategoriesDataLoading
                      ? CategoriesData?.data?.map((category: any) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                          >
                            {category.name}
                          </SelectItem>
                        ))
                      : "Loading..."}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          {/* Stock Quantity */}
          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Stock Quantity...." {...field} />
                </FormControl>
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
          <FormField
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
          />

          {/* Unit Cost Price */}
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit Cost Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Unit Cost Price...." {...field} />
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
                      <Input placeholder="Enter amount paid...." {...field} />
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
                  <Input placeholder="Enter Discount Value...." {...field} />
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
            disabled={addProductPending}
            type="submit"
            className="w-full h-[48px] mt-4"
          >
            {addProductPending ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProduct;
