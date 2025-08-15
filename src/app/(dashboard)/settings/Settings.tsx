"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/lib/store/user-store";
import { useState } from "react";
import { Bank } from "./bank/Bank";
import ChangePassword from "./change-password/ChangePassword";
import PinComp from "./pin/PinComp";
import Subscription from "./premuim/Subscription";
import VeiwStaff from "./staff/VeiwStaff";

const Settings = () => {
  const { user } = useUserRole();

  const SettingsOptionsTab =
    user?.role === "OWNER"
      ? [
          "Bank",
          "Staff",
          "Security & Privacy",
          "Subscription",
          "Notifications",
          "Currency & Localization",
        ]
      : ([
          "Bank",
          "Security & Privacy",
          "Notifications",
          "Currency & Localization",
        ] as const);

  const [activeTab, setActiveTab] =
    useState<(typeof SettingsOptionsTab)[number]>("Bank");

  return (
    <div className="w-full h-full flex flex-col justify-start gap-3 sm:gap-5 items-start px-3 sm:px-4 lg:px-0">
      <div className="w-full">
        {/* Header */}
        <p className="text-xl mb-3 sm:text-2xl lg:text-3xl text-primary-black-100 font-medium">
          Settings
        </p>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full"
        >
          {/* Mobile Tabs - Horizontally Scrollable */}
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="w-full min-w-max inline-flex gap-1 sm:gap-2 h-auto p-1 bg-transparent">
              {SettingsOptionsTab.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={`flex-shrink-0 px-2 sm:px-4 py-2 rounded-md h-10 sm:h-12 text-xs sm:text-sm hover:text-black font-medium transition-all duration-200 whitespace-nowrap min-w-fit ${
                    activeTab === tab
                      ? "bg-primary-green-300 text-white shadow-md"
                      : "bg-primary-green-200 text-primary-black-100 hover:bg-primary-green-300 hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">{tab}</span>
                  <span className="sm:hidden">{getShortTabName(tab)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            <TabsContent value="Bank" className="mt-0">
              <div className="w-full overflow-hidden">
                <Bank />
              </div>
            </TabsContent>

            {user && user?.role === "OWNER" && (
              <TabsContent value="Staff" className="mt-0">
                <div className="w-full overflow-hidden">
                  <VeiwStaff />
                </div>
              </TabsContent>
            )}

            <TabsContent value="Security & Privacy" className="mt-0">
              <div className="w-full overflow-hidden">
                <SecurityPrivacyTabs />
              </div>
            </TabsContent>

            {user && user?.role === "OWNER" && (
              <TabsContent value="Subscription" className="mt-0">
                <div className="w-full overflow-hidden">
                  <Subscription />
                </div>
              </TabsContent>
            )}

            <TabsContent value="Notifications" className="mt-0">
              <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  Notification Settings
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Customize your notification preferences.
                </p>
                {/* Add notification settings components here */}
              </div>
            </TabsContent>

            <TabsContent value="Currency & Localization" className="mt-0">
              <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  Currency & Localization
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Set your preferred currency and language settings.
                </p>
                {/* Add currency and localization components here */}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Helper function to get shortened tab names for mobile
const getShortTabName = (tabName: string): string => {
  const shortNames: { [key: string]: string } = {
    Bank: "Bank",
    Staff: "Staff",
    "Security & Privacy": "Security",
    Subscription: "Plans",
    Notifications: "Alerts",
    "Currency & Localization": "Currency",
  };
  return shortNames[tabName] || tabName;
};

const SecurityPrivacyTabs = () => {
  const [activeSubTab, setActiveSubTab] = useState("Password");

  return (
    <div className="w-full">
      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="mt-3 sm:mt-4"
      >
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-fit grid grid-cols-2 h-auto sm:h-9 items-center justify-center rounded-lg bg-green-100  text-green-700">
            <TabsTrigger
              value="Password"
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-2 sm:py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeSubTab === "Password"
                  ? "bg-green-500 text-white shadow"
                  : "bg-transparent text-green-700 hover:bg-green-200"
              }`}
            >
              Password
            </TabsTrigger>
            <TabsTrigger
              value="Transaction Pin"
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-2 sm:py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeSubTab === "Transaction Pin"
                  ? "bg-green-500 text-white shadow"
                  : "bg-transparent text-green-700 hover:bg-green-200"
              }`}
            >
              <span className="hidden sm:inline">Transaction Pin</span>
              <span className="sm:hidden">Pin</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="w-full ">
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
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
