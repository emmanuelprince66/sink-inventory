import { useLoginMutation } from "@/api/auth/login-user";
import { useToast } from "@/hooks/toast/useToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Enhanced form schema with comprehensive validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    // .email({ message: "Please enter a valid email address" })
    .max(100)
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50),
});

export type LoginFormValues = z.infer<typeof formSchema>;

export const useLoginForm = (options?: { redirectTo?: string }) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [showLogin, setShowLogin] = useState(true);

  const {
    mutate: login,
    isPending,
    isError,
    error,
  } = useLoginMutation({
    onSuccess: (data) => {
      console.log("Login successful", data);
      showToast("Login successful", "success");
      router.push(options?.redirectTo || "/create-business");
      router.refresh();
    },
    onError: (error) => {
      if (error?.status_code === 403) {
        showToast(error?.message || "An error occurred during login", "error");
        setShowLogin(false);

        console.log("Login error", error);
      } else {
        showToast(error?.message || "An error occurred during login", "error");
      }
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // More performant than onChange for complex validation
    criteriaMode: "all", // Show all validation errors at once
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values, {
      onError: (error) => {
        // Handle specific API errors
        if (error.statusCode === 401) {
          form.setError("password", {
            type: "manual",
            message: "Invalid credentials",
          });
        }
      },
    });
  };

  return {
    form,
    onSubmit,
    showLogin,
    isSubmitting: isPending,
    isError,
    error,
  };
};
