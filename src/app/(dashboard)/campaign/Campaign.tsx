"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import AddCampaign from "./AddCampaign";
import AddGroup from "./AddGroup";
import AddSenderId from "./AddSenderId";
import AllCampaigns from "./AllCampaigns";
import AllGroups from "./AllGroups";
import CampaignSettings from "./CampaignSettings";
import FundCampaign from "./FundCampaign";

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
    "campaigns" | "groups" | "settings"
  >("campaigns");

  const [openSenderModal, setOpenSenderModal] = useState(false);
  const senderIdPresent = Boolean(businessData?.sender_id); // More explicit conversion to boolean

  // Open modal when sender ID is not present
  useEffect(() => {
    if (!senderIdPresent) {
      setOpenSenderModal(true);
    }
  }, [senderIdPresent]);

  const closeSenderModal = () => setOpenSenderModal(false);
  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Campaign
          </p>

          <div className="flex items-center gap-2">
            <Button
              className=" border-primary-green-300"
              onClick={openCampaignModalFunc}
            >
              Send a Campaign
            </Button>
          </div>
        </div>
      </div>

      {!businessData || BusinessDataLoading ? (
        <div className="flex gap-4 w-[500px] mt-5">
          {Array.from({ length: 1 }).map((_, index) => (
            <CustomCard key={index} className="w-full border-gray-200">
              <div className="flex flex-col gap-6 items-start">
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <CustomCard className="w-[500px] h-[150px] mt-5 flex flex-col gap-4 justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg shadow-sm">
          {/* Top Section - Full width */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full">
                <PieChart className="w-5 h-5 text-primary-green-300" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Message Credit
              </span>
            </div>

            <button className="flex items-center gap-1 group cursor-pointer">
              <span className="text-sm bg-white rounded-full p-2 font-medium text-primary-green-300 group-hover:text-primary-green-700 transition-colors">
                Active
              </span>
            </button>
          </div>

          {/* Bottom Section - Full width */}
          <div className="w-full flex justify-even items-center">
            <div className="flex flex-col w-full gap-1 mt-4">
              <span className="text-sm  text-gray-900">Available</span>
              <span className="text-1xl font-bold text-gray-900">
                {businessData?.message_credit} Credits
              </span>
            </div>
            <div className="flex flex-col w-full gap-1 mt-4">
              <span className="text-sm  text-gray-900">Used</span>
              <span className="text-1xl font-bold text-gray-900">
                {businessData?.message_credit_used} Credits
              </span>
            </div>
            <div className="flex flex-col w-full gap-1 mt-4">
              <Button onClick={openFundCampaignModalFunc}>Get Credits</Button>
            </div>
          </div>
        </CustomCard>
      )}

      {/* search */}

      <div className="flex w-full justify-between items-center">
        <div className="w-full md:w-1/2 mb-4 mt-4">
          <SearchInput
            placeholder="Search campaigns ..."
            value={searchInput}
            onValueChange={() => {}}
          />
          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-1 text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        <Button onClick={openAddGroupModalFunc}>Create Group</Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "campaigns" | "groups" | "settings")
        }
        className="w-full mt-6"
      >
        <TabsList className="w-[400px]">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="settings">Marketing Automation</TabsTrigger>
        </TabsList>
        <div className="w-full h-[1px] bg-gray-200 mt-[-8px]" />

        <TabsContent value="campaigns">
          {CampaignLoading || !CampaignData ? (
            <div className="w-full">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-[#eef4ef]" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-16 w-full bg-[#eef4ef] mt-2"
                  />
                ))}
              </div>
            </div>
          ) : (
            <AllCampaigns
              campaignsData={CampaignData}
              campaignsLoading={CampaignLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="groups">
          <AllGroups
            groupData={CampaignGroupData}
            groupLoading={CampaignGroupLoading}
          />
        </TabsContent>
        <TabsContent value="settings">
          <CampaignSettings />
        </TabsContent>
      </Tabs>

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
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 text-yellow-500">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                No Sender ID Configured
              </h3>
              <p className="text-gray-600 mt-1">
                Your business needs a Sender ID to send messages. This is what
                appears on your customers' phones when they receive your
                messages.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-blue-800">
              <span className="font-semibold">
                Approval takes up to 5 business days.
              </span>{" "}
              We recommend setting this up immediately.
            </p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              onClick={openSenderIdModalFunc}
              className="px-4 py-2 bg-primary-green-300 text-white rounded-md hover:bg-primary-green-100 transition-colors"
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
