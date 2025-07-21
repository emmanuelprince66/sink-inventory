"use client";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
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
import { SidebarTrigger } from "../ui/sidebar";
import { CustomModal } from "./CustomModal";
import KycConfirm from "./KycConfirm";

export function TopBar() {
  const business_id = useBusinessStore((state) => state.business_id);
  const { user } = useUserRole();
  const [showConfirmKycModal, setShowConfirmKycModal] = useState(false);

  const { data: BusinessData, isLoading: BusinessDataLoading } =
    useFetchBusinessById(business_id);

  const business = BusinessData?.data?.[0] || {};

  // Get user initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const firstName = business?.owner?.firstname || "";
  const lastName = business?.owner?.lastname || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left Section - Welcome Message */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900 md:text-xl">
                    Welcome back,
                    {BusinessDataLoading ? (
                      <span className="ml-2 inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
                    ) : fullName ? (
                      <span className="ml-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      {business.verification_status === "verified"
                        ? "Verified"
                        : "Pending"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 hidden sm:block">
                  {business?.name
                    ? `Managing ${business.name}`
                    : "Dashboard Overview"}
                </p>
              </div>

              {/* Mobile Sidebar Trigger */}
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
            </div>
          </div>

          {/* Right Section - Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex h-9 w-9 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Search - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex h-9 w-9 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2 hover:bg-gray-100 data-[state=open]:bg-gray-100"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={business?.owner?.avatar || "/placeholder.svg"}
                      alt={fullName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-medium">
                      {BusinessDataLoading
                        ? "..."
                        : getInitials(firstName, lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                      {BusinessDataLoading ? "Loading..." : fullName || "User"}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {user?.role?.toLowerCase() || "Member"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
                sideOffset={8}
              >
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={business?.owner?.avatar || "/placeholder.svg"}
                        alt={fullName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium">
                        {getInitials(firstName, lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {business?.owner?.email || "user@example.com"}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-100"
                      >
                        {user?.role?.toLowerCase() || "member"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-md">
                    <UserCircle className="h-4 w-4 text-gray-500" />
                    <span>View Profile</span>
                  </DropdownMenuItem>

                  {user && user?.role === "OWNER" && (
                    <Link href="/business">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-md">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>Business Settings</span>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-md">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowConfirmKycModal(true)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-md"
                  >
                    <Shield className="h-4 w-4 text-gray-500" />
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
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {business.kyc_status}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1 bg-gray-100" />

                <div className="py-1">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-md">
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded-md">
                    <LogOut className="h-4 w-4 text-red-500" />
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
        isOpen={showConfirmKycModal}
        onClose={() => setShowConfirmKycModal(false)}
        title=""
      >
        <KycConfirm />
      </CustomModal>
    </>
  );
}
