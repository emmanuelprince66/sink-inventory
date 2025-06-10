"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const CampaignSettings = () => {
  const [isPurchaseMessageEnabled, setIsPurchaseMessageEnabled] =
    useState(false);
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
      sms: false,
      whatsapp: false,
      email: true, // Default to email for active customers
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

  const handleSaveSettings = () => {
    console.log({
      purchaseMessage: {
        enabled: isPurchaseMessageEnabled,
        message: purchaseMessage,
        sendingMethods,
        totalCost: getTotalCost().cost,
      },
      activeCustomers: {
        enabled: isActiveCustomersEnabled,
        message: activeCustomersMessage,
        sendingMethods: activeCustomersSendingMethods,
        totalCost: getActiveCustomersTotalCost().cost,
      },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Campaign Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Point of Purchase Message Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
          <div className="flex h-full">
            {/* Image Section - 30% */}
            <div className="w-[30%] bg-green-100 flex items-center justify-center p-4">
              <div className="w-full h-full flex items-center justify-center  rounded-lg">
                <Image
                  src="/asset/c-2.jpg"
                  alt="Point of purchase"
                  width={320}
                  height={320}
                  className="rounded-lg object-cover shadow-sm"
                />
              </div>
            </div>

            {/* Content Section - 70% */}
            <div className="w-[70%] p-6 flex flex-col h-full">
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

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
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
                        <Button
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
                        <Button
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

                    {/* Cost Estimate Section */}
                    <div className="pt-4 border-t space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Sending via:
                        </p>
                        <p className="font-medium">{getTotalCost().methods}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Estimated cost:
                        </p>
                        <p className="font-medium">~1000 credits</p>
                        <p className="text-sm">
                          {getTotalCost().cost} NGN per 100 recipients
                        </p>
                      </div>

                      <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <p className="text-xs">
                          You need more credits to send this campaign
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-send to Active Customers Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
          <div className="flex h-full">
            {/* Image Section - 30% */}
            <div className="w-[30%] bg-green-100 flex items-center justify-center p-4">
              <div className="w-full h-full flex items-center justify-center  rounded-lg">
                <Image
                  src="/asset/c-1.jpg"
                  alt="Active customers"
                  width={320}
                  height={320}
                  className="rounded-lg object-cover shadow-sm"
                />
              </div>
            </div>

            {/* Content Section - 70% */}
            <div className="w-[70%] p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    Auto-send to Active customers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send message to customers active within the last three weeks
                  </p>
                </div>
                <Switch
                  checked={isActiveCustomersEnabled}
                  onCheckedChange={setIsActiveCustomersEnabled}
                />
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
                {isActiveCustomersEnabled && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter your message for active customers..."
                      className="min-h-[100px] max-h-[100px] resize-none"
                      value={activeCustomersMessage}
                      onChange={(e) =>
                        setActiveCustomersMessage(e.target.value)
                      }
                    />

                    <div className="space-y-3">
                      <p className="font-medium text-sm mt-2">Send via:</p>
                      <div className="flex flex-wrap gap-2">
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
                        <Button
                          variant={
                            activeCustomersSendingMethods.whatsapp
                              ? "default"
                              : "outline"
                          }
                          size="sm"
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
                        <Button
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

                      {/* Cost Estimate Section */}
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
                          <p className="text-sm text-muted-foreground">
                            Estimated cost:
                          </p>
                          <p className="font-medium">~1000 credits</p>
                          <p className="text-sm">
                            {getActiveCustomersTotalCost().cost} NGN per 100
                            recipients
                          </p>
                        </div>

                        <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <p className="text-xs">
                            You need more credits to send this campaign
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSaveSettings}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default CampaignSettings;
