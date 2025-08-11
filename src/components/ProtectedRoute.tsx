import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  // Align fallback with actual public auth route used in App.tsx
  fallbackPath = "/auth/sign-in",
}) => {
  const { user, loading, initialized, checkPermission } = useAuthStore();
  const location = useLocation();

  const pathname = location.pathname;
  const isAuthRoute = pathname.startsWith("/auth/");

  // Still initializing
  if (!initialized) {
    console.log("Still initializing...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // User is on an auth route but is already authenticated
  if (isAuthRoute && user) {
    console.log("User authenticated, redirecting from auth route to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated and not on an auth route
  if (!user && !isAuthRoute) {
    console.log("User not authenticated, redirecting to sign-in");
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // User is authenticated but doesn't have required role
  if (user && requiredRole && !checkPermission(requiredRole as UserRole | UserRole[])) {
    console.log("User doesn't have required role:", requiredRole);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Access Denied</strong>
            <br />
            You don't have permission to access this page.
          </div>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role (or no role required)
  console.log("User authenticated and authorized, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
