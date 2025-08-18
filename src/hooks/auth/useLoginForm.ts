import { useLoginMutation } from "@/api/auth/login-user";
import { useNotification } from "@/components/providers/notification-provider";
import { useToast } from "@/hooks/toast/useToast";
import { notificationService } from "@/lib/notification";
import { useUserStore } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

// Extended type for API payload
interface LoginPayload extends LoginFormValues {
  fcm_token?: string;
}

export const useLoginForm = (options?: { redirectTo?: string }) => {
  const router = useRouter();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { login } = useUserStore();
  const { isSupported, permission, token, requestPermission, getToken } =
    useNotification();

  console.log("token", token);

  const handleGetToken = async () => {
    setIsLoading(true);
    try {
      const newToken = await getToken();
      if (newToken) {
        setFcmToken(newToken);
        // toast.success("Token retrieved successfully!");
      } else {
        toast.error("Failed to retrieve token.");
      }
    } catch (error) {
      console.error("Error getting token:", error);
      toast.error("Failed to retrieve token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && permission === "granted") {
      setFcmToken(token);
      console.log("🔑 FCM Token from context:", token);
    } else {
      handleGetToken();
    }
  }, [token, permission]);

  const [showLogin, setShowLogin] = useState(true);

  const {
    mutate: loginUser,
    isPending,
    isError,
    error,
  } = useLoginMutation({
    onSuccess: (data) => {
      console.log("Login successful:", data);
      login({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        is_verified: data.is_verified,
        is_subscribed: data.is_subscribed,
        subscription: data.subscription,
        kyc: data?.kyc,
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

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Prepare the payload
      const payload: LoginPayload = {
        ...values,
      };

      console.log("🔔 Getting FCM token before login...");

      // Always try to get FCM token first - wait for it
      let currentFcmToken = fcmToken;

      console.log("🔑 Current FCM token:", currentFcmToken);

      if (!currentFcmToken) {
        try {
          console.log("🔑 Requesting notification permission...");

          // Wait for permission request
          const granted = await notificationService.requestPermission();

          console.log("🔑 Permission granted:", granted);
          if (granted) {
            console.log("✅ Permission granted, getting token...");
            // Wait for token generation
            currentFcmToken = await notificationService.getToken();

            console.log("🔑 FCM token obtained:", currentFcmToken);
          } else {
            console.log("❌ Permission denied by user");
          }
        } catch (error) {
          console.log("❌ Error getting FCM token:", error);
          // Error occurred - continue with login without token
        }
      }

      // Add FCM token to payload if we got one
      if (currentFcmToken) {
        payload.fcm_token = currentFcmToken;
        console.log("🔑 FCM token included in login payload");
      } else {
        console.log("⚠️ Proceeding with login without FCM token");
      }

      console.log("📤 Submitting login payload");

      // Now submit login with or without token
      loginUser(payload, {
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
    } catch (error) {
      console.error("❌ Error during login submission:", error);
      showToast("An error occurred during login", "error");
    }
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
