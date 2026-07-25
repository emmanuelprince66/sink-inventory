import { CircleAlert } from "lucide-react";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerHook } from "@/hooks/useCustomerHook";

const AddCustomer = ({
  closeOpenCustomerModal,
  handleOpenNotSubscribeModal,
}: {
  closeOpenCustomerModal: any;
  handleOpenNotSubscribeModal?: () => void;
}) => {
  const {
    form,
    onSubmit,
    createCustomerLoading,
    stateList,
    cityList,
    handleStateChange,
  } = useCustomerHook({
    closeModal: closeOpenCustomerModal,
    handleOpenNotSubscribeModal,
  });
  const selectedState = form.watch("state");
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name and Last Name in same row */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Customer Name...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State and City — same NG state/city flow as the order delivery
              address (useOrderDeliveryHook) */}
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>State</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleStateChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stateList.map((s) => (
                        <SelectItem key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>City</FormLabel>
                  {selectedState && cityList.length === 0 ? (
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                  ) : (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedState}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              selectedState
                                ? "Select city"
                                : "Select state first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cityList.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Full address"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-[48px] "
            disabled={createCustomerLoading}
          >
            {createCustomerLoading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>

      <div className="flex w-full border border-info-1/30 mt-4 rounded-xl items-start gap-3 bg-info-2 text-info-1 p-3">
        <CircleAlert className="h-5 w-5 shrink-0 mt-0.5" />

        <p className="text-info-1 text-sm font-medium">
          You should ask your customers for permission before you subscribe them
          to your marketing emails or SMS
        </p>
      </div>
    </div>
  );
};

export default AddCustomer;
