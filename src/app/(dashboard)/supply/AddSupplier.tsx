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
import { useSupplyHook } from "@/hooks/useSupplyHook";

const AddSupplier = ({ closeModal }: { closeModal: () => void }) => {
  const { form, onSubmit, createSupplierLoading } = useSupplyHook({
    closeModal,
  });
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name and Last Name in same row */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Supplier Name...." {...field} />
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="phone number...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="wallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet</FormLabel>
                <FormControl>
                  <Input placeholder="Wallet address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-[48px]"
            disabled={createSupplierLoading}
          >
            {createSupplierLoading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddSupplier;
