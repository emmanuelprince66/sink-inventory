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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FUND_PAYMENT_METHODS,
  FUND_TYPES,
  useGetCustomerByIdHook,
} from "@/hooks/useGetCustomerByIdHook";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const TYPE_ICONS = {
  DEPOSIT: ArrowDownLeft,
  WITHDRAWAL: ArrowUpRight,
} as const;

/**
 * Funds or draws down a customer's wallet — POST /customer/fund/{id}/.
 *
 * The body is {amount, payment_method, type, note}: amount is an integer,
 * payment_method is CASH or BANK, and note is optional. Direction is a
 * two-way segmented control rather than a dropdown, since which way the money
 * moves is the most consequential choice on the form and should be visible
 * without opening a menu.
 */
const UpdateCustomerWallet = ({
  wallet,
  closeModal,
}: {
  wallet: string | number;
  closeModal: () => void;
}) => {
  const { form, onSubmit, isUpdatingWallet, handleSelectOption, selectedOption } =
    useGetCustomerByIdHook({ closeModal });

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="rounded-xl border border-grey-5 bg-primary-green-700 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Current wallet balance
        </p>
        <p className="mt-1 text-2xl font-extrabold text-grey-1">{wallet}</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-grey-2">Direction</p>
        <div className="grid grid-cols-2 gap-2">
          {FUND_TYPES.map((option) => {
            const active = selectedOption === option.value;
            const Icon = TYPE_ICONS[option.value];

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectOption(option.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-primary-green-300 bg-secondary-6/50 ring-1 ring-primary-green-300"
                    : "border-grey-5 bg-white hover:border-secondary-3",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    active
                      ? "bg-primary-green-300 text-white"
                      : "bg-grey-6 text-grey-3",
                  )}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-grey-1">
                    {option.label}
                  </span>
                  <span className="block text-[11px] text-grey-3">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="0"
                    {...field}
                    // The endpoint takes whole naira, so digits only — a typed
                    // decimal point would be rounded away server-side anyway.
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12! min-h-0 w-full rounded-md border-grey-5">
                      <SelectValue placeholder="How was it paid?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUND_PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Note{" "}
                  <span className="font-normal text-grey-3">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    maxLength={500}
                    placeholder="What is this for?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              onClick={closeModal}
              disabled={isUpdatingWallet}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 flex-1"
              disabled={isUpdatingWallet}
            >
              {isUpdatingWallet ? (
                <Spinner />
              ) : selectedOption === "DEPOSIT" ? (
                "Fund wallet"
              ) : (
                "Withdraw"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateCustomerWallet;
