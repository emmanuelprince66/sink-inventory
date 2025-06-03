"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/lib/store/user-store";
import { useState } from "react";
import { Bank } from "./bank/Bank";
import ChangePassword from "./change-password/ChangePassword";
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
          "Premium",
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
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="w-full   flex-wrap h-auto">
            {SettingsOptionsTab.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`px-4 py-2 rounded-md h-14  text-xs hover:text-black font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary-green-300 text-white"
                    : "bg-primary-green-200 text-primary-black-100"
                }`}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Bank">
            <Bank />
          </TabsContent>

          {user && user?.role === "OWNER" && (
            <TabsContent value="Staff">
              <VeiwStaff />
            </TabsContent>
          )}

          <TabsContent value="Security & Privacy">
            <ChangePassword />
          </TabsContent>

          {user && user?.role === "OWNER" && (
            <TabsContent value="Premium">
              <Subscription />
            </TabsContent>
          )}

          <TabsContent value="Notifications">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">
                Notification Settings
              </h2>
              <p>Customize your notification preferences.</p>
              {/* Add notification settings components here */}
            </div>
          </TabsContent>

          <TabsContent value="Currency & Localization">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">
                Currency & Localization
              </h2>
              <p>Set your preferred currency and language settings.</p>
              {/* Add currency and localization components here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
