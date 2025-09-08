// src/hooks/auth/useSignUpForm.ts
import { useSignUpMutation } from "@/api/auth/signup-user";
import { useVerifyOtpMutation } from "@/api/auth/verify-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import { useToast } from "../toast/useToast";

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
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password must be less than 50 characters" }),
    // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, {
    //   message:
    //     "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    // }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof formSchema>;

export const useSignUpForm = ({ verifyOtpPhone }: { verifyOtpPhone?: any }) => {
  const { showToast } = useToast();

  const router = useRouter();

  const { mutate: signup, isPending } = useSignUpMutation();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtpMutation();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const [userPhone, setUserPhone] = useState("");

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
  };

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
  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    verifyOtp(
      { token: otp, phone: userPhone || verifyOtpPhone || "" },
      {
        onSuccess: (response) => {
          console.log("response", response);
          showToast("Account verified successfully!", "success");
          closeOtpModal();
          // You might want to redirect or perform other actions here
          // For example:
          router.push("/login");
        },
        onError: (error) => {
          showToast(error.message || "Invalid OTP. Please try again.", "error");
        },
      }
    );
  };

  const handleResendOtp = async () => {
    try {
      // Replace with your actual OTP resend API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("OTP resent successfully!", "success");
    } catch (error) {
      showToast("Failed to resend OTP. Please try again.", "error");
    }
  };

  const onSubmit = (values: SignUpFormValues) => {
    const payload = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      email: values.email,
      password: values.password,
    };

    signup(payload, {
      onSuccess: () => {
        setUserPhone(values.phone);
        setShowOtpModal(true);
        showToast(
          "Signup successful! Check your email for the OTP,Pin Valid For 10 minutes.",
          "success"
        );
      },
      onError: (error) => {
        // Your existing error handling
      },
    });
  };
  return {
    form,
    onSubmit,
    closeOtpModal,
    showOtpModal,
    handleVerifyOtp,
    handleResendOtp,
    otp,
    isVerifying,
    setOtp,
    formSchema,
    isSubmitting: isPending,
  };
};
