# Troubleshooting Foreign Key Constraint Issues

## The Problem
You're getting this error when trying to add sample data:
```
ERROR: 23503: insert or update on table "users" violates foreign key constraint "users_id_fkey"
DETAIL: Key (id)=(11111111-1111-1111-1111-111111111111) is not present in table "users".
```

This indicates that the `users` table has a foreign key constraint that's blocking the insert.

## Step-by-Step Solution

### Step 1: Identify the Foreign Key Constraint

Run this query in your Supabase SQL Editor to see what constraints exist:

```sql
-- Check all foreign key constraints on users table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'users';
```

### Step 2: Use the Minimal Data Approach

Instead of adding complex sample data, use the minimal approach:

```sql
-- Copy and paste the content from minimal-sample-data.sql
-- This handles foreign key constraints safely
```

### Step 3: Alternative - Use Your Authenticated User

If the minimal script still fails, use this manual approach:

```sql
BEGIN;

-- 1. First add business units (these should always work)
INSERT INTO business_units (name, code, description, is_active)
VALUES ('Test Dept', 'TEST', 'Test department', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Get your business unit ID
SELECT id as business_unit_id FROM business_units WHERE code = 'TEST' LIMIT 1;

-- 3. Check your current user ID
SELECT auth.uid() as your_user_id, auth.email() as your_email;

-- 4. If you have a user ID, ensure you exist in the users table
-- Replace 'YOUR_BUSINESS_UNIT_ID' with the ID from step 2
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    business_unit_id,
    is_active
)
VALUES (
    auth.uid(),
    auth.email(),
    'Current',
    'User',
    'admin',
    'YOUR_BUSINESS_UNIT_ID',  -- Replace this
    true
)
ON CONFLICT (id) DO UPDATE SET is_active = true;

COMMIT;
```

### Step 4: Verify Data Exists

After running the data script, verify you have the required data:

```sql
-- Check business units
SELECT count(*) as business_unit_count FROM business_units WHERE is_active = true;

-- Check users
SELECT count(*) as user_count FROM users WHERE is_active = true;

-- Show available data for dropdowns
SELECT 'Business Units:' as type;
SELECT id::text, name, code FROM business_units WHERE is_active = true;

SELECT 'Users:' as type;
SELECT id::text, first_name || ' ' || last_name as name, role 
FROM users WHERE is_active = true;
```

## Common Foreign Key Constraint Scenarios

### Scenario A: Self-Referencing Foreign Key
If users table has a `manager_id` or `supervisor_id` that references other users:

**Solution**: Insert users without the manager reference first, then update:
```sql
-- Insert without manager_id
INSERT INTO users (id, email, first_name, last_name, role, is_active)
VALUES ('uuid-here', 'user@company.com', 'John', 'Doe', 'admin', true);

-- Then update with manager reference if needed
-- UPDATE users SET manager_id = 'other-uuid' WHERE id = 'uuid-here';
```

### Scenario B: Reference to auth.users
If users table references Supabase's `auth.users` table:

**Solution**: Create users through Supabase Auth first:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create users manually
3. Then add them to your custom users table using their auth ID

### Scenario C: Reference to Non-Existent Records
If users table references other tables (departments, roles, etc.):

**Solution**: Create the referenced records first:
```sql
-- Create referenced data first
INSERT INTO departments (id, name) VALUES ('dept-id', 'Test Dept');

-- Then create users
INSERT INTO users (id, email, first_name, last_name, department_id, is_active)
VALUES ('user-id', 'user@company.com', 'John', 'Doe', 'dept-id', true);
```

## Quick Fix for Immediate Testing

If you just need to test audit creation quickly:

### Option 1: Use Existing Data
```sql
-- Check if you already have usable data
SELECT 'BUSINESS_UNITS' as table_name, id::text, name FROM business_units WHERE is_active = true LIMIT 3;
SELECT 'USERS' as table_name, id::text, first_name || ' ' || last_name as name FROM users WHERE is_active = true LIMIT 3;
```

If you see data, you can use those IDs in the audit form.

### Option 2: Disable Foreign Key Checks Temporarily
```sql
-- WARNING: Only for testing, not for production!
SET session_replication_role = replica;  -- Disables FK checks

-- Insert your sample data here

SET session_replication_role = DEFAULT;  -- Re-enables FK checks
```

### Option 3: Create Through Application
Instead of SQL inserts:
1. Use Supabase Dashboard to manually add users
2. Use your application's user management (if available)
3. Create business units through any admin interface

## Verify the Fix

After resolving the foreign key issues:

1. **Test the audit form**:
   - Go to `/audits/create`
   - Check that dropdowns populate with real data
   - Try creating an audit

2. **Check browser console**:
   - Should see no UUID errors
   - Should see successful API calls

3. **Verify in database**:
   ```sql
   SELECT * FROM audits ORDER BY created_at DESC LIMIT 5;
   ```

## Still Having Issues?

If you're still getting foreign key errors:

1. **Share the constraint details**:
   Run the constraint query from Step 1 and share the results

2. **Check your database schema**:
   Your users table structure might be different from expected

3. **Use the application user creation**:
   Instead of SQL inserts, create users through your application's normal flow

4. **Minimal working example**:
   Focus on getting just ONE business unit and ONE user working first

## Success Indicators

✅ **No foreign key constraint errors**  
✅ **Business units appear in dropdown**  
✅ **Users appear in lead auditor dropdown**  
✅ **Audit creates successfully**  
✅ **Audit appears in audit list**  
✅ **No UUID syntax errors**

Once you see these indicators, your audit creation system is working correctly!