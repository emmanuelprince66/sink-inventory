import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useTransferProductHook } from "@/hooks/useTransferProductHook";
import { Loader2 } from "lucide-react";

const TransferProductForm = ({
  inventory,
  closeModal,
}: {
  inventory: any;
  closeModal: any;
}) => {
  const {
    form,
    onSubmit,
    otherBusiness,
    targetProducts,
    hasProducts,
    AllBusinessLoading,
    TargetInventoryLoading,
    isTransferring,
    handleBusinessChange,
  } = useTransferProductHook({ id: inventory?.id, closeModal });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="target_business_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer To Business</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleBusinessChange(value);
                }}
                value={field.value}
                disabled={AllBusinessLoading}
              >
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-full border border-gray-300 bg-white">
                  {otherBusiness?.map((business: any) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasProducts && (
          <FormField
            control={form.control}
            name="target_product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Product (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={TargetInventoryLoading}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to merge with" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full border border-gray-300 bg-white">
                    {targetProducts?.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Current: {product.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <p className="text-sm text-muted -foreground mt-2">
                  Leave empty to create a new product in the target business
                </p>
              </FormItem>
            )}
          />
        )}

        {!hasProducts && form.watch("target_business_id") && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription>
              No products found in target business. A new product will be
              created.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Transfer</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={inventory?.quantity}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Available: {inventory?.quantity}
              </p>
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={isTransferring}>
          {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Transfer Product
        </Button>
      </form>
    </Form>
  );
};

export default TransferProductForm;
