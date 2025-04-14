// src/hooks/auth/useSignUpForm.ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSignUpMutation } from "@/api/auth/signup-user";
import { isValidPhoneNumber } from "react-phone-number-input";

// Define form schema
const formSchema = z
  .object({
    firstname: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastname: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine((value) => isValidPhoneNumber(value), {
        message: "Invalid phone number",
      }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(50, { message: "Password must be less than 50 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof formSchema>;

export const useSignUpForm = () => {
  const { mutate: signup, isPending } = useSignUpMutation();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: SignUpFormValues) => {
    console.log("Form submitted:", values);

    const payload = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone, // Will be in international format (e.g. "+12133734253")
      email: values.email,
      password: values.password,
    };

    signup(payload);
  };

  return {
    form,
    onSubmit,
    formSchema,
    isSubmitting: isPending,
  };
};
