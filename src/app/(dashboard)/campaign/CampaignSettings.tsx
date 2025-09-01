"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/toast/useToast";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const CampaignSettings = () => {
  const [isPurchaseMessageEnabled, setIsPurchaseMessageEnabled] =
    useState(false);
  const { showToast } = useToast();

  const {
    handleSaveSettings,
    CreateCampaignSettingLoading,
    CampaignSettingsData,
    CampaignSettingsLoading,
  } = useCampaignHook({});

  console.log("campaign----4", CampaignSettingsData);

  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [sendingMethods, setSendingMethods] = useState({
    sms: true,
    whatsapp: false,
    email: false,
  });

  const [isActiveCustomersEnabled, setIsActiveCustomersEnabled] =
    useState(false);
  const [activeCustomersMessage, setActiveCustomersMessage] = useState("");
  const [activeCustomersSendingMethods, setActiveCustomersSendingMethods] =
    useState({
      sms: true,
      whatsapp: false,
      email: false, // Default to email for active customers
    });

  const handleSendingMethodChange = (method: "sms" | "whatsapp" | "email") => {
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
    method: "sms" | "whatsapp" | "email"
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

  const getTotalCost = () => {
    let totalCost = 0;
    const methods = [];

    if (sendingMethods.sms) {
      totalCost += 50;
      methods.push("SMS");
    }
    if (sendingMethods.whatsapp) {
      totalCost += 30;
      methods.push("WhatsApp");
    }
    if (sendingMethods.email) {
      totalCost += 10;
      methods.push("Email");
    }

    return {
      methods: methods.join(" + "),
      cost: totalCost,
    };
  };

  const getActiveCustomersTotalCost = () => {
    let totalCost = 0;
    const methods = [];

    if (activeCustomersSendingMethods.sms) {
      totalCost += 50;
      methods.push("SMS");
    }
    if (activeCustomersSendingMethods.whatsapp) {
      totalCost += 30;
      methods.push("WhatsApp");
    }
    if (activeCustomersSendingMethods.email) {
      totalCost += 10;
      methods.push("Email");
    }

    return {
      methods: methods.join(" + "),
      cost: totalCost,
    };
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

  // const handleSave = () => {
  //   const payload
  // }

  const handleSave = () => {
    // Validation checks
    const errors = [];

    if (isPurchaseMessageEnabled && !purchaseMessage.trim()) {
      errors.push("Please enter a purchase message");
    }

    if (isActiveCustomersEnabled && !activeCustomersMessage.trim()) {
      errors.push("Please enter an active customers message");
    }

    if (errors.length > 0) {
      // Show errors to the user (you can replace this with your preferred error display method)
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

      // Assuming single channel selection based on your UI (modify if multiple allowed)
      payload.purchase_message_channel = purchaseChannels[0] || "SMS";
    }

    if (isActiveCustomersEnabled && activeCustomersMessage.trim()) {
      payload.inactive_message_subscription = true;
      payload.inactive_message = activeCustomersMessage.trim();

      // Determine channel based on selected sending methods
      const inactiveChannels = [];
      if (activeCustomersSendingMethods.sms) inactiveChannels.push("SMS");
      if (activeCustomersSendingMethods.whatsapp)
        inactiveChannels.push("WHATSAPP");
      if (activeCustomersSendingMethods.email) inactiveChannels.push("EMAIL");

      // Assuming single channel selection based on your UI (modify if multiple allowed)
      payload.inactive_message_channel = inactiveChannels[0] || "SMS";
    }

    // Log the payload (replace with your actual API call)
    console.log("Final payload:", payload);

    // Call your API endpoint
    handleSaveSettings(payload);
  };

  if (CampaignSettingsLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full ">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white w-full rounded-lg shadow-sm h-[300px] overflow-hidden"
            >
              <div className="flex h-full">
                {/* Image placeholder - 30% width */}
                <Skeleton className="w-[30%] h-full bg-[#eef4ef]" />

                {/* Content placeholder - 70% width */}
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

                  <div className="pt-4 space-y-2 ">
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden self-start">
          <div className="flex">
            {/* Image Section - 30% */}
            <div className="w-[30%] bg-green-100 flex items-center justify-center p-4">
              <div className="w-full aspect-square flex items-center justify-center rounded-lg">
                <Image
                  src="/asset/c-1.jpg"
                  alt="Point of purchase"
                  width={320}
                  height={320}
                  className="rounded-lg object-cover shadow-sm w-full h-full"
                />
              </div>
            </div>

            {/* Content Section - 70% */}
            <div className="w-[70%] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    Point of purchase message
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send a thank you message after customers make a purchase
                  </p>
                </div>
                <Switch
                  className="mr-2"
                  checked={isPurchaseMessageEnabled}
                  onCheckedChange={setIsPurchaseMessageEnabled}
                />
              </div>

              {isPurchaseMessageEnabled && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your thank you message here..."
                    className="min-h-[100px] resize-none"
                    value={purchaseMessage}
                    onChange={(e) => setPurchaseMessage(e.target.value)}
                  />

                  <div className="space-y-3">
                    <p className="font-medium text-sm mt-2">Send via:</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex flex-col items-end  gap-[2px]">
                        <p className="text-green-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-green-100 ">
                          Active
                        </p>
                        <Button
                          variant={sendingMethods.sms ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSendingMethodChange("sms")}
                          className="flex items-center gap-2"
                        >
                          {sendingMethods.sms && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          SMS
                        </Button>
                      </div>

                      <div className="flex flex-col items-end  gap-[2px]">
                        <p className="text-yellow-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-yellow-100 ">
                          Coming soon
                        </p>
                        <Button
                          disabled={true}
                          variant={
                            sendingMethods.whatsapp ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleSendingMethodChange("whatsapp")}
                          className="flex items-center gap-2"
                        >
                          {sendingMethods.whatsapp && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          WhatsApp
                        </Button>
                      </div>

                      <div className="flex flex-col items-end  gap-[2px]">
                        <p className="text-yellow-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-yellow-100 ">
                          Coming soon
                        </p>
                        <Button
                          disabled={true}
                          variant={sendingMethods.email ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSendingMethodChange("email")}
                          className="flex items-center gap-2"
                        >
                          {sendingMethods.email && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sending via:
                      </p>
                      <p className="font-medium">{getTotalCost().methods}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        You will be charge 1 unit per SMS.
                      </p>
                    </div>
                    {/* <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <p className="text-xs">
                        You need more credits to send this campaign
                      </p>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto-send to Active Customers Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden self-start">
          <div className="flex">
            {/* Image Section - 30% */}
            <div className="w-[30%] bg-green-100 flex items-center justify-center p-4">
              <div className="w-full aspect-square flex items-center justify-center rounded-lg">
                <Image
                  src="/asset/c-2.jpg"
                  alt="Active customers"
                  width={320}
                  height={320}
                  className="rounded-lg object-cover shadow-sm w-full h-full"
                />
              </div>
            </div>

            {/* Content Section - 70% */}
            <div className="w-[70%] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    Auto-send to Inactive customers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send message to customers Inactive within the last three
                    weeks
                  </p>
                </div>
                <Switch
                  checked={isActiveCustomersEnabled}
                  onCheckedChange={setIsActiveCustomersEnabled}
                />
              </div>

              {isActiveCustomersEnabled && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your message for active customers..."
                    className="min-h-[100px] resize-none"
                    value={activeCustomersMessage}
                    onChange={(e) => setActiveCustomersMessage(e.target.value)}
                  />

                  <div className="space-y-3">
                    <p className="font-medium text-sm mt-2">Send via:</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex flex-col items-end  gap-[2px]">
                        <p className="text-green-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-green-100 ">
                          Active
                        </p>

                        <Button
                          variant={
                            activeCustomersSendingMethods.sms
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleActiveCustomersSendingMethodChange("sms")
                          }
                          className="flex items-center gap-2"
                        >
                          {activeCustomersSendingMethods.sms && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          SMS
                        </Button>
                      </div>
                      <div className="flex flex-col items-end  gap-[2px]">
                        <p className="text-yellow-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-yellow-100 ">
                          Coming Soon
                        </p>

                        <Button
                          variant={
                            activeCustomersSendingMethods.whatsapp
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          disabled={true}
                          onClick={() =>
                            handleActiveCustomersSendingMethodChange("whatsapp")
                          }
                          className="flex items-center gap-2"
                        >
                          {activeCustomersSendingMethods.whatsapp && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          WhatsApp
                        </Button>
                      </div>
                      <div className="flex flex-col items-end  gap-[2px]">
                        <p className="text-yellow-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-yellow-100 ">
                          Coming Soon
                        </p>
                        <Button
                          disabled={true}
                          variant={
                            activeCustomersSendingMethods.email
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleActiveCustomersSendingMethodChange("email")
                          }
                          className="flex items-center gap-2"
                        >
                          {activeCustomersSendingMethods.email && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sending via:
                      </p>
                      <p className="font-medium">
                        {getActiveCustomersTotalCost().methods}
                      </p>
                    </div>
                    <div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          You will be charge 1 unit per SMS.
                        </p>
                      </div>
                    </div>
                    {/* <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <p className="text-xs">
                        You need more credits to send this campaign
                      </p>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
