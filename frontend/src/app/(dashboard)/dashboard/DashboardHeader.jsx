"use client";
import React, { useState } from "react";
import { BellIcon, LifeBuoyIcon, LogOutIcon, UserIcon } from "lucide-react";
import { MobileNavigation } from "./MobileNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { navigation } from "@/config/navigation";
import { initials } from "@/lib/format";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { useLogout } from "@/hooks/useLogout";

function useBreadcrumbTrail(pathname) {
  for (const group of navigation) {
    for (const item of group.items) {
      if (pathname === item.href) return [group.label, item.label];
      if (pathname.startsWith(`${item.href}/`)) {
        const suffix = pathname.endsWith("/edit") ? "Edit course" : null;
        return suffix
          ? [group.label, item.label, suffix]
          : [group.label, item.label];
      }
    }
  }
  return ["Account"];
}

export function DashboardHeader({ mobileNavOpen, onMobileNavOpenChange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const trail = useBreadcrumbTrail(pathname);
  const logoutMutation = useLogout();

  function handleLogout() {
    logoutMutation.mutate();
  }

  // const { data: notificationsPage } = useApiResource(
  //   ({ signal }) =>
  //     getNotifications({ perPage: 1, filter: "unread" }, { signal }),
  //   [pathname],
  // );
  // const unreadCount = notificationsPage?.unread_count ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
      <MobileNavigation
        role={user?.role}
        pathname={pathname}
        open={mobileNavOpen}
        onOpenChange={onMobileNavOpenChange}
      />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {trail.map((crumb, index) => (
            <React.Fragment key={crumb}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className="min-w-0">
                {index === trail.length - 1 ? (
                  <BreadcrumbPage className="truncate">{crumb}</BreadcrumbPage>
                ) : (
                  <span className="hidden truncate sm:inline">{crumb}</span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Tooltip>
        <TooltipTrigger asChild>
          <NotificationBell />
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 text-left transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open user menu"
          >
            <Avatar>
              {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-medium leading-tight">
                {user.name}
              </span>
              <span className="block truncate text-xs capitalize text-muted-foreground">
                {user.role}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuLabel className="space-y-1 px-2 py-2 text-sm font-normal normal-case text-foreground">
            <span className="block font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
            <Badge variant="secondary" className="mt-1 capitalize">
              {user.role}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/dashboard/profile" className="flex gap-2">
              <UserIcon aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/dashboard/tickets" className="flex gap-2">
              <LifeBuoyIcon aria-hidden="true" />
              Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-1 py-1">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              <LogOutIcon />
              <span>Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your dashboard, courses and
              settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (handleLogout) handleLogout();
                else router.push("/");
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
