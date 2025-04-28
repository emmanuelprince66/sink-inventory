import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSideBar";
import { TopBar } from "./TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full bg-primary-green-600 ">
        <TopBar />

        <div className="p-4 h-[80vh]  w-full md:w-[95%] mx-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
