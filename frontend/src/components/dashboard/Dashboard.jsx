"use client";

import { useEffect, useState } from "react";
import { User, BookOpen, Heart, CreditCard, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/app/loading";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import Profile from "./Profile";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useWishlist } from "@/hooks/useWishlist";
import { useLogout } from "@/hooks/useLogout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardWishlists from "../DashboardWishlists";
import DashboardCourses from "../DashboardCourses";

export default function Dashboard() {
  const [active, setActive] = useState("profile");
  const { editUserProfile } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();
  const {
    isLoading: isAuthLoading,
    isAuthenticated,
    hasRole,
    user,
  } = useAuthGuard(["student"]);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "logout", label: "Logout", icon: LogOut },
  ];

  const fakePayments = [
    { id: 1, amount: "$50", date: "2025-05-12", status: "Successful" },
    { id: 2, amount: "$30", date: "2025-03-20", status: "Failed" },
  ];

  if (isAuthLoading) {
    return <Loading />;
  }

  // if (!isAuthenticated) {
  //   redirect("/login");
  // }

  if (!hasRole) {
    redirect("/403");
  }

  const renderContent = () => {
    switch (active) {
      case "profile":
        return <Profile user={user} editUserProfile={editUserProfile} />;
      case "courses":
        return <DashboardCourses />;
      case "wishlist":
        return (
          <div>
            <DashboardWishlists state="wishlist" />
          </div>
        );
      case "payments":
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Payment History</h3>
            {fakePayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fakePayments.map((pay) => (
                      <tr
                        key={pay.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3">{pay.date}</td>
                        <td className="p-3 font-medium">{pay.amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pay.status === "Successful"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No payment history found.
                </p>
              </div>
            )}
          </div>
        );
      case "logout":
        return (
          <div className="text-center">
            <LogOut className="w-16 h-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Logout Confirmation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="destructive"
                onClick={() => {
                  logoutMutation.mutate();
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Please select a section from the menu.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="lg:w-1/4">
            <Card className="bg-white dark:bg-gray-950 shadow-lg mb-6 lg:sticky lg:top-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatar} />
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{user?.name || "User"}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={active === item.id ? "default" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => setActive(item.id)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <Card className="bg-white dark:bg-gray-950 shadow-lg min-h-[500px]">
              <CardContent className="p-6">
                {isAuthLoading && active === "courses" ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  renderContent()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
