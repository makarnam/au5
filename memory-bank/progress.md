# Progress

Current Status:
- TODO.md normalized with concrete tasks, references, and acceptance criteria
- ActiveContext updated to reflect actionable next steps per module
- Core modules present in codebase: audits, findings, risks, compliance, workflows

What Works:
- Core files created:
  - projectbrief.md
  - productContext.md
  - systemPatterns.md
  - techContext.md
  - activeContext.md
- Consistent templates aligned with memory-bank-rules.md
- SQL-first migrations and module structure in sql/** verified
- Service-layer pattern in place (src/services/*), Supabase client configured (src/lib/supabase.ts)

In Progress:
- Audit Management:
  - AuditWizard + AuditForm validation and Supabase integration (src/components/audit/*, src/services/auditService.ts)
  - Scheduling approach design using sql/workflows/*
- Findings:
  - UI wiring to findingsService and SQL policies (src/services/findingsService.ts, sql/findings/*)
- Risks:
  - Define scoring formula and persistence (sql/risks/*)
- Compliance:
  - Framework CRUD and control mapping UX (sql/compliance/*, src/components/controls/*)
- UI/UX:
  - Global ErrorBoundary, responsive audits of key screens, consistent loading states
- Internationalization:
  - Language selector, key extraction, RTL support
- Performance:
  - Lazy routes and bundle analysis
- Deployment:
  - Draft CI workflow (lint, typecheck, test, build)

What’s Next:
- Implement acceptance criteria from TODO.md per module starting with Audit Wizard
- Add audit_templates schema and CRUD UI
- Establish risk score history and dashboard KPIs
- Add evidence upload flow via Supabase Storage and RLS gating
- Introduce ErrorBoundary and wrap route tree
- Add language selector and persist preference

Known Issues / Risks:
- Pending decision on global state solution (Zustand vs hooks-only)
- AI provider toggling and diagnostics flow to be finalized
- CI/CD and automated migrations pipeline not yet documented

Changelog:
- [2025-08-04] Updated: TODO.md normalized with file/SQL references and AC
- [2025-08-04] Updated: activeContext.md with module-specific next steps

Open Questions:
- Do we standardize on Zustand or stick to hooks-only?
- Which AI models/providers are supported beyond local Ollama?
- What environments and deployment targets are planned?

References:
- Repo: origin (GitHub)
- DB schema & migrations: sql/** and Supabase_Database_Schema.sql
- App modules: src/components, src/pages, src/services, src/lib
- Alignment source: TODO.md
