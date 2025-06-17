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
import { useInventoryHook } from "@/hooks/useInventoryHook";
const EditProductPrice = ({
  productId,
  product,
  closeModal,
}: {
  productId: any;
  closeModal: any;
  product: any;
}) => {
  const { addDiscountForm, addDiscountSubmit, loading } = useInventoryHook({
    productId,
    product,
    closeModal,
  });

  return (
    <div className="w-full">
      <Form {...addDiscountForm}>
        <form
          onSubmit={addDiscountForm.handleSubmit(addDiscountSubmit)}
          className="space-y-5"
        >
          {/* First Name and Last Name in same row */}
          <FormField
            control={addDiscountForm.control}
            name="product_threshold"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Product Threshold</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Product Threshold....."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addDiscountForm.control}
            name="price_discount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Price Discount</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Price Discount....." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-[48px] " disabled={loading}>
            {loading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProductPrice;
