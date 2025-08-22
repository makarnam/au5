import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { autoRecoverSession, checkSessionHealth } from './sessionDebugger';
import toast from 'react-hot-toast';

interface UseSessionRecoveryOptions {
  autoRecover?: boolean;
  showNotifications?: boolean;
  checkInterval?: number;
}

export const useSessionRecovery = (options: UseSessionRecoveryOptions = {}) => {
  const {
    autoRecover = true,
    showNotifications = true,
    checkInterval = 30000
  } = options;

  const { user, session, initialized, isRecovering } = useAuthStore();
  const [isChecking, setIsChecking] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  
  // Use refs to prevent unnecessary re-renders
  const recoveryAttemptedRef = useRef(false);
  const healthCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual recovery function
  const attemptRecovery = useCallback(async () => {
    if (isRecovering || isChecking || recoveryAttemptedRef.current) {
      return false;
    }

    recoveryAttemptedRef.current = true;
    setIsChecking(true);
    
    try {
      const success = await autoRecoverSession();
      
      if (success && showNotifications) {
        toast.success('Session recovered successfully');
      } else if (!success && showNotifications) {
        toast.error('Session recovery failed');
      }
      
      return success;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      if (showNotifications) {
        toast.error('Session recovery failed');
      }
      return false;
    } finally {
      setIsChecking(false);
      // Reset the flag after a delay
      setTimeout(() => {
        recoveryAttemptedRef.current = false;
      }, 5000);
    }
  }, [isRecovering, isChecking, showNotifications]);

  // Health check function
  const performHealthCheck = useCallback(async () => {
    try {
      const health = await checkSessionHealth();
      setLastHealthCheck(new Date());
      
      if (!health.healthy && showNotifications) {
        console.warn('Session health issues detected:', health.issues);
        
        if (autoRecover && !recoveryAttemptedRef.current) {
          await attemptRecovery();
        }
      }
      
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }, [autoRecover, showNotifications, attemptRecovery]);

  // Auto-recovery effect - only run once when component mounts
  useEffect(() => {
    if (!initialized || !autoRecover || recoveryAttemptedRef.current) {
      return;
    }

    const recoveryTimer = setTimeout(async () => {
      if (session && !user) {
        console.log('Auto-recovery: Session exists but no user');
        await attemptRecovery();
      }
    }, 2000);

    return () => clearTimeout(recoveryTimer);
  }, [initialized, session, user, autoRecover, attemptRecovery]);

  // Periodic health check - with cleanup
  useEffect(() => {
    if (!initialized || checkInterval <= 0) {
      return;
    }

    // Clear any existing timer
    if (healthCheckTimerRef.current) {
      clearInterval(healthCheckTimerRef.current);
    }

    healthCheckTimerRef.current = setInterval(() => {
      performHealthCheck();
    }, checkInterval);

    return () => {
      if (healthCheckTimerRef.current) {
        clearInterval(healthCheckTimerRef.current);
        healthCheckTimerRef.current = null;
      }
    };
  }, [initialized, checkInterval, performHealthCheck]);

  // Visibility change handler - debounced
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && initialized && session && !user && !recoveryAttemptedRef.current) {
        console.log('Page became visible, checking session health');
        
        // Clear any existing timer
        if (visibilityTimerRef.current) {
          clearTimeout(visibilityTimerRef.current);
        }
        
        // Debounce the health check
        visibilityTimerRef.current = setTimeout(() => {
          performHealthCheck();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = null;
      }
    };
  }, [initialized, session, user, performHealthCheck]);

  // Online/offline handler - debounced
  useEffect(() => {
    const handleOnline = async () => {
      if (initialized && session && !user && !recoveryAttemptedRef.current) {
        console.log('Network restored, checking session health');
        
        // Clear any existing timer
        if (visibilityTimerRef.current) {
          clearTimeout(visibilityTimerRef.current);
        }
        
        // Debounce the health check
        visibilityTimerRef.current = setTimeout(() => {
          performHealthCheck();
        }, 1000);
      }
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = null;
      }
    };
  }, [initialized, session, user, performHealthCheck]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (healthCheckTimerRef.current) {
        clearInterval(healthCheckTimerRef.current);
      }
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }
    };
  }, []);

  return {
    isRecovering,
    isChecking,
    lastHealthCheck,
    attemptRecovery,
    performHealthCheck
  };
};

// Export for use in other modules
export default useSessionRecovery;
