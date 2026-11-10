"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  HiChevronDown,
  HiOutlineShoppingBag,
  HiUserCircle,
  HiTrash,
  HiChevronRight,
  HiFolderOpen,
  HiFolder,
} from "react-icons/hi2";

import NotificationBell from "@/components/dashboard/NotificationBell";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Menu, ShoppingCart, CreditCard, Grid3X3 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import UserNavbarDropdown from "@/components/UserNavbarDropdown";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import ShowPrice from "@/components/ui/ShowPrice";
import { useLogout } from "@/hooks/useLogout";
import { useUser } from "@/hooks/useUser";
import { useCart } from "@/hooks/cart/useCart";
import { useRemoveFromCart } from "@/hooks/cart/useRemoveFromCart";
import NavbarCart from "@/components/NavbarCart";

function DesktopCategoriesDropdown({ categories }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400"
        >
          <Grid3X3 className="w-4 h-4" />
          Categories
          <HiChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 max-h-[70vh] overflow-y-auto p-2 border-gray-200 dark:border-gray-700 shadow-xl"
        align="start"
        sideOffset={5}
      >
        {categories.map((category) => (
          <div key={category.id}>
            {category.children && category.children.length > 0 ? (
              <DropdownMenuSub>
                {/* Link asChild: a single interactive element (the Radix
                    SubTrigger acting as an <a>) keeps keyboard focus order and
                    ARIA semantics correct — avoid wrapping two interactive
                    elements inside each other. */}
                <DropdownMenuSubTrigger
                  asChild
                  className="w-full justify-between text-sm px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <Link href={`/categories/${category.slug}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {/* Chevron is rendered manually: with asChild the ui
                          wrapper no longer injects one (Slot takes a single
                          child element). */}
                      <HiChevronRight className="size-4 opacity-60" />
                    </div>
                  </Link>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  className="w-56 border-gray-200 dark:border-gray-700 shadow-xl"
                  sideOffset={-4}
                >
                  <div className="p-1">
                    {category.children.map((child) => (
                      <DropdownMenuItem
                        key={child.id}
                        asChild
                        className="text-sm px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <Link href={`/categories/${child.slug}`}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-gray-400">↳</span>
                              <span>{child.name}</span>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem
                asChild
                className="text-sm px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <Link href={`/categories/${category.slug}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{category.name}</span>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileCategories({ categories }) {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Categories
      </div>

      {categories.map((category) => (
        <div key={category.id}>
          {category.children && category.children.length > 0 ? (
            <>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full text-left py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {openCategory === category.id ? (
                    <HiFolderOpen className="w-4 h-4 text-blue-500" />
                  ) : (
                    <HiFolder className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {category.courses_count || 0}
                  </Badge>
                  <HiChevronDown
                    className={`w-3 h-3 transition-transform ${
                      openCategory === category.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {openCategory === category.id && (
                <div className="ml-6 pl-2 border-l border-gray-300 dark:border-gray-700">
                  <Link
                    href={`/categories/${category.slug || category.id}`}
                    className="block py-1.5 px-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiFolder className="w-3 h-3 text-blue-400" />
                        <span className="text-sm">All {category.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {category.courses_count || 0}
                      </Badge>
                    </div>
                  </Link>

                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug || child.id}`}
                      className="block py-1.5 px-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">↳</span>
                          <span className="text-sm">{child.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {child.courses_count || 0}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link
              href={`/categories/${category.slug || category.id}`}
              className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiFolder className="w-4 h-4 text-gray-500" />
                  <span>{category.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.courses_count || 0}
                </Badge>
              </div>
            </Link>
          )}
        </div>
      ))}

      <Separator className="my-2" />

      <Link
        href="/categories"
        className="block py-2 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
      >
        <div className="flex items-center">
          {/* <HiViewGrid className="w-4 h-4 mr-2" /> */}
          View All Categories
        </div>
      </Link>
    </>
  );
}

export default function Navbar({ settings, categories }) {
  const { data: user, isLoading: isUserLoading } = useUser();

  const logoutMutation = useLogout();
  const pathname = usePathname();
  // const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState();
  const router = useRouter();

  const isHome = pathname === "/";

  // useEffect(() => {
  //   async function fetchCategories() {
  //     try {
  //       setIsLoadingCategories(true);
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_PROD_URL}/api/v1/categories`,
  //       );
  //       if (response.ok) {
  //         const data = await response.json();
  //         setCategories(data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //       toast.error("Failed to load categories");
  //     } finally {
  //       setIsLoadingCategories(false);
  //     }
  //   }

  //   fetchCategories();
  // }, []);

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  }

  return (
    <nav
      className={`row-start-1 w-full flex items-center justify-between sm:justify-around px-4 py-3 z-50 ${
        isHome
          ? "absolute bg-transparent"
          : // Sticky header keeps navigation/cart reachable on long pages.
            // z-40 sits below Sheet/Popover overlay layers (z-50) so the
            // mobile menu still opens above it when scrolled.
            "shadow-sm dark:shadow-gray-500 bg-white/95 dark:bg-neutral-900/75 backdrop-blur-sm sticky top-0 z-40"
      }`}
    >
      <div className="flex items-center sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 backdrop-blur-sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[260px] dark:bg-neutral-950 dark:text-white bg-white/95 backdrop-blur-sm"
          >
            <SheetHeader className="dark:text-white">
              <SheetTitle className="text-lg font-bold dark:text-white/90">
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="mt-2 px-5 flex flex-col gap-4">
              <div className="py-1">
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Spinner className="w-4 h-4" />
                    <span className="text-sm text-gray-500 ml-2">
                      Loading categories...
                    </span>
                  </div>
                ) : categories.length > 0 ? (
                  <MobileCategories categories={categories} />
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No categories found
                  </p>
                )}
              </div>

              <Link
                href="/courses"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              >
                Courses
              </Link>
              <Link
                href="/instructors"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              >
                Instructors
              </Link>
              <Link
                href="/blog"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              >
                Blog
              </Link>

              {/* <div className="py-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fa">فارسی</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Auth Section in Mobile Menu */}
              {isUserLoading ? (
                <div className="py-2">
                  <Button className="w-full cursor-pointer shadow-2xl shadow-gray-200">
                    <HiUserCircle className="inline mr-1" />
                    <Spinner className="w-4 h-4" />
                  </Button>
                </div>
              ) : user ? (
                <div className="py-2">
                  <UserNavbarDropdown
                    user={user}
                    handleLogout={handleLogout}
                    isLoading={isUserLoading}
                  />
                </div>
              ) : (
                <div className="py-2">
                  <Link href="/login">
                    <Button className="w-full cursor-pointer shadow-2xl shadow-gray-200">
                      <HiUserCircle className="inline mr-1" />
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Logo — falls back to a text brand when the admin has not
          uploaded a logo; `settings` can also be undefined while the
          settings API is unreachable. */}
      <div>
        <Link
          href="/"
          className="flex items-center gap-2 sm:static sm:translate-x-0 group"
        >
          {settings?.logo ? (
            <Image
              src={settings.logo}
              alt={settings?.site_name || "Logo"}
              width={32}
              height={32}
              className="transition-transform group-hover:scale-110"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white transition-transform group-hover:scale-110">
              {(settings?.site_name || "L").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="font-bold text-lg text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {settings?.site_name || "LMS"}
          </span>
        </Link>
      </div>

      <div
        className={`hidden sm:flex items-center gap-6 ${
          isHome ? "text-gray-200" : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {isLoadingCategories ? (
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-sm"
            disabled
          >
            <Grid3X3 className="w-4 h-4" />
            Categories
            <Spinner className="w-3 h-3 ml-1" />
          </Button>
        ) : categories.length > 0 ? (
          <DesktopCategoriesDropdown categories={categories} />
        ) : null}
        <Link
          href="/courses"
          className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
        >
          Courses
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link
          href="/instructors"
          className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
        >
          Instructors
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link
          href="/blog"
          className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
        >
          Blog
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NavbarCart />

        {/* Auth Buttons */}
        {user ? (
          <>
            <NotificationBell />
            <UserNavbarDropdown user={user} handleLogout={handleLogout} />
          </>
        ) : isUserLoading ? (
          <Button className="hidden sm:flex cursor-pointer shadow-2xl shadow-gray-200">
            <HiUserCircle className="inline mr-1" />
            <Spinner className="w-4 h-4" />
          </Button>
        ) : (
          <Link href="/login">
            <Button>
              <HiUserCircle className="inline mr-1" />
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
