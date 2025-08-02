-- =============================================================================
-- Fix RLS Policies for Controls and Control Sets Tables
-- Run this in Supabase SQL Editor to fix Row Level Security policy issues
-- =============================================================================

-- =============================================================================
-- STEP 1: Check current state
-- =============================================================================

-- Check current RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('controls', 'control_sets');

-- Check existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename, policyname;

-- =============================================================================
-- STEP 2: Drop all existing policies for clean slate
-- =============================================================================

-- Drop all existing policies for controls
DROP POLICY IF EXISTS "Users can view controls they have access to" ON controls;
DROP POLICY IF EXISTS "Users can create controls" ON controls;
DROP POLICY IF EXISTS "Users can update controls they own or created" ON controls;
DROP POLICY IF EXISTS "Users can delete controls they created" ON controls;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON controls;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON controls;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON controls;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON controls;
DROP POLICY IF EXISTS "controls_select_policy" ON controls;
DROP POLICY IF EXISTS "controls_insert_policy" ON controls;
DROP POLICY IF EXISTS "controls_update_policy" ON controls;
DROP POLICY IF EXISTS "controls_delete_policy" ON controls;

-- Drop all existing policies for control_sets
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "control_sets_select_policy" ON control_sets;
DROP POLICY IF EXISTS "control_sets_insert_policy" ON control_sets;
DROP POLICY IF EXISTS "control_sets_update_policy" ON control_sets;
DROP POLICY IF EXISTS "control_sets_delete_policy" ON control_sets;

-- =============================================================================
-- STEP 3: Create new simplified policies for control_sets
-- =============================================================================

-- Control Sets: Allow all authenticated users to read
CREATE POLICY "control_sets_select" ON control_sets
    FOR SELECT
    TO authenticated
    USING (true);

-- Control Sets: Allow creating if user is authenticated (they become the creator)
CREATE POLICY "control_sets_insert" ON control_sets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Control Sets: Allow updating own control sets
CREATE POLICY "control_sets_update" ON control_sets
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- Control Sets: Allow deleting own control sets
CREATE POLICY "control_sets_delete" ON control_sets
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- =============================================================================
-- STEP 4: Create new simplified policies for controls
-- =============================================================================

-- Controls: Allow all authenticated users to read
CREATE POLICY "controls_select" ON controls
    FOR SELECT
    TO authenticated
    USING (true);

-- Controls: Allow creating if user is authenticated (they become the creator)
CREATE POLICY "controls_insert" ON controls
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Controls: Allow updating own controls or controls they own
CREATE POLICY "controls_update" ON controls
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = created_by OR
        auth.uid() = owner_id
    );

-- Controls: Allow deleting own controls
CREATE POLICY "controls_delete" ON controls
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- =============================================================================
-- STEP 5: Ensure RLS is enabled
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 6: Test the current user authentication
-- =============================================================================

-- Check current user
SELECT
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- =============================================================================
-- STEP 7: Verification
-- =============================================================================

-- Verify RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('controls', 'control_sets');

-- Verify policies are created
SELECT
    tablename,
    policyname,
    cmd as operation,
    permissive
FROM pg_policies
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename, policyname;

-- =============================================================================
-- TROUBLESHOOTING: If issues persist, run these diagnostic queries
-- =============================================================================

/*
-- Check if user is properly authenticated
SELECT auth.uid(), auth.role();

-- Check table structure for required columns
\d controls
\d control_sets

-- If you need to temporarily disable RLS for testing (NOT for production):
-- ALTER TABLE controls DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE control_sets DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing:
-- ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;

-- For extreme debugging, create temporary permissive policy:
-- CREATE POLICY "temp_allow_all_controls" ON controls FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "temp_allow_all_control_sets" ON control_sets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Remember to drop temporary policies:
-- DROP POLICY "temp_allow_all_controls" ON controls;
-- DROP POLICY "temp_allow_all_control_sets" ON control_sets;
*/

-- =============================================================================
-- NOTES
-- =============================================================================

/*
This script creates simple but secure RLS policies:

1. READ: All authenticated users can read all control sets and controls
2. CREATE: Users can create new records (they automatically become the creator)
3. UPDATE: Users can update records they created or own
4. DELETE: Users can delete records they created

These policies should allow the control set creation functionality to work
while maintaining appropriate security boundaries.

If you're still getting RLS errors after running this script:
1. Check that the user is properly authenticated in your application
2. Verify that the created_by field is being set to auth.uid()
3. Check the browser developer console for detailed error messages
4. Ensure the Supabase client is properly configured with the correct URL and anon key
*/
