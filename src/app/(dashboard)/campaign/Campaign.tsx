"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { cn } from "@/lib/utils";
import { AlertTriangle, Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddGroup from "./AddGroup";
import AddSenderId from "./AddSenderId";
import AllCampaigns from "./AllCampaigns";
import AllGroups from "./AllGroups";
import CampaignSettings from "./CampaignSettings";
import UnitUsage from "./UnitUsage";

const Campaign = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  // Funding is a page of its own rather than a modal: it carries a balance,
  // an amount, a payment method and an order summary, which is more than a
  // dialog can show without scrolling.
  const goToFundCampaign = () => router.push("/campaign/fund");

  // Same reasoning for composing: the channel picker, the composer and the
  // live preview beside it do not fit a dialog.
  const goToNewCampaign = () => router.push("/campaign/new");

  const {
    CampaignData,
    CampaignLoading,
    BusinessDataLoading,
    CampaignGroupData,
    businessData,
    CampaignGroupLoading,
  } = useCampaignHook({});

  const [openSenderIdModal, setOpenSenderIdModal] = useState(false);
  const closeSenderIdModal = () => setOpenSenderIdModal(false);
  const openSenderIdModalFunc = () => setOpenSenderIdModal(true);

  const [openAddGroupModal, setOpenAddGroupModal] = useState(false);
  const closeAddGroupModal = () => setOpenAddGroupModal(false);
  const openAddGroupModalFunc = () => setOpenAddGroupModal(true);

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

  return (
    // min-w-0 on the column and on each panel below: a flex child defaults to
    // min-width:auto, so a table wider than the viewport refuses to shrink and
    // pushes the whole page sideways instead of scrolling inside its own
    // container. Clamped with min-width rather than overflow-hidden, which
    // would also clip the row action menus.
    <div className="w-full max-w-full min-w-0 h-full flex flex-col justify-start gap-3">
      {/* Header — bare, like Invoices and Orders. Page titles in this app sit
          directly on the page background; only the content below is carded. */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
              Campaign
            </p>
            <p className="text-sm text-grey-3 mt-1">
              Reach your customers at scale
            </p>
          </div>

          <Button
            className="w-full sm:w-auto gap-1.5"
            onClick={goToNewCampaign}
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Credit balance — one row rather than a tall card, so the tabs below
          stay above the fold on a laptop. */}
      {!businessData || BusinessDataLoading ? (
        <CustomCard className="w-full border-grey-5 rounded-2xl">
          <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-9 w-9 rounded-full bg-grey-5" />
            <Skeleton className="h-4 w-32 bg-grey-5" />
            <Skeleton className="h-4 w-24 bg-grey-5 ml-auto" />
          </div>
        </CustomCard>
      ) : (
        <div className="w-full rounded-2xl bg-white border border-grey-5 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Everything on the left is one group, so the button is the only
              other child and lands hard against the right edge — ml-auto on
              the button alone left it trailing the Used column. */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-6 rounded-full shrink-0">
                <Zap className="w-4 h-4 text-primary-green-300" />
              </div>
              {/* Label over badge, not beside it. */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-bold text-grey-2 whitespace-nowrap leading-none">
                  Message Credit
                </span>
                <span className="text-[9px] bg-secondary-6 rounded-full px-1.5 py-0.5 font-bold text-primary-green-300 leading-none">
                  Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-grey-3 leading-none">
                  Available
                </span>
                <span className="text-sm font-extrabold text-primary-green-300 whitespace-nowrap leading-none">
                  {businessData?.message_credit ?? 0} units
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-grey-3 leading-none">
                  Used
                </span>
                <span className="text-sm font-extrabold text-grey-1 whitespace-nowrap leading-none">
                  {businessData?.message_credit_used ?? 0} units
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={goToFundCampaign}
            className="w-full sm:w-auto gap-1.5 shrink-0"
          >
            <Zap className="w-4 h-4" />
            Get Credits
          </Button>
        </div>
      )}

      {/* Tabs and their content share one panel, so switching tabs reads as
          moving within a section rather than replacing the page. */}
      <div className="w-full max-w-full min-w-0 rounded-2xl bg-white border border-grey-5">
        <div className="overflow-x-auto border-b border-grey-5 px-6">
          <div className="flex items-center gap-7 min-w-max">
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

        <div className="p-4 sm:px-6 sm:py-5">
          {activeTab === "campaigns" && (
            <>
              <div className="w-full sm:max-w-[280px] mb-4">
                <SearchInput
                  placeholder="Search campaigns..."
                  value={searchInput}
                  onValueChange={() => {}}
                />
                {searchInput.length > 0 && searchInput.length < 3 && (
                  <div className="mt-1 text-xs text-grey-4">
                    Type at least 3 characters to search
                  </div>
                )}
              </div>

              {CampaignLoading || !CampaignData ? (
                <TableSkeleton
                  rows={5}
                  columns={[
                    { width: "w-28" },
                    { width: "w-32", hiddenOnMobile: true },
                    { width: "w-20", hiddenOnMobile: true },
                    { width: "w-20" },
                    { flex: true },
                    { width: "w-8" },
                  ]}
                />
              ) : (
                <div className="w-full max-w-full min-w-0 overflow-x-auto">
                  <AllCampaigns
                    campaignsData={CampaignData}
                    campaignsLoading={CampaignLoading}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "groups" && (
            <>
              {/* Creating a group belongs to the Groups tab, not the page —
                  on every other tab the button had nothing to do with what
                  was on screen. */}
              <div className="w-full flex justify-end mb-4">
                <Button
                  onClick={openAddGroupModalFunc}
                  className="w-full sm:w-auto gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </div>

              {CampaignGroupLoading || !CampaignGroupData ? (
                <TableSkeleton
                  rows={5}
                  columns={[
                    { flex: true },
                    { width: "w-20" },
                    { width: "w-8" },
                  ]}
                />
              ) : (
                <div className="w-full max-w-full min-w-0 overflow-x-auto">
                  <AllGroups
                    groupData={CampaignGroupData}
                    groupLoading={CampaignGroupLoading}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "usage" && <UnitUsage />}

          {activeTab === "settings" && <CampaignSettings />}
        </div>
      </div>

      {/* Modals */}
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
