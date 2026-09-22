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
import BatchSelect from "./BatchSelect";
const ReturnedProduct = ({
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
            onSubmitAddReturnedProduct
          )}
          className="space-y-5"
        >
          {/* RETURN deducts stock: it records goods sent back to a supplier.
              A customer refund goes through reversing the sale instead, which
              puts the units back — recording it here would take the same
              stock off twice. */}
          <p className="rounded-xl bg-info-2 px-3 py-2.5 text-xs text-info-1">
            For stock sent back to your supplier. This takes the units out of
            your inventory. A customer returning what they bought is handled by
            reversing that sale in Sales History.
          </p>

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

          {/* Only rendered for products that have batches. */}
          <FormField
            control={addReturnedProductForm.control}
            name="batch_id"
            render={({ field }) => (
              <BatchSelect
                productId={productId}
                value={field.value}
                onChange={field.onChange}
              />
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

export default ReturnedProduct;
