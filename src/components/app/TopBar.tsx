// components/TopBar.tsx
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";

export function TopBar() {
  // Replace with actual user data from your auth provider
  const userName = "John Doe";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4 w-full">
          {/* Show SidebarTrigger only on mobile */}

          <div className="flex justify-between items-center w-full">
            <p className="text-sm font-semibold md:text-lg">
              Welcome back,{" "}
              <span className="text-primary-green-300">{userName}</span>
            </p>
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          </div>
        </div>

        {/* Hide dropdown on mobile, show on desktop */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                <User className="h-4 w-4" />
                <span>Account</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
