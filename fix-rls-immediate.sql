-- =============================================================================
-- IMMEDIATE RLS POLICY FIX FOR CONTROLS TABLE
-- Run this in Supabase SQL Editor to fix the control creation issue
-- =============================================================================

-- =============================================================================
-- STEP 1: Check current authentication and table state
-- =============================================================================

-- Check if we have proper authentication context
DO $$
BEGIN
    RAISE NOTICE 'Current user: %', auth.uid();
    RAISE NOTICE 'Current role: %', auth.role();
END $$;

-- Check current RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls_support
FROM pg_tables
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename;

-- =============================================================================
-- STEP 2: Temporarily disable RLS to clear policies safely
-- =============================================================================

-- Disable RLS temporarily to ensure we can clean up
ALTER TABLE IF EXISTS public.controls DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.control_sets DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 3: Drop ALL existing policies completely
-- =============================================================================

-- Drop all possible policy variations for controls table
DROP POLICY IF EXISTS "controls_select" ON public.controls;
DROP POLICY IF EXISTS "controls_insert" ON public.controls;
DROP POLICY IF EXISTS "controls_update" ON public.controls;
DROP POLICY IF EXISTS "controls_delete" ON public.controls;
DROP POLICY IF EXISTS "controls_select_policy" ON public.controls;
DROP POLICY IF EXISTS "controls_insert_policy" ON public.controls;
DROP POLICY IF EXISTS "controls_update_policy" ON public.controls;
DROP POLICY IF EXISTS "controls_delete_policy" ON public.controls;
DROP POLICY IF EXISTS "Users can view controls they have access to" ON public.controls;
DROP POLICY IF EXISTS "Users can create controls" ON public.controls;
DROP POLICY IF EXISTS "Users can update controls they own or created" ON public.controls;
DROP POLICY IF EXISTS "Users can delete controls they created" ON public.controls;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.controls;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.controls;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.controls;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.controls;

-- Drop all possible policy variations for control_sets table
DROP POLICY IF EXISTS "control_sets_select" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_insert" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_update" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_delete" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_select_policy" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_insert_policy" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_update_policy" ON public.control_sets;
DROP POLICY IF EXISTS "control_sets_delete_policy" ON public.control_sets;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.control_sets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.control_sets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.control_sets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.control_sets;

-- =============================================================================
-- STEP 4: Create simple, permissive policies that work with Supabase auth
-- =============================================================================

-- CONTROL_SETS policies
CREATE POLICY "control_sets_all_access" ON public.control_sets
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- CONTROLS policies - More permissive approach
CREATE POLICY "controls_all_access" ON public.controls
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- STEP 5: Re-enable RLS with new policies
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE public.control_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 6: Verify the setup
-- =============================================================================

-- Check RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename;

-- Check policies are created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename, policyname;

-- =============================================================================
-- STEP 7: Test authentication context
-- =============================================================================

-- Test current authentication (should show a UUID if authenticated)
SELECT
    auth.uid() as current_user_uuid,
    auth.role() as current_role,
    CASE
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
        WHEN auth.role() = 'authenticated' THEN 'PROPERLY AUTHENTICATED'
        ELSE 'AUTHENTICATION ISSUE'
    END as auth_status;

-- =============================================================================
-- STEP 8: Create a test control set and control (optional verification)
-- =============================================================================

-- Uncomment below to test if the fix works
/*
-- Test creating a control set
INSERT INTO public.control_sets (name, description, framework, created_by)
VALUES (
    'RLS Test Set',
    'Test control set for RLS verification',
    'TEST',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000')
)
ON CONFLICT DO NOTHING;

-- Test creating a control
INSERT INTO public.controls (
    control_set_id,
    control_code,
    title,
    description,
    control_type,
    frequency,
    process_area,
    testing_procedure,
    evidence_requirements,
    effectiveness,
    is_automated,
    created_by
) VALUES (
    (SELECT id FROM public.control_sets WHERE name = 'RLS Test Set' LIMIT 1),
    'RLS-TEST-001',
    'RLS Test Control',
    'Test control for RLS verification',
    'preventive',
    'monthly',
    'Testing',
    'Verify RLS policies work correctly',
    'Test results and logs',
    'not_tested',
    false,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000')
)
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM public.controls WHERE control_code = 'RLS-TEST-001';
DELETE FROM public.control_sets WHERE name = 'RLS Test Set';
*/

-- =============================================================================
-- ALTERNATIVE: If the above doesn't work, use these emergency policies
-- =============================================================================

/*
-- EMERGENCY FALLBACK - Use only if the above fails
-- These policies are very permissive and should only be used temporarily

DROP POLICY IF EXISTS "controls_all_access" ON public.controls;
DROP POLICY IF EXISTS "control_sets_all_access" ON public.control_sets;

-- Allow all operations for authenticated users without any restrictions
CREATE POLICY "emergency_controls_policy" ON public.controls
    AS PERMISSIVE FOR ALL TO public
    USING (true) WITH CHECK (true);

CREATE POLICY "emergency_control_sets_policy" ON public.control_sets
    AS PERMISSIVE FOR ALL TO public
    USING (true) WITH CHECK (true);
*/

-- =============================================================================
-- NOTES FOR DEBUGGING
-- =============================================================================

/*
After running this script:

1. If you still get RLS errors, the issue might be:
   - Authentication not working properly in your app
   - Wrong Supabase configuration
   - User not properly logged in

2. To debug further, run these queries in your app's browser console:

   // Check authentication
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Current user:', user);

   // Try a simple select
   const { data, error } = await supabase.from('controls').select('*').limit(1);
   console.log('Select test:', data, error);

3. If authentication is working but inserts still fail, temporarily use the
   emergency policies (uncomment the section above) for testing.

4. Check your Supabase client configuration:
   - Correct project URL
   - Correct anon key
   - User is properly authenticated

5. Verify table structure matches expectations:
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'controls' AND table_schema = 'public'
   ORDER BY ordinal_position;
*/

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'RLS POLICY FIX COMPLETED';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test control set creation in your app';
    RAISE NOTICE '2. Check browser console for any auth errors';
    RAISE NOTICE '3. If still failing, uncomment emergency policies';
    RAISE NOTICE '==============================================';
END $$;
