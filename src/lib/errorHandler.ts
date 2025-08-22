import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  retryOnSessionError?: boolean;
  autoRecover?: boolean;
  maxRetries?: number;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private isHandlingError = false;
  private retryCount = 0;
  private maxRetries = 3;
  private recoveryInProgress = false;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handles Supabase errors with session refresh logic
   */
  async handleSupabaseError(
    error: any,
    operation: string = 'Unknown operation',
    config: ErrorHandlerConfig = {}
  ): Promise<boolean> {
    const { 
      showToast = true, 
      logError = true, 
      retryOnSessionError = true,
      autoRecover = true,
      maxRetries = 3
    } = config;

    if (this.isHandlingError) {
      return false;
    }

    this.isHandlingError = true;
    this.maxRetries = maxRetries;

    try {
      if (logError) {
        console.error(`Error in ${operation}:`, error);
      }

      // Check if it's a session-related error
      if (this.isSessionError(error) && retryOnSessionError) {
        console.log('Session error detected, attempting recovery...');
        
        if (autoRecover && this.retryCount < this.maxRetries) {
          this.retryCount++;
          const recoverySuccess = await this.attemptRecovery(operation);
          
          if (recoverySuccess) {
            this.retryCount = 0;
            this.isHandlingError = false;
            return true; // Recovery successful, retry the operation
          }
        }
        
        // Recovery failed or max retries reached
        if (showToast) {
          toast.error('Session expired. Please log in again.');
        }
        this.redirectToLogin();
        this.isHandlingError = false;
        this.retryCount = 0;
        return false;
      }

      // Handle other types of errors
      if (showToast) {
        const errorMessage = this.getErrorMessage(error);
        toast.error(errorMessage);
      }

      this.isHandlingError = false;
      this.retryCount = 0;
      return false;
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      this.isHandlingError = false;
      this.retryCount = 0;
      return false;
    }
  }

  /**
   * Attempts to recover from session errors
   */
  private async attemptRecovery(operation: string): Promise<boolean> {
    if (this.recoveryInProgress) {
      return false;
    }

    this.recoveryInProgress = true;

    try {
      console.log(`Attempting recovery (${this.retryCount}/${this.maxRetries}) for: ${operation}`);
      
      // First, try to refresh the session
      const authStore = useAuthStore.getState();
      const refreshSuccess = await authStore.refreshSession();
      
      if (refreshSuccess) {
        console.log('Session refresh successful during recovery');
        this.recoveryInProgress = false;
        return true;
      }

      // If refresh failed, try to recover the entire session
      const recoverySuccess = await authStore.recoverSession();
      
      if (recoverySuccess) {
        console.log('Session recovery successful');
        this.recoveryInProgress = false;
        return true;
      }

      // If all recovery attempts failed, wait a bit before next attempt
      if (this.retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
      }

      this.recoveryInProgress = false;
      return false;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      this.recoveryInProgress = false;
      return false;
    }
  }

  /**
   * Wraps a function with error handling and automatic retry
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    operation: string = 'Operation',
    config: ErrorHandlerConfig = {}
  ): Promise<T | null> {
    const { maxRetries = 3 } = config;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          // Final attempt failed
          await this.handleSupabaseError(error, operation, config);
          return null;
        }

        // Check if it's a session error that can be recovered
        if (this.isSessionError(error)) {
          console.log(`Session error on attempt ${attempt + 1}, attempting recovery...`);
          const recoverySuccess = await this.attemptRecovery(operation);
          
          if (recoverySuccess) {
            // Recovery successful, continue to next attempt
            continue;
          } else {
            // Recovery failed, handle the error
            await this.handleSupabaseError(error, operation, config);
            return null;
          }
        } else {
          // Non-session error, handle it normally
          await this.handleSupabaseError(error, operation, config);
          return null;
        }
      }
    }

    return null;
  }

  /**
   * Checks if an error is session-related
   */
  private isSessionError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';
    const errorDetails = error.details?.toLowerCase() || '';

    return (
      errorMessage.includes('jwt') ||
      errorMessage.includes('token') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('unauthenticated') ||
      errorMessage.includes('expired') ||
      errorCode.includes('401') ||
      errorCode.includes('jwt') ||
      errorCode.includes('token') ||
      errorDetails.includes('jwt') ||
      errorDetails.includes('token')
    );
  }

  /**
   * Gets a user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';

    // Handle Supabase errors
    if (error.message) {
      return error.message;
    }

    // Handle network errors
    if (error.name === 'NetworkError') {
      return 'Network connection error. Please check your internet connection.';
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      return 'Request timed out. Please try again.';
    }

    // Handle generic errors
    if (error.toString) {
      return error.toString();
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Redirects to login page
   */
  private redirectToLogin(): void {
    console.log('Redirecting to login page...');
    
    // Clear auth store
    const authStore = useAuthStore.getState();
    authStore.setUser(null);
    authStore.setSession(null);
    
    // Clear storage
    localStorage.removeItem('auth-store');
    sessionStorage.removeItem('auth-store');
    
    // Redirect
    setTimeout(() => {
      window.location.href = '/auth/sign-in';
    }, 1000);
  }

  /**
   * Sets up global error handlers with enhanced recovery
   */
  setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', async (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a Supabase error
      if (event.reason && this.isSessionError(event.reason)) {
        event.preventDefault();
        const handled = await this.handleSupabaseError(event.reason, 'Unhandled promise rejection', {
          autoRecover: true,
          maxRetries: 2
        });
        
        if (handled) {
          console.log('Unhandled promise rejection recovered successfully');
        }
      }
    });

    // Handle global errors
    window.addEventListener('error', async (event) => {
      console.error('Global error:', event.error);
      
      if (event.error && this.isSessionError(event.error)) {
        const handled = await this.handleSupabaseError(event.error, 'Global error', {
          autoRecover: true,
          maxRetries: 2
        });
        
        if (handled) {
          console.log('Global error recovered successfully');
        }
      }
    });

    // Handle beforeunload to save state
    window.addEventListener('beforeunload', () => {
      const authStore = useAuthStore.getState();
      authStore.updateLastActivity();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        // Page became visible, check session status
        const authStore = useAuthStore.getState();
        const { session, user, initialized } = authStore;
        
        if (initialized && session && !user) {
          console.log('Page became visible, session exists but no user - attempting recovery');
          await authStore.recoverSession();
        }
      }
    });

    // Handle online/offline status
    window.addEventListener('online', async () => {
      console.log('Network connection restored');
      const authStore = useAuthStore.getState();
      const { session, user } = authStore;
      
      if (session && !user) {
        console.log('Network restored, attempting session recovery');
        await authStore.recoverSession();
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      toast.error('Network connection lost. Some features may be unavailable.');
    });
  }

  /**
   * Resets the retry counter
   */
  resetRetryCount(): void {
    this.retryCount = 0;
  }

  /**
   * Gets current retry count
   */
  getRetryCount(): number {
    return this.retryCount;
  }
}

// Create singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const handleSupabaseError = (error: any, operation?: string, config?: ErrorHandlerConfig) => 
  errorHandler.handleSupabaseError(error, operation, config);

export const withErrorHandling = <T>(
  fn: () => Promise<T>, 
  operation?: string, 
  config?: ErrorHandlerConfig
) => errorHandler.withErrorHandling(fn, operation, config);

export const resetRetryCount = () => errorHandler.resetRetryCount();
export const getRetryCount = () => errorHandler.getRetryCount();
