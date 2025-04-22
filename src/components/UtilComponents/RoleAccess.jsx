import React from "react";
import { useUser } from "../../context/userContext";

/**
 * RoleAccess - A component that conditionally renders children based on user roles
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - Single role or array of roles allowed to see the content
 * @param {boolean} props.matchAll - If true, user must have ALL roles in allowedRoles (default: false - ANY role is sufficient)
 * @param {React.ReactNode} props.fallback - Optional component to render if user doesn't have required roles
 * @param {React.ReactNode} props.children - Content to render if user has required roles
 * @returns {React.ReactNode|null}
 */
const RoleAccess = ({
  allowedRoles,
  matchAll = false,
  fallback = null,
  children,
}) => {
  const { user } = useUser();

  // If no roles are specified, show content to everyone
  if (
    !allowedRoles ||
    (Array.isArray(allowedRoles) && allowedRoles.length === 0)
  ) {
    return children;
  }

  // If no user or user has no role, don't show the content
  if (!user || !user.role) {
    return fallback;
  }

  // Convert single role to array for consistent handling
  const requiredRoles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  // Current user role (if it's an array in your system, adjust accordingly)
  const userRole = user.role;

  // Check if user has required role(s)
  let hasAccess = false;

  if (matchAll) {
    // User must have ALL required roles
    hasAccess = requiredRoles.every((role) => {
      // Handle 'admin' as a special case that has access to everything
      if (userRole === "admin") return true;
      return userRole === role;
    });
  } else {
    // User must have ANY of the required roles
    hasAccess = requiredRoles.some((role) => {
      // Handle 'admin' as a special case that has access to everything
      if (userRole === "admin") return true;
      return userRole === role;
    });
  }

  return hasAccess ? children : fallback;
};

/**
 * Hook version for programmatic role checking
 * @param {string|string[]} allowedRoles - Role or roles that are allowed
 * @param {boolean} matchAll - If true, user must have ALL roles in allowedRoles (default: false - ANY role is sufficient)
 * @returns {boolean} - Whether the current user has the required role(s)
 */
export const useRoleAccess = (allowedRoles, matchAll = false) => {
  const { user } = useUser();

  // If no roles are specified, grant access to everyone
  if (
    !allowedRoles ||
    (Array.isArray(allowedRoles) && allowedRoles.length === 0)
  ) {
    return true;
  }

  // If no user or user has no role, deny access
  if (!user || !user.role) {
    return false;
  }

  // Convert single role to array for consistent handling
  const requiredRoles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  // Current user role (if it's an array in your system, adjust accordingly)
  const userRole = user.role;

  if (matchAll) {
    // User must have ALL required roles
    return requiredRoles.every((role) => {
      // Handle 'admin' as a special case that has access to everything
      if (userRole === "admin") return true;
      return userRole === role;
    });
  } else {
    // User must have ANY of the required roles
    return requiredRoles.some((role) => {
      // Handle 'admin' as a special case that has access to everything
      if (userRole === "admin") return true;
      return userRole === role;
    });
  }
};

export default RoleAccess;
