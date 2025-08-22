import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  retryOnSessionError?: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private isHandlingError = false;

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
    const { showToast = true, logError = true, retryOnSessionError = true } = config;

    if (this.isHandlingError) {
      return false;
    }

    this.isHandlingError = true;

    try {
      if (logError) {
        console.error(`Error in ${operation}:`, error);
      }

      // Check if it's a session-related error
      if (this.isSessionError(error) && retryOnSessionError) {
        console.log('Session error detected, attempting refresh...');
        
        const refreshSuccess = await this.refreshSession();
        
        if (refreshSuccess) {
          if (showToast) {
            toast.success('Session renewed, please try again');
          }
          this.isHandlingError = false;
          return true; // Session refreshed, retry the operation
        } else {
          // Session refresh failed
          if (showToast) {
            toast.error('Session expired. Please log in again.');
          }
          this.redirectToLogin();
          this.isHandlingError = false;
          return false;
        }
      }

      // Handle other types of errors
      if (showToast) {
        const errorMessage = this.getErrorMessage(error);
        toast.error(errorMessage);
      }

      this.isHandlingError = false;
      return false;
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      this.isHandlingError = false;
      return false;
    }
  }

  /**
   * Wraps a function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    operation: string = 'Operation',
    config: ErrorHandlerConfig = {}
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const handled = await this.handleSupabaseError(error, operation, config);
      
      if (handled) {
        // Session was refreshed, retry the operation once
        try {
          return await fn();
        } catch (retryError) {
          await this.handleSupabaseError(retryError, `${operation} (retry)`, config);
          return null;
        }
      }
      
      return null;
    }
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
   * Refreshes the session
   */
  private async refreshSession(): Promise<boolean> {
    try {
      console.log('Attempting to refresh session...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }

      if (data.session) {
        console.log('Session refreshed successfully');
        
        // Update auth store
        const authStore = useAuthStore.getState();
        authStore.setSession(data.session);
        
        return true;
      }

      console.log('No session returned from refresh');
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
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
   * Sets up global error handlers
   */
  setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a Supabase error
      if (event.reason && this.isSessionError(event.reason)) {
        event.preventDefault();
        this.handleSupabaseError(event.reason, 'Unhandled promise rejection');
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      if (event.error && this.isSessionError(event.error)) {
        this.handleSupabaseError(event.error, 'Global error');
      }
    });
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
