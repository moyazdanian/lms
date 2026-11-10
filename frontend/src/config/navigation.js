import {
  BellIcon,
  BookOpenIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  PlusCircleIcon,
  ReceiptIcon,
  TrophyIcon,
  UserRoundPlus,
  TrendingUpIcon,
  UserIcon,
  WalletIcon } from
'lucide-react';
import { ROLES } from '../lib/auth/auth';

const { INSTRUCTOR, STUDENT , ADMIN } = ROLES;

/** Single source of truth for sidebar navigation AND route protection. */
export const navigation = [
{
  label: 'Overview',
  items: [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
    roles: [INSTRUCTOR , ADMIN]
  }]

},
{
  label: 'Teaching',
  items: [
  {
    label: 'Teaching Courses',
    href: '/dashboard/teaching',
    icon: BookOpenIcon,
    roles: [INSTRUCTOR , ADMIN]
  },
  {
    label: 'Create Course',
    href: '/dashboard/teaching/create',
    icon: PlusCircleIcon,
    roles: [INSTRUCTOR , ADMIN]
  }]

},
{
  label: 'Earnings',
  items: [
  {
    label: 'Earnings',
    href: '/dashboard/earnings',
    icon: TrendingUpIcon,
    roles: [INSTRUCTOR , ADMIN]
  },
  {
    label: 'Sales',
    href: '/dashboard/earnings/sales',
    icon: CreditCardIcon,
    roles: [INSTRUCTOR , ADMIN]
  },
  {
    label: 'Payout Requests',
    href: '/dashboard/earnings/payouts',
    icon: WalletIcon,
    roles: [INSTRUCTOR , ADMIN]
  }]

},
{
  label: 'Account',
  items: [
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: UserIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  },
  {
    label: 'Become Instructor',
    href: '/dashboard/become-instructor',
    icon: UserRoundPlus,
    roles: [STUDENT]
  },
  {
    label: 'Wishlist',
    href: '/dashboard/wishlist',
    icon: HeartIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  },
  {
    label: 'My Courses',
    href: '/dashboard/courses',
    icon: GraduationCapIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  },
  {
    label: 'My Certificates',
    href: '/dashboard/certificates',
    icon: TrophyIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  },
  {
    label: 'Payments History',
    href: '/dashboard/payments',
    icon: ReceiptIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  },
  {
    label: 'Support',
    href: '/dashboard/tickets',
    icon: LifeBuoyIcon,
    roles: [STUDENT, INSTRUCTOR , ADMIN]
  }]

}];


/** Sidebar groups/items the given role may see. */
export function getNavigationForRole(role) {
  return navigation.
  map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role))
  })).
  filter((group) => group.items.length > 0);
}

export function findNavItemByPath(pathname) {
  const items = navigation.flatMap((group) => group.items);
  return (
    items.find((item) => item.href === pathname) ||
    items.
    filter((item) => pathname.startsWith(`${item.href}/`)).
    sort((a, b) => b.href.length - a.href.length)[0] ||
    null);

}