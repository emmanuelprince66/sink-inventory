"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/store/user-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bank } from "./bank/Bank";
import ChangePassword from "./change-password/ChangePassword";
import PinComp from "./pin/PinComp";
import Subscription from "./premuim/Subscription";
import VeiwStaff from "./staff/VeiwStaff";
import Tax from "./tax/Tax";

const Settings = () => {
  const { user } = useUserRole();
  const searchParams = useSearchParams();
  const router = useRouter();

  console.log("user", user);

  const SettingsOptionsTab =
    user?.role === "OWNER"
      ? [
          "Bank",
          "HR",
          "Tax",
          "Security & Privacy",
          "Subscription",
          "Notifications",
          "Currency & Localization",
        ]
      : ([
          // "Security & Privacy",
          "HR",
          "Notifications",
          "Currency & Localization",
        ] as const);

  // Map URL tab param to actual tab names
  const getTabFromUrl = (
    urlTab: string | null,
  ): (typeof SettingsOptionsTab)[number] => {
    const tabMapping: { [key: string]: (typeof SettingsOptionsTab)[number] } = {
      plans: "Subscription",
      subscription: "Subscription",
      bank: "Bank",
      hr: "HR",
      tax: "Tax",
      security: "Security & Privacy",
      notifications: "Notifications",
      currency: "Currency & Localization",
    };
    return (
      tabMapping[urlTab || ""] ||
      (user?.role === "OWNER" ? "Bank" : "HR")
    );
  };

  const urlTab = searchParams.get("tab");
  const initialTab = getTabFromUrl(urlTab);

  const [activeTab, setActiveTab] =
    useState<(typeof SettingsOptionsTab)[number]>(initialTab);

  console.log("activeTab", activeTab);

  // Update activeTab when URL changes
  useEffect(() => {
    const currentUrlTab = searchParams.get("tab");
    const mappedTab = getTabFromUrl(currentUrlTab);
    if (mappedTab !== activeTab) {
      setActiveTab(mappedTab);
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newTab = value as (typeof SettingsOptionsTab)[number];
    setActiveTab(newTab);

    // Map tab names back to URL params
    const urlMapping: { [key: string]: string } = {
      Subscription: "plans",
      Bank: "bank",
      HR: "hr",
      Tax: "tax",
      "Security & Privacy": "security",
      Notifications: "notifications",
      "Currency & Localization": "currency",
    };

    const urlParam =
      urlMapping[newTab] || newTab.toLowerCase().replace(/\s+/g, "");
    router.replace(`/settings?tab=${urlParam}`, { scroll: false });
  };

  return (
    <div className="w-full h-full flex flex-col justify-start gap-4 sm:gap-6 items-start">
      {/* Header */}
      <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
        Settings
      </p>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="w-full rounded-2xl border border-border-tint bg-white overflow-hidden">
          {/* Tabs Header — same plain-button underline pattern as Sales' Products Sold / Order History tabs */}
          <div className="flex items-center overflow-x-auto border-b border-border-tint px-4 sm:px-6">
            {SettingsOptionsTab.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "px-4 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap mr-2",
                  activeTab === tab
                    ? "border-primary-green-300 text-primary-green-300"
                    : "border-transparent text-grey-3 hover:text-grey-2",
                )}
              >
                <span className="hidden sm:inline">{tab}</span>
                <span className="sm:hidden">{getShortTabName(tab)}</span>
              </button>
            ))}
          </div>

          {/* Tab Content — full width, no extra centering */}
          <div className="w-full p-4 sm:p-6">
            {user && user?.role === "OWNER" && (
              <TabsContent value="Bank" className="mt-0">
                <div className="w-full overflow-hidden">
                  <Bank />
                </div>
              </TabsContent>
            )}

            {user &&
              (user?.role === "OWNER" || user?.role === "ADMIN-ATTENDANT") && (
                <TabsContent value="HR" className="mt-0">
                  <div className="w-full overflow-hidden">
                    <VeiwStaff />
                  </div>
                </TabsContent>
              )}

            {user && user?.role === "OWNER" && (
              <TabsContent value="Tax" className="mt-0">
                <div className="w-full overflow-hidden">
                  <Tax />
                </div>
              </TabsContent>
            )}

            {user && user?.role === "OWNER" && (
              <TabsContent value="Security & Privacy" className="mt-0">
                <div className="w-full overflow-hidden">
                  <SecurityPrivacyTabs />
                </div>
              </TabsContent>
            )}

            {user && user?.role === "OWNER" && (
              <TabsContent value="Subscription" className="mt-0">
                <div className="w-full overflow-hidden">
                  <Subscription />
                </div>
              </TabsContent>
            )}

            <TabsContent value="Notifications" className="mt-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-grey-1 mb-3 sm:mb-4">
                Notification Settings
              </h2>
              <p className="text-sm sm:text-base text-grey-3">
                Customize your notification preferences.
              </p>
              {/* Add notification settings components here */}
            </TabsContent>

            <TabsContent value="Currency & Localization" className="mt-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-grey-1 mb-3 sm:mb-4">
                Currency & Localization
              </h2>
              <p className="text-sm sm:text-base text-grey-3">
                Set your preferred currency and language settings.
              </p>
              {/* Add currency and localization components here */}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

// Helper function to get shortened tab names for mobile
const getShortTabName = (tabName: string): string => {
  const shortNames: { [key: string]: string } = {
    Bank: "Bank",
    HR: "HR",
    Tax: "Tax",
    "Security & Privacy": "Security",
    Subscription: "Plans",
    Notifications: "Alerts",
    "Currency & Localization": "Currency",
  };
  return shortNames[tabName] || tabName;
};

const SECURITY_TABS = [
  { value: "Password", label: "Password", shortLabel: "Password" },
  { value: "Transaction Pin", label: "Transaction Pin", shortLabel: "Pin" },
] as const;

const SecurityPrivacyTabs = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>("Password");

  return (
    <div className="w-full">
      <div className="flex items-center border-b border-border-tint mb-4">
        {SECURITY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveSubTab(tab.value)}
            className={cn(
              "px-4 py-2.5 text-sm font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap mr-2",
              activeSubTab === tab.value
                ? "border-primary-green-300 text-primary-green-300"
                : "border-transparent text-grey-3 hover:text-grey-2",
            )}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsContent value="Password" className="mt-0">
          <div className="w-full overflow-hidden">
            <ChangePassword />
          </div>
        </TabsContent>

        <TabsContent value="Transaction Pin" className="mt-0">
          <div className="w-full overflow-hidden">
            <PinComp />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
