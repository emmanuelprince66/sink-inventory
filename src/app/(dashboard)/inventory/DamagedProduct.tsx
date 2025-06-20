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
import { Textarea } from "@/components/ui/textarea";
import { useInventoryHook } from "@/hooks/useInventoryHook";
const DamagedProduct = ({
  productId,
  closeModal,
}: {
  productId: any;
  closeModal: any;
}) => {
  const {
    onSubmitAddDamagedProduct,
    addDamagedProductForm,
    addReturnedOrDamagedProductLoading,
  } = useInventoryHook({ productId, closeModal });

  return (
    <div className="w-full">
      <Form {...addDamagedProductForm}>
        <form
          onSubmit={addDamagedProductForm.handleSubmit(
            onSubmitAddDamagedProduct
          )}
          className="space-y-5"
        >
          {/* First Name and Last Name in same row */}
          <FormField
            control={addDamagedProductForm.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input placeholder="Product Quantity....." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addDamagedProductForm.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Reason..."
                    className="min-h-[120px]"
                    {...field}
                    maxLength={150} // Add maxLength attribute for native HTML limiting
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-[48px] "
            disabled={addReturnedOrDamagedProductLoading}
          >
            {addReturnedOrDamagedProductLoading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DamagedProduct;
