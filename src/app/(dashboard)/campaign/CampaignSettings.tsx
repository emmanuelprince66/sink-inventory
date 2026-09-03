"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import CampaignAutomationCard from "./CampaignAutomationCard";

interface SendingMethods {
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
}

interface AutomationSetting {
  type: string;
  message: string;
  channel: string;
  is_active: boolean;
}

const CampaignSettings = () => {
  const { showToast } = useToast();

  const {
    handleSaveSettings,
    CreateCampaignSettingLoading,
    CampaignSettingsData,
    CampaignSettingsLoading,
  } = useCampaignHook({});

  // Purchase Message States
  const [isPurchaseMessageEnabled, setIsPurchaseMessageEnabled] =
    useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState(
    "We appreciate your patronage! Looking forward to serving you better. Management St Michael"
  );
  const [sendingMethods, setSendingMethods] = useState<SendingMethods>({
    sms: true,
    whatsapp: false,
    email: false,
  });

  // Inactive Customers States
  const [isActiveCustomersEnabled, setIsActiveCustomersEnabled] =
    useState(false);
  const [activeCustomersMessage, setActiveCustomersMessage] = useState("");
  const [activeCustomersSendingMethods, setActiveCustomersSendingMethods] =
    useState<SendingMethods>({
      sms: true,
      whatsapp: false,
      email: false,
    });

  // Friday Message States
  const [isFridayMessageEnabled, setIsFridayMessageEnabled] = useState(false);
  const [fridayMessage, setFridayMessage] = useState(
    "Thank God it's Friday! 🎉 Wishing you a fantastic weekend ahead! Don't forget to check out our weekend specials."
  );
  const [fridaySendingMethods, setFridaySendingMethods] =
    useState<SendingMethods>({
      sms: true,
      whatsapp: false,
      email: false,
    });

  // Monday Message States
  const [isMondayMessageEnabled, setIsMondayMessageEnabled] = useState(false);
  const [mondayMessage, setMondayMessage] = useState(
    "It's Monday already! 💪 Start your week strong and make it count. We're here to support your goals!"
  );
  const [mondaySendingMethods, setMondaySendingMethods] =
    useState<SendingMethods>({
      sms: true,
      whatsapp: false,
      email: false,
    });

  // New Month Message States
  const [isNewMonthMessageEnabled, setIsNewMonthMessageEnabled] =
    useState(false);
  const [newMonthMessage, setNewMonthMessage] = useState(
    "Happy New Month! 🌟 May this month bring you joy, success, and amazing opportunities. Check out our monthly deals!"
  );
  const [newMonthSendingMethods, setNewMonthSendingMethods] =
    useState<SendingMethods>({
      sms: true,
      whatsapp: false,
      email: false,
    });

  // Returning Customer Message States
  const [isReturnedMessageEnabled, setIsReturnedMessageEnabled] =
    useState(false);
  const [newReturnedMessage, setNewReturnedMessage] = useState(
    "Welcome back! 🎉 We're thrilled to see you again. Explore our latest offerings and enjoy exclusive deals just for returning customers."
  );
  const [returnedSendingMethods, setReturnedSendingMethods] =
    useState<SendingMethods>({
      sms: true,
      whatsapp: false,
      email: false,
    });

  const handleSendingMethodChange = (method: keyof SendingMethods) => {
    setSendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev;
      }

      return newMethods;
    });
  };

  const handleActiveCustomersSendingMethodChange = (
    method: keyof SendingMethods
  ) => {
    setActiveCustomersSendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev;
      }

      return newMethods;
    });
  };

  const handleFridaySendingMethodChange = (method: keyof SendingMethods) => {
    setFridaySendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev;
      }

      return newMethods;
    });
  };

  const handleMondaySendingMethodChange = (method: keyof SendingMethods) => {
    setMondaySendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev;
      }

      return newMethods;
    });
  };

  const handleNewMonthSendingMethodChange = (method: keyof SendingMethods) => {
    setNewMonthSendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev;
      }

      return newMethods;
    });
  };

  const handleReturnedSendingMethodChange = (method: keyof SendingMethods) => {
    setReturnedSendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev;
      }

      return newMethods;
    });
  };

  // Helper function to convert SendingMethods to channel string
  const getChannelFromSendingMethods = (methods: SendingMethods): string => {
    if (methods.sms) return "SMS";
    if (methods.whatsapp) return "WHATSAPP";
    if (methods.email) return "EMAIL";
    return "SMS"; // default
  };

  // Helper function to convert channel string to SendingMethods
  const getSendingMethodsFromChannel = (channel: string): SendingMethods => {
    return {
      sms: channel === "SMS",
      whatsapp: channel === "WHATSAPP",
      email: channel === "EMAIL",
    };
  };

  useEffect(() => {
    if (CampaignSettingsData && !CampaignSettingsLoading) {
      const settings = CampaignSettingsData?.data || [];

      // Process each automation setting
      settings.forEach((setting: AutomationSetting) => {
        const sendingMethods = getSendingMethodsFromChannel(setting.channel);

        switch (setting.type) {
          case "POINT-OF-PURCHASE":
            setIsPurchaseMessageEnabled(setting.is_active);
            setPurchaseMessage(setting.message);
            setSendingMethods(sendingMethods);
            break;
          case "INACTIVE":
            setIsActiveCustomersEnabled(setting.is_active);
            setActiveCustomersMessage(setting.message);
            setActiveCustomersSendingMethods(sendingMethods);
            break;
          case "FRIDAY":
            setIsFridayMessageEnabled(setting.is_active);
            setFridayMessage(setting.message);
            setFridaySendingMethods(sendingMethods);
            break;
          case "MONDAY":
            setIsMondayMessageEnabled(setting.is_active);
            setMondayMessage(setting.message);
            setMondaySendingMethods(sendingMethods);
            break;
          case "NEW-MONTH":
            setIsNewMonthMessageEnabled(setting.is_active);
            setNewMonthMessage(setting.message);
            setNewMonthSendingMethods(sendingMethods);
            break;
          case "RETURNING-CUSTOMER":
            setIsReturnedMessageEnabled(setting.is_active);
            setNewReturnedMessage(setting.message);
            setReturnedSendingMethods(sendingMethods);
            break;
        }
      });
    }
  }, [CampaignSettingsData, CampaignSettingsLoading]);

  const handleSave = () => {
    // Validation checks - only for enabled campaigns
    const errors = [];

    if (isPurchaseMessageEnabled && !purchaseMessage.trim()) {
      errors.push("Please enter a purchase message");
    }

    if (isActiveCustomersEnabled && !activeCustomersMessage.trim()) {
      errors.push("Please enter an inactive customers message");
    }

    if (isFridayMessageEnabled && !fridayMessage.trim()) {
      errors.push("Please enter a Friday message");
    }

    if (isMondayMessageEnabled && !mondayMessage.trim()) {
      errors.push("Please enter a Monday message");
    }

    if (isNewMonthMessageEnabled && !newMonthMessage.trim()) {
      errors.push("Please enter a new month message");
    }

    if (isReturnedMessageEnabled && !newReturnedMessage.trim()) {
      errors.push("Please enter a returning customer message");
    }

    if (errors.length > 0) {
      showToast(errors.join("\n"), "error");
      return;
    }

    // Build the payload as an array of automation objects
    // Include ALL campaigns, not just enabled ones
    const payload: AutomationSetting[] = [];

    // Point of Purchase - always include
    payload.push({
      type: "POINT-OF-PURCHASE",
      message:
        purchaseMessage.trim() ||
        "We appreciate your patronage! Looking forward to serving you better. Management St Michael",
      channel: getChannelFromSendingMethods(sendingMethods),
      is_active: isPurchaseMessageEnabled,
    });

    // Inactive Customers - always include
    payload.push({
      type: "INACTIVE",
      message: activeCustomersMessage.trim() || "",
      channel: getChannelFromSendingMethods(activeCustomersSendingMethods),
      is_active: isActiveCustomersEnabled,
    });

    // Friday Message - always include
    payload.push({
      type: "FRIDAY",
      message:
        fridayMessage.trim() ||
        "Thank God it's Friday! 🎉 Wishing you a fantastic weekend ahead! Don't forget to check out our weekend specials.",
      channel: getChannelFromSendingMethods(fridaySendingMethods),
      is_active: isFridayMessageEnabled,
    });

    // Monday Message - always include
    payload.push({
      type: "MONDAY",
      message:
        mondayMessage.trim() ||
        "It's Monday already! 💪 Start your week strong and make it count. We're here to support your goals!",
      channel: getChannelFromSendingMethods(mondaySendingMethods),
      is_active: isMondayMessageEnabled,
    });

    // New Month Message - always include
    payload.push({
      type: "NEW-MONTH",
      message:
        newMonthMessage.trim() ||
        "Happy New Month! 🌟 May this month bring you joy, success, and amazing opportunities. Check out our monthly deals!",
      channel: getChannelFromSendingMethods(newMonthSendingMethods),
      is_active: isNewMonthMessageEnabled,
    });

    // Returning Customer Message - always include
    payload.push({
      type: "RETURNING-CUSTOMER",
      message:
        newReturnedMessage.trim() ||
        "Welcome back! 🎉 We're thrilled to see you again. Explore our latest offerings and enjoy exclusive deals just for returning customers.",
      channel: getChannelFromSendingMethods(returnedSendingMethods),
      is_active: isReturnedMessageEnabled,
    });

    console.log("Final payload:", payload);
    handleSaveSettings(payload);
  };

  if (CampaignSettingsLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white w-full rounded-lg shadow-sm h-[300px] overflow-hidden"
            >
              <div className="flex h-full">
                <Skeleton className="w-[30%] h-full bg-grey-5" />
                <div className="w-[70%] p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 w-[70%]">
                      <Skeleton className="h-6 w-full bg-grey-5" />
                      <Skeleton className="h-4 w-3/4 bg-grey-5" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full bg-grey-5" />
                  </div>
                  <Skeleton className="h-32 w-full bg-grey-5" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4 bg-grey-5" />
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-20 bg-grey-5" />
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-grey-5" />
                    <Skeleton className="h-4 w-full bg-grey-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* The pitch for the tab, as a banner rather than a paragraph of grey
          body copy — it is the first thing on an otherwise uniform grid. */}
      <div className="mb-5 flex items-start gap-3 rounded-xl bg-primary-green-100 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Zap className="h-4 w-4 text-white" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white">
            Unlock 80% Customer Retention
          </p>
          <p className="mt-0.5 text-xs text-white/75">
            Boost your business growth with powerful marketing automation. Set
            it up once — we handle the rest, reaching customers at exactly the
            right moment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Point of Purchase Message Card */}
        <CampaignAutomationCard
          title="Point of purchase message"
          description="Send a thank you message after customers make a purchase"
          imageSrc="/asset/c-1.jpg"
          imageAlt="Point of purchase"
          isEnabled={isPurchaseMessageEnabled}
          onToggle={setIsPurchaseMessageEnabled}
          message={purchaseMessage}
          onMessageChange={setPurchaseMessage}
          sendingMethods={sendingMethods}
          onSendingMethodChange={handleSendingMethodChange}
          placeholder="Enter your thank you message here..."
          onSave={handleSave}
          saving={CreateCampaignSettingLoading}
        />

        {/* Auto-send to Inactive Customers Card */}
        <CampaignAutomationCard
          title="Auto-send to Inactive customers"
          description="Send message to customers Inactive within the last three weeks"
          imageSrc="/asset/c-2.jpg"
          imageAlt="Inactive customers"
          isEnabled={isActiveCustomersEnabled}
          onToggle={setIsActiveCustomersEnabled}
          message={activeCustomersMessage}
          onMessageChange={setActiveCustomersMessage}
          sendingMethods={activeCustomersSendingMethods}
          onSendingMethodChange={handleActiveCustomersSendingMethodChange}
          placeholder="Enter your message for inactive customers..."
          onSave={handleSave}
          saving={CreateCampaignSettingLoading}
        />

        {/* Thank God It's Friday Message Card */}
        <CampaignAutomationCard
          title="Thank God It's Friday message"
          description="A friendly, end-of-week message to customers - can boost retention by 60%"
          imageSrc="/asset/c-4.jpg"
          imageAlt="Friday celebration"
          isEnabled={isFridayMessageEnabled}
          onToggle={setIsFridayMessageEnabled}
          message={fridayMessage}
          onMessageChange={setFridayMessage}
          sendingMethods={fridaySendingMethods}
          onSendingMethodChange={handleFridaySendingMethodChange}
          placeholder="Enter your Friday celebration message..."
          highlight="+ 60% retention boost"
          onSave={handleSave}
          saving={CreateCampaignSettingLoading}
        />

        {/* It's Monday Already Message Card */}
        <CampaignAutomationCard
          title="It's Monday already message"
          description="A motivational start-of-week message to inspire customers"
          imageSrc="/asset/c-6.jpg"
          imageAlt="Monday motivation"
          isEnabled={isMondayMessageEnabled}
          onToggle={setIsMondayMessageEnabled}
          message={mondayMessage}
          onMessageChange={setMondayMessage}
          sendingMethods={mondaySendingMethods}
          onSendingMethodChange={handleMondaySendingMethodChange}
          placeholder="Enter your Monday motivation message..."
          onSave={handleSave}
          saving={CreateCampaignSettingLoading}
        />

        {/* Happy New Month Message Card */}
        <CampaignAutomationCard
          title="Happy New Month message"
          description="A message wishing customers well at the start of a new month with promotions"
          imageSrc="/asset/c-5.jpg"
          imageAlt="New month celebration"
          isEnabled={isNewMonthMessageEnabled}
          onToggle={setIsNewMonthMessageEnabled}
          message={newMonthMessage}
          onMessageChange={setNewMonthMessage}
          sendingMethods={newMonthSendingMethods}
          onSendingMethodChange={handleNewMonthSendingMethodChange}
          placeholder="Enter your new month greeting message..."
          onSave={handleSave}
          saving={CreateCampaignSettingLoading}
        />

        {/* Returning Customers Message Card */}
        <CampaignAutomationCard
          title="Returning customers message"
          description="A message wishing returning customers well with promotions"
          imageSrc="/asset/c-5.jpg"
          imageAlt="Returning customers"
          isEnabled={isReturnedMessageEnabled}
          onToggle={setIsReturnedMessageEnabled}
          message={newReturnedMessage}
          onMessageChange={setNewReturnedMessage}
          sendingMethods={returnedSendingMethods}
          onSendingMethodChange={handleReturnedSendingMethodChange}
          placeholder="Enter your returning customers greeting message..."
          onSave={handleSave}
          saving={CreateCampaignSettingLoading}
        />
      </div>

      {/* Kept alongside the per-card buttons: switching an automation OFF
          collapses its card and takes its Save with it, so without this there
          would be no way to persist a card being turned off. */}
      <div className="mt-6 flex justify-end">
        <Button
          disabled={CreateCampaignSettingLoading}
          onClick={handleSave}
          className="h-11 w-full rounded-xl sm:w-auto sm:min-w-[180px]"
        >
          {CreateCampaignSettingLoading ? <Spinner /> : "Save all settings"}
        </Button>
      </div>
    </div>
  );
};

export default CampaignSettings;
