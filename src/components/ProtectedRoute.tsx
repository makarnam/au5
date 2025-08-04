import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing..." variant="dots" />
      </div>
    );
  }

  // Loading user data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." variant="default" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    // Allow access to public auth routes to prevent redirect loops
    if (isAuthRoute) {
      return <>{children}</>;
    }
    // Redirect to configured fallbackPath
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Authenticated users should not remain on auth routes
  if (user && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  // Check role-based permissions (unchanged)
  if (requiredRole && !checkPermission(requiredRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

export default ProtectedRoute;
