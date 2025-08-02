# Controls Module Documentation

## Overview

The Controls Module is a comprehensive system for managing control sets and individual controls within the AU5 audit management platform. It provides functionality for creating, editing, deleting, and AI-assisted generation of controls organized by frameworks and control sets.

## Architecture

The module is built with a modular architecture to keep components under 300 lines and avoid context window issues:

```
src/components/controls/
├── ControlSetManager.tsx      # Main control set management
├── ControlEditor.tsx          # Individual control editing
├── ControlSetForm.tsx         # Control set creation/editing form
├── ControlForm.tsx            # Individual control form
├── AIControlGenerator.tsx     # AI-powered control generation
├── AIConfigModal.tsx          # AI provider configuration
└── index.ts                   # Module exports

src/pages/controls/
└── EnhancedControlsPage.tsx   # Main controls page

src/services/
├── controlService.ts          # Control CRUD operations
├── aiService.ts               # AI integration
└── userService.ts             # User management
```

## Key Features

### 1. Control Set Management
- **Create Control Sets**: Organize controls by framework (ISO 27001, SOX, COSO, etc.)
- **Framework Support**: Pre-defined and custom frameworks
- **Hierarchical Organization**: Control sets can contain multiple controls
- **Bulk Operations**: Delete multiple control sets at once
- **Duplication**: Copy existing control sets with all controls

### 2. Individual Control Management
- **CRUD Operations**: Create, read, update, delete individual controls
- **Control Types**: Preventive, Detective, Corrective, Directive
- **Frequency Settings**: Continuous, Daily, Weekly, Monthly, Quarterly, Annually, Ad-hoc
- **Effectiveness Tracking**: Not Tested, Effective, Partially Effective, Ineffective
- **Ownership Assignment**: Assign control owners from user list
- **Automation Flags**: Mark controls as automated or manual

### 3. AI-Powered Control Generation
- **Multiple Providers**: Support for Ollama (local), OpenAI, Claude, Gemini
- **Real AI Integration**: Actual API calls to configured providers
- **Framework-Based Generation**: Generate controls based on selected frameworks
- **Contextual Prompts**: AI considers audit context and requirements
- **Bulk Generation**: Create multiple controls at once

### 4. AI Configuration Management
- **Provider Configuration**: Set up multiple AI providers
- **API Key Management**: Secure storage of API keys
- **Connection Testing**: Test AI provider connections
- **Model Selection**: Choose from available models per provider
- **Parameter Tuning**: Configure temperature, max tokens, etc.

## Component Details

### ControlSetManager
**Purpose**: Main interface for managing control sets
**Features**:
- Grid view of control sets with stats
- Search and filtering capabilities
- Sorting options (name, date, control count)
- Framework filtering
- Quick actions (view, edit, duplicate, delete)
- Integration with AI generation

**Props**:
```typescript
interface ControlSetManagerProps {
  auditId?: string;
  onControlSetSelect?: (controlSetId: string) => void;
  embedded?: boolean;
}
```

### ControlEditor
**Purpose**: Manage individual controls within a control set
**Features**:
- Table view of controls with comprehensive details
- Bulk selection and operations
- Advanced filtering (type, effectiveness, owner)
- Inline editing capabilities
- Control effectiveness visualization
- Owner assignment

**Props**:
```typescript
interface ControlEditorProps {
  controlSetId: string;
  embedded?: boolean;
}
```

### ControlSetForm
**Purpose**: Form for creating/editing control sets
**Features**:
- Framework selection (predefined + custom)
- Validation for required fields
- Modal-based interface
- Real-time error feedback

### ControlForm
**Purpose**: Form for creating/editing individual controls
**Features**:
- Comprehensive control data entry
- Owner selection from user list
- Date pickers for testing dates
- Rich text descriptions
- Validation and error handling

### AIControlGenerator
**Purpose**: AI-powered control generation interface
**Features**:
- Provider selection
- Framework-based generation
- Batch control creation
- Real-time generation progress
- Generated control preview and editing

### AIConfigModal
**Purpose**: AI provider configuration interface
**Features**:
- Multi-provider setup (Ollama, OpenAI, Claude, Gemini)
- Secure API key management
- Connection testing
- Configuration validation
- Provider-specific settings

## AI Integration

### Supported Providers

#### Ollama (Local)
- **Endpoint**: http://localhost:11434 (configurable)
- **Models**: llama3.2, llama3.1, mistral, codellama, phi3, gemma2
- **Advantages**: Privacy, no API costs, offline capability
- **Setup**: Requires local Ollama installation

#### OpenAI
- **Endpoint**: https://api.openai.com/v1
- **Models**: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
- **Advantages**: High quality, reliable
- **Setup**: Requires API key

#### Anthropic Claude
- **Endpoint**: https://api.anthropic.com/v1
- **Models**: claude-3-5-sonnet, claude-3-haiku, claude-3-opus
- **Advantages**: Strong reasoning, safety-focused
- **Setup**: Requires API key

#### Google Gemini
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta
- **Models**: gemini-1.5-pro, gemini-1.5-flash, gemini-pro
- **Advantages**: Multimodal capabilities, competitive pricing
- **Setup**: Requires API key

### AI Generation Process

1. **Configuration**: Set up AI provider with credentials
2. **Context Building**: System builds prompts with audit context
3. **Generation**: AI generates controls based on framework and requirements
4. **Review**: Generated controls are presented for review
5. **Customization**: User can edit generated controls before saving
6. **Batch Creation**: Multiple controls created in single operation

## Data Models

### ControlSet
```typescript
interface ControlSet {
  id: string;
  audit_id: string;
  name: string;
  description: string;
  framework: string;
  controls_count: number;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### Control
```typescript
interface Control {
  id: string;
  control_set_id: string;
  control_code: string;
  title: string;
  description: string;
  control_type: ControlType;
  frequency: ControlFrequency;
  process_area: string;
  owner_id?: string;
  testing_procedure: string;
  evidence_requirements: string;
  effectiveness: ControlEffectiveness;
  last_tested_date?: string;
  next_test_date?: string;
  is_automated: boolean;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## Usage Examples

### Basic Control Set Creation
```typescript
import { ControlSetManager } from '../components/controls';

function MyAuditPage() {
  return (
    <ControlSetManager
      auditId="audit-123"
      onControlSetSelect={(id) => console.log('Selected:', id)}
    />
  );
}
```

### AI Configuration Setup
```typescript
import { AIConfigModal } from '../components/controls';

function SettingsPage() {
  const [showAIConfig, setShowAIConfig] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowAIConfig(true)}>
        Configure AI
      </button>
      {showAIConfig && (
        <AIConfigModal onClose={() => setShowAIConfig(false)} />
      )}
    </>
  );
}
```

### Custom Control Generation
```typescript
import { controlService } from '../services/controlService';

async function generateCustomControls() {
  const controlSet = await controlService.createControlSet({
    name: "Custom Controls",
    description: "AI-generated custom controls",
    framework: "Custom",
    audit_id: "audit-123"
  });
  
  const controls = await controlService.generateControlsWithAI(
    controlSet.id,
    {
      framework: "Custom",
      processArea: "Financial Reporting",
      count: 10
    }
  );
}
```

## Security Considerations

### API Key Management
- API keys are encrypted in storage
- Keys are never exposed in client-side code
- User-specific key storage (not shared between users)
- Secure transmission over HTTPS

### Access Control
- Role-based permissions for control management
- Audit trail for all control operations
- User ownership tracking for generated content

### Data Privacy
- Local AI option (Ollama) for sensitive environments
- No data sent to external providers without explicit configuration
- Audit logs for all AI interactions

## Performance Optimizations

### Component Splitting
- Each component is under 300 lines to avoid context window issues
- Lazy loading for AI generation components
- Efficient state management with minimal re-renders

### API Optimization
- Batch operations for bulk control creation
- Efficient database queries with proper indexing
- Caching for frequently accessed data

### AI Generation
- Streaming responses for real-time feedback
- Timeout handling for slow AI responses
- Fallback mechanisms for provider failures

## Testing

### Unit Tests
- Component rendering tests
- Form validation tests
- Service method tests
- AI integration mocks

### Integration Tests
- End-to-end control creation flows
- AI provider connection tests
- Database operation tests

### Manual Testing Checklist
- [ ] Create control set with all frameworks
- [ ] Generate controls with each AI provider
- [ ] Test bulk operations
- [ ] Verify permission-based access
- [ ] Test error handling scenarios

## Deployment

### Environment Variables
```bash
# AI Provider API Keys (optional, user-configurable)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_API_KEY=your_gemini_key

# Ollama Configuration (optional)
OLLAMA_BASE_URL=http://localhost:11434
```

### Database Migrations
Required tables:
- `control_sets`
- `controls`
- `ai_configurations`
- `ai_generation_logs`

### External Dependencies
- Supabase for data storage
- React Hook Form for form handling
- Framer Motion for animations
- Lucide React for icons

## Troubleshooting

### Common Issues

#### AI Generation Fails
1. Check AI provider configuration
2. Verify API keys are correct
3. Test connection using built-in test feature
4. Check network connectivity for cloud providers
5. Verify Ollama is running for local provider

#### Control Creation Errors
1. Verify user permissions
2. Check required field validation
3. Ensure control codes are unique
4. Verify audit association

#### Performance Issues
1. Check for large control sets (>1000 controls)
2. Optimize database queries
3. Consider pagination for large datasets
4. Monitor AI generation timeouts

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('au5_debug_controls', 'true');
```

## Future Enhancements

### Planned Features
- Control mapping to risks
- Advanced analytics dashboard
- Integration with external frameworks
- Mobile-responsive design
- Real-time collaboration
- Version control for controls

### AI Improvements
- Custom model fine-tuning
- Multi-language support
- Control effectiveness prediction
- Automated testing suggestions

## Support

For technical support or feature requests:
1. Check this documentation first
2. Review the troubleshooting section
3. Create an issue in the project repository
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial release with full control management
- AI integration with 4 providers
- Comprehensive CRUD operations
- Security and permission system