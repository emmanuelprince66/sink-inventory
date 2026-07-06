"use client";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { NotificationSocketDisplay } from "@/app/(dashboard)/notification/NotificationSocketDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import {
  Bell,
  Building2,
  ChevronDown,
  HelpCircle,
  LogOut,
  Search,
  Settings,
  Shield,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
// import { useNotificationContext } from "../providers/NotificationProvider";
import { SidebarTrigger } from "../ui/sidebar";
import { CustomModal } from "./CustomModal";
import KycConfirm from "./kyc/KycConfirm";

export function TopBar() {
  const business_id = useBusinessStore((state) => state.business_id);
  const { user } = useUserRole();
  // const { notifications, isConnected } = useNotificationContext();

  // console.log("notifications", notifications);
  // console.log("isConnected", isConnected);
  console.log("user", user);

  const [showConfirmKycModal, setShowConfirmKycModal] = useState(false);
  const [showNotiSocketModal, setShowNotiSocketModal] = useState(false);
  const { data: BusinessData, isLoading: BusinessDataLoading } =
    useFetchBusinessById(business_id);
  const business = BusinessData?.data || {};

  // Extract user info from the user object
  const userName = user?.name || "";
  const userEmail = user?.email || "";
  // Split full name into first and last name for initials
  const nameParts = userName.split(" ");
  const firstName = nameParts[0] || "";

  // Get notification count
  const notificationCount = []?.length || 0;

  // Get user initials for avatar fallback
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return `${parts[0]?.charAt(0) || ""}${
      parts[parts.length - 1]?.charAt(0) || ""
    }`.toUpperCase();
  };

  const NotificationButton = ({ className = "" }) => (
    <Button
      onClick={
        notificationCount > 0
          ? () => setShowNotiSocketModal(true)
          : () => setShowNotiSocketModal(false)
      }
      variant="ghost"
      size="sm"
      className={`relative h-9 w-9 p-0 rounded-xl bg-secondary-6 text-primary-green-100 hover:bg-secondary-5 hover:text-primary-green-100 ${className}`}
    >
      <Bell className="h-4 w-4" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center shadow-sm border-2 border-white">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      )}
      <span className="sr-only">
        Notifications {notificationCount > 0 && `(${notificationCount})`}
      </span>
    </Button>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-grey-5 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left Section - Welcome Message */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-extrabold text-grey-1 md:text-xl">
                    Welcome back,
                    {BusinessDataLoading ? (
                      <span className="ml-2 inline-block h-4 w-24 animate-pulse rounded bg-grey-5" />
                    ) : userName ? (
                      <span className="ml-1 text-primary-green-300">
                        {firstName}
                      </span>
                    ) : null}
                  </p>
                  {business?.verification_status && (
                    <Badge
                      variant={
                        business.verification_status === "verified"
                          ? "default"
                          : "secondary"
                      }
                      className={`text-xs ${
                        business.verification_status === "verified"
                          ? "bg-success-2 text-success-1 hover:bg-success-2"
                          : "bg-warning-2 text-warning-1 hover:bg-warning-2"
                      }`}
                    >
                      {business.verification_status === "verified"
                        ? "Verified"
                        : "Pending"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-grey-3 hidden sm:block">
                  {business?.name
                    ? `Managing ${business.name}`
                    : "Dashboard Overview"}
                </p>
              </div>
              {/* Mobile Actions & Sidebar Trigger */}
              <div className="flex items-center gap-2 md:hidden">
                {/* Mobile Notifications */}
                <NotificationButton />
                {/* Mobile Sidebar Trigger */}
                <SidebarTrigger />
              </div>
            </div>
          </div>

          {/* Right Section - Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Desktop Notifications */}
            <NotificationButton className="hidden md:flex" />

            {/* Search - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex h-9 w-9 p-0 rounded-xl bg-grey-6 text-grey-3 hover:bg-secondary-6 hover:text-primary-green-100"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2 rounded-xl hover:bg-secondary-6 data-[state=open]:bg-secondary-6"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={business?.owner?.avatar || "/placeholder.svg"}
                      alt={userName}
                    />
                    <AvatarFallback className="bg-primary-green-300 text-white text-xs font-bold">
                      {BusinessDataLoading ? "..." : getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-bold text-grey-1 max-w-[120px] truncate">
                      {BusinessDataLoading ? "Loading..." : firstName || "User"}
                    </span>
                    <span className="text-xs font-medium text-grey-3 capitalize">
                      {user?.role?.toLowerCase() || "Member"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-grey-4 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-white border border-grey-5 shadow-lg rounded-xl p-1"
                sideOffset={8}
              >
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-grey-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={business?.owner?.avatar || "/placeholder.svg"}
                        alt={userName}
                      />
                      <AvatarFallback className="bg-primary-green-300 text-white font-bold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-grey-1 truncate">
                        {userName || "User"}
                      </p>
                      <p className="text-xs font-medium text-grey-3 truncate">
                        {userEmail ||
                          business?.owner?.email ||
                          "user@example.com"}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs bg-grey-6 text-grey-2 hover:bg-grey-6"
                      >
                        {user?.role?.toLowerCase() || "member"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Menu Items */}
                <div className="py-1">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-grey-2 hover:bg-secondary-6 cursor-pointer rounded-lg">
                    <UserCircle className="h-4 w-4 text-grey-3" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  {user && user?.role === "OWNER" && (
                    <Link href="/business">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-grey-2 hover:bg-secondary-6 cursor-pointer rounded-lg">
                        <Building2 className="h-4 w-4 text-grey-3" />
                        <span>Business Settings</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-grey-2 hover:bg-secondary-6 cursor-pointer rounded-lg">
                    <Settings className="h-4 w-4 text-grey-3" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>

                  {user && user?.role === "OWNER" && (
                    <DropdownMenuItem
                      onClick={() => setShowConfirmKycModal(true)}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-grey-2 hover:bg-secondary-6 cursor-pointer rounded-lg"
                    >
                      <Shield className="h-4 w-4 text-grey-3" />
                      <div className="flex items-center justify-between flex-1">
                        <span>KYC Verification</span>
                        {business?.kyc_status && (
                          <Badge
                            variant={
                              business.kyc_status === "verified"
                                ? "default"
                                : "secondary"
                            }
                            className={`text-xs ml-2 ${
                              business.kyc_status === "verified"
                                ? "bg-success-2 text-success-1"
                                : "bg-warning-2 text-warning-1"
                            }`}
                          >
                            {business.kyc_status}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="my-1 bg-grey-6" />
                <div className="py-1">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-grey-2 hover:bg-secondary-6 cursor-pointer rounded-lg">
                    <HelpCircle className="h-4 w-4 text-grey-3" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-error-1 hover:bg-error-2/40 cursor-pointer rounded-lg">
                    <LogOut className="h-4 w-4 text-error-1" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {/* KYC Verification Modal */}
      <CustomModal
        isOpen={showNotiSocketModal}
        onClose={() => setShowNotiSocketModal(false)}
        title=""
      >
        <NotificationSocketDisplay />
      </CustomModal>
      <CustomModal
        isOpen={showConfirmKycModal}
        onClose={() => setShowConfirmKycModal(false)}
        title=""
      >
        <KycConfirm page={false} />
      </CustomModal>
    </>
  );
}
