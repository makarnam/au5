import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import { autoRecoverSession } from "../lib/sessionDebugger";
import toast from "react-hot-toast";

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
  const { user, loading, initialized, checkPermission, session } = useAuthStore();
  const location = useLocation();
  const [isRecovering, setIsRecovering] = useState(false);

  const pathname = location.pathname;
  const isAuthRoute = pathname.startsWith("/auth/");

  // Auto-recovery effect
  useEffect(() => {
    const attemptRecovery = async () => {
      if (initialized && session && !user && !isRecovering) {
        console.log("ProtectedRoute: Session exists but no user - attempting recovery");
        setIsRecovering(true);
        
        try {
          const success = await autoRecoverSession();
          if (success) {
            toast.success("Session recovered successfully");
          }
        } catch (error) {
          console.error("Recovery failed:", error);
        } finally {
          setIsRecovering(false);
        }
      }
    };

    // Attempt recovery after a short delay
    const recoveryTimer = setTimeout(attemptRecovery, 1000);
    
    return () => clearTimeout(recoveryTimer);
  }, [initialized, session, user, isRecovering]);

  // Still initializing or recovering
  if (!initialized || loading || isRecovering) {
    console.log("ProtectedRoute: Still initializing or recovering...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {isRecovering ? "Recovering session..." : "Initializing..."}
          </p>
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
  if (user && requiredRole && !checkPermission(requiredRole)) {
    console.log("User doesn't have required role, redirecting to dashboard");
    toast.error("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role (or no role requirement)
  return <>{children}</>;
};

export default ProtectedRoute;
