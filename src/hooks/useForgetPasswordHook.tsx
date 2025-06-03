import { useForgetPasswordMutation } from "@/api/auth/forget-password";
import { useResetPasswordMutation } from "@/api/auth/reset-password";
import { useVerifyResetMutation } from "@/api/auth/verify-reset";
import { useToast } from "@/hooks/toast/useToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    // .email({ message: "Please enter a valid email address" })
    .max(100)
    .transform((val) => val.toLowerCase().trim()),
});
const resetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password must be less than 50 characters" }),
});

export type ForgetPasswordFormValues = z.infer<typeof formSchema>;
export type PasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export const useForgetPasswordHook = ({
  setShowChangePassword,
}: {
  setShowChangePassword?: any;
}) => {
  const { showToast } = useToast();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { mutate: verifyOtp, isPending: isVerifying } =
    useVerifyResetMutation();
  const { mutate: resetPassword, isPending: isResetting } =
    useResetPasswordMutation();

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    verifyOtp(
      { token: otp, email: userEmail },
      {
        onSuccess: (response) => {
          console.log("OTP verification response:", response);
          if (response?.uid64) {
            showToast("Account verified successfully!", "success");
            setShowChangePassword(true);
            localStorage.setItem("uid", response.uid64);
            closeOtpModal();
          } else {
            showToast("Invalid response from server", "error");
          }
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

  const { mutate: ForgetPassword, isPending } = useForgetPasswordMutation({
    onSuccess: (data) => {
      console.log("data", data);
      showToast(data?.data?.message, "success");
      setShowOtpModal(true);
    },
    onError: (error) => {
      showToast("Something went wrong", "error");
    },
  });

  const sendform = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur", // More performant than onChange for complex validation
    criteriaMode: "all", // Show all validation errors at once
  });
  const resetPasswordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
    },
    mode: "onBlur", // More performant than onChange for complex validation
    criteriaMode: "all", // Show all validation errors at once
  });

  const onSubmitEmail = (values: ForgetPasswordFormValues) => {
    console.log("values", values);
    setUserEmail(values.email);
    ForgetPassword(values);
  };

  const handleResetPassword = () => {
    onSubmitPassword(resetPasswordForm.getValues());
  };
  const onSubmitPassword = (values: PasswordFormValues) => {
    console.log("values", values);
    const payload = {
      password: values.password,
      uid64: localStorage.getItem("uid"),
    };

    resetPassword(payload, {
      onSuccess: (data) => {
        showToast(data?.message, "success");
        router.push("/login");
      },
      onError: (error) => {
        showToast("Something went wrong", "error");
      },
    });
  };

  return {
    onSubmitEmail,
    sendform,
    isSubmitting: isPending,
    isResetting,
    closeOtpModal,
    showOtpModal,
    onSubmitPassword,
    handleResetPassword,
    resetPasswordForm,
    handleVerifyOtp,
    handleResendOtp,
    otp,
    isVerifying,
    setOtp,
  };
};
