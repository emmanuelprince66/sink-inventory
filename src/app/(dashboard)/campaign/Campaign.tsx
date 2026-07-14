"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { cn } from "@/lib/utils";
import { AlertTriangle, PieChart, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddCampaign from "./AddCampaign";
import AddGroup from "./AddGroup";
import AddSenderId from "./AddSenderId";
import AllCampaigns from "./AllCampaigns";
import AllGroups from "./AllGroups";
import CampaignSettings from "./CampaignSettings";
import FundCampaign from "./FundCampaign";
import UnitUsage from "./UnitUsage";

const Campaign = () => {
  const [searchInput, setSearchInput] = useState("");

  const {
    CampaignData,
    CampaignLoading,
    BusinessDataLoading,
    CampaignGroupData,
    businessData,
    CampaignGroupLoading,
  } = useCampaignHook({});
  console.log("CampaignGroupData", CampaignGroupData);

  const [openAddCampaignModal, setOpenAddCampaignModal] = useState(false);
  const closeOpenCampaignModal = () => setOpenAddCampaignModal(false);
  const openCampaignModalFunc = () => setOpenAddCampaignModal(true);

  const [openSenderIdModal, setOpenSenderIdModal] = useState(false);
  const closeSenderIdModal = () => setOpenSenderIdModal(false);
  const openSenderIdModalFunc = () => setOpenSenderIdModal(true);

  const [openAddGroupModal, setOpenAddGroupModal] = useState(false);
  const closeAddGroupModal = () => setOpenAddGroupModal(false);
  const openAddGroupModalFunc = () => setOpenAddGroupModal(true);

  const [openFundCampaignModal, setOpenFundCampaignModal] = useState(false);
  const closeFundCampaignModal = () => setOpenFundCampaignModal(false);
  const openFundCampaignModalFunc = () => setOpenFundCampaignModal(true);

  const [activeTab, setActiveTab] = useState<
    "campaigns" | "groups" | "usage" | "settings"
  >("campaigns");

  const [openSenderModal, setOpenSenderModal] = useState(false);
  const senderIdPresent = Boolean(businessData?.sender_id);

  useEffect(() => {
    if (!senderIdPresent) {
      setOpenSenderModal(true);
    }
  }, [senderIdPresent]);

  const closeSenderModal = () => setOpenSenderModal(false);

  console.log("businessData", businessData);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-3 sm:gap-5 items-start">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-grey-1">
          Campaign
        </h1>

        <Button
          className="w-full sm:w-auto gap-1.5"
          onClick={openCampaignModalFunc}
        >
          <Plus className="w-4 h-4" />
          Send a Campaign
        </Button>
      </div>

      {/* Message Credit Card */}
      {!businessData || BusinessDataLoading ? (
        <div className="flex w-full mt-3 sm:mt-5">
          <CustomCard className="w-full max-w-full sm:max-w-[500px] border-grey-5">
            <div className="flex flex-col gap-4 sm:gap-6 items-start p-3 sm:p-4">
              <Skeleton className="h-3 sm:h-4 w-full bg-grey-5" />
              <Skeleton className="h-5 sm:h-6 w-3/4 bg-grey-5" />
              <Skeleton className="h-5 sm:h-6 w-1/2 bg-grey-5" />
            </div>
          </CustomCard>
        </div>
      ) : (
        <CustomCard className="w-full max-w-full sm:max-w-[500px] min-h-[180px] sm:min-h-[150px] mt-3 sm:mt-5 flex flex-col gap-3 sm:gap-4 justify-between p-3 sm:p-4 bg-secondary-6 border-primary-green-300/20 rounded-2xl">
          {/* Top Section */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white rounded-full">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-green-300" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-grey-2">
                Message Credit
              </span>
            </div>

            <button className="flex items-center gap-1 group cursor-pointer">
              <span className="text-xs sm:text-sm bg-white rounded-full px-2 py-1 sm:p-2 font-bold text-primary-green-300 group-hover:text-primary-green-600 transition-colors">
                Active
              </span>
            </button>
          </div>

          {/* Bottom Section - Responsive Layout */}
          <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between items-start sm:items-center mt-2 sm:mt-4">
            <div className="flex gap-6 sm:gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm text-grey-2">
                  Available
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-grey-1">
                  {businessData?.message_credit} Credits
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm text-grey-2">Used</span>
                <span className="text-lg sm:text-xl font-extrabold text-grey-1">
                  {businessData?.message_credit_used} Credits
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                onClick={openFundCampaignModalFunc}
                className="w-full sm:w-auto text-sm px-4 py-2"
              >
                Get Credits
              </Button>
            </div>
          </div>
        </CustomCard>
      )}

      {/* Search and Create Group Section */}
      <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-4">
        <div className="w-full sm:w-1/2">
          <SearchInput
            placeholder="Search campaigns..."
            value={searchInput}
            onValueChange={() => {}}
          />
          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-1 text-xs sm:text-sm text-grey-4">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        <Button
          onClick={openAddGroupModalFunc}
          className="w-full sm:w-auto gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="w-full mt-4 sm:mt-6">
        <div className="overflow-x-auto border-b border-grey-5">
          <div className="flex items-center gap-6 min-w-max">
            {(
              [
                { key: "campaigns", label: "Campaigns" },
                { key: "groups", label: "Groups" },
                { key: "usage", label: "Usage" },
                {
                  key: "settings",
                  label: "Marketing Automation",
                  shortLabel: "Automation",
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "py-4 text-xs sm:text-sm cursor-pointer font-bold border-b-2 whitespace-nowrap transition-colors",
                  activeTab === tab.key
                    ? "border-primary-green-300 text-primary-green-300"
                    : "border-transparent text-grey-3 hover:text-grey-2",
                )}
              >
                {"shortLabel" in tab ? (
                  <>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </>
                ) : (
                  tab.label
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "campaigns" &&
            (CampaignLoading || !CampaignData ? (
              <div className="w-full">
                <div className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-8 sm:h-10 w-full bg-grey-5" />
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-12 sm:h-16 w-full bg-grey-5"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <AllCampaigns
                  campaignsData={CampaignData}
                  campaignsLoading={CampaignLoading}
                />
              </div>
            ))}

          {activeTab === "groups" && (
            <div className="overflow-x-auto">
              <AllGroups
                groupData={CampaignGroupData}
                groupLoading={CampaignGroupLoading}
              />
            </div>
          )}

          {activeTab === "usage" && <UnitUsage />}

          {activeTab === "settings" && <CampaignSettings />}
        </div>
      </div>

      {/* Modals */}
      <CustomModal
        isOpen={openAddCampaignModal}
        onClose={closeOpenCampaignModal}
        trigger={false}
        title="Add New Campaign"
      >
        <AddCampaign closeModal={closeOpenCampaignModal} />
      </CustomModal>

      <CustomModal
        isOpen={openSenderIdModal}
        onClose={closeSenderIdModal}
        trigger={false}
        title="Add a Sender ID"
      >
        <AddSenderId closeModal={closeSenderIdModal} />
      </CustomModal>

      <CustomModal
        isOpen={openAddGroupModal}
        onClose={closeAddGroupModal}
        trigger={false}
        title="Create Group"
      >
        <AddGroup closeModal={closeAddGroupModal} />
      </CustomModal>

      <CustomModal
        isOpen={openFundCampaignModal}
        onClose={closeFundCampaignModal}
        trigger={false}
        title="Fund Campaign"
      >
        <FundCampaign closeModal={closeFundCampaignModal} />
      </CustomModal>

      <CustomModal
        isOpen={openSenderModal}
        onClose={closeSenderModal}
        trigger={false}
        title="Sender ID Required"
      >
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 text-warning-1">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-grey-1">
                No Sender ID Configured
              </h3>
              <p className="text-sm sm:text-base text-grey-3 mt-1">
                Your business needs a Sender ID to send messages. This is what
                appears on your customers' phones when they receive your
                messages.
              </p>
            </div>
          </div>

          <div className="bg-info-2 p-3 sm:p-4 rounded-lg border border-info-1/20">
            <p className="text-info-1 text-sm sm:text-base">
              <span className="font-bold">
                Approval takes up to 5 business days.
              </span>{" "}
              We recommend setting this up immediately.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={openSenderIdModalFunc}
              className="w-full sm:w-auto"
            >
              Set Up Sender ID
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default Campaign;
