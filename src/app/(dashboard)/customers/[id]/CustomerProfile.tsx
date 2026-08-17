"use client";

import { Spinner } from "@/components/app/Spinner";
import EngagementTab from "./profile/EngagementTab";
import FinancialTab from "./profile/FinancialTab";
import LoyaltyTab from "./profile/LoyaltyTab";
import OverviewTab from "./profile/OverviewTab";
import ProfileHeader from "./profile/ProfileHeader";
import PurchaseTab from "./profile/PurchaseTab";
import ShoppingTab from "./profile/ShoppingTab";
import type { ProfileTab } from "./profile/primitives";
import {
  useCustomerProfile,
  type CustomerProfileData,
} from "./profile/useCustomerProfile";

const TAB_VIEWS: Record<
  ProfileTab,
  (props: { profile: CustomerProfileData }) => React.ReactElement
> = {
  Overview: OverviewTab,
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
        <TabView profile={profile} />
      </div>
    </div>
  );
};

export default CustomerProfile;
