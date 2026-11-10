/**
 * Role constants shared by navigation and the auth guards.
 * Auth itself is cookie-based (Laravel Sanctum) — see lib/api/authApi.js.
 */

export const ROLES = {
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  ADMIN: 'admin'
};

export function isInstructor(user) {
  return user?.role === ROLES.INSTRUCTOR;
}

export function isStudent(user) {
  return user?.role === ROLES.STUDENT;
}
