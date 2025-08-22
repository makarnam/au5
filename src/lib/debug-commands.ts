// Debug Commands for Session Recovery
// Bu dosya console'da kullanılabilecek debug komutlarını içerir

import { useAuthStore } from '../store/authStore';
import { autoRecoverSession, checkSessionHealth, debugSession } from './sessionDebugger';

// Debug komutları
export const debugCommands = {
  // Auth store durumunu kontrol et
  checkAuth: () => {
    const authStore = useAuthStore.getState();
    console.log('🔍 Auth Store Status:', {
      user: authStore.user ? 'Present' : 'Missing',
      session: authStore.session ? 'Present' : 'Missing',
      loading: authStore.loading,
      initialized: authStore.initialized,
      lastActivity: new Date(authStore.lastActivity).toLocaleString(),
      recoveryAttempts: authStore.sessionRecoveryAttempts,
      isRecovering: authStore.isRecovering
    });
    return authStore;
  },

  // Session'ı zorla yenile
  forceRefresh: async () => {
    console.log('🔄 Force refreshing session...');
    const authStore = useAuthStore.getState();
    const success = await authStore.refreshSession();
    console.log('Refresh result:', success);
    return success;
  },

  // Session'ı kurtar
  recover: async () => {
    console.log('🔄 Recovering session...');
    const authStore = useAuthStore.getState();
    const success = await authStore.recoverSession();
    console.log('Recovery result:', success);
    return success;
  },

  // Auth store'u sıfırla
  reset: () => {
    console.log('🔄 Resetting auth store...');
    const authStore = useAuthStore.getState();
    authStore.setUser(null);
    authStore.setSession(null);
    authStore.setLoading(false);
    authStore.resetRecoveryAttempts();
    console.log('Auth store reset complete');
  },

  // Initialize'i tekrar çalıştır
  reinitialize: async () => {
    console.log('🔄 Reinitializing auth...');
    const authStore = useAuthStore.getState();
    await authStore.initialize();
    console.log('Reinitialization complete');
  },

  // Session health check
  health: async () => {
    console.log('🏥 Checking session health...');
    const health = await checkSessionHealth();
    console.log('Health status:', health);
    return health;
  },

  // Auto recovery test
  autoRecover: async () => {
    console.log('🔄 Testing auto recovery...');
    const success = await autoRecoverSession();
    console.log('Auto recovery result:', success);
    return success;
  },

  // Full debug
  debug: async () => {
    console.log('🔍 Full debug session...');
    await debugSession();
  },

  // Test login
  testLogin: async (email: string, password: string) => {
    console.log('🧪 Testing login...');
    const authStore = useAuthStore.getState();
    const success = await authStore.signIn(email, password);
    console.log('Login result:', success);
    return success;
  },

  // Test signup
  testSignup: async (email: string, password: string, firstName: string, lastName: string) => {
    console.log('🧪 Testing signup...');
    const authStore = useAuthStore.getState();
    const success = await authStore.signUp(email, password, firstName, lastName);
    console.log('Signup result:', success);
    return success;
  },

  // Test signout
  testSignout: async () => {
    console.log('🧪 Testing signout...');
    const authStore = useAuthStore.getState();
    await authStore.signOut();
    console.log('Signout complete');
  },

  // Clear storage
  clearStorage: () => {
    console.log('🧹 Clearing storage...');
    localStorage.removeItem('auth-store');
    localStorage.removeItem('au5-auth-token');
    sessionStorage.removeItem('auth-store');
    console.log('Storage cleared');
  },

  // Check network
  checkNetwork: () => {
    console.log('🌐 Network status:', {
      online: navigator.onLine,
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    });
  },

  // Check visibility
  checkVisibility: () => {
    console.log('👁️ Visibility status:', {
      hidden: document.hidden,
      visibilityState: document.visibilityState
    });
  }
};

// Window'a ekle
if (typeof window !== 'undefined') {
  (window as any).debug = debugCommands;
  
  // Kısa komutlar
  (window as any).auth = debugCommands.checkAuth;
  (window as any).refresh = debugCommands.forceRefresh;
  (window as any).recover = debugCommands.recover;
  (window as any).reset = debugCommands.reset;
  (window as any).init = debugCommands.reinitialize;
  (window as any).health = debugCommands.health;
  (window as any).auto = debugCommands.autoRecover;
  (window as any).debug = debugCommands.debug;
  (window as any).login = debugCommands.testLogin;
  (window as any).signup = debugCommands.testSignup;
  (window as any).signout = debugCommands.testSignout;
  (window as any).clear = debugCommands.clearStorage;
  (window as any).network = debugCommands.checkNetwork;
  (window as any).visibility = debugCommands.checkVisibility;
}

// Export
export default debugCommands;
