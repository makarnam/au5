### Audit Report Generation Module — Specification

#### Project Overview
Develop a comprehensive audit report generation module for an existing GRC system with drag-and-drop report creation, predefined templates, and PDF export.

#### Core Features
- **Report Builder Interface**: Drag-and-drop editor, component library, live preview, template management, responsive design.
- **Database Integration**: Audit, controls, findings, historical data access; real-time sync.
- **Report Templates**: Standard templates for Internal Audit, Compliance Assessment, Risk Assessment, Control Testing, Executive Dashboard.
- **Flexible Components**: Text blocks, data tables, charts/graphs, executive summary, findings matrix, risk register, action plans, appendices, signature blocks, headers/footers with configurable properties (conditional display, dynamic content, custom styling, data filtering).
- **Data Integration Features**: Audit selection, control set selection, finding filters, date range, multi-audit comparison, trend analysis.
- **Export & Output**: PDF, Word, Excel; batch export; scheduled reports; email integration; digital signatures.
- **User Interface**: Intuitive design, role-based access, collaboration, versioning, audit trail.

#### Technical Stack
- **Frontend**: React + TypeScript; Drag-and-Drop via React Beautiful DnD; Charts via Chart.js; Rich Text via TinyMCE/Quill; UI: Material-UI (MUI) or custom.
- **PDF Generation**: Puppeteer or jsPDF.
- **Backend**: RESTful API with pagination/filtering; optimized SQL; caching (Redis); secure storage; queue for large jobs.

#### Database Schema (public)
```sql
CREATE TABLE public.report_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_structure JSONB,
    created_by UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE public.generated_reports (
    id UUID PRIMARY KEY,
    template_id UUID REFERENCES public.report_templates(id),
    title VARCHAR(255),
    parameters JSONB,
    status VARCHAR(50),
    file_path VARCHAR(500),
    created_by UUID,
    created_at TIMESTAMP
);

CREATE TABLE public.report_sections (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    component_type VARCHAR(100),
    configuration JSONB,
    is_active BOOLEAN DEFAULT true
);
```

#### Standard Templates (Sections)
1. **Internal Audit Report**: Executive Summary; Scope & Objectives; Methodology; Key Findings; Risk Assessment; Recommendations; Management Response; Action Plan.
2. **Compliance Assessment Report**: Framework Overview; Compliance Status; Gap Analysis; Non-compliance; Remediation Plan; Timeline & Responsibilities.
3. **Risk Assessment Report**: Risk Landscape; Risk Register; Heat Map; Mitigation; Treatment Plan; Monitoring.
4. **Control Testing Report**: Control Environment; Testing Methodology; Effectiveness Results; Deficiencies; Improvements; Implementation Timeline.
5. **Executive Dashboard Report**: KPIs; Risk Metrics; Compliance Status; Trends; Action Items.

#### Builder Components
- **Palette**: TextBlock, DataTable, Chart, ExecutiveSummary, FindingsMatrix, RiskRegister, ActionPlan, Appendix, SignatureBlock, Header/Footer.
- **Canvas**: Drop zone with reorder, group, and layout controls.
- **Properties Panel**: Per-component props (data sources, filters, style, conditional logic).
- **Preview Panel**: Live preview (print styles aware).
- **Template Manager**: Save/load/update templates with versioning.

#### Component Properties (examples)
- **Data**: source, query, filters (date/department/severity/status), sorting, pagination.
- **Display**: title, description, visibility conditions, empty-state handling.
- **Style**: theme, colors, fonts, spacing, layout variants.
- **Advanced**: computed fields, aggregations, cross-component references.

#### Data Integration
- Services for audits, controls, findings, risks, users.
- Filtering: date ranges, department, severity, status.
- Aggregations: counts, severity distributions, risk scores, trend lines.
- Historical & multi-audit comparisons.
- Real-time sync (subscribe/refresh triggers) where supported.

#### PDF & Output
- Professional formatting: headers/footers, page numbers, ToC, branding.
- Full chart/table rendering; digital signature blocks.
- Batch export; scheduled jobs; email delivery.

#### Security & Compliance
- Role-based access control for builder/export.
- Audit trail of creation/modification/exports.
- Secure storage & transit; encryption for sensitive content.

#### Performance Targets
- Builder load < 3s; 60fps drag/drop.
- PDF export < 30s for standard reports.
- Queries < 2s.

#### Implementation Approach (Phases)
1. Core infrastructure: app structure, basic DnD, data layer, component library.
2. Report builder: full DnD UI, properties panel, templates, live preview.
3. Data integration: connect to DB, filters/search, sample templates.
4. Export & polish: PDF, charts, template library, testing and fixes.

#### Developer Notes
- Prefer application or database-level NULL handling; use COALESCE() prudently.
- Never modify `auth.users`; use complementary tables in `public` schema.
- Ensure responsive design, robust error handling, clear loading/empty states.

#### Success Criteria
- Users can build, configure, and save/share templates.
- Accurate data retrieval and comparisons; professional exports.
- Smooth UX, secure operations, and comprehensive audit trail.


#### Existing GRC Modules Integration Map (Repo-aware)
- **Audits & Audit Planning**
  - UI: `src/pages/audits/*`, `src/components/audit/*`
  - Services: `src/services/auditService.ts`, `src/services/auditPlanningService.ts`
  - Use for: audit selection, scope/objectives, methodology, findings sources, action plans, historical reports.
- **Controls & Control Sets**
  - UI: `src/pages/controls/*`, `src/components/controls/*`
  - Services: `src/services/controlService.ts`, `src/services/controlService-fixed.ts`
  - Use for: control environment, testing methodology, effectiveness results, deficiencies, recommendations.
- **Risk & Risk Control Matrix**
  - UI: `src/pages/risks/*`, `src/components/risk-control-matrix/*`
  - Services: `src/services/operationalRiskService.ts`, `src/services/riskControlMatrixService.ts`
  - Use for: risk register, heat maps, mitigation strategies, treatment plans, findings matrix linkage.
- **Findings & Remediation**
  - UI: `src/pages/findings/*`, `src/components/Findings.tsx`
  - Services: `src/services/findingsService.ts`
  - Use for: key findings, severity, remediation plans, timelines, responsibilities.
- **Documents & Evidence**
  - UI: `src/pages/documents/*`, `src/components/documents/*`
  - Services: `src/services/documentManagementService.ts`, `src/services/documentWorkflowService.ts`
  - Use for: appendices, evidence linking, document export bundling.
- **Workflows & Approvals**
  - UI: `src/pages/workflows/*`, `src/components/workflows/*`
  - Services: `src/services/advancedWorkflowService.ts`, `src/services/documentWorkflowService.ts`
  - Use for: collaboration, comments, approval timelines, signature blocks.
- **Notifications & Email**
  - UI: `src/pages/notifications/*`, `src/components/notifications/*`
  - Services: `src/services/emailService.ts`, `src/services/notificationService.ts`
  - Use for: scheduled reports, batch export notifications, email delivery.
- **Policies/Compliance/Privacy/IT Security/ESG**
  - UI: `src/pages/policies/*`, `src/pages/compliance/*`, `src/pages/privacy/*`, `src/pages/it-security/*`, `src/pages/esg/*`
  - Services: `src/services/policyService.ts`, `src/services/compliance.ts`, `src/services/privacyService.ts`, `src/services/itSecurityService.ts`, `src/services/esgService.ts`
  - Use for: framework overviews, compliance status, gap analysis, KPI sections.
- **Auth, Session & Stores**
  - Lib/Store: `src/lib/supabase.ts`, `src/store/authStore.ts`, `src/components/ProtectedRoute.tsx`
  - Use for: role-based access, audit trail user context, secure headers.
- **Shared Utils**
  - Lib: `src/lib/fetchWithSupabaseHeaders.ts`, `src/lib/sessionInterceptor.ts`, `src/lib/errorHandler.ts`
  - Use for: authenticated API calls, error handling, session-aware data fetch.

##### Data-to-Component Mapping
- Executive Summary → Aggregations from audits/findings/risks services.
- Findings Matrix/Data Table → `findingsService` with filters (severity/status/department/date).
- Risk Register/Heat Map → `operationalRiskService` + matrix service; Chart.js for visuals.
- Control Testing Results → `controlService(-fixed)` effectiveness endpoints.
- Action Plans → audits/findings remediation timelines; workflow approvals for status.
- Appendices → document service with evidence links.

##### Supabase/Database Notes
- Use `public` schema complementary tables for reports (see schema above).
- Never access or mutate `auth.users` directly; join via application-level identifiers.
- Prefer COALESCE for null-safe aggregations; index heavy filters (date/severity/status).

#### Phased Implementation Tasks (for Cursor prompts)
Phase 1 — Core Infrastructure
- Scaffold report builder shell (palette, canvas, properties, preview) with React + TS.
- Set up state management (Zustand or Redux Toolkit) for builder state and undo/redo.
- Create base component contracts and registry (TextBlock, DataTable, Chart, ExecutiveSummary, FindingsMatrix).
- Add authenticated fetch utilities integration using `fetchWithSupabaseHeaders`.

Phase 2 — Report Builder Features
- Implement drag-and-drop with React Beautiful DnD, persistence to `public.report_templates`.
- Build properties panel with schema-driven props and validation.
- Implement live preview with print styles and per-component conditional visibility.
- Add template manager UI (save, load, version list) and share controls (RBAC-aware).

Phase 3 — Data Integration
- Wire services: audits, controls, findings, risks, documents; add filtering and search.
- Implement aggregations for executive summary, risk distributions, trends.
- Support multi-audit selection and historical comparisons.
- Add caching layer hooks (client memoization + server-side Redis where applicable).

Phase 4 — Export & Delivery
- Implement PDF export via Puppeteer (headers/footers, ToC, page numbers, branding).
- Render charts/tables in PDF; add signature blocks and approval capture.
- Batch export and scheduling; integrate email delivery via `emailService`.
- Add audit trail logging for template edits and report exports.


