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
import { UserRole } from "@/lib/store/types";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const { mutate: logout, isPending } = useLogoutMutation();
  const pathname = usePathname();
  const { hasPermission } = useUserRole();

  return (
    <Sidebar className="z-10 bg-white border-gray-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="py-6 mb-8">
            <div className="w-100 h-100">
              <Image
                src="/asset/h-1.png"
                alt="sink-logo"
                className="w-full h-full object-contain"
                priority
                width={150}
                height={150}
              />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item: any) => {
                // Check if user has permission for this link
                const hasAccess = item.roles.some((role: UserRole) =>
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
                      "transition-colors duration-200 my-2 py-1 rounded",
                      isActive
                        ? "bg-primary-green-300 text-white"
                        : "hover:bg-primary-green-300 hover:text-white"
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex items-center font-[600]"
                      >
                        <item.icon className="mr-2" />
                        <p className="text-[18px] font-normal">{item.title}</p>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          onClick={() => logout()}
          disabled={isPending}
          className={cn(
            "text-primary-red-100 cursor-pointer py-1 flex items-center font-[600]",
            "hover:bg-red-50 transition-colors duration-200 rounded"
          )}
        >
          <LogOut className="mr-2" />
          {isPending ? "Logging out..." : "Logout"}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
