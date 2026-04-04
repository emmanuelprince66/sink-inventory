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
const AddWaste = ({
  productId,
  closeModal,
}: {
  productId: any;
  closeModal: any;
}) => {
  const {
    onSubmitAddReturnedProduct,
    addReturnedProductForm,
    addReturnedOrDamagedProductLoading,
  } = useInventoryHook({ productId, closeModal });

  return (
    <div className="w-full">
      <Form {...addReturnedProductForm}>
        <form
          onSubmit={addReturnedProductForm.handleSubmit(
            onSubmitAddReturnedProduct,
          )}
          className="space-y-5"
        >
          {/* First Name and Last Name in same row */}
          <FormField
            control={addReturnedProductForm.control}
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
            control={addReturnedProductForm.control}
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
            disabled={addReturnedOrDamagedProductLoading}
            type="submit"
            className="w-full h-[48px] "
          >
            {addReturnedOrDamagedProductLoading ? <Spinner /> : "Add Waste"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddWaste;
