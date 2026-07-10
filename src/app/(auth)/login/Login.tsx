"use client";

import ResetPassword from "@/app/reset-password/ResetPassword";
import { CustomModal } from "@/components/app/CustomModal";
import { OtpInput } from "@/components/app/OtpInput";
import { PhoneInput } from "@/components/app/PhoneInput";
import WelcomeMessage from "@/components/app/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import { useSignUpForm } from "@/hooks/auth/useSignUpForm";

import Image from "next/image";
import Link from "next/link";

const Login = () => {
  const {
    form,
    onSubmit,
    showOtpModal,
    closeOtpPhoneModal,
    showLogin,
    setShowLogin,
    verifyOtpPhone,
    setVerifyOtpPhone,
    isSubmitting,
  } = useLoginForm();

  const {
    otp,
    setOtp,

    handleVerifyOtp,
    handleResendOtp,
    isVerifying,
  } = useSignUpForm({ verifyOtpPhone, closeOtpPhoneModal });

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Welcome Message Component (Left Side) */}
      <WelcomeMessage />

      {/* Login Form (Right Side) */}
      {showLogin ? (
        <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-6 lg:p-12 bg-[#F4F7F4]">
          <Card className="w-full md:max-w-[75%] p-6 md:p-8 border border-grey-5 bg-white rounded-2xl">
            {/* Logo */}

            <Image src="/asset/sink2.png" alt="Logo" width={130} height={130} />

            {/* Welcome Message */}
            <div className="mb-8 mt-4">
              <h1 className="text-2xl font-bold text-grey-1">
                Welcome to Sync360 Admin
              </h1>
            </div>

            {/* Login Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-grey-2">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-grey-2">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          showPasswordToggle
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Continue"}
                </Button>
              </form>
            </Form>

            {/* Additional Links */}
            <div className="mt-6 space-y-4 text-center">
              <div className="flex justify-center items-center gap-2">
                <p className="text-sm text-grey-3">
                  Don't have an account yet?
                </p>
                <Link href="/signup">
                  <p className="text-sm text-primary-green-300 hover:text-primary-green-100 font-bold transition-colors">
                    Sign Up
                  </p>
                </Link>
              </div>
              <Link href="/forget-password">
                <p className="text-sm text-grey-3 hover:text-grey-2 transition-colors">
                  Forget Password
                </p>
              </Link>
            </div>
          </Card>
          {/* verify otp modal */}
          <CustomModal
            isOpen={showOtpModal} // FIXED: Removed the negation
            onClose={closeOtpPhoneModal}
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

              <div className="flex w-full flex-col items-start mt-4">
                <p className="text-sm font-bold text-grey-2 mb-2">
                  Enter Phone Number
                </p>
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={verifyOtpPhone}
                  onChange={(value) => setVerifyOtpPhone(value)}
                  placeholder="Enter phone number"
                />
                <p className="text-xs text-warning-1 mt-1.5 mb-2">
                  Please enter the phone number you used in signing up.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  className="w-full h-[48px]"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otp.length !== 6 || !verifyOtpPhone}
                >
                  {isVerifying ? <Spinner /> : "Verify OTP"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-[48px]"
                  onClick={handleResendOtp}
                  disabled={isVerifying || !verifyOtpPhone}
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          </CustomModal>
          {/* verify otp modal end */}
        </div>
      ) : (
        <ResetPassword setShowLogin={setShowLogin} />
      )}
    </div>
  );
};

export default Login;
