// AddBankForm.tsx
"use client";

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
import { useBankHook } from "@/hooks/useBankHook";

export const AddBankForm = ({ closeModal }: { closeModal?: () => void }) => {
  const { form, onSubmit, createBankLoading } = useBankHook({ closeModal });
  // const { isSubmitting } = form.formState;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Bank Name */}
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter account name"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Number */}
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter account number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expense Tracking Section */}
            <div className="border-t pt-4 mt-4 flex flex-col gap-4 items-start w-full">
              <h3 className="font-medium mb-4">
                Expense Tracking (Optional - Fill all or none)
              </h3>

              {/* Minimum Charges */}
              <FormField
                control={form.control}
                name="min_fee"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Minimum Charges</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter minimum charges"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capped Charges */}
              <FormField
                control={form.control}
                name="max_fee"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Capped Charges</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter capped charges"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Percentage */}
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter percentage"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={createBankLoading}
              type="submit"
              className="w-full h-[48px] mt-6"
            >
              {createBankLoading ? <Spinner /> : "Add Bank Account"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
