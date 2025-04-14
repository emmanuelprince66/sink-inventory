import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginMutation } from "@/api/auth/login-user";

// Enhanced form schema with proper email validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(50, { message: "Password must be less than 50 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

export const useLoginForm = () => {
  const { mutate: login, isPending } = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange", // Changed to onChange for better responsiveness
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values); // No need for async/await since mutate is already a promise
  };

  return {
    form,
    onSubmit,
    isSubmitting: isPending,
  };
};
