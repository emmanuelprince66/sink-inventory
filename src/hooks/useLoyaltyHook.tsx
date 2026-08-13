import { useCreateLoyaltyProgramMutation } from "@/api/loyalty/create-loyalty-program";
import { useCreateLoyaltyTierMutation } from "@/api/loyalty/create-loyalty-tier";
import { useDeleteLoyaltyProgramMutation } from "@/api/loyalty/delete-loyalty-program";
import { useUpdateLoyaltyProgramMutation } from "@/api/loyalty/update-loyalty-program";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@/lib/react-query";
import type { LoyaltyProgram, LoyaltyTier } from "@/types/loyalty";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Mirrors the LoyaltyProgram serialiser, narrowed to the fields the create /
// edit form actually collects. Conditions and milestones go up as
// condition_data / milestone_data, which the backend expands.
const loyaltyProgramSchema = z.object({
  name: z
    .string()
    .min(1, "Campaign name is required")
    .max(80, "Campaign name must not exceed 80 characters"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  condition_type: z.string().min(1, "Trigger type is required"),
  threshold: z.string().min(1, "Trigger value is required"),
  reward_type: z.string().min(1, "Reward type is required"),
  reward_value: z.string().optional(),
  reward_description: z.string().optional(),
  reward_style: z.string().optional(),
  visit_window_hours: z.string().optional(),
  completion_window_days: z.string().optional(),
  timeout_action: z.string().optional(),
  notify_welcome: z.boolean().optional(),
  notify_progress: z.boolean().optional(),
  notify_reward_ready: z.boolean().optional(),
  notify_expiry_reminder: z.boolean().optional(),
});

const loyaltyTierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  rank: z.string().min(1, "Rank is required"),
  qualifying_metric: z.string().min(1, "Qualifying metric is required"),
  threshold: z.string().min(1, "Threshold is required"),
});

export type LoyaltyProgramFormValues = z.infer<typeof loyaltyProgramSchema>;
export type LoyaltyTierFormValues = z.infer<typeof loyaltyTierSchema>;

export const CONDITION_TYPES = [
  { value: "VISIT", label: "Visits" },
  { value: "SPEND", label: "Amount spent" },
  { value: "QUANTITY", label: "Quantity purchased" },
  { value: "PRODUCT", label: "Specific product" },
  { value: "CATEGORY", label: "Product category" },
  { value: "STREAK", label: "Visit streak" },
  { value: "REFERRAL", label: "Referrals" },
  { value: "BIRTHDAY", label: "Birthday" },
];

export const REWARD_TYPES = [
  { value: "POINTS", label: "Points" },
  { value: "WALLET_CREDIT", label: "Wallet credit" },
  { value: "PERCENTAGE", label: "Percentage discount" },
  { value: "FREE_ITEM", label: "Free product" },
  { value: "FREE_SERVICE", label: "Free service" },
];

export const REWARD_STYLES = [
  { value: "CONTINUOUS", label: "Repeatable" },
  { value: "ONE_TIME", label: "One time only" },
];

export const TIMEOUT_ACTIONS = [
  { value: "RESTART", label: "Restart progress" },
  { value: "PAUSE", label: "Pause progress" },
  { value: "EXPIRE", label: "Expire enrollment" },
];

export const QUALIFYING_METRICS = [
  { value: "SPEND", label: "Total spend" },
  { value: "VISITS", label: "Total visits" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export const useLoyaltyHook = ({
  closeModal,
  editData,
}: {
  closeModal?: () => void;
  editData?: LoyaltyProgram | null;
} = {}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();

  const form = useForm<LoyaltyProgramFormValues>({
    resolver: zodResolver(loyaltyProgramSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: todayISO(),
      end_date: "",
      condition_type: "VISIT",
      threshold: "",
      reward_type: "PERCENTAGE",
      reward_value: "",
      reward_description: "",
      reward_style: "CONTINUOUS",
      visit_window_hours: "",
      completion_window_days: "",
      timeout_action: "RESTART",
      notify_welcome: true,
      notify_progress: true,
      notify_reward_ready: true,
      notify_expiry_reminder: false,
    },
  });

  const tierForm = useForm<LoyaltyTierFormValues>({
    resolver: zodResolver(loyaltyTierSchema),
    defaultValues: {
      name: "",
      rank: "1",
      qualifying_metric: "SPEND",
      threshold: "",
    },
  });

  // Hydrate the form when editing an existing programme.
  useEffect(() => {
    if (!editData) return;
    const firstCondition = editData.conditions?.[0];
    form.reset({
      name: editData.name ?? "",
      description: editData.description ?? "",
      start_date: editData.start_date?.slice(0, 10) ?? todayISO(),
      end_date: editData.end_date?.slice(0, 10) ?? "",
      condition_type: firstCondition?.type ?? "VISIT",
      threshold: firstCondition?.threshold ?? "",
      reward_type: editData.reward_type ?? "PERCENTAGE",
      reward_value: editData.reward_value ?? "",
      reward_description: editData.reward_description ?? "",
      reward_style: editData.reward_style ?? "CONTINUOUS",
      visit_window_hours: editData.visit_window_hours
        ? String(editData.visit_window_hours)
        : "",
      completion_window_days: editData.completion_window_days
        ? String(editData.completion_window_days)
        : "",
      timeout_action: editData.timeout_action ?? "RESTART",
      notify_welcome: editData.notify_welcome ?? true,
      notify_progress: editData.notify_progress ?? true,
      notify_reward_ready: editData.notify_reward_ready ?? true,
      notify_expiry_reminder: editData.notify_expiry_reminder ?? false,
    });
  }, [editData, form]);

  const invalidateLoyalty = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKey.loyalty.getLoyaltyPrograms],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKey.loyalty.getLoyaltyDashboard],
    });
  };

  const onMutationSettled = () => {
    invalidateLoyalty();
    closeModal?.();
  };

  const { mutate: createProgram, isPending: createProgramLoading } =
    useCreateLoyaltyProgramMutation({
      id: business_id ?? "",
      onSuccess: onMutationSettled,
    });

  const { mutate: updateProgram, isPending: updateProgramLoading } =
    useUpdateLoyaltyProgramMutation({
      programId: editData?.id ?? "",
      onSuccess: onMutationSettled,
    });

  const { mutate: deleteProgram, isPending: deleteProgramLoading } =
    useDeleteLoyaltyProgramMutation({
      programId: editData?.id ?? "",
      onSuccess: onMutationSettled,
    });

  const { mutate: createTier, isPending: createTierLoading } =
    useCreateLoyaltyTierMutation({
      id: business_id ?? "",
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKey.loyalty.getLoyaltyTiers],
        });
        tierForm.reset();
        closeModal?.();
      },
    });

  // Translate the flat form into the nested payload the API expects.
  const toPayload = (values: LoyaltyProgramFormValues): LoyaltyProgram => ({
    name: values.name,
    description: values.description || null,
    start_date: values.start_date,
    end_date: values.end_date || null,
    reward_type: values.reward_type as LoyaltyProgram["reward_type"],
    reward_value: values.reward_value || null,
    reward_description: values.reward_description || null,
    reward_style: values.reward_style as LoyaltyProgram["reward_style"],
    visit_window_hours: values.visit_window_hours
      ? Number(values.visit_window_hours)
      : undefined,
    completion_window_days: values.completion_window_days
      ? Number(values.completion_window_days)
      : null,
    timeout_action: values.timeout_action as LoyaltyProgram["timeout_action"],
    notify_welcome: values.notify_welcome,
    notify_progress: values.notify_progress,
    notify_reward_ready: values.notify_reward_ready,
    notify_expiry_reminder: values.notify_expiry_reminder,
    condition_data: [
      { type: values.condition_type, threshold: values.threshold },
    ],
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = toPayload(values);
    if (editData?.id) updateProgram(payload);
    else createProgram(payload);
  });

  const onTierSubmit = tierForm.handleSubmit((values) => {
    const payload: LoyaltyTier = {
      name: values.name,
      rank: Number(values.rank),
      qualifying_metric:
        values.qualifying_metric as LoyaltyTier["qualifying_metric"],
      threshold: values.threshold,
    };
    createTier(payload);
  });

  return {
    form,
    onSubmit,
    tierForm,
    onTierSubmit,
    createTierLoading,
    deleteProgram,
    deleteProgramLoading,
    isEditing: Boolean(editData?.id),
    submitLoading: createProgramLoading || updateProgramLoading,
  };
};
