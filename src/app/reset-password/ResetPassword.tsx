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
import { useResetPasswordHook } from "@/hooks/useResetPassword";

const ResetPassword = () => {
  const { form, onSubmit, resetInvitePasswordLoading } = useResetPasswordHook();
  return (
    <>
      <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-8 text-center">
            Change Password
          </h1>
          <p className="text-sm text-center text-gray-500 mb-4">
            Change your password and take control of your business.
          </p>
        </div>
        <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="old_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter old password"
                        {...field}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={resetInvitePasswordLoading}
                type="submit"
                className="w-full h-[48px] mt-6"
              >
                {resetInvitePasswordLoading ? <Spinner /> : "Change Password"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
