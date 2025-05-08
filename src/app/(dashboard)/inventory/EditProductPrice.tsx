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
const EditProductPrice = ({ id }: { id: any }) => {
  const { editSellingPriceForm, onSubmitEditSellingPrice, editProductPending } =
    useInventoryHook({
      productId: id,
    });

  console.log("EditProductPrice", id);
  return (
    <div className="w-full">
      <Form {...editSellingPriceForm}>
        <form
          onSubmit={editSellingPriceForm.handleSubmit(onSubmitEditSellingPrice)}
          className="space-y-5"
        >
          {/* First Name and Last Name in same row */}
          <FormField
            control={editSellingPriceForm.control}
            name="selling_price"
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

          <Button
            type="submit"
            className="w-full h-[48px] "
            disabled={editProductPending}
          >
            {editProductPending ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProductPrice;
