"use client";

import { useRef } from "react";
import { UseFormReturn } from "react-hook-form";

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
import { DELIVERY_DAYS_OPTIONS } from "@/hooks/useBusinessHook";
import { cn } from "@/lib/utils";

interface OptionType {
  label: string;
  value: string;
}

interface CreateBusinessFormProps {
  // The shared form instance from useBusinessHook
  form: UseFormReturn<any>;
  // Which submit handler to use — create or edit
  onSubmit: (values: any) => void;
  // Options for selects
  businessTypeOptions: OptionType[];
  currencyOptions: OptionType[];
  // Loading state — isCreating or isUpdating depending on mode
  loading: boolean;
  // Label for the submit button
  submitLabel?: string;
}

const CreateBusinessForm = ({
  form,
  onSubmit,
  businessTypeOptions,
  currencyOptions,
  loading,
  submitLabel = "Create Business",
}: CreateBusinessFormProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* ── Logo Upload ── */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => {
                const fileInputRef = useRef<HTMLInputElement>(null);

                return (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel>Business Logo</FormLabel>
                    <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {field.value ? (
                        <>
                          <img
                            src={
                              typeof field.value === "string"
                                ? field.value
                                : URL.createObjectURL(field.value)
                            }
                            alt="Business logo preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(null);
                            }}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs text-gray-500">
                            Click to upload
                          </span>
                        </div>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {field.value ? "Change Image" : "Select Image"}
                    </Button>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* ── Business Name ── */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Type ── */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex-1 w-full bg-white">
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full border border-green-300">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white cursor-pointer border border-green-100">
                      {businessTypeOptions?.map((type) => (
                        <SelectItem
                          key={type.label}
                          value={type.value}
                          className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                        >
                          {type.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Currency ── */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="flex-1 w-full bg-white">
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full border border-green-300">
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white cursor-pointer border border-green-100">
                      {currencyOptions?.map((type) => (
                        <SelectItem
                          key={type.label}
                          value={type.value}
                          className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                        >
                          {type.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Country ── */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── State ── */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state or province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── City ── */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Town</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city or town" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Street ── */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Phone ── */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      maxLength={15}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Email ── */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="business@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Delivery Days ── */}
            <FormField
              control={form.control}
              name="delivery_days"
              render={({ field }) => {
                const selected: string[] = field.value || [];
                const toggle = (day: string) => {
                  const set = new Set(selected);
                  if (set.has(day)) set.delete(day);
                  else set.add(day);
                  field.onChange(Array.from(set));
                };
                return (
                  <FormItem>
                    <FormLabel>Delivery Days</FormLabel>
                    <p className="text-xs text-gray-500 -mt-1">
                      Days this business delivers orders.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DELIVERY_DAYS_OPTIONS.map((day) => {
                        const isSelected = selected.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggle(day.value)}
                            className={cn(
                              "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer",
                              isSelected
                                ? "bg-green-600 border-green-600 text-white hover:bg-green-700"
                                : "bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50",
                            )}
                            aria-pressed={isSelected}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* ── Submit ── */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full h-[48px]"
            >
              {loading ? <Spinner /> : submitLabel}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateBusinessForm;
