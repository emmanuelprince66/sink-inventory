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
import {
  ChevronDown,
  ClipboardList,
  LogOut,
  Package,
  Settings,
  Store,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRealtime } from "../providers/RealtimeProvider";

// Derived from your constants, so it stays in sync with links.ts.
type NavItem = (typeof links)[number]["items"][number];

type CollapsibleGroupConfig = {
  /** Text shown on the collapsible header. */
  label: string;
  icon: LucideIcon;
  /** Should the group start expanded for the current route? */
  initiallyOpen?: (pathname: string) => boolean;
  /** Is this child link the active one? Differs slightly per group. */
  isChildActive: (pathname: string, url: string) => boolean;
};

const exact = (pathname: string, url: string) => pathname === url;
const exactOrNested = (pathname: string, url: string) =>
  pathname === url || pathname.startsWith(`${url}/`);

/**
 * Render order is NOT decided here; it follows the order of the `links` array.
 */
const COLLAPSIBLE_GROUPS: Record<string, CollapsibleGroupConfig> = {
  Fulfillment: {
    label: "Fulfillment",
    icon: ClipboardList,
    initiallyOpen: (p) => p.startsWith("/orders") || p.startsWith("/bookings"),
    isChildActive: exactOrNested,
  },
  "Store Management": {
    label: "Store",
    icon: Store,
    initiallyOpen: (p) =>
      p.startsWith("/store-info") ||
      p.startsWith("/shipping") ||
      p.startsWith("/online-payment") ||
      p.startsWith("/e-setup"),
    // /store-info is a parent of sibling routes, so only match it exactly.
    isChildActive: (p, url) =>
      p === url || (url !== "/store-info" && p.startsWith(`${url}/`)),
  },
  "Inventory Management": {
    label: "Stock",
    icon: Package,
    isChildActive: exact,
  },
  Operations: {
    label: "Operations",
    icon: Settings,
    isChildActive: exact,
  },
};

const itemClass = (isActive: boolean) =>
  cn(
    "mx-2 my-1 rounded-xl py-1.5 transition-colors duration-200",
    isActive
      ? "bg-primary-green-300 text-white"
      : "text-grey-2 hover:bg-secondary-6",
  );

export function AppSidebar() {
  const { mutate: logout, isPending } = useLogoutMutation();
  const pathname = usePathname();
  const { role, canAny } = useUserRole();
  const { unreadNotifications } = useRealtime();

  // One record instead of four booleans. Initial values come from the config.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(COLLAPSIBLE_GROUPS).map(([title, cfg]) => [
        title,
        cfg.initiallyOpen?.(pathname) ?? false,
      ]),
    ),
  );

  const toggleGroup = (title: string) =>
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));

  // Dev-only guard: warn if a config key has no matching group in links.ts,
  // otherwise that group silently renders as a plain (non-collapsible) section.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const titles = new Set(links.map((g) => g.title));
    Object.keys(COLLAPSIBLE_GROUPS).forEach((key) => {
      if (!titles.has(key)) {
        console.warn(
          `[AppSidebar] COLLAPSIBLE_GROUPS key "${key}" doesn't match any title in links.ts, so it will render as a plain group.`,
        );
      }
    });
  }, []);

  const handleLogOut = () => {
    deleteCookie("accessToken");
    deleteCookie("userRole");
    deleteCookie("refreshToken");
    localStorage.clear();
    logout();
  };

  // Role first, then any permission the link declares. `anyPermission` is
  // opt-in per link, so every existing entry keeps behaving as it did.
  const canSeeLink = (item: any) => {
    if (!item.roles.includes(role)) return false;
    if (!item.anyPermission?.length) return true;
    return canAny(item.anyPermission);
  };

  const filteredLinks = links.filter((group) =>
    group.items.some((item) => canSeeLink(item)),
  );

  return (
    <Sidebar className="z-10 bg-white border-grey-5">
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

          {filteredLinks.map((group) => {
            const visibleItems = group.items.filter((item) =>
              canSeeLink(item),
            ) as NavItem[];
            if (visibleItems.length === 0) return null;

            // ---------- Collapsible groups (config driven) ----------
            const config = COLLAPSIBLE_GROUPS[group.title];
            if (config) {
              const isOpen = openGroups[group.title] ?? false;
              const GroupIcon = config.icon;

              return (
                <SidebarGroup key={group.title}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => toggleGroup(group.title)}
                        className="flex h-auto cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 transition-colors duration-200 hover:bg-secondary-6"
                      >
                        <div className="flex items-center">
                          <GroupIcon className="mr-3 h-[17px] w-[17px]" />
                          <span className="text-sm font-bold">
                            {config.label}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transform transition-transform duration-300 ease-in-out",
                            isOpen && "rotate-180",
                          )}
                        />
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-96" : "max-h-0",
                      )}
                    >
                      {visibleItems.map((item) => (
                        <SidebarMenuItem
                          key={item.title}
                          className={itemClass(
                            config.isChildActive(pathname, item.url),
                          )}
                        >
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.url}
                              className="flex items-center pl-8 text-sm font-bold"
                            >
                              {item.icon && (
                                <item.icon className="mr-3 h-[17px] w-[17px]" />
                              )}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  </SidebarMenu>
                </SidebarGroup>
              );
            }

            // ---------- Normal groups ----------
            return (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-[10px] font-extrabold text-grey-4 uppercase tracking-widest px-4 py-2">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const isActive = pathname === item.url;
                      /**
                       * Only Notifications carries a badge.
                       *
                       * Orders used to show pending_orders_count, but nothing
                       * in the app can clear it: a merchant with old unpaid
                       * orders would see a permanent red dot, and a badge that
                       * never reaches zero teaches people to ignore badges.
                       * The unread count is different — mark-read clears it,
                       * and the socket broadcasts the new total.
                       */
                      const badge =
                        item.url === "/notification" ? unreadNotifications : 0;

                      return (
                        <SidebarMenuItem
                          key={item.title}
                          className={itemClass(isActive)}
                        >
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.url}
                              className="flex items-center font-bold text-sm px-4"
                            >
                              <item.icon className="mr-3 h-[17px] w-[17px]" />
                              <span className="flex-1">{item.title}</span>
                              {badge > 0 && (
                                <span
                                  className={cn(
                                    "ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold",
                                    isActive
                                      ? "bg-white text-primary-green-300"
                                      : "bg-red-500 text-white",
                                  )}
                                >
                                  {badge > 99 ? "99+" : badge}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-grey-5">
        <SidebarMenuButton
          onClick={handleLogOut}
          disabled={isPending}
          className={cn(
            "text-error-1 cursor-pointer py-2.5 px-3 flex items-center font-bold rounded-xl text-sm",
            "hover:bg-error-2/40 transition-colors duration-200",
          )}
        >
          <LogOut className="mr-3 h-[17px] w-[17px]" />
          <span>{isPending ? "Logging out..." : "Logout"}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
