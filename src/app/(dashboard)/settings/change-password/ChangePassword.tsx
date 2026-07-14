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
import { useChangePasswordHook } from "@/hooks/useChangePasswordHook";
const ChangePassword = () => {
  const { form, changePasswordLoading, onSubmit } = useChangePasswordHook();
  return (
    <div className="w-full flex flex-col items-center gap-4 py-4 sm:py-6">
      <div className="text-center">
        <h1 className="text-lg sm:text-xl font-extrabold text-grey-1">
          Change Password
        </h1>
        <p className="text-sm text-grey-3 mt-1">
          Change your password and take control of your business.
        </p>
      </div>
      <div className="w-full max-w-md bg-white p-4 sm:p-6 rounded-2xl border border-grey-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter current password"
                      {...field}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              disabled={changePasswordLoading}
              type="submit"
              className="w-full h-[48px] mt-6"
            >
              {changePasswordLoading ? <Spinner /> : "Change Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
