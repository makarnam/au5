-- Fix Controls Table RLS Policies
-- This script fixes Row Level Security policies for the controls table to allow proper CRUD operations

-- =============================================================================
-- STEP 1: Drop existing policies if they exist
-- =============================================================================

-- Drop existing policies for controls table
DROP POLICY IF EXISTS "Users can view controls they have access to" ON controls;
DROP POLICY IF EXISTS "Users can create controls" ON controls;
DROP POLICY IF EXISTS "Users can update controls they own or created" ON controls;
DROP POLICY IF EXISTS "Users can delete controls they created" ON controls;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON controls;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON controls;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON controls;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON controls;

-- =============================================================================
-- STEP 2: Create simplified RLS policies for controls
-- =============================================================================

-- Allow authenticated users to read all controls
CREATE POLICY "controls_select_policy" ON controls
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert controls they create
CREATE POLICY "controls_insert_policy" ON controls
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update controls they created or own
CREATE POLICY "controls_update_policy" ON controls
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = created_by OR
        auth.uid() = owner_id
    );

-- Allow authenticated users to delete controls they created
CREATE POLICY "controls_delete_policy" ON controls
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- =============================================================================
-- STEP 3: Ensure controls table has RLS enabled
-- =============================================================================

-- Enable RLS on controls table
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 4: Fix control_sets table policies as well
-- =============================================================================

-- Drop existing policies for control_sets table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON control_sets;

-- Create simplified policies for control_sets
CREATE POLICY "control_sets_select_policy" ON control_sets
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "control_sets_insert_policy" ON control_sets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "control_sets_update_policy" ON control_sets
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "control_sets_delete_policy" ON control_sets
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Enable RLS on control_sets table
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 5: Verification queries
-- =============================================================================

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('controls', 'control_sets');

-- =============================================================================
-- TROUBLESHOOTING NOTES
-- =============================================================================

/*
If you still get RLS policy violations after running this script:

1. Check if the user is properly authenticated:
   SELECT auth.uid(), auth.role();

2. Temporarily disable RLS for testing (NOT for production):
   ALTER TABLE controls DISABLE ROW LEVEL SECURITY;
   -- Test your operations
   ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

3. Check if the created_by field is being set correctly:
   -- The insert should include: created_by: user.id where user.id = auth.uid()

4. For debugging, you can create a more permissive temporary policy:
   CREATE POLICY "temp_allow_all" ON controls FOR ALL TO authenticated USING (true) WITH CHECK (true);
   -- Remember to drop it after fixing the issue:
   DROP POLICY "temp_allow_all" ON controls;

5. Ensure the controls table has the correct structure:
   \d controls
*/
