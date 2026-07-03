// app/app/layout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { RouteGuard } from "../auth/route-guard";
import { NotificationModalProvider } from "../providers/notification-modal-provider";
import { AppSidebar } from "./AppSideBar";
import { TopBar } from "./TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NotificationModalProvider />
      <RouteGuard requiredRole="OWNER">
        <AppSidebar />
        <main className="w-full bg-[#F4F7F4]">
          <TopBar />
          <div className="p-3 min-h-[80vh] w-full md:w-[95%] mx-auto">
            {children}
          </div>
        </main>
      </RouteGuard>
    </SidebarProvider>
  );
}
