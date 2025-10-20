import { useCreateSenderIdMutation } from "@/api/campaign/add-sender-id";
import { useFetchAllCampaignQuery } from "@/api/campaign/fetch-all-campaign";
import { useFetchCampaignGroupQuery } from "@/api/campaign/fetch-campaign-group";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";

import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDebounce } from "./useDebounce";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useCreateCampaignMutation } from "@/api/campaign/create-campaign";
import { useCreateCampaignSettingsMutation } from "@/api/campaign/create-campaign-settings";
import { useCreateGroupMutation } from "@/api/campaign/create-group";
import { useDeleteCampaignMutation } from "@/api/campaign/delete-campaign";
import { useDeleteGroupMutation } from "@/api/campaign/delete-group";
import { useEditCampaignMutation } from "@/api/campaign/edit-campaign";
import { useEditGroupMutation } from "@/api/campaign/edit-group";
import { useFundCampaignMutation } from "@/api/campaign/fund-campaign";
import { useFetchAllCampaignSettingsQuery } from "@/api/campaign/get-campaign-settings";
import { useEffect } from "react";
import { useToast } from "./toast/useToast";

const addCampaignSchema = z.object({
  name: z
    .string()
    .min(1, "Campaign name is required")
    .max(50, "Campaign name must not exceed 50 characters"),
  channel: z.string().min(1, "Channel is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters"),
  message: z.string().min(1, "Message is required"),
  customer_ids: z.array(z.string().uuid()).optional(),
  group_ids: z.array(z.string().uuid()).optional(),
});

const addSenderIdSchema = z.object({
  sender_id: z.string().min(1, "Sender ID is required"),
});
const fundCampaignSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
});
const addGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  customer_ids: z.array(z.string().uuid()).optional(),
});

export type AddCampaignFormValues = z.infer<typeof addCampaignSchema>;
export type AddSenderIdValues = z.infer<typeof addSenderIdSchema>;
export type AddGroupValues = z.infer<typeof addGroupSchema>;
export type FundCampaignValues = z.infer<typeof fundCampaignSchema>;

export const useCampaignHook = ({
  closeModal,
  editGroupData,
  resetSettings,
  searchInput,
  editData,
}: {
  closeModal?: () => void;
  searchInput?: string;
  resetSettings?: () => void;
  editData?: any;
  editGroupData?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    refetch: refetchBusiness,
  } = useFetchBusinessById(business_id);
  const businessData = BusinessData?.data || {};

  console.log("businessData in hook", BusinessData);

  const { showToast } = useToast();
  const isEditMode = !!editData;
  const isEditModeGroup = !!editGroupData;
  const router = useRouter();
  const {
    data: CampaignData,
    isLoading: CampaignLoading,
    refetch: refetchCampaign,
  } = useFetchAllCampaignQuery(business_id);

  const {
    data: CampaignGroupData,
    isLoading: CampaignGroupLoading,
    refetch: refetchGroup,
  } = useFetchCampaignGroupQuery(business_id);
  const {
    data: CampaignSettingsData,
    isLoading: CampaignSettingsLoading,
    refetch: refetchSettings,
  } = useFetchAllCampaignSettingsQuery(business_id);

  const debouncedSearchTerm = useDebounce(searchInput || "", 500);

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const {
    data: CustomersData,
    isLoading: CustomersLoading,
    error: CustomerError,
    refetch,
  } = useGetCustomerQuery({
    params: {
      id: business_id,
      search: searchTerm,
      status: "",
      limit: 1000,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleDeleteCampaign = (id: string) => {
    deleteCampaign(id);
  };
  const handleDeleteGroup = (id: string) => {
    deleteGroup(id);
  };

  const form = useForm<AddCampaignFormValues>({
    resolver: zodResolver(addCampaignSchema),
    defaultValues: {
      name: "",
      channel: editData ? editData.channel : "",
      title: "",
      message: "",
      customer_ids: [],
      group_ids: [],
    },
    mode: "onChange",
  });
  const fundCampaignForm = useForm<FundCampaignValues>({
    resolver: zodResolver(fundCampaignSchema),
    defaultValues: {
      amount: "",
    },
    mode: "onChange",
  });
  const senderIdForm = useForm<AddSenderIdValues>({
    resolver: zodResolver(addSenderIdSchema),
    defaultValues: {
      sender_id: "",
    },
    mode: "onChange",
  });
  const addGroupForm = useForm<AddGroupValues>({
    resolver: zodResolver(addGroupSchema),
    defaultValues: {
      name: "",
      customer_ids: [],
    },
    mode: "onChange",
  });

  const messageChannelOptions = [
    {
      value: "SMS",
      label: "SMS",
    },
    {
      value: "EMAIL",
      label: "EMAIL",
    },
    {
      value: "WHATSAPP",
      label: "WHATSAPP",
    },
  ];

  // EDIT FUNCTIONALITY
  useEffect(() => {
    if (editData) {
      const customerIds =
        editData.customers?.map((customer: any) => customer.id) || [];
      const groupIds = editData.groups?.map((group: any) => group.id) || [];

      form.reset({
        name: editData?.name || "",
        channel: editData.channel,
        title: editData?.title || "",
        message: editData?.message || "",
        customer_ids: customerIds,
        group_ids: groupIds,
      });
    }
  }, [editData, form]);

  useEffect(() => {
    if (editGroupData) {
      const customerIds =
        editGroupData.customers?.map((customer: any) => customer.id) || [];

      addGroupForm.reset({
        name: editGroupData?.name || "",
        customer_ids: customerIds || [],
      });
    }
  }, [editGroupData, addGroupForm]);

  const { mutate: deleteCampaign, isPending: deleteCampaignLoading } =
    useDeleteCampaignMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
        refetchCampaign();
        refetchBusiness();

        if (closeModal) closeModal();
      },
    });
  const { mutate: deleteGroup, isPending: deleteGroupLoading } =
    useDeleteGroupMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
        refetchGroup();

        if (closeModal) closeModal();
      },
    });

  const { mutate: CreateSenderId, isPending: CreateSenderIdLoading } =
    useCreateSenderIdMutation({
      businessId: business_id,
      onSuccess: (data) => {
        showToast(data.message, "success");
        if (closeModal) closeModal();
      },
    });
  const { mutate: fundCampaign, isPending: fundCampaignLoading } =
    useFundCampaignMutation({
      businessId: business_id,
      onSuccess: (data) => {
        try {
          if (!data?.data?.payment_url) {
            throw new Error("No payment URL received");
          }

          const paymentUrl = new URL(data.data.payment_url);

          refetchBusiness();
          if (closeModal) closeModal();

          showToast(data.message, "success");

          setTimeout(() => {
            if (paymentUrl.hostname === window.location.hostname) {
              router.push(data.data.payment_url);
            } else {
              window.location.href = data.data.payment_url;
            }
          }, 1000);
        } catch (error) {
          console.error("Redirect error:", error);
          showToast("Failed to process payment", "error");
        }
      },
      onError: (error) => {
        showToast(error.message, "error");
      },
    });

  const { mutate: CreateCampaign, isPending: CreateCampaignLoading } =
    useCreateCampaignMutation({
      businessId: business_id,
      onSuccess: (data) => {
        showToast(data.message, "success");
        refetchCampaign();
        refetchBusiness();
        if (closeModal) closeModal();
      },
      onError: (error) => {
        console.error("Campaign creation failed", error);
        showToast("Failed to create campaign", "error");
      },
    });
  const {
    mutate: CreateCampaignSetting,
    isPending: CreateCampaignSettingLoading,
  } = useCreateCampaignSettingsMutation({
    businessId: business_id,
    onSuccess: (data) => {
      showToast(data.message, "success");
      refetchSettings();
      refetchBusiness();
    },
    onError: (error) => {
      console.error("Campaign settings creation failed", error);
      showToast("Failed to save campaign settings", "error");
    },
  });

  const handleSaveSettings = (payload: any) => {
    CreateCampaignSetting(payload);
  };

  const { mutate: CreateGroup, isPending: CreateGroupLoading } =
    useCreateGroupMutation({
      businessId: business_id,
      onSuccess: (data) => {
        showToast(data.message, "success");
        refetchGroup();
        if (closeModal) closeModal();
      },
      onError: (error) => {
        console.error("Group creation failed", error);
        showToast("Failed to create group", "error");
      },
    });

  const { mutate: editCampaign, isPending: editCampaignLoading } =
    useEditCampaignMutation();
  const { mutate: editGroup, isPending: editGroupLoading } =
    useEditGroupMutation();

  const onSubmit = (values: AddCampaignFormValues) => {
    if (
      (!values.customer_ids || values.customer_ids.length === 0) &&
      (!values.group_ids || values.group_ids.length === 0)
    ) {
      showToast("Please select at least one customer or group", "error");
      return;
    }

    if (businessData?.message_credit <= 0) {
      showToast("You don't have enough credit to send a campaign", "error");
      return;
    }

    const payload = {
      name: values.name,
      channel: values.channel,
      title: values.title,
      message: values.message,
      customer_ids: values.customer_ids || [],
      group_ids: values.group_ids || [],
    };

    if (isEditMode) {
      editCampaign(
        {
          campaignId: editData.id,
          payload,
        },
        {
          onSuccess: () => {
            refetchCampaign();
            if (closeModal) {
              closeModal();
            }
          },
        }
      );
    } else {
      CreateCampaign({
        businessId: business_id,
        payload,
      });
    }
  };

  const onSubmitFundCampaign = (values: FundCampaignValues) => {
    fundCampaign({
      businessId: business_id,
      payload: {
        amount: Number(values.amount),
      },
    });
  };
  const onSubmitSenderIdForm = (values: AddSenderIdValues) => {
    CreateSenderId({
      businessId: business_id,
      payload: {
        sender_id: values.sender_id,
      },
    });
  };
  const onSubmitAddGroupForm = (values: AddGroupValues) => {
    if (!values.customer_ids || values.customer_ids.length === 0) {
      showToast("Please select at least one customer ", "error");
      return;
    }

    if (isEditModeGroup) {
      editGroup(
        {
          groupId: editGroupData.id,
          payload: {
            name: values.name,
            customer_ids: values.customer_ids || [],
          },
        },
        {
          onSuccess: () => {
            refetchGroup();
            if (closeModal) {
              closeModal();
            }
          },
        }
      );
    } else {
      const payload = {
        name: values.name,
        customer_ids: values.customer_ids || [],
      };

      CreateGroup({
        businessId: business_id,
        payload,
      });
    }
  };

  return {
    CampaignData,
    CampaignLoading,
    onSubmit,
    form,
    onSubmitSenderIdForm,
    CampaignGroupData,
    senderIdForm,
    messageChannelOptions,
    deleteCampaignLoading,
    CreateSenderIdLoading,
    CreateCampaignSettingLoading,
    onSubmitFundCampaign,
    CampaignSettingsData,
    BusinessDataLoading,
    fundCampaignForm,
    fundCampaignLoading,
    businessData,
    handleDeleteGroup,
    CampaignSettingsLoading,
    CreateCampaignSetting,
    deleteGroupLoading,
    handleSaveSettings,
    onSubmitAddGroupForm,
    addGroupForm,
    CreateCampaignLoading: isEditMode
      ? editCampaignLoading
      : CreateCampaignLoading,
    handleDeleteCampaign,
    CreateGroupLoading: isEditModeGroup ? editGroupLoading : CreateGroupLoading,
    CampaignGroupLoading,
    CustomersData: CustomersData?.data?.results,
    CustomersLoading,
    isEditMode,
  };
};
