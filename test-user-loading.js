// Simple test script to verify user loading functionality
// This can be run in the browser console to test the different services

console.log('Testing User Loading Services...');

// Test 1: Direct Supabase query
async function testDirectQuery() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabase = createClient(
      'https://iuxhefuorkpbmwxmxtqd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4'
    );
    
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('Direct Query Result:', { data, error, count });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Direct Query Error:', err);
    return { success: false, error: err };
  }
}

// Test 2: Query with business unit join
async function testJoinQuery() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabase = createClient(
      'https://iuxhefuorkpbmwxmxtqd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4'
    );
    
    const { data, error, count } = await supabase
      .from('users')
      .select(`
        *,
        business_unit:business_units(name, code)
      `, { count: 'exact' })
      .limit(5);
    
    console.log('Join Query Result:', { data, error, count });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Join Query Error:', err);
    return { success: false, error: err };
  }
}

// Test 3: Query with search (the problematic one)
async function testSearchQuery() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabase = createClient(
      'https://iuxhefuorkpbmwxmxtqd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4'
    );
    
    const { data, error, count } = await supabase
      .from('users')
      .select(`
        *,
        business_unit:business_units(name, code)
      `, { count: 'exact' })
      .or(`first_name.ilike.%admin%,last_name.ilike.%admin%,email.ilike.%admin%`)
      .limit(5);
    
    console.log('Search Query Result:', { data, error, count });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Search Query Error:', err);
    return { success: false, error: err };
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Starting User Loading Tests ===');
  
  console.log('\n1. Testing Direct Query...');
  const directResult = await testDirectQuery();
  
  console.log('\n2. Testing Join Query...');
  const joinResult = await testJoinQuery();
  
  console.log('\n3. Testing Search Query...');
  const searchResult = await testSearchQuery();
  
  console.log('\n=== Test Results Summary ===');
  console.log('Direct Query:', directResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Join Query:', joinResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Search Query:', searchResult.success ? '✅ PASS' : '❌ FAIL');
  
  if (!directResult.success) {
    console.error('Direct query failed:', directResult.error);
  }
  if (!joinResult.success) {
    console.error('Join query failed:', joinResult.error);
  }
  if (!searchResult.success) {
    console.error('Search query failed:', searchResult.error);
  }
  
  return { directResult, joinResult, searchResult };
}

// Export for use in browser console
window.testUserLoading = {
  testDirectQuery,
  testJoinQuery,
  testSearchQuery,
  runAllTests
};

console.log('User loading tests ready. Run testUserLoading.runAllTests() to test.');
