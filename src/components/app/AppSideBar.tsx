"use client";
import { LogOut } from "lucide-react";
import sink from "@/assets/sink.png";
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
import Image from "next/image";
import Link from "next/link";
import { links } from "@/constants/links";
import { useLogoutMutation } from "@/api/auth/logout-user";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming you have a classnames utility

export function AppSidebar() {
  const { mutate: logout, isPending } = useLogoutMutation();
  const pathname = usePathname();

  return (
    <Sidebar className="z-10 bg-white border-gray-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="bg-[#001e06] py-6 mb-8">
            <div className="w-24 h-24">
              <Image
                src={sink}
                alt="sink-logo"
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links?.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      "transition-colors duration-200 my-2 py-1 rounded",
                      isActive
                        ? "bg-primary-green-100 text-white"
                        : "hover:bg-primary-green-100 hover:text-white"
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex items-center font-[600]"
                      >
                        <item.icon className="mr-2" />
                        <p>{item.title}</p>
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
