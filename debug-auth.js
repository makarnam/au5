// =============================================================================
// SUPABASE AUTHENTICATION DEBUGGER
// Run this in your browser console to debug RLS authentication issues
// =============================================================================

console.log('🔍 Starting Supabase Authentication Debug...');

// Helper function to format output
function debugLog(title, data, isError = false) {
  const emoji = isError ? '❌' : '✅';
  console.log(`${emoji} ${title}:`, data);
}

// Debug function to check authentication status
async function debugSupabaseAuth() {
  try {
    console.log('\n🚀 SUPABASE AUTHENTICATION DEBUG REPORT');
    console.log('=' .repeat(50));

    // 1. Check if supabase is available
    if (typeof supabase === 'undefined') {
      debugLog('Supabase Client', 'NOT AVAILABLE - supabase object not found', true);
      console.log('💡 Make sure you\'re on a page where supabase is loaded');
      return;
    }

    debugLog('Supabase Client', 'Available ✓');

    // 2. Check current session
    console.log('\n📋 SESSION INFORMATION:');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      debugLog('Session Error', sessionError, true);
    } else {
      debugLog('Session Status', sessionData.session ? 'Active' : 'No active session');
      if (sessionData.session) {
        debugLog('Access Token', sessionData.session.access_token ? 'Present' : 'Missing');
        debugLog('User ID', sessionData.session.user?.id || 'Not found');
        debugLog('User Email', sessionData.session.user?.email || 'Not found');
        debugLog('Session Expires', new Date(sessionData.session.expires_at * 1000).toLocaleString());
      }
    }

    // 3. Check current user
    console.log('\n👤 USER INFORMATION:');
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      debugLog('User Error', userError, true);
    } else {
      debugLog('User Object', userData.user ? 'Available' : 'Not available');
      if (userData.user) {
        debugLog('User ID', userData.user.id);
        debugLog('User Email', userData.user.email);
        debugLog('User Role', userData.user.role || 'No role specified');
        debugLog('Email Confirmed', userData.user.email_confirmed_at ? 'Yes' : 'No');
        debugLog('Last Sign In', userData.user.last_sign_in_at ? new Date(userData.user.last_sign_in_at).toLocaleString() : 'Never');
      }
    }

    // 4. Test database connectivity with auth context
    console.log('\n🗄️ DATABASE CONNECTIVITY TEST:');

    // Test simple select on control_sets
    try {
      const { data: controlSetsData, error: controlSetsError } = await supabase
        .from('control_sets')
        .select('id, name, created_by')
        .limit(1);

      if (controlSetsError) {
        debugLog('Control Sets Query', controlSetsError.message, true);
      } else {
        debugLog('Control Sets Query', `Success - Found ${controlSetsData.length} records`);
      }
    } catch (e) {
      debugLog('Control Sets Query', e.message, true);
    }

    // Test simple select on controls
    try {
      const { data: controlsData, error: controlsError } = await supabase
        .from('controls')
        .select('id, title, created_by')
        .limit(1);

      if (controlsError) {
        debugLog('Controls Query', controlsError.message, true);
      } else {
        debugLog('Controls Query', `Success - Found ${controlsData.length} records`);
      }
    } catch (e) {
      debugLog('Controls Query', e.message, true);
    }

    // 5. Test insert permissions
    console.log('\n🔧 INSERT PERMISSION TEST:');

    const testControlSetData = {
      name: `Debug Test ${Date.now()}`,
      description: 'Test control set for debugging RLS policies',
      framework: 'DEBUG',
      created_by: userData.user?.id
    };

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('control_sets')
        .insert(testControlSetData)
        .select()
        .single();

      if (insertError) {
        debugLog('Control Set Insert Test', insertError.message, true);

        // Check specific error types
        if (insertError.message.includes('row-level security')) {
          console.log('🔒 RLS POLICY ISSUE DETECTED');
          console.log('The user is authenticated but RLS policies are blocking the insert.');
          console.log('Run the RLS fix script in Supabase SQL Editor.');
        }
      } else {
        debugLog('Control Set Insert Test', 'Success - Insert worked!');

        // Clean up test data
        await supabase
          .from('control_sets')
          .delete()
          .eq('id', insertData.id);
        console.log('🧹 Test data cleaned up');
      }
    } catch (e) {
      debugLog('Control Set Insert Test', e.message, true);
    }

    // 6. Check RLS policies (if we can query them)
    console.log('\n🛡️ RLS POLICY CHECK:');
    try {
      const { data: policyData, error: policyError } = await supabase
        .rpc('check_rls_policies');

      if (policyError) {
        debugLog('RLS Policy Check', 'Cannot query policies (this is normal)', false);
      } else {
        debugLog('RLS Policy Check', policyData);
      }
    } catch (e) {
      debugLog('RLS Policy Check', 'Cannot query policies (this is normal)', false);
    }

    // 7. Environment check
    console.log('\n🌍 ENVIRONMENT CHECK:');
    debugLog('Current URL', window.location.href);
    debugLog('Supabase URL', supabase.supabaseUrl || 'Not available');
    debugLog('Browser', navigator.userAgent.split(')')[0] + ')');

    // 8. Summary and recommendations
    console.log('\n📋 SUMMARY & RECOMMENDATIONS:');
    console.log('=' .repeat(50));

    if (!userData.user) {
      console.log('❌ ISSUE: User not authenticated');
      console.log('💡 SOLUTION: Make sure user is logged in');
      console.log('   - Check login form');
      console.log('   - Verify Supabase auth configuration');
      console.log('   - Check for auth redirects');
    } else if (sessionError) {
      console.log('❌ ISSUE: Session error detected');
      console.log('💡 SOLUTION: Refresh authentication');
      console.log('   - Log out and log back in');
      console.log('   - Check token expiration');
    } else {
      console.log('✅ Authentication appears to be working');
      console.log('💡 If you\'re still getting RLS errors:');
      console.log('   1. Run the RLS fix script in Supabase SQL Editor');
      console.log('   2. Check that created_by field matches auth.uid()');
      console.log('   3. Verify RLS policies are properly configured');
    }

    console.log('\n🚀 Debug complete!');

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Auto-run the debug function
debugSupabaseAuth();

// Also provide manual functions for additional testing
window.debugSupabaseAuth = debugSupabaseAuth;

// Test specific operations
window.testControlSetInsert = async function() {
  console.log('🧪 Testing Control Set Insert...');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ User not authenticated');
      return;
    }

    const testData = {
      name: `Manual Test ${Date.now()}`,
      description: 'Manual test control set',
      framework: 'MANUAL_TEST',
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('control_sets')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.log('❌ Insert failed:', error);
    } else {
      console.log('✅ Insert successful:', data);

      // Clean up
      await supabase.from('control_sets').delete().eq('id', data.id);
      console.log('🧹 Test data cleaned up');
    }
  } catch (e) {
    console.log('❌ Test error:', e);
  }
};

window.testControlInsert = async function() {
  console.log('🧪 Testing Control Insert...');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ User not authenticated');
      return;
    }

    // First create a test control set
    const controlSetData = {
      name: `Control Test ${Date.now()}`,
      description: 'Test control set for control testing',
      framework: 'CONTROL_TEST',
      created_by: user.id
    };

    const { data: controlSet, error: csError } = await supabase
      .from('control_sets')
      .insert(controlSetData)
      .select()
      .single();

    if (csError) {
      console.log('❌ Control set creation failed:', csError);
      return;
    }

    console.log('✅ Control set created for testing');

    // Now test control insert
    const controlData = {
      control_set_id: controlSet.id,
      control_code: 'TEST-001',
      title: 'Test Control',
      description: 'Test control for RLS debugging',
      control_type: 'preventive',
      frequency: 'monthly',
      process_area: 'Testing',
      testing_procedure: 'Manual test',
      evidence_requirements: 'Test evidence',
      effectiveness: 'not_tested',
      is_automated: false,
      created_by: user.id
    };

    const { data: control, error: controlError } = await supabase
      .from('controls')
      .insert(controlData)
      .select()
      .single();

    if (controlError) {
      console.log('❌ Control insert failed:', controlError);
    } else {
      console.log('✅ Control insert successful:', control);
    }

    // Clean up
    await supabase.from('controls').delete().eq('control_set_id', controlSet.id);
    await supabase.from('control_sets').delete().eq('id', controlSet.id);
    console.log('🧹 All test data cleaned up');

  } catch (e) {
    console.log('❌ Test error:', e);
  }
};

console.log('\n🛠️ AVAILABLE DEBUG FUNCTIONS:');
console.log('- debugSupabaseAuth() - Run full authentication debug');
console.log('- testControlSetInsert() - Test control set insertion');
console.log('- testControlInsert() - Test control insertion');
console.log('\nJust call any of these functions in the console!');
