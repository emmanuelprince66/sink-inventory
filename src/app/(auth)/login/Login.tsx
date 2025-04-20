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
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

const Login = () => {
  const { form, onSubmit, isSubmitting } = useLoginForm();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Welcome Screen (Left Side) */}
      <WelcomeScreen />
      {/* Login Form (Right Side) */}
      <div className="w-full md:w-1/2 flex items-center flex-col justify-center p-8 bg-primary-green-600">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-8 text-center">Welcome Back</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e); // Ensure onChange is properly handled
                        }}
                      />
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
                        showPasswordToggle
                        placeholder="Enter password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e); // Ensure onChange is properly handled
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
                {isSubmitting ? <Spinner /> : "Login"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="w-full md:w-1/4 mx-auto mt-3 flex justify-between items-center">
          <p className="text-[14px]">Don't have an account yet?</p>
          <Link href="/signup">
            <p className="text-[14px] text-blue-500">Sign Up</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
