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
import { useGetRestockHistory } from "@/hooks/useGetRestockHistory";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const RestockItem = ({
  data,
  closeModal,
}: {
  data?: any;
  closeModal?: any;
}) => {
  const {
    restockHistory,
    SupplierData,
    SupplierLoading,
    form,
    restockProductPending,
    onSubmit,
    paymentMethodOptions,
  } = useGetRestockHistory({ data, closeModal });

  console.log("form", form.getValues());

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col gap-2"
        >
          {/* Item Name */}
          <FormField
            control={form.control}
            name="name"
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
            name="qty"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter Stock Quantity...."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
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
                      selected={field.value ? new Date(field.value) : undefined}
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

          {/* Low Stock Threshold */}
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Cost Price...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supplier */}

          {/* Stock Status */}
          <FormField
            control={form.control}
            name="selling_price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Selling Price...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Submit Button */}
          <Button
            disabled={restockProductPending}
            type="submit"
            className="w-full h-[48px] mt-4"
          >
            {restockProductPending ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RestockItem;
