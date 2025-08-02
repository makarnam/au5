# Controls Module Setup Guide

## Quick Start

This guide will help you set up and configure the Controls Module in AU5 for managing control sets and individual controls with AI assistance.

## Prerequisites

1. **Database Setup**: Ensure the following tables exist in your Supabase database:
   - `control_sets`
   - `controls`
   - `ai_configurations`
   - `ai_generation_logs`
   - `users` (for owner assignment)

2. **Authentication**: User must be logged in with appropriate permissions

3. **Environment**: React 18+ with TypeScript support

## Installation Steps

### 1. Import Components

```typescript
// In your main controls page
import { 
  ControlSetManager, 
  ControlEditor, 
  AIConfigModal,
  EnhancedControlsPage 
} from '../components/controls';
```

### 2. Basic Implementation

```typescript
// Simple controls page
import React from 'react';
import { EnhancedControlsPage } from '../components/controls';

export default function ControlsPage() {
  return <EnhancedControlsPage />;
}
```

### 3. Embedded Usage

```typescript
// Embedded in audit page
import React from 'react';
import { ControlSetManager } from '../components/controls';

export default function AuditControlsSection({ auditId }: { auditId: string }) {
  return (
    <ControlSetManager
      auditId={auditId}
      embedded={true}
      onControlSetSelect={(id) => console.log('Selected control set:', id)}
    />
  );
}
```

## AI Configuration

### 1. Local AI (Ollama)

**Install Ollama**:
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

**Start Ollama and pull models**:
```bash
ollama serve
ollama pull llama3.2
ollama pull mistral
```

**Configure in AU5**:
1. Click "AI Config" button in controls page
2. Add new configuration:
   - Provider: Ollama (Local)
   - Model: llama3.2
   - API Endpoint: http://localhost:11434
   - Max Tokens: 2000
   - Temperature: 0.7

### 2. Cloud AI Providers

#### OpenAI Setup
1. Get API key from https://platform.openai.com/api-keys
2. In AU5 AI Config:
   - Provider: OpenAI GPT
   - Model: gpt-4o-mini
   - API Key: [your-api-key]
   - Max Tokens: 2000
   - Temperature: 0.7

#### Anthropic Claude Setup
1. Get API key from https://console.anthropic.com/
2. In AU5 AI Config:
   - Provider: Anthropic Claude
   - Model: claude-3-5-sonnet-20241022
   - API Key: [your-api-key]
   - Max Tokens: 2000
   - Temperature: 0.7

#### Google Gemini Setup
1. Get API key from https://aistudio.google.com/app/apikey
2. In AU5 AI Config:
   - Provider: Google Gemini
   - Model: gemini-1.5-flash
   - API Key: [your-api-key]
   - Max Tokens: 2000
   - Temperature: 0.7

## Database Schema

### Control Sets Table
```sql
CREATE TABLE control_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID REFERENCES audits(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  framework VARCHAR(100) NOT NULL,
  controls_count INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### Controls Table
```sql
CREATE TABLE controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  control_set_id UUID REFERENCES control_sets(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES audits(id),
  control_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  control_type control_type_enum NOT NULL,
  frequency control_frequency_enum NOT NULL,
  process_area VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  testing_procedure TEXT NOT NULL,
  evidence_requirements TEXT NOT NULL,
  effectiveness control_effectiveness_enum DEFAULT 'not_tested',
  last_tested_date DATE,
  next_test_date DATE,
  is_automated BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### AI Configurations Table
```sql
CREATE TABLE ai_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(255),
  api_key TEXT,
  max_tokens INTEGER DEFAULT 2000,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enums
```sql
CREATE TYPE control_type_enum AS ENUM ('preventive', 'detective', 'corrective', 'directive');
CREATE TYPE control_frequency_enum AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'adhoc');
CREATE TYPE control_effectiveness_enum AS ENUM ('not_tested', 'effective', 'partially_effective', 'ineffective');
```

## Permissions Setup

### Role-Based Access
```sql
-- Add controls permissions to roles
UPDATE user_roles SET permissions = permissions || 
'{"manage_controls": true, "use_ai_generation": true}' 
WHERE role IN ('admin', 'supervisor_auditor');

UPDATE user_roles SET permissions = permissions || 
'{"create_controls": true, "use_ai_generation": true}' 
WHERE role = 'auditor';

UPDATE user_roles SET permissions = permissions || 
'{"view_controls": true}' 
WHERE role IN ('reviewer', 'viewer');
```

## Common Workflows

### 1. Create Control Set Manually
```typescript
const handleCreateControlSet = async () => {
  const controlSet = await controlService.createControlSet({
    name: "Financial Controls",
    description: "Controls for financial reporting processes",
    framework: "SOX",
    audit_id: auditId
  });
  
  console.log('Created control set:', controlSet.id);
};
```

### 2. Generate Controls with AI
```typescript
const handleAIGeneration = async () => {
  // First ensure AI is configured
  const configs = await aiService.getConfigurations();
  if (configs.length === 0) {
    alert('Please configure AI provider first');
    return;
  }
  
  // Generate controls
  const controls = await controlService.generateControlsWithAI(
    controlSetId,
    {
      framework: "ISO 27001",
      processArea: "Access Management",
      count: 10,
      provider: "ollama",
      model: "llama3.2"
    }
  );
  
  console.log('Generated controls:', controls.length);
};
```

### 3. Bulk Control Creation
```typescript
const handleBulkCreate = async () => {
  const controlsData = [
    {
      control_code: "AC-001",
      title: "User Access Review",
      description: "Monthly review of user access rights",
      control_type: "detective",
      frequency: "monthly",
      process_area: "Access Management",
      testing_procedure: "Review access reports",
      evidence_requirements: "Access review reports",
      is_automated: false
    },
    // ... more controls
  ];
  
  await controlService.createMultipleControls(controlSetId, controlsData);
};
```

## Testing Your Setup

### 1. Test AI Connection
```typescript
const testAIConnection = async () => {
  const config = {
    provider: "ollama",
    model_name: "llama3.2",
    api_endpoint: "http://localhost:11434",
    max_tokens: 2000,
    temperature: 0.7,
    is_active: true
  };
  
  const result = await aiService.testConnection(config);
  console.log('AI connection test:', result);
};
```

### 2. Test Control Operations
```typescript
const testControlOperations = async () => {
  // Create control set
  const controlSet = await controlService.createControlSet({
    name: "Test Controls",
    description: "Testing control operations",
    framework: "Custom",
    audit_id: "test-audit-id"
  });
  
  // Create control
  const control = await controlService.createControl(controlSet.id, {
    control_code: "TEST-001",
    title: "Test Control",
    description: "This is a test control",
    control_type: "preventive",
    frequency: "monthly",
    process_area: "Testing",
    testing_procedure: "Test the test",
    evidence_requirements: "Test evidence",
    is_automated: false
  });
  
  console.log('Test completed successfully');
};
```

## Troubleshooting

### Common Issues

#### AI Generation Not Working
1. **Check AI Configuration**:
   ```bash
   # For Ollama
   curl http://localhost:11434/api/tags
   ```

2. **Verify API Keys**:
   - Ensure keys are correctly entered
   - Check key permissions and quotas

3. **Network Issues**:
   - Check firewall settings
   - Verify CORS configuration

#### Control Creation Fails
1. **Database Connection**:
   ```sql
   -- Test database connection
   SELECT * FROM control_sets LIMIT 1;
   ```

2. **Permission Issues**:
   ```typescript
   const user = await supabase.auth.getUser();
   console.log('User permissions:', user.role);
   ```

#### Performance Issues
1. **Large Data Sets**:
   - Enable pagination for >100 controls
   - Add database indexes
   - Optimize queries

2. **AI Response Times**:
   - Increase timeout settings
   - Use smaller models for faster responses

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('au5_debug_controls', 'true');

// Check logs in browser console
console.log('Controls debug enabled');
```

## Production Deployment

### Environment Variables
```bash
# Optional: Default AI endpoints
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1
VITE_CLAUDE_ENDPOINT=https://api.anthropic.com/v1
VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta

# Database
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Security Checklist
- [ ] API keys encrypted in database
- [ ] User permissions properly configured
- [ ] SQL injection prevention
- [ ] Rate limiting for AI requests
- [ ] Audit logging enabled

### Performance Optimization
- [ ] Database indexes on frequently queried fields
- [ ] Pagination for large datasets
- [ ] Lazy loading for AI components
- [ ] Caching for static data

## Support

For help with setup:
1. Check the troubleshooting section above
2. Review the main documentation: `CONTROLS_MODULE_DOCUMENTATION.md`
3. Test with the provided examples
4. Contact development team for complex issues

## Next Steps

After setup:
1. Configure your preferred AI provider
2. Create your first control set
3. Generate some controls with AI
4. Set up user permissions
5. Train your team on the interface

Happy auditing! 🛡️