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
    <>
      <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-8 text-center">
            Enter your new password
          </h1>
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit(onSubmitPassword)}
              className="space-y-6"
            >
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field: passwordField }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter New Password"
                        {...passwordField}
                        onChange={(e) => {
                          passwordField.onChange(e); // Ensure onChange is properly handled
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-[48px]"
                disabled={isResetting}
              >
                {isResetting ? <Spinner /> : "Reset"}
              </Button>
            </form>
          </Form>
        </div>

        <Link href="/login">
          <p className="text-[14px] text-blue-500 mt-2">Login</p>
        </Link>
      </div>
    </>
  );
};

export default ChangePass;
