// app/app/layout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { RouteGuard } from "../auth/route-guard";
import { AppSidebar } from "./AppSideBar";
import { TopBar } from "./TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <RouteGuard requiredRole="OWNER">
        <AppSidebar />
        <main className="w-full bg-primary-green-600">
          <TopBar />
          <div className="p-4 h-[80vh] w-full md:w-[95%] mx-auto">
            {children}
          </div>
        </main>
      </RouteGuard>
    </SidebarProvider>
  );
}
