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

// Menu items.

export function AppSidebar() {
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
              {links?.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="hover:bg-primary-green-100 hover:text-white transition-colors duration-200 my-2 py-1 rounded"
                >
                  <SidebarMenuButton asChild>
                    <Link
                      href={item?.url}
                      className=" flex items-center font-[600]"
                    >
                      <item.icon />
                      <p className="">{item.title}</p>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}{" "}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          asChild
          className=" text-primary-red-100 cursor-pointer py-1"
        >
          <div className="flex items-center font-[600]">
            <LogOut />

            <p>Logout</p>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
