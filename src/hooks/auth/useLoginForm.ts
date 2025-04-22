import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginMutation } from "@/api/auth/login-user";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/toast/useToast";

// Enhanced form schema with comprehensive validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
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

  const {
    mutate: login,
    isPending,
    isError,
    error,
  } = useLoginMutation({
    onSuccess: () => {
      showToast("Login successful", "success");
      router.push(options?.redirectTo || "/create-business");
      router.refresh();
    },
    onError: (error) => {
      showToast(error?.message || "An error occurred during login", "error");
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
    isSubmitting: isPending,
    isError,
    error,
  };
};
