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
import { formatQty } from "./batch";
import BatchSelect, { useProductBatches } from "./BatchSelect";
const MoveProduction = ({
  productId,
  closeModal,
}: {
  productId: any;
  closeModal: any;
}) => {
  const {
    onSubmitAddMoveToProduction,
    addMoveToProductionForm,
    isMovingToProduction,
  } = useInventoryHook({ productId, closeModal });

  // Only bounded once a batch is chosen: without one the backend draws across
  // batches by expiry, so the product's own stock is the only ceiling and this
  // form does not have that figure.
  const batches = useProductBatches(productId);
  const selectedBatch = batches.find(
    (batch) => batch.id === addMoveToProductionForm.watch("batch_id"),
  );

  return (
    <div className="w-full">
      <Form {...addMoveToProductionForm}>
        <form
          onSubmit={addMoveToProductionForm.handleSubmit(
            onSubmitAddMoveToProduction,
          )}
          className="space-y-5"
        >
          {/* First Name and Last Name in same row */}
          <FormField
            control={addMoveToProductionForm.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={
                      selectedBatch ? Number(selectedBatch.quantity) : undefined
                    }
                    placeholder="Product Quantity....."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {selectedBatch && (
                  <p className="text-sm text-grey-3">
                    Available in {selectedBatch.batch_name}:{" "}
                    {formatQty(selectedBatch.quantity)}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Only rendered for products that have batches. */}
          <FormField
            control={addMoveToProductionForm.control}
            name="batch_id"
            render={({ field }) => (
              <BatchSelect
                productId={productId}
                value={field.value}
                onChange={field.onChange}
                label="Batch to draw from"
              />
            )}
          />

          <FormField
            control={addMoveToProductionForm.control}
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
            disabled={isMovingToProduction}
          >
            {isMovingToProduction ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MoveProduction;
