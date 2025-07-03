import { useLoginMutation } from "@/api/auth/login-user";
import { useToast } from "@/hooks/toast/useToast";
import { useUserStore } from "@/lib/store/user-store";
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
  const { login } = useUserStore();

  const [showLogin, setShowLogin] = useState(true);

  const {
    mutate: loginUser,
    isPending,
    isError,
    error,
  } = useLoginMutation({
    onSuccess: (data) => {
      console.log("data", data);
      login({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        is_verified: data.is_verified,
        is_subscribed: data.is_subscribed,
        subscription: data.subscription,
        tokens: {
          access: data.tokens.access,
          refresh: data.tokens.refresh,
        },
      });
      showToast("Login successful", "success");

      if (data?.role === "OWNER") {
        router.push(options?.redirectTo || "/create-business");
        router.refresh();
      } else if (data?.role === "ATTENDANT") {
        router.push(options?.redirectTo || "/create-business");
        router.refresh();
      }
    },
    onError: (error) => {
      if (error?.status_code === 403) {
        showToast(error?.message || "An error occurred during login", "error");
        setShowLogin(false);
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
    loginUser(values, {
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
    setShowLogin,
    error,
  };
};
