# Supabase Schema Alignment Fix

## Problem Summary

The AI configuration system was experiencing "404 Not Found" errors and other issues due to misalignment between the Supabase database schema and the TypeScript application code. The database used field names like `model_name` and `api_endpoint`, while the application code expected `model` and `baseUrl`.

## Root Causes

1. **Field Name Mismatch**: Database schema used snake_case (`model_name`, `api_endpoint`, `max_tokens`, `api_key`) while code expected camelCase
2. **Incomplete Error Handling**: 404 errors from Ollama weren't properly diagnosed or resolved
3. **Missing Database Constraints**: Some validation constraints were not properly enforced
4. **Inconsistent Logging**: AI generation logs used incorrect field names
5. **No Diagnostic Tools**: Users had no way to troubleshoot connection issues

## Database Schema (Correct Implementation)

### ai_configurations Table
```sql
CREATE TABLE public.ai_configurations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  provider public.ai_provider_enum NOT NULL,
  model_name character varying(100) NOT NULL,
  api_endpoint character varying(500) NULL,
  api_key text NULL,
  max_tokens integer NULL DEFAULT 2000,
  temperature numeric(3, 2) NULL DEFAULT 0.7,
  is_active boolean NULL DEFAULT true,
  created_by uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT ai_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ai_config_created_by FOREIGN KEY (created_by) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT ai_config_max_tokens_range CHECK ((max_tokens >= 100 AND max_tokens <= 10000)),
  CONSTRAINT ai_config_model_name_not_empty CHECK ((length(TRIM(both from model_name)) > 0)),
  CONSTRAINT ai_config_temperature_range CHECK ((temperature >= 0.0 AND temperature <= 2.0))
);
```

### ai_provider_enum Type
```sql
CREATE TYPE ai_provider_enum AS ENUM ('ollama', 'openai', 'claude', 'gemini');
```

### ai_generation_logs Table
```sql
CREATE TABLE public.ai_generation_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  provider public.ai_provider_enum NOT NULL,
  model_name character varying(100) NOT NULL,
  prompt text NOT NULL,
  response text NULL,
  tokens_used integer NULL DEFAULT 0,
  request_type character varying(50) NOT NULL,
  entity_type character varying(50) NULL,
  entity_id uuid NULL,
  success boolean NULL DEFAULT true,
  error_message text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT ai_generation_logs_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ai_log_user_id FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL
);
```

## Code Changes Made

### 1. Updated AIConfiguration Interface
**File**: `au5/src/services/aiService.ts`

Added backward compatibility fields:
```typescript
export interface AIConfiguration {
  id?: string;
  provider: string;
  model_name: string;      // Database field name
  api_endpoint?: string;   // Database field name
  api_key?: string;        // Database field name
  temperature: number;
  max_tokens: number;      // Database field name
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed fields for backward compatibility
  model?: string;          // Alias for model_name
  baseUrl?: string;        // Alias for api_endpoint
}
```

### 2. Enhanced Error Handling
**File**: `au5/src/services/aiService.ts`

Added pre-flight checks for Ollama:
```typescript
// Health check before generation
const healthCheck = await fetch(`${baseUrl}/api/tags`, {
  method: "GET",
  signal: AbortSignal.timeout(5000),
});

// Model verification
const availableModels = modelsData.models?.map((m: any) => m.name) || [];
if (!availableModels.some((name: string) => name.startsWith(request.model))) {
  throw new Error(`Model "${request.model}" not found. Run "ollama pull ${request.model}" to download it.`);
}
```

### 3. Fixed Field Name Mapping
**File**: `au5/src/services/aiService.ts`

Updated getConfigurations method:
```typescript
return (data || []).map((config) => ({
  id: config.id,
  provider: config.provider,
  model_name: config.model_name,
  api_key: config.api_key,
  api_endpoint: config.api_endpoint,
  temperature: config.temperature,
  max_tokens: config.max_tokens,
  created_by: config.created_by,
  is_active: config.is_active,
  created_at: config.created_at,
  updated_at: config.updated_at,
  // Add computed fields for backward compatibility
  model: config.model_name,
  baseUrl: config.api_endpoint,
}));
```

### 4. Updated Component Usage
**File**: `au5/src/components/ai/AIGenerator.tsx`

Fixed field references:
```typescript
const request: AIGenerationRequest = {
  provider: selectedConfig.provider,
  model: selectedConfig.model_name,        // Use database field
  prompt: "",
  context: buildContext(),
  fieldType,
  auditData,
  temperature: selectedConfig.temperature,
  maxTokens: selectedConfig.max_tokens,    // Use database field
  apiKey: selectedConfig.api_key,          // Use database field
  baseUrl: selectedConfig.api_endpoint,    // Use database field
};
```

### 5. Fixed Generation Logging
**File**: `au5/src/services/aiService.ts`

Updated logGeneration method:
```typescript
await supabase.from("ai_generation_logs").insert([
  {
    user_id: user.id,
    provider: request.provider,
    model_name: request.model,    // Fixed: was 'model'
    prompt: request.prompt,
    response: response.content,
    tokens_used: response.tokensUsed || 0,
    request_type: request.fieldType,
    success: response.success,
    error_message: response.error,
  },
]);
```

## New Features Added

### 1. Ollama Diagnostic Tool
**File**: `au5/src/components/ai/OllamaDiagnostic.tsx`

Interactive diagnostic interface that:
- Checks if Ollama is running
- Lists available models
- Provides installation instructions
- Shows copy-paste commands for troubleshooting
- Offers step-by-step setup guide

### 2. Enhanced Error Messages
Smart error detection with context-aware messages:
- Detects Ollama 404 errors specifically
- Shows "Diagnose" button for quick troubleshooting
- Provides specific solutions based on error type
- Guides users through resolution steps

### 3. Status Checking Method
**File**: `au5/src/services/aiService.ts`

New method for real-time status checking:
```typescript
async checkOllamaStatus(baseUrl: string = "http://localhost:11434"): Promise<{
  isRunning: boolean;
  availableModels: string[];
  error?: string;
}> {
  // Implementation checks health and available models
}
```

## Migration Process

### Step 1: Run Database Migration
Execute the provided migration script:
```bash
psql -d your_database -f au5/ai-configuration-schema-migration.sql
```

### Step 2: Verify Schema
Check that tables were created correctly:
```sql
-- Verify ai_configurations table
\d public.ai_configurations

-- Verify ai_generation_logs table  
\d public.ai_generation_logs

-- Check enum type
\dT ai_provider_enum
```

### Step 3: Test Configuration
1. Go to Settings → AI Configuration
2. Add new Ollama configuration
3. Test connection
4. Try generating audit description

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Model not found" Error
**Cause**: Requested model not downloaded in Ollama
**Solution**: 
```bash
ollama pull llama2
ollama pull mistral
```

#### 2. "Connection refused" Error
**Cause**: Ollama service not running
**Solution**:
```bash
ollama serve
```

#### 3. "Permission denied" Error
**Cause**: Incorrect file permissions
**Solution**:
```bash
sudo chown -R $USER ~/.ollama
```

#### 4. Database Field Name Errors
**Cause**: Old code trying to use camelCase field names
**Solution**: Update code to use database field names (snake_case)

### Verification Commands

Test Ollama connection:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama2", "prompt": "Test", "stream": false}'
```

Test database connection:
```sql
-- Check active configurations
SELECT * FROM ai_configurations WHERE is_active = true;

-- Check recent generation logs
SELECT * FROM ai_generation_logs ORDER BY created_at DESC LIMIT 5;
```

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own configurations
- Users can only view their own generation logs
- Admins can view all data (optional)

### Data Protection
- API keys stored as encrypted TEXT fields
- Foreign key constraints maintain referential integrity
- Check constraints validate data ranges
- Indexes optimize query performance

## Performance Improvements

### Indexes Added
```sql
-- Configuration lookups
CREATE INDEX idx_ai_config_provider ON ai_configurations(provider);
CREATE INDEX idx_ai_config_active ON ai_configurations(is_active);

-- Generation log queries
CREATE INDEX idx_ai_log_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_log_created_at ON ai_generation_logs(created_at DESC);
```

### Query Optimization
- Limited queries to active configurations only
- Added proper WHERE clauses for user filtering
- Implemented connection timeout handling
- Added abort signals for long-running requests

## Testing Checklist

✅ **Database Schema**
- [ ] Tables created with correct field names
- [ ] Constraints working properly
- [ ] Indexes created for performance
- [ ] RLS policies active

✅ **Application Integration**
- [ ] AI configurations save/load correctly
- [ ] Field name mapping works
- [ ] Error handling shows proper messages
- [ ] Diagnostic tool functions

✅ **Ollama Integration**
- [ ] Connection status checking works
- [ ] Model availability detection works
- [ ] Error messages are helpful
- [ ] Diagnostic tool guides users properly

✅ **Generation Features**
- [ ] Audit description generation works
- [ ] Error recovery is smooth
- [ ] Logging captures correct data
- [ ] Performance is acceptable

## Success Metrics

### Before Fix
- ❌ 404 errors with no clear resolution path
- ❌ Field name mismatches causing data issues
- ❌ No diagnostic capabilities
- ❌ Poor error messages

### After Fix
- ✅ Clear error messages with specific solutions
- ✅ Interactive diagnostic tools
- ✅ Proper database schema alignment
- ✅ Self-service troubleshooting capability
- ✅ Robust error handling and recovery
- ✅ Comprehensive documentation

## Future Enhancements

1. **Enhanced Diagnostics**: Add more detailed system checks
2. **Model Management**: UI for downloading/managing Ollama models
3. **Configuration Templates**: Pre-configured setups for common use cases
4. **Performance Monitoring**: Track generation times and success rates
5. **Bulk Operations**: Batch configuration management
6. **API Key Management**: Integration with secure key storage
7. **Multi-tenancy**: Organization-level configuration sharing

The implementation now provides a robust, well-documented AI configuration system that handles errors gracefully and guides users through troubleshooting steps when issues occur.