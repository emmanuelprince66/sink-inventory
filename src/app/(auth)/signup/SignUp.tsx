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
  } = useSignUpForm({});

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Welcome Screen (Left Side) */}
      <WelcomeScreen />

      {/* SignUp Form (Right Side) */}
      <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-2 md:p-6 bg-[#F4F7F4]">
        <div className="w-full md:max-w-[75%] p-2 md:p-6 border border-grey-5 bg-white rounded-2xl">
          <Image src="/asset/sink2.png" alt="Logo" width={90} height={90} />

          <div className="mb-4">
            <h1 className="text-xl font-bold text-grey-1">Create Account</h1>
          </div>
          {/* Signup Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 w-full"
            >
              {/* First Name and Last Name in same row */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs font-bold text-grey-2">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="rounded-full bg-[#EEF4EF] h-10"
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
                      <FormLabel className="text-xs font-bold text-grey-2">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="rounded-full bg-[#EEF4EF] h-10"
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
                    <FormLabel className="text-xs font-bold text-grey-2">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        international
                        defaultCountry="NG"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Enter phone number"
                        className="rounded-full bg-[#EEF4EF] h-10"
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
                    <FormLabel className="text-xs font-bold text-grey-2">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@email.com"
                        className="rounded-full bg-[#EEF4EF] h-10"
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
                    <FormLabel className="text-xs font-bold text-grey-2">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="At least 8 characters"
                        showPasswordToggle
                        className="rounded-full bg-[#EEF4EF] h-10"
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
                    <FormLabel className="text-xs font-bold text-grey-2">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        showPasswordToggle
                        className="rounded-full bg-[#EEF4EF] h-10"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Referral Code Field (optional) */}
              <FormField
                control={form.control}
                name="referal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-grey-2">
                      Referral Code{" "}
                      <span className="text-grey-4 font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter referral code"
                        className="rounded-full bg-[#EEF4EF] h-10"
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
                className="w-full h-10 rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="w-full mt-3 flex justify-center items-center gap-2">
            <p className="text-xs text-grey-3">Already have an account?</p>
            <Link href="/login">
              <p className="text-xs text-primary-green-300 hover:text-primary-green-100 font-bold transition-colors">
                Login
              </p>
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
      {/* verify otp modal end */}
    </div>
  );
};

export default SignUp;
