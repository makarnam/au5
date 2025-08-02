# Enhanced AI Control Generator - Database Migration Guide

## Overview

This guide will help you migrate your Supabase PostgreSQL database to support the Enhanced AI Control Generator features. The migration adds new tables, columns, and functionality while preserving all existing data.

## 🚨 Important - Backup First!

**Before running any migration, create a backup of your database:**

```sql
-- In Supabase SQL Editor, run this to export your current schema
-- Go to Settings > Database > Database Settings > Download backup
```

Or use the Supabase CLI:
```bash
supabase db dump --file backup_before_enhanced_ai_$(date +%Y%m%d).sql
```

## Migration Steps

### Step 1: Verify Prerequisites

Ensure your database has the required base tables:
- `users` table with authentication
- `audits` table for audit management
- `controls` table for control storage
- `ai_configurations` table for AI providers

### Step 2: Run the Migration Script

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Execute the Migration**
   - Copy the entire content of `enhanced-ai-control-generator-migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

The migration script will:
- Add new columns to existing `controls` table
- Create `control_sets` table for grouping controls
- Create `ai_control_templates` table for reusable templates
- Enhance `ai_generation_logs` table for better tracking
- Add indexes for improved performance
- Set up Row Level Security policies
- Create helper functions and views

### Step 3: Verify Migration Success

1. **Run the Verification Script**
   - Copy the content of `verify-enhanced-ai-migration.sql`
   - Paste it into Supabase SQL Editor
   - Click "Run"

2. **Check for Success Messages**
   Look for these messages in the output:
   ```
   ✓ All required tables exist
   ✓ All required columns exist in controls table
   ✓ All required indexes exist
   ✓ All required triggers exist
   ✓ All required functions exist
   ✓ All required views exist
   ✓ Row Level Security is properly configured
   ```

3. **Check Sample Data**
   The verification will show counts of:
   - Control sets created
   - AI templates installed
   - Controls linked to sets
   - Enhanced control fields populated

## New Database Structure

### Enhanced Controls Table

The `controls` table now includes these new fields:

```sql
-- New fields added to controls table
control_code VARCHAR(50)          -- Unique control identifier
process_area VARCHAR(100)         -- Business process area
testing_procedure TEXT            -- Detailed testing steps
evidence_requirements_text TEXT   -- Required evidence (text format)
effectiveness VARCHAR(50)         -- Control effectiveness status
is_automated BOOLEAN              -- Whether control is automated
framework VARCHAR(50)             -- Compliance framework
industry VARCHAR(50)              -- Industry type
risk_level VARCHAR(20)            -- Risk environment level
control_set_id UUID               -- Link to control set
```

### New Tables

#### control_sets
Groups related controls together:
```sql
id UUID PRIMARY KEY
name VARCHAR(255)                 -- Control set name
description TEXT                  -- Control set description
framework VARCHAR(100)            -- Compliance framework
industry VARCHAR(100)             -- Industry type
audit_id UUID                     -- Associated audit
controls_count INTEGER            -- Auto-calculated count
tested_controls INTEGER           -- Auto-calculated tested count
effective_controls INTEGER        -- Auto-calculated effective count
```

#### ai_control_templates
Stores reusable control patterns:
```sql
id UUID PRIMARY KEY
name VARCHAR(255)                 -- Template name
description TEXT                  -- Template description
framework VARCHAR(100)            -- Target framework
industry VARCHAR(100)             -- Target industry
process_area VARCHAR(100)         -- Process area
template_data JSONB               -- Control template structure
is_public BOOLEAN                 -- Whether template is shared
usage_count INTEGER               -- How often template is used
```

#### ai_generation_logs (Enhanced)
Tracks AI generation activities:
```sql
id UUID PRIMARY KEY
user_id UUID                      -- User who generated
audit_id UUID                     -- Associated audit
control_set_id UUID               -- Associated control set
provider VARCHAR(50)              -- AI provider used
model VARCHAR(100)                -- AI model used
prompt_context JSONB              -- Generation configuration
response_data JSONB               -- AI response data
generated_controls_count INTEGER  -- Number of controls generated
generation_status VARCHAR(50)     -- Success/failure status
processing_time_ms INTEGER        -- Generation time
```

### New Views

#### control_set_stats
Provides statistics for control sets:
```sql
SELECT * FROM control_set_stats;
-- Returns: id, name, framework, controls_count, testing_percentage, effectiveness_percentage
```

#### ai_generation_analytics
Analytics for AI generation usage:
```sql
SELECT * FROM ai_generation_analytics;
-- Returns: generation_date, provider, model, total_generations, success_rate_percentage
```

## Configuration Updates

### AI Provider Configuration

The `ai_configurations` table has been enhanced with new fields:

```sql
-- New fields in ai_configurations
configuration_name VARCHAR(100)           -- Friendly name
description TEXT                          -- Configuration description
usage_count INTEGER                       -- Usage tracking
last_used_at TIMESTAMPTZ                 -- Last usage timestamp
rate_limit_requests_per_minute INTEGER   -- Rate limiting
daily_request_limit INTEGER              -- Daily usage limits
success_rate DECIMAL(5,2)                -- Success rate percentage
average_response_time_ms INTEGER         -- Average response time
```

### Sample Data Inserted

The migration creates sample data:

1. **Default Control Sets**
   - "Default ISO 27001 Control Set"
   - "Default SOX Control Set"

2. **AI Control Templates**
   - "Healthcare HIPAA Access Controls"
   - "Financial SOX Controls"

3. **Updated Existing Controls**
   - Links existing controls to appropriate control sets
   - Adds framework and process area information
   - Sets default effectiveness and automation status

## Row Level Security (RLS)

The migration enables RLS on new tables with policies:

### control_sets
- Users can view control sets they created or have audit access to
- Users can create new control sets
- Users can update/delete their own control sets or those they have audit access to

### ai_control_templates
- Users can view public templates and their own private templates
- Users can create their own templates
- Users can update/delete only their own templates

### ai_generation_logs
- Users can only view their own generation logs
- Users can create new generation logs

## Performance Optimizations

The migration adds strategic indexes:

```sql
-- Control Sets
idx_control_sets_audit_id
idx_control_sets_framework
idx_control_sets_created_by

-- Enhanced Controls
idx_controls_control_set_id
idx_controls_framework
idx_controls_process_area
idx_controls_effectiveness

-- AI Templates
idx_ai_control_templates_framework
idx_ai_control_templates_industry
idx_ai_control_templates_is_public

-- Generation Logs
idx_ai_generation_logs_user_id
idx_ai_generation_logs_provider
idx_ai_generation_logs_created_at
```

## Automated Features

### Triggers
- **Auto-update timestamps**: `updated_at` fields automatically updated
- **Control set counts**: Automatically recalculates control counts when controls are added/removed

### Functions
- `update_control_set_counts()`: Maintains accurate control counts
- `increment_template_usage()`: Tracks template usage
- `update_ai_config_stats()`: Updates AI provider statistics

## Troubleshooting

### Common Issues

#### Migration Fails with Permission Error
```sql
-- Grant necessary permissions
GRANT CREATE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
```

#### Missing uuid-ossp Extension
```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### RLS Policies Block Access
```sql
-- Temporarily disable RLS for testing (not recommended for production)
ALTER TABLE control_sets DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable after fixing policies
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
```

#### Function Creation Fails
```sql
-- Check if plpgsql language is available
CREATE EXTENSION IF NOT EXISTS plpgsql;
```

### Rollback (if needed)

If you need to rollback the migration:

```sql
-- WARNING: This will remove all enhanced features and data
-- Make sure you have a backup first!

-- Drop new tables
DROP TABLE IF EXISTS ai_control_templates CASCADE;
DROP TABLE IF EXISTS control_sets CASCADE;
DROP VIEW IF EXISTS control_set_stats;
DROP VIEW IF EXISTS ai_generation_analytics;

-- Remove new columns from controls (optional)
ALTER TABLE controls DROP COLUMN IF EXISTS control_code;
ALTER TABLE controls DROP COLUMN IF EXISTS process_area;
ALTER TABLE controls DROP COLUMN IF EXISTS testing_procedure;
ALTER TABLE controls DROP COLUMN IF EXISTS evidence_requirements_text;
ALTER TABLE controls DROP COLUMN IF EXISTS effectiveness;
ALTER TABLE controls DROP COLUMN IF EXISTS is_automated;
ALTER TABLE controls DROP COLUMN IF EXISTS framework;
ALTER TABLE controls DROP COLUMN IF EXISTS industry;
ALTER TABLE controls DROP COLUMN IF EXISTS risk_level;
ALTER TABLE controls DROP COLUMN IF EXISTS control_set_id;
```

## Post-Migration Steps

### 1. Restart Application
Restart your application server to pick up the new database schema.

### 2. Update Environment Variables
Ensure your application has proper AI provider configurations:

```env
# Example environment variables
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
GEMINI_API_KEY=your_gemini_key
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Test Enhanced Features
1. Navigate to `/controls/enhanced-ai-demo`
2. Try generating controls with different configurations
3. Test the preview and editing functionality
4. Create and save custom templates

### 4. Configure AI Providers
1. Go to your application's AI settings
2. Add and configure AI providers
3. Test connectivity to ensure proper setup

## Support

If you encounter issues during migration:

1. **Check the verification script output** for specific error messages
2. **Review Supabase logs** in your project dashboard
3. **Ensure proper permissions** for your database user
4. **Verify prerequisites** are met before running migration

## Migration Checklist

- [ ] Database backup created
- [ ] Prerequisites verified
- [ ] Migration script executed successfully
- [ ] Verification script run without errors
- [ ] Application restarted
- [ ] AI providers configured
- [ ] Enhanced features tested
- [ ] Sample controls generated successfully

## Next Steps

After successful migration, you can:

1. **Explore Enhanced Features**: Try the demo at `/controls/enhanced-ai-demo`
2. **Create Control Sets**: Organize your controls into logical groups
3. **Build Templates**: Save proven control patterns for reuse
4. **Generate AI Controls**: Use context-aware AI generation
5. **Analyze Usage**: Review analytics in the new dashboard views

The Enhanced AI Control Generator is now ready for production use!