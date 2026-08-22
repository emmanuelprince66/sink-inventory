"use client";

import { Spinner } from "@/components/app/Spinner";
import EngagementTab from "./profile/EngagementTab";
import FinancialTab from "./profile/FinancialTab";
import LoyaltyTab from "./profile/LoyaltyTab";
import OverviewTab from "./profile/OverviewTab";
import ProfileHeader from "./profile/ProfileHeader";
import PurchaseTab from "./profile/PurchaseTab";
import ShoppingTab from "./profile/ShoppingTab";
import TransactionsTab from "./profile/TransactionsTab";
import type { ProfileTab } from "./profile/primitives";
import {
  useCustomerProfile,
  type CustomerProfileData,
} from "./profile/useCustomerProfile";

/**
 * Every tab takes the resolved profile; Transactions also needs the raw id,
 * because it runs its own paged query rather than reading the detail payload.
 */
type TabViewProps = { profile: CustomerProfileData; id: string };

const TAB_VIEWS: Record<ProfileTab, (props: TabViewProps) => React.ReactElement> = {
  Overview: OverviewTab,
  Transactions: ({ id }) => <TransactionsTab id={id} />,
  Purchase: PurchaseTab,
  Loyalty: LoyaltyTab,
  Engagement: EngagementTab,
  Shopping: ShoppingTab,
  Financial: FinancialTab,
};

const CustomerProfile = ({ id }: { id: string }) => {
  const profile = useCustomerProfile(id);

  if (profile.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  const TabView = TAB_VIEWS[profile.tab];

  return (
    <div className="w-full min-w-0">
      <ProfileHeader profile={profile} />

      <div className="mt-4 space-y-4">
        <TabView profile={profile} id={id} />
      </div>
    </div>
  );
};

export default CustomerProfile;
