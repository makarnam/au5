# AI Auditor GRC - Project TODO

## Project Overview
AI-powered Audit Management System with Governance, Risk & Compliance features built with:
- React 18
- TypeScript
- Vite
- Supabase
- Tailwind CSS
- React Query
- React Hook Form + Zod
- i18next for internationalization
- Framer Motion for animations
- Various Radix UI components


## Core Features
### Audit Management
- [ ] Audit Wizard: finalize steps, Zod validation, and Supabase integration
      - Ref: src/components/audit/AuditWizard.tsx, src/components/audit/AuditForm.tsx
      - AC: Step navigation, form schema validation, create records via src/services/auditService.ts
- [ ] Implement audit scheduling
      - Ref: sql/workflows/*, src/pages/audits/
      - AC: Create schedule table/functions; UI to schedule and list upcoming audits
- [ ] Set up audit templates
      - Ref: sql/audit (add audit_templates), components/audit/*
      - AC: CRUD for templates; apply template when creating audit
- [ ] Create audit findings management
      - Ref: src/components/Findings.tsx, src/services/findingsService.ts, sql/findings/*
      - AC: Link audits→findings, CRUD, status transitions, tests
- [ ] Implement audit reporting
      - Ref: sql/audit/03_audit_views_reporting.sql
      - AC: Reports page with filters; export CSV/PDF

### Risk Management
- [ ] Risk assessment workflows
      - Ref: sql/risks/*, src/pages/risks/, src/services/riskService.ts
      - AC: Assessment forms, approval flow, RLS verified
- [ ] Risk scoring system
      - Ref: sql/risks/risks-module-migration.sql
      - AC: Define scoring formula, UI visualization, persisted score history
- [ ] Risk mitigation tracking
      - AC: Tasks with owners/dates; status timeline
- [ ] Risk reporting dashboard
      - AC: KPIs, filters, trend charts

### Compliance
- [ ] Compliance framework management
      - Ref: sql/compliance/*, src/services/compliance.ts, docs/COMPLIANCE_MODULE.md
      - AC: CRUD frameworks/requirements; RLS policies in place
- [ ] Control mapping
      - Ref: src/components/controls/*, docs/CONTROLS_MODULE_DOCUMENTATION.md
      - AC: Map controls↔requirements; conflict detection
- [ ] Evidence collection
      - AC: Upload to Supabase Storage; link to controls/findings; access via RLS
- [ ] Compliance reporting
      - AC: Coverage metrics; export

## UI/UX Improvements
- [ ] Implement responsive design
      - AC: Audit key screens at 360px/768px/1024px
- [ ] Create loading states
      - Ref: src/components/LoadingSpinner.tsx
      - AC: Ensure all async pages use spinner/skeletons
- [ ] Add error boundaries
      - AC: Create src/components/common/ErrorBoundary.tsx and wrap routes
- [ ] Implement proper form validation
      - Ref: React Hook Form + Zod
      - AC: Audit AuditForm, ControlForm, ControlSetForm
- [ ] Add tooltips and help text
      - AC: Use Radix Tooltip with i18n keys
- [ ] Create a design system/component library
      - Ref: src/components/ui/*
      - AC: Consolidate Tailwind tokens; document usage

## Internationalization
- [ ] Set up i18n configuration
      - Ref: src/i18n/index.ts
      - AC: Ensure namespaces and init options documented
- [ ] Add language selector
      - AC: Add to Settings page; persist preference
- [ ] Translate UI components
      - AC: Extract strings, add keys, pluralization
- [ ] Support RTL languages
      - AC: Tailwind RTL utilities and layout verification

## Performance Optimization
- [ ] Implement code splitting / lazy routes
      - AC: Lazy-load audits, controls, workflows routes
- [ ] Optimize bundle size
      - AC: Tree-shake Radix/Framer Motion; analyze with vite-bundle-visualizer
- [ ] Set up caching strategies
      - Ref: React Query
      - AC: Per-service cache times, pagination, invalidation

## Testing
- [ ] Unit tests for components
      - Ref: src/__tests__/components/, src/__tests__/components/audit/
      - AC: AuditWizard, AuditForm, Controls components
- [ ] Integration tests for features
      - AC: Services with MSW for Supabase API
- [ ] E2E testing
      - AC: Playwright baseline scenarios for audits/controls
- [ ] Performance testing
      - AC: Lighthouse CI thresholds in CI

## Deployment
- [ ] Set up CI/CD pipeline
      - AC: GitHub Actions: install, lint, typecheck, test, build, artifact
- [ ] Configure staging/production environments
      - AC: Vite envs, Supabase projects, secure keys
- [ ] Set up monitoring and error tracking
      - AC: Sentry integration with ErrorBoundary
- [ ] Configure logging
      - AC: Structured client logs; Supabase logs dashboards

## Documentation
- [ ] API documentation
      - AC: Document services in src/services/*
- [ ] User guide
      - AC: Task-based guides for audits/controls/risks
- [ ] Developer documentation
      - AC: CONTRIBUTING, env setup, run scripts
- [ ] Architecture decision records (ADRs)
      - AC: Capture key choices (state mgmt, RLS patterns, AI providers)

## Future Enhancements
- [ ] AI-powered audit recommendations
- [ ] Automated compliance checking
- [ ] Integration with third-party tools
- [ ] Mobile app
- [ ] Advanced analytics and reporting

## Notes
- Review the existing SQL setup files for database structure (sql/** and Supabase_Database_Schema.sql)
- Check the src/pages and src/components directories for existing features
- The project uses React Query for server state management
- Zustand is used for client state management (confirm and document)
- The UI is built with Tailwind CSS and Radix UI components
- See docs/* for module docs and troubleshooting guides
