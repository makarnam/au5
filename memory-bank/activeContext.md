# Active Context

Current Focus:
- Initialize Memory Bank with core files and consistent templates
- Establish structure to persist project knowledge across sessions

Recent Changes:
- Created core files:
  - projectbrief.md
  - productContext.md
  - systemPatterns.md
  - techContext.md
- Pending creation:
  - progress.md (to track status and next steps)

Decisions & Conventions:
- Follow memory-bank-rules.md hierarchy and workflows
- Core files act as living documents; update after significant changes
- Use SQL-first approach for DB, service-layer for data access in app
- RLS-first security model in Supabase

Next Steps (Short-term):
- Create progress.md scaffold and start tracking current status
- Fill projectbrief.md with concrete scope and goals
- Add concrete user personas and success metrics in productContext.md
- Confirm global state management (Zustand vs hooks) and document in techContext.md

Known Risks / Open Questions:
- Global state solution confirmation
- AI provider toggling strategy and diagnostics flow
- CI/CD pipeline definition and documentation

Links / References:
- Source control: GitHub repo (origin)
- Supabase schema and migrations: sql/** and Supabase_Database_Schema.sql
- UI primitives: src/components/ui
- Services: src/services/*
- Supabase client: src/lib/supabase.ts
