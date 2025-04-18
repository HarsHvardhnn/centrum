import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";
import NotFound404 from "./NotFound";

// Enhanced loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-lg">Loading...</span>
  </div>
);

/**
 * Enhanced ProtectedRoute that handles:
 * - Loading states
 * - Authentication checks
 * - Role-based authorization
 * - Redirect preservation
 */
export const ProtectedRoute = ({ allowedRoles, redirectPath = "/login" }) => {
  const { user, loading } = useUser();
  console.log("role is :{}",user.role)
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Set auth check complete after loading completes
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Still checking authentication status
  if (loading || !authChecked) {
    return <LoadingScreen />;
  }

  // Not logged in - redirect to login with return path
  if (!user) {
    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // Check role-based access (admin can access everything)
  const hasRequiredRole =
    user.role === "admin" || !allowedRoles || allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return <NotFound404 />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

/**
 * PublicRoute component
 * - Accessible without login
 * - Can optionally redirect authenticated users away
 */
export const PublicRoute = ({
  redirectAuthenticatedTo = null,
  restrictedRoles = [],
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  // Wait for auth check to complete
  if (loading) {
    return <LoadingScreen />;
  }

  // If we want to redirect authenticated users elsewhere
  // (useful for login/signup pages that shouldn't be accessible when logged in)
  if (user && redirectAuthenticatedTo) {
    // Check if user's role is restricted from this route
    const isRoleRestricted =
      restrictedRoles.length > 0 && restrictedRoles.includes(user.role);

    if (!isRoleRestricted) {
      // Get the intended destination or use the default redirect
      const destination = location.state?.from || redirectAuthenticatedTo;
      return <Navigate to={destination} replace />;
    }
  }

  // Otherwise render the child routes
  return <Outlet />;
};
