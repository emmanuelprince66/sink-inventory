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
import { deleteCookie } from "cookies-next";
import { ChevronDown, LogOut, Package, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AppSidebar() {
  const { mutate: logout, isPending } = useLogoutMutation();
  const pathname = usePathname();
  const { role } = useUserRole(); // Only need role now
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

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
    <Sidebar className="z-10 bg-white border-gray-200">
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
                        className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-gray-50 rounded transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Store className="mr-3 h-4 w-4" />
                          <span className="text-xs font-medium">Store</span>
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
                              "transition-colors duration-200 my-1 py-1 rounded mx-2",
                              isActive
                                ? "bg-primary-green-300 text-white"
                                : "hover:bg-gray-100 text-gray-700",
                            )}
                          >
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url}
                                className="flex items-center font-medium pl-8 text-xs"
                              >
                                {item.icon && (
                                  <item.icon className="mr-3 h-4 w-4" />
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
                        className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-gray-50 rounded transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <Package className="mr-3 h-4 w-4" />
                          <span className="text-xs font-medium">
                            Stock Management
                          </span>
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
                              "transition-colors duration-200 my-1 py-1 rounded mx-2",
                              isActive
                                ? "bg-primary-green-300 text-white"
                                : "hover:bg-gray-100 text-gray-700",
                            )}
                          >
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url}
                                className="flex items-center font-medium pl-8 text-xs"
                              >
                                {item.icon && (
                                  <item.icon className="mr-3 h-4 w-4" />
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
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupItems.map((item) => {
                      const isActive = pathname === item.url;

                      return (
                        <SidebarMenuItem
                          key={item.title}
                          className={cn(
                            "transition-colors duration-200 my-1 py-1 rounded mx-2",
                            isActive
                              ? "bg-primary-green-300 text-white"
                              : "hover:bg-gray-100 text-gray-700",
                          )}
                        >
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.url}
                              className="flex items-center font-medium text-xs px-4"
                            >
                              <item.icon className="mr-3 h-4 w-4" />
                              <span>{item.title}</span>
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

      <SidebarFooter className="px-4 py-3 border-t border-gray-200">
        <SidebarMenuButton
          onClick={handleLogOut}
          disabled={isPending}
          className={cn(
            "text-red-600 cursor-pointer py-2 px-3 flex items-center font-medium rounded text-xs",
            "hover:bg-red-50 transition-colors duration-200",
          )}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>{isPending ? "Logging out..." : "Logout"}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
