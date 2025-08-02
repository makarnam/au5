# Controls Module Troubleshooting Guide

## Overview

This guide helps you troubleshoot common issues with the AU5 Controls Module, particularly UUID validation errors and database connectivity problems.

## Common Error: "invalid input syntax for type uuid"

### Error Description
```
Error: Database error: invalid input syntax for type uuid: ""
Error: Database error: invalid input syntax for type uuid: "create"
```

### Root Cause
This error occurs when:
1. Empty strings (`""`) are passed as UUID parameters to database queries
2. Non-UUID strings (like "create" from URL paths) are treated as UUID parameters
3. The application tries to use invalid UUID values in database operations

### Solution Steps

#### Step 1: Use the Fixed Control Service
Replace your existing `controlService.ts` with the fixed version that includes UUID validation:

```typescript
// Utility function to validate UUID
function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Utility function to check if string is empty
function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim() === "";
}
```

#### Step 2: Update Method Calls
Ensure all service methods validate UUIDs before database operations:

```typescript
async getControlSetsByAudit(auditId?: string): Promise<ControlSet[]> {
  let query = supabase
    .from("control_sets")
    .select("*")
    .eq("is_deleted", false);

  // Only filter by audit_id if it's provided and valid
  if (auditId && !isEmpty(auditId) && isValidUUID(auditId)) {
    query = query.eq("audit_id", auditId);
  } else if (isEmpty(auditId)) {
    // If auditId is empty, get all control sets
    query = query.is("audit_id", null);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  // ... rest of method
}
```

#### Step 3: Fix Component Calls
Update your components to handle undefined/empty audit IDs correctly:

```typescript
// WRONG - passing empty string
const controlSets = await controlService.getControlSetsByAudit("");

// CORRECT - pass undefined for no audit filter
const controlSets = await controlService.getControlSetsByAudit();

// CORRECT - only pass if valid UUID
const controlSets = auditId 
  ? await controlService.getControlSetsByAudit(auditId)
  : await controlService.getControlSetsByAudit();
```

## Quick Fix Checklist

### ✅ Database Setup
- [ ] All enum types created before tables
- [ ] Tables created in proper dependency order
- [ ] Foreign key constraints properly configured
- [ ] Row Level Security (RLS) policies configured (if using Supabase)

### ✅ Service Layer
- [ ] UUID validation functions implemented
- [ ] All service methods validate UUIDs before database calls
- [ ] Empty string handling implemented
- [ ] Error handling for invalid UUIDs

### ✅ Component Layer
- [ ] Components validate URL parameters before API calls
- [ ] Route handling for invalid UUIDs implemented
- [ ] Proper error messages displayed to users

## Testing Your Fix

### 1. Run the Test Page
Navigate to `/controls/test` (if you've added the test page) and run:
- Database connectivity test
- CRUD operations test
- UUID validation test

### 2. Manual Testing
Try these scenarios:
- Access `/controls` (should load all control sets)
- Access `/controls/create` (should not treat "create" as UUID)
- Access `/controls/[valid-uuid]` (should load specific control set)
- Access `/controls/[invalid-uuid]` (should show error and redirect)

### 3. Browser Console Testing
Open browser console and run:
```javascript
// This should work
controlService.getControlSetsByAudit();

// This should work with valid UUID
controlService.getControlSetsByAudit("550e8400-e29b-41d4-a716-446655440000");

// This should not cause UUID errors (will be filtered out)
controlService.getControlSetsByAudit("");
controlService.getControlSetsByAudit("invalid-uuid");
```

## Specific Error Scenarios

### Error: "column control_set_id does not exist"
**Cause**: Tables created in wrong order
**Solution**: 
1. Drop all tables
2. Run the fixed SQL setup script
3. Ensure enums are created first, then tables in dependency order

### Error: "User not authenticated"
**Cause**: Supabase auth session expired or not configured
**Solution**:
1. Check Supabase auth configuration
2. Ensure user is logged in
3. Verify RLS policies allow user access

### Error: "Failed to load resource: 400"
**Cause**: Invalid API request parameters
**Solution**:
1. Check network tab for specific error details
2. Verify URL parameters are valid UUIDs
3. Check service method implementations

## Database Schema Verification

Run these queries to verify your database setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('control_sets', 'controls', 'ai_configurations');

-- Check if enums exist
SELECT typname FROM pg_type 
WHERE typname LIKE '%_enum';

-- Check control sets data
SELECT id, name, framework, controls_count 
FROM control_sets 
WHERE is_deleted = false;

-- Check for UUID validation
SELECT id FROM control_sets WHERE id = 'invalid-uuid'; -- Should fail
SELECT id FROM control_sets WHERE id = ''; -- Should fail
```

## Performance Optimization

### Index Creation
Ensure these indexes exist for optimal performance:
```sql
CREATE INDEX IF NOT EXISTS idx_control_sets_audit_id ON control_sets(audit_id);
CREATE INDEX IF NOT EXISTS idx_controls_control_set_id ON controls(control_set_id);
CREATE INDEX IF NOT EXISTS idx_controls_active ON controls(is_deleted) WHERE is_deleted = FALSE;
```

### Query Optimization
- Use pagination for large datasets
- Implement proper WHERE clauses to filter deleted records
- Use selective field queries instead of SELECT *

## Advanced Debugging

### Enable Debug Mode
Add this to your browser console:
```javascript
localStorage.setItem('au5_debug_controls', 'true');
```

### Database Connection Testing
```javascript
// Test Supabase connection
const { data, error } = await supabase.from('control_sets').select('count', { count: 'exact', head: true });
console.log('Row count:', data);
console.log('Error:', error);
```

### Service Method Testing
```javascript
// Test individual service methods
try {
  const controlSets = await controlService.getControlSetsByAudit();
  console.log('Control sets loaded:', controlSets.length);
} catch (error) {
  console.error('Service error:', error.message);
}
```

## Environment-Specific Issues

### Development Environment
- Ensure Supabase local development is running
- Check environment variables are set correctly
- Verify database migrations are applied

### Production Environment
- Check production database connectivity
- Verify environment variables in deployment
- Ensure RLS policies are properly configured
- Check API rate limits and quotas

## Common Fixes

### Fix 1: UUID Validation Wrapper
```typescript
const safeUUIDCall = async (uuid: string, callback: (uuid: string) => Promise<any>) => {
  if (!isValidUUID(uuid)) {
    throw new Error(`Invalid UUID format: ${uuid}`);
  }
  return await callback(uuid);
};
```

### Fix 2: Safe Route Parameter Handling
```typescript
const { id } = useParams<{ id: string }>();

useEffect(() => {
  if (id) {
    if (isValidUUID(id)) {
      loadData(id);
    } else {
      toast.error("Invalid ID format");
      navigate("/controls");
    }
  }
}, [id]);
```

### Fix 3: Graceful Error Handling
```typescript
try {
  const result = await controlService.someMethod(id);
  // Handle success
} catch (error) {
  if (error.message.includes("invalid input syntax for type uuid")) {
    toast.error("Invalid ID format");
    navigate("/controls");
  } else {
    toast.error("An error occurred");
    console.error(error);
  }
}
```

## Support Resources

### Documentation
- `CONTROLS_MODULE_DOCUMENTATION.md` - Complete module documentation
- `CONTROLS_SETUP.md` - Setup and configuration guide
- `controls-module-setup-fixed.sql` - Database setup script

### Test Resources
- `ControlsTestPage.tsx` - Comprehensive testing interface
- Browser console debugging commands
- Database verification queries

### Getting Help
1. Check browser console for detailed error messages
2. Verify database schema matches expected structure
3. Test with minimal data first
4. Use the test page to isolate issues
5. Check Supabase dashboard for database errors

## Preventive Measures

### Code Quality
- Always validate UUIDs before database operations
- Use TypeScript strict mode for better type checking
- Implement proper error boundaries in React components
- Add unit tests for service methods

### Database Management
- Use soft deletes instead of hard deletes
- Implement proper indexes for performance
- Regular database backups
- Monitor query performance

### Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API response times
- Track user error reports
- Regular health checks

---

**Last Updated**: Current Date
**Version**: 1.0
**Compatibility**: AU5 Controls Module v1.0+