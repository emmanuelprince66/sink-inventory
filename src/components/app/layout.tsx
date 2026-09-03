// app/app/layout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { RouteGuard } from "../auth/route-guard";
import { NotificationModalProvider } from "../providers/notification-modal-provider";
import { RealtimeProvider } from "../providers/RealtimeProvider";
import { AppSidebar } from "./AppSideBar";
import BusinessDataSync from "./BusinessDataSync";
import { TopBar } from "./TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NotificationModalProvider />
      {/* Every money figure formats itself from the persisted business
          snapshot, so keeping that snapshot current is what keeps the whole
          dashboard in the right currency. */}
      <BusinessDataSync />
      {/* Inside the shell, so the socket only opens for a signed-in dashboard —
          never on /login or the public /loyalty/join pages. */}
      <RealtimeProvider>
        <RouteGuard requiredRole="OWNER">
          <AppSidebar />
          {/* min-w-0: the sidebar and this are flex siblings, and a flex child
              defaults to min-width:auto — so a table wider than the space left
              over grows main rather than scrolling inside it, and the whole
              shell slides sideways. w-full alone does not prevent that. */}
          <main className="w-full min-w-0 bg-[#F4F7F4]">
            <TopBar />
            {/* px-8 py-6 matches the Figma reference content gutter; pages must not add their own page-level padding. */}
            <div className="px-4 md:px-8 py-6 min-h-[80vh] w-full min-w-0">
              {children}
            </div>
          </main>
        </RouteGuard>
      </RealtimeProvider>
    </SidebarProvider>
  );
}
