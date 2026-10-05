"use client";

import { useState } from "react";
import { Spinner } from "@/components/app/Spinner";
import EditCustomer from "./EditCustomer";
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

/**
 * Every tab takes the resolved profile; Financial also needs the raw id,
 * because the transaction ledger it now carries runs its own paged query
 * rather than reading the detail payload.
 */
type TabViewProps = { profile: CustomerProfileData; id: string };

const TAB_VIEWS: Record<ProfileTab, (props: TabViewProps) => React.ReactElement> = {
  Overview: OverviewTab,
  Purchase: PurchaseTab,
  Loyalty: LoyaltyTab,
  Engagement: EngagementTab,
  Shopping: ShoppingTab,
  Financial: FinancialTab,
};

const CustomerProfile = ({ id }: { id: string }) => {
  const profile = useCustomerProfile(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
      <ProfileHeader
        profile={profile}
        onEdit={() => setIsEditOpen(true)}
      />

      <div className="mt-4 space-y-4">
        <TabView profile={profile} id={id} />
      </div>

      {profile.row && (
        <EditCustomer
          customer={{
            ...profile.row,
            name: profile.identity?.name ?? profile.row.name,
            phone: profile.identity?.phone ?? profile.row.phone,
            email: profile.identity?.email ?? profile.row.email,
            gender: profile.identity?.gender ?? profile.row.gender,
            date_of_birth:
              profile.identity?.date_of_birth ??
              profile.row.date_of_birth ??
              profile.row.birthday,
          }}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomerProfile;
