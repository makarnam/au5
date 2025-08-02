# Audit Management Module Documentation

## Overview

The Audit Management Module is a comprehensive system for creating, editing, and managing audits within the AI Auditor GRC platform. It provides a complete workflow from audit planning through execution and reporting, with AI-powered assistance and role-based access control.

## Features

### 🎯 **Core Functionality**
- **Create New Audits**: Multi-step wizard for comprehensive audit creation
- **Edit Existing Audits**: Full editing capabilities for audit modifications
- **Audit Listing**: Advanced filtering, searching, and bulk operations
- **Audit Details**: Comprehensive view with timeline, findings, and team collaboration
- **AI Assistance**: AI-powered content generation for objectives, scope, and methodology
- **Role-Based Access**: Granular permissions based on user roles

### 📋 **Audit Creation & Editing**
- **5-Step Wizard Process**:
  1. Basic Information (title, type, description, business unit)
  2. Team & Schedule (lead auditor, team members, dates, hours)
  3. Scope & Objectives (audit objectives with AI generation)
  4. Methodology (audit approach with AI suggestions)
  5. Review & Submit (comprehensive review before saving)

### 🔧 **Advanced Features**
- **Multi-user Team Assignment**: Assign lead auditors and team members
- **Dynamic Objectives Management**: Add/remove objectives with AI generation
- **Date Validation**: Ensures end date is after start date
- **Progress Tracking**: Visual step indicator with completion status
- **Form Validation**: Comprehensive client-side validation with error handling
- **Auto-save Drafts**: Preserves work in progress
- **Responsive Design**: Works seamlessly on desktop and mobile

## File Structure

```
src/
├── components/
│   └── audit/
│       ├── AuditForm.tsx          # Main audit creation/editing form
│       └── AuditWizard.tsx        # Legacy wizard (now replaced)
├── pages/
│   └── audits/
│       ├── CreateAuditPage.tsx    # Create audit page wrapper
│       ├── EditAuditPage.tsx      # Edit audit page wrapper
│       ├── AuditDetails.tsx       # Detailed audit view
│       └── AuditsList.tsx         # Audit listing and management
└── types/
    └── index.ts                   # Audit-related TypeScript types
```

## Component Architecture

### AuditForm Component

**Location**: `src/components/audit/AuditForm.tsx`

**Purpose**: Main form component for creating and editing audits

**Props**:
```typescript
interface AuditFormProps {
  audit?: Audit;                    // Existing audit data (for edit mode)
  onSave: (data: AuditFormData) => Promise<void>;  // Save callback
  onCancel: () => void;             // Cancel callback
  isLoading?: boolean;              // Loading state
  mode: 'create' | 'edit';          // Form mode
}
```

**Key Features**:
- Multi-step wizard interface
- Form validation with Zod schema
- AI content generation
- Dynamic objectives management
- Real-time validation feedback
- Responsive design
- Accessibility support

### CreateAuditPage Component

**Location**: `src/pages/audits/CreateAuditPage.tsx`

**Purpose**: Page wrapper for audit creation

**Features**:
- Navigation breadcrumbs
- Loading states
- Success/error handling
- Integration with routing

### EditAuditPage Component

**Location**: `src/pages/audits/EditAuditPage.tsx`

**Purpose**: Page wrapper for audit editing

**Features**:
- Audit data loading
- Error handling for missing audits
- Pre-populated form data
- Update operations

## Data Schema

### Audit Type Definition

```typescript
interface Audit {
  id: string;
  title: string;
  description: string;
  audit_type: AuditType;
  status: AuditStatus;
  business_unit_id: string;
  lead_auditor_id: string;
  team_members: string[];
  start_date: string;
  end_date: string;
  planned_hours: number;
  actual_hours?: number;
  objectives: string[];
  scope: string;
  methodology: string;
  ai_generated: boolean;
  ai_model_used?: string;
  approval_status: ApprovalStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### Audit Types

```typescript
type AuditType = 
  | 'internal'
  | 'external' 
  | 'compliance'
  | 'operational'
  | 'financial'
  | 'it'
  | 'quality'
  | 'environmental';
```

### Audit Statuses

```typescript
type AuditStatus = 
  | 'draft'
  | 'planning'
  | 'in_progress'
  | 'testing'
  | 'reporting'
  | 'completed'
  | 'cancelled';
```

## Form Validation

### Validation Schema (Zod)

```typescript
const auditSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters'),
  audit_type: z.enum([...auditTypes]),
  status: z.enum([...auditStatuses]),
  business_unit_id: z.string().min(1, 'Business unit is required'),
  lead_auditor_id: z.string().min(1, 'Lead auditor is required'),
  team_members: z.array(z.string()).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  planned_hours: z.number()
    .min(1, 'Planned hours must be at least 1')
    .max(10000, 'Planned hours too high'),
  objectives: z.array(z.string())
    .min(1, 'At least one objective is required'),
  scope: z.string().min(20, 'Scope must be at least 20 characters'),
  methodology: z.string().min(10, 'Methodology must be at least 10 characters'),
}).refine((data) => {
  return new Date(data.end_date) >= new Date(data.start_date);
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});
```

## AI Integration

### AI Content Generation

The audit form includes AI-powered content generation for:

1. **Objectives**: Generate comprehensive audit objectives based on audit type and business unit
2. **Scope**: Create detailed scope descriptions covering relevant areas
3. **Methodology**: Suggest appropriate audit methodologies and approaches

**Implementation**:
```typescript
const generateAIContent = async (field: 'objectives' | 'scope' | 'methodology') => {
  setAiGenerating(true);
  try {
    // Mock AI service call - replace with actual AI integration
    const response = await aiService.generateContent({
      field,
      auditType: watch('audit_type'),
      businessUnit: watch('business_unit_id'),
      context: watch('description')
    });
    
    setValue(field, response.content, { shouldValidate: true });
    toast.success(`AI-generated ${field} added successfully!`);
  } catch (error) {
    toast.error('Failed to generate AI content');
  } finally {
    setAiGenerating(false);
  }
};
```

## Navigation & Routing

### Routes

- `/audits` - Audit listing page
- `/audits/create` - Create new audit
- `/audits/:id` - Audit details view
- `/audits/:id/edit` - Edit existing audit

### Navigation Flow

```
Audits List
├── Create New Audit → Creation Form → Success → Audit Details
├── View Audit → Audit Details
│   └── Edit Audit → Edit Form → Success → Audit Details
└── Bulk Operations → Confirmation → Updated List
```

## User Permissions

### Role-Based Access Control

**Create Audits**: `auditor`, `supervisor_auditor`, `cro`, `admin`, `super_admin`

**Edit Audits**: 
- Own audits: `auditor`, `supervisor_auditor`
- All audits: `cro`, `admin`, `super_admin`

**View Audits**: `reviewer`, `auditor`, `supervisor_auditor`, `cro`, `admin`, `super_admin`

**Delete Audits**: `supervisor_auditor`, `cro`, `admin`, `super_admin`

## State Management

### Form State

Uses React Hook Form for:
- Form validation
- Field state management
- Error handling
- Dynamic field arrays (objectives)

### Component State

- `currentStep`: Current wizard step (1-5)
- `showAIAssistant`: AI assistant visibility
- `aiGenerating`: AI generation loading state
- `users`: Available auditors list
- `businessUnits`: Available business units

## Error Handling

### Client-Side Validation

- Real-time field validation
- Form submission validation
- Custom validation messages
- Visual error indicators

### Server-Side Error Handling

```typescript
const handleSaveAudit = async (auditData: AuditFormData) => {
  try {
    await onSave(auditData);
    toast.success(`Audit ${mode === 'create' ? 'created' : 'updated'} successfully!`);
  } catch (error) {
    if (error.response?.status === 400) {
      // Handle validation errors
      toast.error('Please check your input and try again');
    } else if (error.response?.status === 403) {
      // Handle permission errors
      toast.error('You do not have permission to perform this action');
    } else {
      // Handle generic errors
      toast.error(`Failed to ${mode} audit. Please try again.`);
    }
  }
};
```

## Styling & UI

### Design System

- **Colors**: Blue primary, semantic colors for status
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px grid system
- **Components**: Radix UI base components
- **Animations**: Framer Motion for smooth transitions

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## Testing Strategy

### Unit Tests

```typescript
// Example test structure
describe('AuditForm', () => {
  it('should validate required fields', () => {
    // Test form validation
  });
  
  it('should generate AI content', () => {
    // Test AI integration
  });
  
  it('should handle form submission', () => {
    // Test form submission
  });
});
```

### Integration Tests

- Form navigation flow
- Data persistence
- API integration
- Error scenarios

### E2E Tests

- Complete audit creation workflow
- Edit audit flow
- Validation scenarios
- Cross-browser compatibility

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load audit components
const AuditForm = React.lazy(() => import('./components/audit/AuditForm'));
const EditAuditPage = React.lazy(() => import('./pages/audits/EditAuditPage'));
```

### Memoization

```typescript
// Memoize expensive calculations
const filteredAudits = useMemo(() => {
  return audits.filter(audit => {
    // Filtering logic
  });
}, [audits, filters]);
```

### Virtual Scrolling

For large audit lists, implement virtual scrolling to improve performance.

## Accessibility

### WCAG 2.1 Compliance

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

### Implementation

```typescript
// Example accessibility implementation
<button
  aria-label={`Edit audit: ${audit.title}`}
  onClick={() => navigate(`/audits/${audit.id}/edit`)}
  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <Edit className="w-4 h-4" />
</button>
```

## Internationalization

### Translation Keys

```typescript
// Common audit translations
'audit.title': 'Audit Title'
'audit.description': 'Description'
'audit.objectives': 'Audit Objectives'
'audit.scope': 'Audit Scope'
'audit.methodology': 'Audit Methodology'
'audit.newAudit': 'Create New Audit'
'audit.editAudit': 'Edit Audit'
```

### Usage

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// In component
<label>{t('audit.title', 'Audit Title')}</label>
```

## Future Enhancements

### Planned Features

1. **Audit Templates**: Pre-defined audit templates for common audit types
2. **Workflow Integration**: Integration with approval workflows
3. **Document Management**: File attachments and evidence management
4. **Collaboration Tools**: Real-time collaboration and comments
5. **Advanced Analytics**: Audit metrics and performance dashboards
6. **Mobile App**: Native mobile application for field audits
7. **Offline Support**: Offline audit capabilities with sync
8. **Integration APIs**: Third-party system integrations

### Technical Improvements

1. **Performance**: Virtual scrolling for large datasets
2. **Caching**: Implement intelligent caching strategies
3. **Real-time Updates**: WebSocket integration for live updates
4. **Progressive Web App**: PWA capabilities for better mobile experience
5. **Advanced Search**: Full-text search with Elasticsearch
6. **Automated Testing**: Comprehensive test coverage

## Troubleshooting

### Common Issues

**Form Validation Errors**:
- Check required field completion
- Verify date range validity
- Ensure proper data types

**AI Generation Failures**:
- Check AI service availability
- Verify API credentials
- Review network connectivity

**Permission Errors**:
- Verify user role assignments
- Check business unit access
- Confirm audit ownership

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Audit form data:', formData);
}
```

## Support & Maintenance

### Regular Tasks

- Monitor form submission success rates
- Review AI generation performance
- Update validation rules as needed
- Maintain audit type and status lists
- Review user feedback and feature requests

### Health Checks

- Form validation accuracy
- AI service response times
- Database query performance
- User experience metrics
- Error rate monitoring

This comprehensive audit management module provides a robust foundation for audit creation, editing, and management within the GRC platform, with room for future enhancements and scalability.