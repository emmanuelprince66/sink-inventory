"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import useShippingHook from "@/hooks/useShippingHook";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

interface CreateShippingMethodProps {
  id?: string;
  closeModal?: any;
}

const CreateShippingMethod = ({
  id,
  closeModal,
}: CreateShippingMethodProps) => {
  const params = useParams();
  const shippingMethodId = (params.id as string) || id;
  const isEdit = !!shippingMethodId;

  const {
    ShippingData,
    shippingMethodData,
    shippingMethodLoading,
    form,
    onSubmit,
    isSubmitting,
    resetShippingMethodForm,
  } = useShippingHook({ closeModal });

  const handleCancel = () => {
    resetShippingMethodForm();
    window.history.back();
  };

  if (shippingMethodLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner color="text-primary-green-300" size={"xxl"} />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border border-gray-50 shadow-sm py-4">
      <CardHeader className="border-b border-gray-200">
        {!closeModal && (
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2 -ml-2"
              type="button"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        )}

        <CardTitle className="text-2xl">
          {isEdit ? "Edit Shipping Method" : "Create Shipping Method"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the shipping method for your store"
            : "Set up a new shipping method for your store"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location_name" className="text-base font-medium">
              Location Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location_name"
              placeholder="e.g., United States, Europe, Worldwide"
              {...form.register("location_name")}
              className={
                form.formState.errors.location_name ? "border-red-500" : ""
              }
              disabled={isSubmitting || shippingMethodLoading}
            />
            {form.formState.errors.location_name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.location_name.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Name the region or area where this shipping method applies
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee" className="text-base font-medium">
              Shipping Fee
            </Label>
            <Input
              id="fee"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("fee")}
              className={form.formState.errors.fee ? "border-red-500" : ""}
              disabled={isSubmitting || shippingMethodLoading}
            />
            {form.formState.errors.fee && (
              <p className="text-sm text-red-500">
                {form.formState.errors.fee.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave blank or enter 0 to make shipping fee "FREE"
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="shipping_description"
              className="text-base font-medium"
            >
              Shipping Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="shipping_description"
              placeholder="Describe the shipping method, delivery time, and any special conditions..."
              className="min-h-[100px] resize-none"
              {...form.register("shipping_description")}
              disabled={isSubmitting || shippingMethodLoading}
            />
            {form.formState.errors.shipping_description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.shipping_description.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Provide details about delivery times and shipping conditions
            </p>
          </div>

          <div className="flex items-start gap-2 space-x-3 rounded-md border border-gray-200 p-4">
            <Checkbox
              className="h-5 w-5 mt-0.5"
              id="visible_on_checkout"
              checked={form.watch("visible_on_checkout") || false}
              onCheckedChange={(checked) => {
                form.setValue("visible_on_checkout", checked === true);
              }}
              disabled={isSubmitting || shippingMethodLoading}
            />
            <div className="space-y-1">
              <Label
                htmlFor="visible_on_checkout"
                className="text-base font-medium cursor-pointer"
              >
                Make shipping method visible on web checkout
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, customers will see this option during checkout
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Update Shipping Method"
                : "Create Shipping Method"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateShippingMethod;
