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
import Image from "next/image";
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
        <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-[#F4F7F4]">
          <div className="w-full md:max-w-[75%] p-2 md:p-8 border border-grey-5 bg-white rounded-2xl">
            <Image src="/asset/sink2.png" alt="Logo" width={130} height={130} />

            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-grey-1">
                Enter your email to reset your password
              </h1>
            </div>
            <Form {...sendform}>
              <form
                onSubmit={sendform.handleSubmit(onSubmitEmail)}
                className="space-y-5"
              >
                <FormField
                  control={sendform.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-grey-2">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email"
                          className="rounded-full bg-[#EEF4EF]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Send"}
                </Button>
              </form>
            </Form>
            <div className="w-full flex items-center justify-center">
              <Link href="/login">
                <p className="text-sm text-primary-green-300 hover:text-primary-green-100 font-bold mt-2 transition-colors">
                  Login
                </p>
              </Link>
            </div>
          </div>
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
              className="w-full h-[48px] rounded-full"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? <Spinner /> : "Verify OTP"}
            </Button>

            <Button
              variant="outline"
              className="w-full h-[48px] rounded-full"
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
