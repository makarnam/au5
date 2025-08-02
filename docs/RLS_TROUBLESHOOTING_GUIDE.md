# RLS Troubleshooting Guide - Control Set Creation Issue

## Problem Description

You're getting the following error when creating control sets with controls:

```
Error creating control set: – Error: Database error: new row violates row-level security policy for table "controls"
```

This indicates that the Row Level Security (RLS) policies on the `controls` table are preventing the insertion of new control records.

## Root Cause

The issue occurs because:
1. The `controls` table has RLS enabled
2. The current RLS policies are either missing or too restrictive
3. The policy requires `auth.uid() = created_by` but there might be a mismatch

## Solution Steps

### Step 1: Fix RLS Policies in Supabase

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the RLS Fix Script**
   Copy and paste the contents of `fix-rls-policies-supabase.sql` into the SQL Editor and execute it.

   Or copy this script directly:

```sql
-- =============================================================================
-- Fix RLS Policies for Controls and Control Sets Tables
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

-- Drop all existing policies for control_sets
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON control_sets;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON control_sets;

-- Create new policies for control_sets
CREATE POLICY "control_sets_select" ON control_sets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "control_sets_insert" ON control_sets
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "control_sets_update" ON control_sets
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "control_sets_delete" ON control_sets
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Create new policies for controls
CREATE POLICY "controls_select" ON controls
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "controls_insert" ON controls
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "controls_update" ON controls
    FOR UPDATE TO authenticated USING (
        auth.uid() = created_by OR auth.uid() = owner_id
    );

CREATE POLICY "controls_delete" ON controls
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Ensure RLS is enabled
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
```

### Step 2: Verify the Fix

After running the script, verify it worked:

```sql
-- Check if policies are created
SELECT tablename, policyname, cmd as operation
FROM pg_policies
WHERE tablename IN ('controls', 'control_sets')
ORDER BY tablename, policyname;

-- Check current user authentication
SELECT auth.uid() as current_user_id, auth.role() as current_role;
```

### Step 3: Test the Application

1. **Log out and log back in** to ensure fresh authentication
2. **Try creating a control set** with controls
3. **Check browser console** for any additional error messages

## Alternative Solutions

### Temporary Workaround (For Testing Only)

If you need to test immediately and the above doesn't work, you can temporarily disable RLS:

```sql
-- TEMPORARY - For testing only
ALTER TABLE controls DISABLE ROW LEVEL SECURITY;
ALTER TABLE control_sets DISABLE ROW LEVEL SECURITY;

-- Test your functionality

-- Re-enable RLS afterwards
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
```

**⚠️ Warning**: Only use this for local testing. Never disable RLS in production.

### Permissive Policy (For Development)

For development environments, you can create more permissive policies:

```sql
-- More permissive policies for development
DROP POLICY IF EXISTS "controls_insert" ON controls;
CREATE POLICY "controls_insert_dev" ON controls
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "control_sets_insert" ON control_sets;
CREATE POLICY "control_sets_insert_dev" ON control_sets
    FOR INSERT TO authenticated WITH CHECK (true);
```

## Debugging Steps

### 1. Check User Authentication

In your browser console, check if the user is properly authenticated:

```javascript
// In browser console
console.log(await supabase.auth.getUser());
```

### 2. Check Table Structure

Verify the tables have the required columns:

```sql
-- Check controls table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'controls' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check control_sets table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'control_sets' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 3. Manual Test Insert

Try a manual insert to isolate the issue:

```sql
-- Test insert (replace with actual values)
INSERT INTO control_sets (name, description, framework, created_by)
VALUES ('Test Set', 'Test Description', 'Test Framework', auth.uid());

-- If that works, try inserting a control
INSERT INTO controls (
    control_set_id, control_code, title, description,
    control_type, frequency, process_area,
    testing_procedure, evidence_requirements,
    effectiveness, is_automated, created_by
) VALUES (
    (SELECT id FROM control_sets WHERE name = 'Test Set' LIMIT 1),
    'TEST-001', 'Test Control', 'Test Description',
    'preventive', 'monthly', 'Test Area',
    'Test Procedure', 'Test Evidence',
    'not_tested', false, auth.uid()
);
```

## Expected Behavior After Fix

After applying the fix:

1. ✅ **Control Set Creation**: Should work without RLS errors
2. ✅ **Control Generation**: AI should generate 5-6 controls successfully
3. ✅ **Control Editing**: Users can edit controls they created
4. ✅ **Control Deletion**: Users can delete controls they created
5. ✅ **Viewing**: All users can view all control sets and controls

## Common Issues and Solutions

### Issue: "User not authenticated"
**Solution**: Ensure user is logged in and has a valid session

### Issue: "created_by field is null"
**Solution**: Check that the service is properly setting `created_by: user.id`

### Issue: "Policy still blocking after fix"
**Solution**: 
1. Clear browser cache and cookies
2. Log out and log back in
3. Check if the policies were actually created using the verification queries

### Issue: "Controls table doesn't exist"
**Solution**: Run the complete database setup script first

## Prevention

To prevent similar issues in the future:

1. **Always test RLS policies** after database schema changes
2. **Use consistent policy naming** across all tables
3. **Document policy requirements** for each table
4. **Test with different user roles** to ensure proper access control

## Contact Support

If the issue persists after following all steps:

1. **Collect the following information**:
   - Error message from browser console
   - Result of the verification queries
   - Current user authentication status
   - Browser network tab showing the failed request

2. **Check Supabase logs** in the dashboard for additional error details

3. **Verify environment**: Ensure you're working with the correct Supabase project

## File References

- `fix-rls-policies-supabase.sql` - Complete RLS policy fix script
- `src/services/controlService.ts` - Updated with better error handling
- `src/pages/controls/controlsets/CreateControlSetPage.tsx` - Enhanced error messages