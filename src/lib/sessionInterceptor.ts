import { supabase } from './supabase';
import toast from 'react-hot-toast';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

class SessionInterceptor {
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  /**
   * Wraps a Supabase query with session refresh logic
   */
  async withSessionRefresh<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    config: RetryConfig = {}
  ): Promise<{ data: T | null; error: any }> {
    const { maxRetries = 2, retryDelay = 1000, onRetry } = config;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const result = await queryFn();
        
        // If successful, return the result
        if (!result.error) {
          return result;
        }

        // Check if error is session-related
        if (this.isSessionError(result.error)) {
          console.log(`Session error detected on attempt ${attempt + 1}:`, result.error);
          
          if (attempt < maxRetries) {
            // Try to refresh session
            const refreshSuccess = await this.refreshSession();
            
            if (refreshSuccess) {
              onRetry?.(attempt + 1);
              await this.delay(retryDelay);
              attempt++;
              continue;
            } else {
              // Session refresh failed, redirect to login
              this.handleSessionExpired();
              return { data: null, error: result.error };
            }
          } else {
            // Max retries reached
            this.handleSessionExpired();
            return { data: null, error: result.error };
          }
        }

        // Non-session error, return as is
        return result;
      } catch (error) {
        console.error('Query execution error:', error);
        
        if (attempt < maxRetries) {
          onRetry?.(attempt + 1);
          await this.delay(retryDelay);
          attempt++;
          continue;
        }
        
        return { data: null, error };
      }
    }

    return { data: null, error: new Error('Max retries exceeded') };
  }

  /**
   * Checks if an error is session-related
   */
  private isSessionError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return (
      errorMessage.includes('jwt') ||
      errorMessage.includes('token') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('unauthenticated') ||
      errorCode.includes('401') ||
      errorCode.includes('jwt') ||
      errorCode.includes('token')
    );
  }

  /**
   * Refreshes the session
   */
  private async refreshSession(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Performs the actual session refresh
   */
  private async performRefresh(): Promise<boolean> {
    try {
      console.log('Attempting to refresh session...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }

      if (data.session) {
        console.log('Session refreshed successfully');
        toast.success('Session renewed automatically');
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
   * Handles session expiration
   */
  private handleSessionExpired(): void {
    console.log('Session expired, redirecting to login...');
    toast.error('Session expired. Please log in again.');
    
    // Clear any stored session data
    localStorage.removeItem('auth-store');
    sessionStorage.removeItem('auth-store');
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = '/auth/sign-in';
    }, 1000);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a wrapped Supabase client with session refresh
   */
  createWrappedClient() {
    const originalFrom = supabase.from;
    
    return {
      ...supabase,
      from: (table: string) => {
        const originalSelect = originalFrom.call(supabase, table).select;
        const originalInsert = originalFrom.call(supabase, table).insert;
        const originalUpdate = originalFrom.call(supabase, table).update;
        const originalDelete = originalFrom.call(supabase, table).delete;
        
        return {
          ...originalFrom.call(supabase, table),
          select: (...args: any[]) => {
            return this.withSessionRefresh(() => originalSelect.apply(originalFrom.call(supabase, table), args));
          },
          insert: (...args: any[]) => {
            return this.withSessionRefresh(() => originalInsert.apply(originalFrom.call(supabase, table), args));
          },
          update: (...args: any[]) => {
            return this.withSessionRefresh(() => originalUpdate.apply(originalFrom.call(supabase, table), args));
          },
          delete: (...args: any[]) => {
            return this.withSessionRefresh(() => originalDelete.apply(originalFrom.call(supabase, table), args));
          }
        };
      }
    };
  }
}

// Create singleton instance
export const sessionInterceptor = new SessionInterceptor();

// Export wrapped client
export const supabaseWithSessionRefresh = sessionInterceptor.createWrappedClient();
