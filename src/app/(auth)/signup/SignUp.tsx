// SignUp.tsx
"use client";

import Link from "next/link";

import { CustomModal } from "@/components/app/CustomModal";
import { OtpInput } from "@/components/app/OtpInput";
import { PhoneInput } from "@/components/app/PhoneInput";
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
import { useSignUpForm } from "@/hooks/auth/useSignUpForm";
import Image from "next/image";
import "react-phone-number-input/style.css";

const SignUp = () => {
  const {
    form,
    onSubmit,
    otp,
    setOtp,
    isSubmitting,
    showOtpModal,
    closeOtpModal,
    handleVerifyOtp,
    handleResendOtp,
    isVerifying,
  } = useSignUpForm();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Welcome Screen (Left Side) */}
      <WelcomeScreen />

      {/* SignUp Form (Right Side) */}
      <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
        <div className="w-full  md:max-w-[75%] p-2 md:p-8 shadow-lg border-0 bg-white">
          <div className="flex items-center mb-8 bg-black p-4 rounded-full w-[100px] justify-center">
            {/* <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">✓</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                          SYNC360
                        </span> */}

            <Image src="/asset/sink.png" alt="Logo" width={50} height={50} />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-600 mb-2">
              Create Account
            </h1>
          </div>
          {/* Signup Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name and Last Name in same row */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="At least 8 characters"
                        showPasswordToggle
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        showPasswordToggle
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:ring-0 transition-colors"
                        {...field}
                        value={field.value ?? ""}
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
                {isSubmitting ? <Spinner /> : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="w-full mt-4 flex justify-center items-center gap-2">
            <p className="text-[14px]">Already have an account?</p>
            <Link href="/login">
              <p className="text-[14px] text-blue-500">Login</p>
            </Link>
          </div>
        </div>
      </div>

      {/* verify otp modal */}
      <CustomModal
        isOpen={showOtpModal} // FIXED: Removed the negation
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
      {/* verify otp modal end */}
    </div>
  );
};

export default SignUp;
