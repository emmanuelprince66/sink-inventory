"use client";

import { useState } from "react";

import { UserRound } from "lucide-react";

import Image from "next/image";

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
import { useBusinessHook } from "@/hooks/useBusinessHook";




const CreateBusinessForm = () => {
  const { form, onSubmit } = useBusinessHook();
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full items-center justify-center ">
      <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Logo Upload */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center mb-2">Add Logo</FormLabel>
                  <FormControl>
                    <div className="relative group w-[60px] h-[60px]">
                      <label className="cursor-pointer">
                        {preview ? (
                          <Image
                            src={preview}
                            alt="Preview"
                            width={120}
                            height={120}
                            className="rounded-full object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-gray-100 border border-gray-300">
                            <UserRound className="text-gray-400 w-10 h-10" />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPreview(URL.createObjectURL(file));
                              field.onChange(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Text Fields */}
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

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Retail, Tech, Services..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button type="submit" className="w-full h-[48px]">
              Create Business
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateBusinessForm;
