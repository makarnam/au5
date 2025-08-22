import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';

export class SessionDebugger {
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

      // 7. Recommendations
      console.log('\n7. Recommendations:');
      if (!sessionData.session) {
        console.log('💡 No session found - user needs to log in');
      } else if (sessionData.session.expires_at < Math.floor(Date.now() / 1000)) {
        console.log('💡 Session expired - try refreshing the page or logging in again');
      } else if (!authStore.user) {
        console.log('💡 Session exists but user profile not loaded - check auth store initialization');
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
}

// Export convenience functions
export const debugSession = () => SessionDebugger.debugSession();
export const forceRefreshSession = () => SessionDebugger.forceRefreshSession();
export const clearSessionData = () => SessionDebugger.clearSessionData();
export const testDatabaseOperations = () => SessionDebugger.testDatabaseOperations();

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).sessionDebug = {
    debug: debugSession,
    refresh: forceRefreshSession,
    clear: clearSessionData,
    test: testDatabaseOperations
  };
}
