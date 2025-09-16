"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { useEffect, useState } from "react";
import CampaignAutomationCard from "./CampaignAutomationCard";

interface SendingMethods {
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
}

const CampaignSettings = () => {
  const { showToast } = useToast();

  const {
    handleSaveSettings,
    CreateCampaignSettingLoading,
    CampaignSettingsData,
    CampaignSettingsLoading,
  } = useCampaignHook({});

  console.log("campaign----4", CampaignSettingsData);

  // Purchase Message States
  const [isPurchaseMessageEnabled, setIsPurchaseMessageEnabled] =
    useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
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

  const handleSendingMethodChange = (method: keyof SendingMethods) => {
    setSendingMethods((prev) => {
      const newMethods = {
        ...prev,
        [method]: !prev[method],
      };

      // Ensure at least one method is always selected
      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev; // Don't change if it would result in no selection
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

      // Ensure at least one method is always selected
      const hasAnySelected = Object.values(newMethods).some(Boolean);
      if (!hasAnySelected) {
        return prev; // Don't change if it would result in no selection
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

  useEffect(() => {
    if (CampaignSettingsData && !CampaignSettingsLoading) {
      const settings = CampaignSettingsData?.data;
      console.log("settings", settings);
      setIsPurchaseMessageEnabled(settings.message_subscription);
      setIsActiveCustomersEnabled(settings.inactive_message_subscription);
      setActiveCustomersMessage(settings.inactive_message);
      setPurchaseMessage(settings.purchase_message);
      setSendingMethods({
        sms: settings.purchase_message_channel === "SMS" || true,
        whatsapp: settings.purchase_message_channel === "WHATSAPP" || false,
        email: settings.purchase_message_channel === "EMAIL" || false,
      });
      setActiveCustomersSendingMethods({
        sms: settings.inactive_message_channel === "SMS" || true,
        whatsapp: settings.inactive_message_channel === "WHATSAPP" || false,
        email: settings.inactive_message_channel === "EMAIL" || false,
      });
    }
  }, [CampaignSettingsData, CampaignSettingsLoading]);

  const handleSave = () => {
    // Validation checks
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

    if (errors.length > 0) {
      showToast(errors.join("\n"), "error");
      return;
    }

    // Construct payload based on enabled toggles and non-empty messages
    const payload: any = {};

    if (isPurchaseMessageEnabled && purchaseMessage.trim()) {
      payload.message_subscription = true;
      payload.purchase_message = purchaseMessage.trim();

      // Determine channel based on selected sending methods
      const purchaseChannels = [];
      if (sendingMethods.sms) purchaseChannels.push("SMS");
      if (sendingMethods.whatsapp) purchaseChannels.push("WHATSAPP");
      if (sendingMethods.email) purchaseChannels.push("EMAIL");

      payload.purchase_message_channel = purchaseChannels[0] || "SMS";
    }

    if (isActiveCustomersEnabled && activeCustomersMessage.trim()) {
      payload.inactive_message_subscription = true;
      payload.inactive_message = activeCustomersMessage.trim();

      const inactiveChannels = [];
      if (activeCustomersSendingMethods.sms) inactiveChannels.push("SMS");
      if (activeCustomersSendingMethods.whatsapp)
        inactiveChannels.push("WHATSAPP");
      if (activeCustomersSendingMethods.email) inactiveChannels.push("EMAIL");

      payload.inactive_message_channel = inactiveChannels[0] || "SMS";
    }

    // Add new automation payloads (for now, just log them as they're dummy data)
    if (isFridayMessageEnabled && fridayMessage.trim()) {
      console.log("Friday Message:", {
        enabled: true,
        message: fridayMessage.trim(),
        channel: fridaySendingMethods.sms
          ? "SMS"
          : fridaySendingMethods.whatsapp
          ? "WHATSAPP"
          : "EMAIL",
      });
    }

    if (isMondayMessageEnabled && mondayMessage.trim()) {
      console.log("Monday Message:", {
        enabled: true,
        message: mondayMessage.trim(),
        channel: mondaySendingMethods.sms
          ? "SMS"
          : mondaySendingMethods.whatsapp
          ? "WHATSAPP"
          : "EMAIL",
      });
    }

    if (isNewMonthMessageEnabled && newMonthMessage.trim()) {
      console.log("New Month Message:", {
        enabled: true,
        message: newMonthMessage.trim(),
        channel: newMonthSendingMethods.sms
          ? "SMS"
          : newMonthSendingMethods.whatsapp
          ? "WHATSAPP"
          : "EMAIL",
      });
    }

    console.log("Final payload:", payload);
    handleSaveSettings(payload);
  };

  if (CampaignSettingsLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white w-full rounded-lg shadow-sm h-[300px] overflow-hidden"
            >
              <div className="flex h-full">
                <Skeleton className="w-[30%] h-full bg-[#eef4ef]" />
                <div className="w-[70%] p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 w-[70%]">
                      <Skeleton className="h-6 w-full bg-[#eef4ef]" />
                      <Skeleton className="h-4 w-3/4 bg-[#eef4ef]" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full bg-[#eef4ef]" />
                  </div>
                  <Skeleton className="h-32 w-full bg-[#eef4ef]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4 bg-[#eef4ef]" />
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-20 bg-[#eef4ef]" />
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-[#eef4ef]" />
                    <Skeleton className="h-4 w-full bg-[#eef4ef]" />
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
    <div className="container mx-auto py-8">
      <p className="text-gray-600 text-sm leading-relaxed tracking-normal font-normal mb-4">
        Unlock 80% Customer Retention with Our Marketing Automation Tools! Boost
        your business growth and retain more customers with our powerful
        marketing automation solutions. Setup the automation tools we built for
        you.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          disabled={CreateCampaignSettingLoading}
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700"
        >
          {CreateCampaignSettingLoading ? <Spinner /> : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default CampaignSettings;
