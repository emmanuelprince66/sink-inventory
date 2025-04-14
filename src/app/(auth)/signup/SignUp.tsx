"use client";

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
import Link from "next/link";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/app/PhoneInput";

const SignUp = () => {
  const { form, onSubmit, isSubmitting } = useSignUpForm();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Welcome Screen (Left Side) */}
      <WelcomeScreen />

      {/* SignUp Form (Right Side) */}
      <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-8 text-center">
            Create Account
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name and Last Name in same row */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Enter phone number"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="At least 8 characters"
                        showPasswordToggle
                        {...field}
                        value={field.value ?? ""} // Ensure value is never undefined
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        showPasswordToggle
                        {...field}
                        value={field.value ?? ""} // Ensure value is never undefined
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
                {isSubmitting ? <Spinner /> : "Sign Up"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="w-full max-w-md mt-4 flex justify-center items-center gap-2">
          <p className="text-[14px]">Already have an account?</p>
          <Link href="/login">
            <p className="text-[14px] text-blue-500">Login</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
