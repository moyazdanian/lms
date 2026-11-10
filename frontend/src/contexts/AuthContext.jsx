"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { login, logout, register } from "@/lib/api/authApi";
import { useEditProfile } from "@/hooks/useEditProfile";
import { useUser } from "@/hooks/useUser";

const AuthContext = createContext(null);

const USER_SCOPED_QUERY_KEYS = [
  "cart",
  "coupon",
  "wishlist",
  "wishlist-ids",
  "dashboard-courses",
  "course-progress",
  "course-resume",
  "payments",
  "check-enroll",
  "notifications",
  "tickets",
  "instructor-application",
  "instructor-courses",
  "instructor-course",
];

export function clearUserScopedQueries(queryClient) {
  queryClient.removeQueries({
    predicate: (query) => USER_SCOPED_QUERY_KEYS.includes(query.queryKey[0]),
  });
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userQuery = useUser();
  const editProfileMutation = useEditProfile();

  const signIn = async (email, password) => {
    const response = await login(email, password);

    // Remove data belonging to the previous account.
    clearUserScopedQueries(queryClient);

    // The login response is the immediate source of truth.
    queryClient.setQueryData(["user"], response.user);

    return response.user;
  };

  const signUp = async (credentials) => {
    const response = await register(credentials);

    clearUserScopedQueries(queryClient);

    queryClient.setQueryData(["user"], response.user);

    return response.user;
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      // Immediately remove the authenticated user from React Query.
      queryClient.setQueryData(["user"], null);

      // Remove all account-specific cached data.
      clearUserScopedQueries(queryClient);

      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userQuery.data ?? null,
        loading: userQuery.isLoading,
        isError: userQuery.isError,
        signIn,
        signUp,
        signOut,
        logout: signOut,
        editUserProfile: editProfileMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
