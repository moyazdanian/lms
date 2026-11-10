import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPath, UNAUTHORIZED_REDIRECT } from '@/lib/auth/access';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * The app's only route check. Wrapped around the dashboard outlet, so every
 * route inherits the policy in lib/auth/access.js.
 *
 * This is UX only — the Laravel API still authorizes every request.
 */
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!canAccessPath(pathname, user.role)) {
    return <Link href={UNAUTHORIZED_REDIRECT} />;
  }
  return children;
}