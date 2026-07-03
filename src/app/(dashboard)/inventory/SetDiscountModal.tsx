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
import { AlertTriangle } from "lucide-react";

const SetDiscountModal = ({
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

  // Watch form values to calculate profit warning
  const watchedValues = addDiscountForm.watch();
  const priceDiscount = parseFloat(watchedValues.price_discount) || 0;
  const productThreshold = parseFloat(watchedValues.product_threshold) || 0;

  // Calculate if profit would be negative
  const costPrice = product?.cost_price || 0;
  const sellingPrice = product?.selling_price || 0;
  const currentProfit = sellingPrice - costPrice;
  const profitAfterDiscount = currentProfit - priceDiscount;

  // Show warning if discount makes profit negative
  const showWarning = priceDiscount > 0 && profitAfterDiscount < 0;

  // Calculate break-even discount (maximum discount before going negative)
  const maxDiscount = Math.max(0, currentProfit);

  return (
    <div className="w-full">
      <Form {...addDiscountForm}>
        <form
          onSubmit={addDiscountForm.handleSubmit(addDiscountSubmit)}
          className="space-y-5"
        >
          {/* Product Threshold Field */}
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

          {/* Price Discount Field */}
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

          {/* Profit Warning */}
          {showWarning && (
            <div className="bg-error-2 border border-error-1/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-error-1 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-error-1 mb-1">
                  Warning: Negative Profit
                </h4>
                <p className="text-sm font-medium text-error-1 mb-2">
                  This discount will result in a negative profit for this item.
                </p>
                <div className="text-xs font-medium text-error-1 space-y-1">
                  <div>Cost Price: ₦{costPrice.toLocaleString()}</div>
                  <div>Selling Price: ₦{sellingPrice.toLocaleString()}</div>
                  <div>Current Profit: ₦{currentProfit.toLocaleString()}</div>
                  <div>Discount: ₦{priceDiscount.toLocaleString()}</div>
                  <div className="font-bold">
                    Profit After Discount: ₦
                    {profitAfterDiscount.toLocaleString()}
                  </div>
                  <div className="pt-1 border-t border-error-1/30">
                    Maximum recommended discount: ₦
                    {maxDiscount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-[48px]" disabled={loading}>
            {loading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SetDiscountModal;
