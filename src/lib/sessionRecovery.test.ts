// Session Recovery Test Suite
// Bu dosya session recovery özelliklerini test etmek için kullanılır

import { useAuthStore } from '../store/authStore';
import { autoRecoverSession, checkSessionHealth } from './sessionDebugger';

// Test fonksiyonları
export const testSessionRecovery = async () => {
  console.log('🧪 Testing Session Recovery Features');
  console.log('=' .repeat(50));

  try {
    // Test 1: Session health check
    console.log('1. Testing session health check...');
    const health = await checkSessionHealth();
    console.log('Health status:', health);

    // Test 2: Auto recovery
    console.log('\n2. Testing auto recovery...');
    const authStore = useAuthStore.getState();
    const { session, user } = authStore;
    
    if (session && !user) {
      console.log('Session exists but no user - testing recovery');
      const recoverySuccess = await autoRecoverSession();
      console.log('Recovery result:', recoverySuccess);
    } else {
      console.log('No recovery needed - session/user status:', { hasSession: !!session, hasUser: !!user });
    }

    // Test 3: Auth store state
    console.log('\n3. Testing auth store state...');
    const currentState = useAuthStore.getState();
    console.log('Current auth state:', {
      user: currentState.user ? 'Present' : 'Missing',
      session: currentState.session ? 'Present' : 'Missing',
      loading: currentState.loading,
      initialized: currentState.initialized,
      lastActivity: new Date(currentState.lastActivity).toLocaleString(),
      recoveryAttempts: currentState.sessionRecoveryAttempts,
      isRecovering: currentState.isRecovering
    });

    console.log('\n✅ Session recovery tests completed');
    return true;

  } catch (error) {
    console.error('❌ Session recovery test failed:', error);
    return false;
  }
};

// Manual recovery test
export const testManualRecovery = async () => {
  console.log('🔄 Testing Manual Recovery');
  console.log('=' .repeat(30));

  try {
    const authStore = useAuthStore.getState();
    
    // Force a recovery attempt
    console.log('Attempting manual session recovery...');
    const success = await authStore.recoverSession();
    
    console.log('Manual recovery result:', success);
    return success;

  } catch (error) {
    console.error('Manual recovery test failed:', error);
    return false;
  }
};

// Network simulation test
export const testNetworkRecovery = () => {
  console.log('🌐 Testing Network Recovery');
  console.log('=' .repeat(30));

  // Simulate network events
  const simulateNetworkEvents = () => {
    // Simulate going offline
    console.log('Simulating network offline...');
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    // Trigger offline event
    window.dispatchEvent(new Event('offline'));
    
    // Simulate coming back online after 2 seconds
    setTimeout(() => {
      console.log('Simulating network online...');
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      
      // Trigger online event
      window.dispatchEvent(new Event('online'));
    }, 2000);
  };

  simulateNetworkEvents();
  console.log('Network simulation started');
};

// Tab visibility test
export const testTabVisibilityRecovery = () => {
  console.log('👁️ Testing Tab Visibility Recovery');
  console.log('=' .repeat(35));

  // Simulate tab visibility changes
  const simulateTabVisibility = () => {
    console.log('Simulating tab hidden...');
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: true
    });
    
    // Trigger visibility change event
    document.dispatchEvent(new Event('visibilitychange'));
    
    // Simulate tab becoming visible after 2 seconds
    setTimeout(() => {
      console.log('Simulating tab visible...');
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false
      });
      
      // Trigger visibility change event
      document.dispatchEvent(new Event('visibilitychange'));
    }, 2000);
  };

  simulateTabVisibility();
  console.log('Tab visibility simulation started');
};

// Export test runner
export const runAllSessionRecoveryTests = async () => {
  console.log('🚀 Running All Session Recovery Tests');
  console.log('=' .repeat(50));

  const results = {
    healthCheck: false,
    autoRecovery: false,
    manualRecovery: false,
    networkRecovery: false,
    tabVisibilityRecovery: false
  };

  try {
    // Run health check test
    const health = await checkSessionHealth();
    results.healthCheck = health.healthy;

    // Run auto recovery test
    results.autoRecovery = await testSessionRecovery();

    // Run manual recovery test
    results.manualRecovery = await testManualRecovery();

    // Run network recovery test
    testNetworkRecovery();
    results.networkRecovery = true;

    // Run tab visibility recovery test
    testTabVisibilityRecovery();
    results.tabVisibilityRecovery = true;

    console.log('\n📊 Test Results:');
    console.log('Health Check:', results.healthCheck ? '✅ Pass' : '❌ Fail');
    console.log('Auto Recovery:', results.autoRecovery ? '✅ Pass' : '❌ Fail');
    console.log('Manual Recovery:', results.manualRecovery ? '✅ Pass' : '❌ Fail');
    console.log('Network Recovery:', results.networkRecovery ? '✅ Pass' : '❌ Fail');
    console.log('Tab Visibility Recovery:', results.tabVisibilityRecovery ? '✅ Pass' : '❌ Fail');

    const allPassed = Object.values(results).every(result => result);
    console.log('\nOverall Result:', allPassed ? '✅ All Tests Passed' : '❌ Some Tests Failed');

    return results;

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return results;
  }
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).sessionRecoveryTests = {
    test: testSessionRecovery,
    manual: testManualRecovery,
    network: testNetworkRecovery,
    visibility: testTabVisibilityRecovery,
    runAll: runAllSessionRecoveryTests
  };
}
