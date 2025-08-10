# Active Context

Current Focus:
- ✅ Audit Templates: Complete CRUD functionality implemented with template selection in AuditWizard
- ✅ ErrorBoundary: Global error handling component created and ready for route integration
- ✅ Enhanced AuditWizard: 4-step process with template selection and improved UX
- ✅ SQL Migration: audit_templates table with RLS policies and sample data
- Wire Findings UI to findingsService and SQL module; plan reporting views
- Define Risk scoring approach and assessment workflows
- Establish Compliance framework CRUD and control mapping UX
- Add responsive audits of key screens and consistent loading states
- Harden i18n (selector, keys, RTL), and introduce lazy-loaded routes

Recent Changes:
- ✅ Implemented complete audit templates functionality:
  - AuditTemplateManager component with full CRUD operations
  - Template selection integration in AuditWizard
  - SQL migration with RLS policies and sample templates
  - Template pre-filling and validation in audit creation flow
- ✅ Created ErrorBoundary component for global error handling
- ✅ Enhanced AuditWizard with 4-step process and template selection
- Updated TODO.md with references (files/SQL) and acceptance criteria per task
- Confirmed presence of core modules: audits, findings, risks, compliance, workflows
- Documented concrete next steps across modules in this Active Context

Decisions & Conventions:
- Follow memory-bank-rules.md hierarchy and workflows
- Core files act as living documents; update after significant changes
- SQL-first approach for DB; service-layer for data access in app
- RLS-first security model in Supabase
- Use React Query for server-state; Zustand likely for lightweight client-state (to confirm and document)
- ✅ Template-based audit creation for consistency and efficiency
- ✅ ErrorBoundary pattern for graceful error handling

Next Steps (Short-term):
- Audit Management:
  - ✅ Complete AuditWizard and AuditForm validation and submission flow (src/components/audit/*, src/services/auditService.ts)
  - ✅ Audit templates CRUD and selection flow implemented
  - Plan audit scheduling leveraging sql/workflows/*
  - Design audit reporting views and export functionality
- Findings:
  - Link audits→findings CRUD, status transitions, tests (src/services/findingsService.ts, sql/findings/*)
  - Create findings management UI and reporting
- Risks:
  - Define scoring formula and visualization; persist score history (sql/risks/*, riskService)
- Compliance:
  - CRUD frameworks/requirements and control mapping UX; ensure RLS policies (sql/compliance/*)
- UI/UX:
  - ✅ ErrorBoundary component ready for route integration
  - Audit responsive design across key screens
  - Ensure consistent loading states with LoadingSpinner
- Internationalization:
  - Language selector, extract strings, pluralization, RTL checks
- Performance:
  - Lazy routes for large modules; bundle analysis and library tree-shaking
- Deployment:
  - Draft GitHub Actions workflow for CI (lint, typecheck, test, build)

Known Risks / Open Questions:
- Global state solution confirmation (Zustand vs hooks-only)
- AI provider toggling strategy and diagnostics flow
- CI/CD pipeline specifics and environment promotion strategy

Links / References:
- Source control: GitHub repo (origin)
- Supabase schema and migrations: sql/** and Supabase_Database_Schema.sql
- UI primitives: src/components/ui
- Services: src/services/*
- Supabase client: src/lib/supabase.ts
- TODO alignment reference: TODO.md (root)
- ✅ New components: src/components/audit/AuditTemplateManager.tsx, src/components/common/ErrorBoundary.tsx
- ✅ New pages: src/pages/audits/AuditTemplatesPage.tsx
- ✅ New SQL: sql/audit_templates.sql
