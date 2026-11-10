import { useUser } from "./useUser";

export function useAuthGuard(requiredRoles = []) {
  const { data:user, isPending:loading, isError } = useUser();

  const isAuthenticated = !!user;
  const hasRole =
    requiredRoles.length === 0 || requiredRoles.includes(user?.role);

  return {
    user,
    isLoading: loading,
    isError,
    isAuthenticated,
    hasRole,
  };
}
