import { useResetInvitePasswordMutation } from "@/api/auth/invite-reset-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required"),
  old_password: z.string().min(1, "TOld Password  is required"),
  new_password: z.string().min(1, "New Password is required"),
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const useResetPasswordHook = () => {
  const { showToast } = useToast();

  const { mutate: resetInvitePassword, isPending: resetInvitePasswordLoading } =
    useResetInvitePasswordMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(error.message, "error");
      },
    });
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      old_password: "",
      new_password: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    const payload = {
      email: values.email,
      default_password: values.old_password,
      new_password: values.new_password,
    };

    resetInvitePassword(payload);
    console.log("payload", payload);
  };
  return { onSubmit, form, resetInvitePasswordLoading };
};
