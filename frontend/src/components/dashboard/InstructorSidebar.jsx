"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  User,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";

const groups = [
  {
    label: "Overview",
    instructorOnly: true,
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Teaching",
    instructorOnly: true,
    items: [
      { href: "/dashboard/teaching", label: "My courses", icon: BookOpen },
      {
        href: "/dashboard/teaching/create",
        label: "Create course",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "Payments",
    instructorOnly: true,
    items: [
      {
        href: "/dashboard/teaching/earnings",
        label: "Payments",
        icon: CreditCard,
      },
      {
        href: "/dashboard/teaching/earnings",
        label: "Earnings",
        icon: BarChart3,
      },
      {
        href: "/dashboard/teaching/earnings",
        label: "Payout requests",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: User },
      { href: "/dashboard/courses", label: "My learning", icon: GraduationCap },
      { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
      {
        href: "/dashboard/payments",
        label: "Purchase history",
        icon: CreditCard,
      },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/tickets", label: "Support", icon: MessageSquare },
    ],
  },
];

export default function InstructorSidebar({
  user,
  logoutMutation,
  onNavigate,
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState({
    Teaching: true,
    Payments: true,
    Account: true,
  });
  const isInstructor = ["instructor", "admin"].includes(user?.role);
  const navigate = () => onNavigate?.();
  const menu = () => (
    <SidebarContent>
      <SidebarHeader className="border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} />
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{user?.name || "User"}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <NotificationBell />
        </div>
      </SidebarHeader>
      {groups
        .filter((group) => !group.instructorOnly || isInstructor)
        .map((group) => (
          <SidebarGroup key={group.label} className="px-3 py-1.5">
            {group.label !== "Overview" && (
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800"
                onClick={() =>
                  setOpenGroups((state) => ({
                    ...state,
                    [group.label]: !state[group.label],
                  }))
                }
              >
                {group.label}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openGroups[group.label] ? "rotate-180" : ""}`}
                />
              </button>
            )}
            {(group.label === "Overview" || openGroups[group.label]) && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={`${group.label}-${item.label}`}>
                      <SidebarMenuButton
                        asChild
                        active={pathname === item.href}
                      >
                        <Link href={item.href} onClick={navigate}>
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      <SidebarFooter className="border-t border-slate-100 dark:border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-red-600"
              onClick={() => logoutMutation?.mutate()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContent>
  );
  return (
    <SidebarProvider className="!contents">
      <SidebarTrigger className="fixed bottom-5 left-5 top-auto z-[60] h-11 w-11 rounded-full border-primary/20 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 lg:hidden" />
      <Sidebar className="w-72 shrink-0 rounded-xl border bg-white shadow-lg dark:bg-gray-950">
        {menu()}
      </Sidebar>
    </SidebarProvider>
  );
}
