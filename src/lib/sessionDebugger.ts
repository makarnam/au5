import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';

export class SessionDebugger {
  private static isMonitoring = false;
  private static monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Debug session status and provide recommendations
   */
  static async debugSession(): Promise<void> {
    console.log('\n🔍 SESSION DEBUG REPORT');
    console.log('=' .repeat(50));

    try {
      // 1. Check Supabase client
      console.log('1. Supabase Client Status:');
      if (typeof supabase === 'undefined') {
        console.log('❌ Supabase client not available');
        return;
      }
      console.log('✅ Supabase client available');

      // 2. Check current session
      console.log('\n2. Current Session:');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('❌ Session error:', sessionError);
      } else if (sessionData.session) {
        console.log('✅ Active session found');
        console.log('   User ID:', sessionData.session.user?.id);
        console.log('   Email:', sessionData.session.user?.email);
        console.log('   Expires:', new Date(sessionData.session.expires_at * 1000).toLocaleString());
        
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        if (sessionData.session.expires_at < now) {
          console.log('⚠️  Session is expired!');
        } else {
          console.log('✅ Session is valid');
        }
      } else {
        console.log('❌ No active session');
      }

      // 3. Check current user
      console.log('\n3. Current User:');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.log('❌ User error:', userError);
      } else if (userData.user) {
        console.log('✅ User authenticated');
        console.log('   ID:', userData.user.id);
        console.log('   Email:', userData.user.email);
      } else {
        console.log('❌ No authenticated user');
      }

      // 4. Check auth store
      console.log('\n4. Auth Store Status:');
      const authStore = useAuthStore.getState();
      console.log('   User:', authStore.user ? '✅ Loaded' : '❌ Not loaded');
      console.log('   Session:', authStore.session ? '✅ Available' : '❌ Not available');
      console.log('   Loading:', authStore.loading ? '⏳ Yes' : '✅ No');
      console.log('   Initialized:', authStore.initialized ? '✅ Yes' : '❌ No');
      console.log('   Last Activity:', new Date(authStore.lastActivity).toLocaleString());
      console.log('   Recovery Attempts:', authStore.sessionRecoveryAttempts);
      console.log('   Is Recovering:', authStore.isRecovering ? '⏳ Yes' : '✅ No');

      // 5. Test database connection
      console.log('\n5. Database Connection Test:');
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          console.log('❌ Database error:', error.message);
        } else {
          console.log('✅ Database connection successful');
        }
      } catch (error) {
        console.log('❌ Database connection failed:', error);
      }

      // 6. Check storage
      console.log('\n6. Storage Status:');
      try {
        const authToken = localStorage.getItem('au5-auth-token');
        const authStore = localStorage.getItem('auth-store');
        
        console.log('   Auth token:', authToken ? '✅ Present' : '❌ Missing');
        console.log('   Auth store:', authStore ? '✅ Present' : '❌ Missing');
      } catch (error) {
        console.log('❌ Storage access error:', error);
      }

      // 7. Check network status
      console.log('\n7. Network Status:');
      console.log('   Online:', navigator.onLine ? '✅ Yes' : '❌ No');
      console.log('   Page Visibility:', document.hidden ? '❌ Hidden' : '✅ Visible');

      // 8. Recommendations
      console.log('\n8. Recommendations:');
      if (!sessionData.session) {
        console.log('💡 No session found - user needs to log in');
      } else if (sessionData.session.expires_at < Math.floor(Date.now() / 1000)) {
        console.log('💡 Session expired - try refreshing the page or logging in again');
      } else if (!authStore.user) {
        console.log('💡 Session exists but user profile not loaded - check auth store initialization');
      } else if (authStore.sessionRecoveryAttempts > 0) {
        console.log('💡 Session recovery attempts detected - consider manual recovery');
      } else {
        console.log('💡 Session appears healthy');
      }

    } catch (error) {
      console.error('❌ Debug error:', error);
    }

    console.log('\n' + '=' .repeat(50));
  }

  /**
   * Force refresh session
   */
  static async forceRefreshSession(): Promise<boolean> {
    console.log('🔄 Force refreshing session...');
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh failed:', error);
        return false;
      }

      if (data.session) {
        console.log('✅ Session refreshed successfully');
        
        // Update auth store
        const authStore = useAuthStore.getState();
        authStore.setSession(data.session);
        
        return true;
      } else {
        console.log('❌ No session returned from refresh');
        return false;
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      return false;
    }
  }

  /**
   * Clear all session data
   */
  static clearSessionData(): void {
    console.log('🧹 Clearing session data...');
    
    try {
      // Clear auth store
      const authStore = useAuthStore.getState();
      authStore.setUser(null);
      authStore.setSession(null);
      
      // Clear storage
      localStorage.removeItem('au5-auth-token');
      localStorage.removeItem('auth-store');
      sessionStorage.removeItem('auth-store');
      
      console.log('✅ Session data cleared');
    } catch (error) {
      console.error('❌ Error clearing session data:', error);
    }
  }

  /**
   * Test database operations with error handling
   */
  static async testDatabaseOperations(): Promise<void> {
    console.log('\n🧪 Testing Database Operations');
    console.log('=' .repeat(50));

    try {
      // Test 1: Simple select
      console.log('1. Testing simple select...');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);
      
      if (usersError) {
        console.log('❌ Users select failed:', usersError.message);
      } else {
        console.log('✅ Users select successful');
      }

      // Test 2: Insert (if user has permission)
      console.log('\n2. Testing insert permission...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: insertError } = await supabase
          .from('audit_logs')
          .insert([{
            user_id: user.id,
            action: 'test_operation',
            entity_type: 'test',
            entity_id: 'test',
            ip_address: '127.0.0.1',
            user_agent: 'SessionDebugger',
            created_at: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.log('❌ Insert test failed:', insertError.message);
        } else {
          console.log('✅ Insert test successful');
        }
      } else {
        console.log('⚠️  No user for insert test');
      }

    } catch (error) {
      console.error('❌ Database test error:', error);
    }

    console.log('\n' + '=' .repeat(50));
  }

  /**
   * Start monitoring session health
   */
  static startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.log('⚠️  Session monitoring already active');
      return;
    }

    console.log('🔍 Starting session monitoring...');
    this.isMonitoring = true;

    // Clear any existing interval
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const authStore = useAuthStore.getState();
        const { session, user, initialized } = authStore;

        // Only check if initialized and not already recovering
        if (!initialized || authStore.isRecovering) {
          return;
        }

        // Check if session exists but user is missing
        if (session && !user) {
          console.log('⚠️  Session monitoring: Session exists but no user - attempting recovery');
          await authStore.recoverSession();
        }

        // Check if session is expired
        if (session && session.expires_at) {
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = session.expires_at - now;
          
          if (timeUntilExpiry < 300) { // Less than 5 minutes
            console.log('⚠️  Session monitoring: Session expiring soon - refreshing');
            await authStore.refreshSession();
          }
        }

        // Check if recovery attempts are too high
        if (authStore.sessionRecoveryAttempts >= 3) {
          console.log('⚠️  Session monitoring: Too many recovery attempts - clearing session');
          this.clearSessionData();
        }

      } catch (error) {
        console.error('❌ Session monitoring error:', error);
      }
    }, intervalMs);

    console.log('✅ Session monitoring started');
  }

  /**
   * Stop monitoring session health
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('⚠️  Session monitoring not active');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log('✅ Session monitoring stopped');
  }

  /**
   * Get monitoring status
   */
  static getMonitoringStatus(): boolean {
    return this.isMonitoring;
  }

  /**
   * Auto-recover session if needed
   */
  static async autoRecover(): Promise<boolean> {
    console.log('🔄 Auto-recovering session...');
    
    try {
      const authStore = useAuthStore.getState();
      const { session, user, initialized } = authStore;

      if (!initialized) {
        console.log('⚠️  Auth store not initialized');
        return false;
      }

      if (!session) {
        console.log('⚠️  No session to recover');
        return false;
      }

      if (user) {
        console.log('✅ User already loaded, no recovery needed');
        return true;
      }

      console.log('🔄 Attempting session recovery...');
      const success = await authStore.recoverSession();
      
      if (success) {
        console.log('✅ Auto-recovery successful');
      } else {
        console.log('❌ Auto-recovery failed');
      }

      return success;
    } catch (error) {
      console.error('❌ Auto-recovery error:', error);
      return false;
    }
  }

  /**
   * Check session health and return status
   */
  static async checkSessionHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const authStore = useAuthStore.getState();
      const { session, user, initialized } = authStore;

      if (!initialized) {
        issues.push('Auth store not initialized');
        recommendations.push('Wait for initialization to complete');
      }

      if (!session) {
        issues.push('No active session');
        recommendations.push('User needs to log in');
      } else {
        // Check session expiry
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at < now) {
          issues.push('Session expired');
          recommendations.push('Session needs to be refreshed');
        }

        // Check if user profile is loaded
        if (!user) {
          issues.push('Session exists but user profile not loaded');
          recommendations.push('Attempt session recovery');
        }
      }

      // Check recovery attempts
      if (authStore.sessionRecoveryAttempts >= 3) {
        issues.push('Too many recovery attempts');
        recommendations.push('Clear session and re-authenticate');
      }

      // Check network status
      if (!navigator.onLine) {
        issues.push('Network connection lost');
        recommendations.push('Check internet connection');
      }

      const healthy = issues.length === 0;

      return {
        healthy,
        issues,
        recommendations
      };

    } catch (error) {
      console.error('❌ Session health check error:', error);
      return {
        healthy: false,
        issues: ['Health check failed'],
        recommendations: ['Check console for errors']
      };
    }
  }
}

// Export convenience functions
export const debugSession = () => SessionDebugger.debugSession();
export const forceRefreshSession = () => SessionDebugger.forceRefreshSession();
export const clearSessionData = () => SessionDebugger.clearSessionData();
export const testDatabaseOperations = () => SessionDebugger.testDatabaseOperations();
export const startSessionMonitoring = (intervalMs?: number) => SessionDebugger.startMonitoring(intervalMs);
export const stopSessionMonitoring = () => SessionDebugger.stopMonitoring();
export const getMonitoringStatus = () => SessionDebugger.getMonitoringStatus();
export const autoRecoverSession = () => SessionDebugger.autoRecover();
export const checkSessionHealth = () => SessionDebugger.checkSessionHealth();

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).sessionDebug = {
    debug: debugSession,
    refresh: forceRefreshSession,
    clear: clearSessionData,
    test: testDatabaseOperations,
    monitor: startSessionMonitoring,
    stopMonitor: stopSessionMonitoring,
    monitoringStatus: getMonitoringStatus,
    autoRecover: autoRecoverSession,
    health: checkSessionHealth
  };
}
