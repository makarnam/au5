# Active Context

Current Focus:
- Normalize TODO.md to concrete, actionable tasks mapped to existing code and SQL modules
- Finalize Audit Wizard steps, Zod schemas, and Supabase integration
- Wire Findings UI to findingsService and SQL module; plan reporting views
- Define Risk scoring approach and assessment workflows
- Establish Compliance framework CRUD and control mapping UX
- Add global ErrorBoundary, responsive audits of key screens, and consistent loading states
- Harden i18n (selector, keys, RTL), and introduce lazy-loaded routes

Recent Changes:
- Updated TODO.md with references (files/SQL) and acceptance criteria per task
- Confirmed presence of core modules: audits, findings, risks, compliance, workflows
- Documented concrete next steps across modules in this Active Context

Decisions & Conventions:
- Follow memory-bank-rules.md hierarchy and workflows
- Core files act as living documents; update after significant changes
- SQL-first approach for DB; service-layer for data access in app
- RLS-first security model in Supabase
- Use React Query for server-state; Zustand likely for lightweight client-state (to confirm and document)

Next Steps (Short-term):
- Audit Management:
  - Complete AuditWizard and AuditForm validation and submission flow (src/components/audit/*, src/services/auditService.ts)
  - Plan audit scheduling leveraging sql/workflows/*
  - Design audit templates schema (sql/audit) and CRUD UI
- Findings:
  - Link audits→findings CRUD, status transitions, tests (src/services/findingsService.ts, sql/findings/*)
- Risks:
  - Define scoring formula and visualization; persist score history (sql/risks/*, riskService)
- Compliance:
  - CRUD frameworks/requirements and control mapping UX; ensure RLS policies (sql/compliance/*)
- UI/UX:
  - Introduce ErrorBoundary and audit responsive design across key screens
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
