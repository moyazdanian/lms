import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getHomePathForRole } from '@/lib/auth/access';

/** Sends each role to its landing screen: instructors to the dashboard, students to Account. */
export function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomePathForRole(user.role)} replace />;
}