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
          {/* px-8 py-6 matches the Figma reference content gutter; pages must not add their own page-level padding. */}
          <div className="px-4 md:px-8 py-6 min-h-[80vh] w-full">
            {children}
          </div>
        </main>
      </RouteGuard>
    </SidebarProvider>
  );
}
