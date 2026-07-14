"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="w-full max-w-4xl mx-auto">
      {!closeModal && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
            {isEdit ? "Edit Shipping Method" : "Create Shipping Method"}
          </h1>
        </div>
      )}

      <Card className="w-full rounded-2xl border-border-tint py-0">
        {closeModal && (
          <CardHeader className="border-b border-border-tint py-4">
            <CardTitle className="text-grey-1 text-base font-extrabold">
              {isEdit ? "Edit Shipping Method" : "Create Shipping Method"}
            </CardTitle>
          </CardHeader>
        )}

        <CardContent className="space-y-6 p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location_name" className="font-bold">
              Location Name <span className="text-error-1">*</span>
            </Label>
            <Input
              id="location_name"
              placeholder="e.g., United States, Europe, Worldwide"
              {...form.register("location_name")}
              className={
                form.formState.errors.location_name ? "border-error-1" : ""
              }
              disabled={isSubmitting || shippingMethodLoading}
            />
            {form.formState.errors.location_name && (
              <p className="text-sm text-error-1">
                {form.formState.errors.location_name.message}
              </p>
            )}
            <p className="text-sm text-grey-3">
              Name the region or area where this shipping method applies
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee" className="font-bold">
              Shipping Fee
            </Label>
            <Input
              id="fee"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("fee")}
              className={form.formState.errors.fee ? "border-error-1" : ""}
              disabled={isSubmitting || shippingMethodLoading}
            />
            {form.formState.errors.fee && (
              <p className="text-sm text-error-1">
                {form.formState.errors.fee.message}
              </p>
            )}
            <p className="text-sm text-grey-3">
              Leave blank or enter 0 to make shipping fee "FREE"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_description" className="font-bold">
              Shipping Description <span className="text-error-1">*</span>
            </Label>
            <Textarea
              id="shipping_description"
              placeholder="Describe the shipping method, delivery time, and any special conditions..."
              className="min-h-[100px] resize-none"
              {...form.register("shipping_description")}
              disabled={isSubmitting || shippingMethodLoading}
            />
            {form.formState.errors.shipping_description && (
              <p className="text-sm text-error-1">
                {form.formState.errors.shipping_description.message}
              </p>
            )}
            <p className="text-sm text-grey-3 mt-2">
              Provide details about delivery times and shipping conditions
            </p>
          </div>

          <div className="flex items-start gap-2 space-x-3 rounded-lg border border-grey-5 p-4">
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
                className="font-bold cursor-pointer"
              >
                Make shipping method visible on web checkout
              </Label>
              <p className="text-sm text-grey-3">
                When enabled, customers will see this option during checkout
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border-tint">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-grey-5 text-grey-2 hover:bg-grey-6"
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
    </div>
  );
};

export default CreateShippingMethod;
