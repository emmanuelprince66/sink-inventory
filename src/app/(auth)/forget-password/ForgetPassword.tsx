"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { OtpInput } from "@/components/app/OtpInput";
import WelcomeScreen from "@/components/app/WelcomeScreen";
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
import { useState } from "react";
import ChangePass from "./ChangePass";

const ForgetPassword = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const {
    sendform,
    onSubmitEmail,
    isSubmitting,
    closeOtpModal,
    showOtpModal,
    handleVerifyOtp,
    handleResendOtp,
    otp,
    isVerifying,
    setOtp,
  } = useForgetPasswordHook({
    setShowChangePassword,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Welcome Screen (Left Side) */}
      <WelcomeScreen />

      {/* Login Form (Right Side) */}
      {!showChangePassword ? (
        <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-8 text-center">
              Enter your email
            </h1>
            <Form {...sendform}>
              <form
                onSubmit={sendform.handleSubmit(onSubmitEmail)}
                className="space-y-6"
              >
                <FormField
                  control={sendform.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Send"}
                </Button>
              </form>
            </Form>
          </div>

          <Link href="/login">
            <p className="text-[14px] text-blue-500 mt-2">Login</p>
          </Link>
        </div>
      ) : (
        <ChangePass />
      )}

      {/* Verify OTP Modal */}
      <CustomModal
        isOpen={showOtpModal}
        onClose={closeOtpModal}
        trigger={true}
        title="Verify OTP"
        description="Enter the 6-digit code sent to your email"
      >
        <div className="grid gap-4 py-4">
          <OtpInput
            value={otp}
            onChange={(value) => setOtp(value)}
            length={6}
          />

          <div className="flex flex-col gap-2 mt-4">
            <Button
              className="w-full h-[48px]"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? <Spinner /> : "Verify OTP"}
            </Button>

            <Button
              variant="outline"
              className="w-full h-[48px]"
              onClick={handleResendOtp}
              disabled={isVerifying}
            >
              Resend OTP
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default ForgetPassword;
