"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Heart,
  CreditCard,
  Bell,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
  UserCircle,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["instructor", "admin"],
  },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  {
    href: "/dashboard/teaching",
    label: "Teaching",
    icon: GraduationCap,
    roles: ["instructor", "admin"],
  },
  {
    href: "/dashboard/become-instructor",
    label: "Become Instructor",
    icon: GraduationCap,
    roles: ["student"],
  },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/tickets", label: "Support", icon: MessageSquare },
];

export default function UserNavbarDropdown({ user, handleLogout, isLoading }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        className="hidden cursor-pointer items-center gap-2 sm:flex"
        disabled
      >
        <UserCircle className="size-5" />
        <Spinner className="size-4" />
      </Button>
    );
  }

  const items = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  );

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-accent sm:px-3"
          >
            <Avatar className="size-8 ring-2 ring-transparent transition group-data-[state=open]:ring-primary">
              <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
              <AvatarFallback className="text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
              {user?.name || user?.email}
            </span>
            <ChevronDown className="size-4 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 overflow-hidden rounded-xl border-border/60 p-0 shadow-xl"
        >
          {/* Account header */}
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-4 dark:from-blue-700 dark:to-indigo-900">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 ring-2 ring-white/30">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback className="bg-white/20 font-semibold text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  {user?.role && (
                    <span className="rounded-full border border-white/20 bg-white/20 px-1.5 py-0 text-[10px] font-medium capitalize text-white">
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-white/80">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <DropdownMenuLabel className="px-2 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Account
          </DropdownMenuLabel>
          <div className="px-1 pb-1">
            {items.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Logout */}
          <div className="px-1 py-1">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              <LogOut />
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
                if (handleLogout) await handleLogout();
                else router.push("/");
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
