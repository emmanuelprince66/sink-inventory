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
import { Spinner } from "@/components/ui/spinner";
import { useForgetPasswordHook } from "@/hooks/useForgetPasswordHook";
import Link from "next/link";

const ChangePass = () => {
  const {
    sendform,
    onSubmitEmail,
    isSubmitting,
    closeOtpModal,
    showOtpModal,
    handleVerifyOtp,
    handleResendOtp,
    handleResetPassword,
    onSubmitPassword,
    isResetting,
    resetPasswordForm,
    otp,

    isVerifying,
    setOtp,
  } = useForgetPasswordHook({});
  return (
    <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-[#F4F7F4]">
      <div className="w-full max-w-md p-2 md:p-8 border border-grey-5 bg-white rounded-2xl">
        <h1 className="text-2xl font-bold text-grey-1 mb-8 text-center">
          Enter your new password
        </h1>
        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(onSubmitPassword)}
            className="space-y-5"
          >
            <FormField
              control={resetPasswordForm.control}
              name="password"
              render={({ field: passwordField }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-grey-2">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      showPasswordToggle
                      placeholder="Enter New Password"
                      className="rounded-full bg-[#EEF4EF]"
                      {...passwordField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 rounded-full"
              disabled={isResetting}
            >
              {isResetting ? <Spinner /> : "Reset"}
            </Button>
          </form>
        </Form>
      </div>

      <Link href="/login">
        <p className="text-sm text-primary-green-300 hover:text-primary-green-100 font-bold mt-4 transition-colors">
          Login
        </p>
      </Link>
    </div>
  );
};

export default ChangePass;
