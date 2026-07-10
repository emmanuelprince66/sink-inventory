"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTaxHook } from "@/hooks/useTaxHook";
import { Edit, Percent } from "lucide-react";

const Tax = () => {
  const {
    taxForm,
    isEditTaxModalOpen,
    handleUpdateTax,
    BusinessDataLoading,
    handleOpenEditModal,
    handleCloseEditModal,
    isLoading,
    taxRate,
    lastUpdated,
  } = useTaxHook();

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
            Tax Configuration
          </h1>
          <p className="text-sm text-grey-3 mt-1">
            Manage your business tax rate settings
          </p>
        </div>
      </div>

      {/* Tax Rate Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-grey-1">Tax Rate</h2>
          <Button
            onClick={handleOpenEditModal}
            variant="outline"
            size="sm"
            className="text-primary-green-300 border-primary-green-300 hover:bg-secondary-6"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        {!taxRate && taxRate !== 0 && !BusinessDataLoading ? (
          <Skeleton className="h-32 w-full bg-grey-5" />
        ) : (
          <CustomCard className="w-full rounded-2xl border-none bg-success-2 p-0" contentClassName="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/60 rounded-full">
                  <Percent className="w-6 h-6 text-success-1" />
                </div>
                <div>
                  <p className="text-sm text-success-1">Current Tax Rate</p>
                  <p className="text-3xl font-extrabold text-grey-1 mt-1">
                    {taxRate}%
                  </p>
                  {lastUpdated ? (
                    <p className="text-xs text-grey-4 mt-2">
                      Last updated:{" "}
                      {new Date(lastUpdated).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-grey-4 mt-2">
                      Not yet configured
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CustomCard>
        )}
      </div>

      {/* Edit Tax Rate Modal */}
      <CustomModal
        isOpen={isEditTaxModalOpen}
        onClose={handleCloseEditModal}
        trigger={false}
        title="Edit Tax Rate"
        description="Update the tax rate for your business"
      >
        <Form {...taxForm}>
          <form
            onSubmit={taxForm.handleSubmit(handleUpdateTax)}
            className="space-y-4"
          >
            <FormField
              control={taxForm.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g., 7.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditModal}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Tax Rate"}
              </Button>
            </div>
          </form>
        </Form>
      </CustomModal>
    </div>
  );
};

export default Tax;
