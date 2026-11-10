import { ROLES } from './auth';

/**
 * Centralized route access policy. Route protection and sidebar filtering both
 * derive from this — no per-page role checks anywhere in the app.
 *
 * Frontend checks exist purely for UX/routing; Laravel remains the real
 * authorization layer.
 */
const ROUTE_RULES = [
{ prefix: '/dashboard', roles: [ROLES.INSTRUCTOR] },
{ prefix: '/dashboard/teaching', roles: [ROLES.INSTRUCTOR] },
{ prefix: '/dashboard/payments', roles: [ROLES.INSTRUCTOR] },
{ prefix: '/dashboard/profile', roles: [ROLES.INSTRUCTOR, ROLES.STUDENT] }];


/** Where each role lands after login or after an unauthorized redirect. */
export const ROLE_HOME = {
  [ROLES.INSTRUCTOR]: '/dashboard',
  [ROLES.STUDENT]: '/dashboard/profile'
};

export const UNAUTHORIZED_REDIRECT = '/dashboard/profile';

export function canAccessPath(pathname, role) {
  if (!role) return false;
  const rule = ROUTE_RULES.filter(
    (candidate) =>
    pathname === candidate.prefix || pathname.startsWith(`${candidate.prefix}/`)
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  if (!rule) return true;
  return rule.roles.includes(role);
}

export function getHomePathForRole(role) {
  return ROLE_HOME[role] || UNAUTHORIZED_REDIRECT;
}