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
import { useCustomerHook } from "@/hooks/useCustomerHook";

const AddCustomer = ({
  closeOpenCustomerModal,
  handleOpenNotSubscribeModal,
}: {
  closeOpenCustomerModal: any;
  handleOpenNotSubscribeModal?: () => void;
}) => {
  const { form, onSubmit, createCustomerLoading } = useCustomerHook({
    closeModal: closeOpenCustomerModal,
    handleOpenNotSubscribeModal,
  });
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

          <Button
            type="submit"
            className="w-full h-[48px] "
            disabled={createCustomerLoading}
          >
            {createCustomerLoading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>

      <div
        className={
          "flex w-full border border-blue-600 mt-4 rounded-sm  items-start gap-3 bg-blue-200 text-blue-600 p-3"
        }
      >
        <CircleAlert />

        <p className="text-blue-600 text-sm">
          You should ask your customers for permission before you subscribe them
          to your marketing emails or SMS
        </p>
      </div>
    </div>
  );
};

export default AddCustomer;
