"use client";
import { useLogoutMutation } from "@/api/auth/logout-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { links } from "@/constants/links";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { useRealtime } from "../providers/RealtimeProvider";
import { deleteCookie } from "cookies-next";
import { ChevronDown, LogOut, Package, Settings, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AppSidebar() {
  const { mutate: logout, isPending } = useLogoutMutation();
  const pathname = usePathname();
  const { role } = useUserRole(); // Only need role now
  const { unreadNotifications } = useRealtime();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);

  const handleLogOut = () => {
    deleteCookie("accessToken");
    deleteCookie("userRole");
    deleteCookie("refreshToken");
    localStorage.clear();
    logout();
  };

  // Simple role-based check
  const canSeeLink = (item: any) => {
    return item.roles.includes(role);
  };

  // Filter links based on role only
  const filteredLinks = links.filter((group) => {
    return group.items.some((item) => canSeeLink(item));
  });

  return (
    <Sidebar className="z-10 bg-white border-grey-5">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="py-6 mb-4">
            <div className="w-100 h-100">
              <Image
                src="/asset/sink2.png"
                alt="sink-logo"
                className="w-full h-full object-contain"
                priority
                width={150}
                height={150}
              />
            </div>
          </SidebarGroupLabel>

          {filteredLinks.map((group) => {
            // Special case for Store Management
            if (group.title === "Store Management") {
              const storeItems = group.items.filter((item) => canSeeLink(item));

              if (storeItems.length === 0) return null;

              return (
                <SidebarGroup key={group.title}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setIsStoreOpen(!isStoreOpen)}
                        className="flex items-center justify-between cursor-pointer h-auto px-4 py-2.5 hover:bg-secondary-6 rounded-xl transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Store className="mr-3 h-[17px] w-[17px]" />
                          <span className="text-sm font-bold">Store</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transform transition-transform duration-300 ease-in-out",
                            isStoreOpen ? "rotate-180" : "",
                          )}
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div
                      className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isStoreOpen ? "max-h-96" : "max-h-0",
                      )}
                    >
                      {storeItems.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                          <SidebarMenuItem
                            key={item.title}
                            className={cn(
                              "transition-colors duration-200 my-1 py-1.5 rounded-xl mx-2",
                              isActive
                                ? "bg-primary-green-300 text-white"
                                : "hover:bg-secondary-6 text-grey-2",
                            )}
                          >
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url}
                                className="flex items-center font-bold pl-8 text-sm"
                              >
                                {item.icon && (
                                  <item.icon className="mr-3 h-[17px] w-[17px]" />
                                )}
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  </SidebarMenu>
                </SidebarGroup>
              );
            }

            // Special case for Inventory Management
            if (group.title === "Inventory Management") {
              const inventoryItems = group.items.filter((item) =>
                canSeeLink(item),
              );

              if (inventoryItems.length === 0) return null;

              return (
                <SidebarGroup key={group.title}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                        className="flex items-center justify-between cursor-pointer h-auto px-4 py-2.5 hover:bg-secondary-6 rounded-xl transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Package className="mr-3 h-[17px] w-[17px]" />
                          <span className="text-sm font-bold">Stock</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transform transition-transform duration-300 ease-in-out",
                            isInventoryOpen ? "rotate-180" : "",
                          )}
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div
                      className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isInventoryOpen ? "max-h-96" : "max-h-0",
                      )}
                    >
                      {inventoryItems.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                          <SidebarMenuItem
                            key={item.title}
                            className={cn(
                              "transition-colors duration-200 my-1 py-1.5 rounded-xl mx-2",
                              isActive
                                ? "bg-primary-green-300 text-white"
                                : "hover:bg-secondary-6 text-grey-2",
                            )}
                          >
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url}
                                className="flex items-center font-bold pl-8 text-sm"
                              >
                                {item.icon && (
                                  <item.icon className="mr-3 h-[17px] w-[17px]" />
                                )}
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  </SidebarMenu>
                </SidebarGroup>
              );
            }

            // Special case for Operations
            if (group.title === "Operations") {
              const operationsItems = group.items.filter((item) =>
                canSeeLink(item),
              );

              if (operationsItems.length === 0) return null;

              return (
                <SidebarGroup key={group.title}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setIsOperationsOpen(!isOperationsOpen)}
                        className="flex items-center justify-between cursor-pointer h-auto px-4 py-2.5 hover:bg-secondary-6 rounded-xl transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Settings className="mr-3 h-[17px] w-[17px]" />
                          <span className="text-sm font-bold">
                            Operations
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transform transition-transform duration-300 ease-in-out",
                            isOperationsOpen ? "rotate-180" : "",
                          )}
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div
                      className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isOperationsOpen ? "max-h-96" : "max-h-0",
                      )}
                    >
                      {operationsItems.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                          <SidebarMenuItem
                            key={item.title}
                            className={cn(
                              "transition-colors duration-200 my-1 py-1.5 rounded-xl mx-2",
                              isActive
                                ? "bg-primary-green-300 text-white"
                                : "hover:bg-secondary-6 text-grey-2",
                            )}
                          >
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url}
                                className="flex items-center font-bold pl-8 text-sm"
                              >
                                {item.icon && (
                                  <item.icon className="mr-3 h-[17px] w-[17px]" />
                                )}
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  </SidebarMenu>
                </SidebarGroup>
              );
            }

            // Normal groups
            const groupItems = group.items.filter((item) => canSeeLink(item));

            if (groupItems.length === 0) return null;

            return (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-[10px] font-extrabold text-grey-4 uppercase tracking-widest px-4 py-2">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupItems.map((item) => {
                      const isActive = pathname === item.url;
                      /**
                       * Only Notifications carries a badge.
                       *
                       * Orders used to show pending_orders_count, but nothing
                       * in the app can clear it: a merchant with old unpaid
                       * orders would see a permanent red dot, and a badge that
                       * never reaches zero teaches people to ignore badges.
                       * The unread count is different — mark-read clears it,
                       * and the socket broadcasts the new total.
                       */
                      const badge =
                        item.url === "/notification" ? unreadNotifications : 0;

                      return (
                        <SidebarMenuItem
                          key={item.title}
                          className={cn(
                            "transition-colors duration-200 my-1 py-1.5 rounded-xl mx-2",
                            isActive
                              ? "bg-primary-green-300 text-white"
                              : "hover:bg-secondary-6 text-grey-2",
                          )}
                        >
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.url}
                              className="flex items-center font-bold text-sm px-4"
                            >
                              <item.icon className="mr-3 h-[17px] w-[17px]" />
                              <span className="flex-1">{item.title}</span>
                              {badge > 0 && (
                                <span
                                  className={cn(
                                    "ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold",
                                    isActive
                                      ? "bg-white text-primary-green-300"
                                      : "bg-red-500 text-white",
                                  )}
                                >
                                  {badge > 99 ? "99+" : badge}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-grey-5">
        <SidebarMenuButton
          onClick={handleLogOut}
          disabled={isPending}
          className={cn(
            "text-error-1 cursor-pointer py-2.5 px-3 flex items-center font-bold rounded-xl text-sm",
            "hover:bg-error-2/40 transition-colors duration-200",
          )}
        >
          <LogOut className="mr-3 h-[17px] w-[17px]" />
          <span>{isPending ? "Logging out..." : "Logout"}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
