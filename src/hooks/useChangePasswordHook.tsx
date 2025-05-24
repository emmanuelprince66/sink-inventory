import { useChangePasswordMutation } from "@/api/auth/change-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(1, "New password    is required"),
});

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

export const useChangePasswordHook = () => {
  const { showToast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
    },
    mode: "onChange",
  });

  const { mutate: changePassword, isPending: changePasswordLoading } =
    useChangePasswordMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(error.message, "error");
      },
    });

  const onSubmit = (values: ChangePasswordFormValues) => {
    const payload = {
      current_password: values.current_password,
      new_password: values.new_password,
    };

    changePassword(payload);

    console.log("payload", payload);
  };

  return { onSubmit, form, changePasswordLoading };
};
