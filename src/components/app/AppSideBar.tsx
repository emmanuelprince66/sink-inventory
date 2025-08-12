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
import { ChevronDown, LogOut, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AppSidebar() {
  const { mutate: logout, isPending } = useLogoutMutation();
  const pathname = usePathname();
  const { hasPermission } = useUserRole();
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const handleLogOut = () => {
    deleteCookie("accessToken");
    deleteCookie("userRole");
    deleteCookie("refreshToken");
    localStorage.clear();
    logout();
  };

  // Filter links to only include groups that have at least one accessible item
  const filteredLinks = links.filter((group) => {
    return group.items.some((item) =>
      item.roles.some((role: any) => hasPermission(role))
    );
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

          {/* Store Dropdown Section */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsStoreOpen(!isStoreOpen)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Store className="mr-3 h-5 w-5" />
                    <span className="text-sm">Store</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isStoreOpen ? "rotate-180" : ""
                    )}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isStoreOpen && (
                <>
                  <SidebarMenuItem
                    className={cn(
                      "transition-colors duration-200 my-1 py-1 rounded mx-2",
                      pathname === "/store-info"
                        ? "bg-primary-green-300 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href="/store-info"
                        className="flex items-center font-medium pl-8"
                      >
                        <span className="text-sm">Store Information</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem
                    className={cn(
                      "transition-colors duration-200 my-1 py-1 rounded mx-2",
                      pathname === "/shipping"
                        ? "bg-primary-green-300 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href="/shipping"
                        className="flex items-center font-medium pl-8"
                      >
                        <Truck className="mr-3 h-5 w-5" />
                        <span className="text-sm">Shipping</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroup>

          {/* Existing Links */}
          {filteredLinks.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const hasAccess = item.roles.some((role: any) =>
                      hasPermission(role)
                    );
                    if (!hasAccess) return null;

                    const isActive =
                      pathname === item.url ||
                      (item.url !== "/" && pathname.startsWith(item.url));

                    return (
                      <SidebarMenuItem
                        key={item.title}
                        className={cn(
                          "transition-colors duration-200 my-1 py-1 rounded mx-2",
                          isActive
                            ? "bg-primary-green-300 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <SidebarMenuButton asChild>
                          <Link
                            href={item.url}
                            className="flex items-center font-medium"
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-gray-200">
        <SidebarMenuButton
          onClick={handleLogOut}
          disabled={isPending}
          className={cn(
            "text-red-600 cursor-pointer py-2 px-3 flex items-center font-medium rounded",
            "hover:bg-red-50 transition-colors duration-200"
          )}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span className="text-sm">
            {isPending ? "Logging out..." : "Logout"}
          </span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
