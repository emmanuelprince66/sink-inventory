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
        <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
          <div className="w-full md:max-w-[75%] p-2 md:p-8 shadow-lg border-0 bg-white">
            {/* Logo */}
            <div className="flex items-center mb-8 bg-black p-4 rounded-full w-[100px] justify-center">
              {/* <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                         <span className="text-white font-bold text-sm">✓</span>
                       </div>
                       <span className="text-xl font-semibold text-gray-900">
                         SYNC360
                       </span> */}

              <Image src="/asset/sink.png" alt="Logo" width={50} height={50} />
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-2xl font-light text-gray-600 mb-2">
                Enter your email to reset your password
              </h1>
            </div>
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
                      <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
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
                  className="w-full py-3 bg-green-800 hover:bg-gray-800 text-white font-medium rounded-full transition-colors uppercase tracking-wider h-[48px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Send"}
                </Button>
              </form>
            </Form>
            <div className="w-full flex items-center justify-center">
              <Link href="/login">
                <p className="text-[14px] text-blue-500 mt-2">Login</p>
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
