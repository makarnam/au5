# System Patterns

Architecture Overview:
- Frontend: React + Vite + TypeScript + Tailwind
- Backend/Data: Supabase (Postgres, RLS, Auth), PostgREST
- AI: Optional local Ollama integration; AI service abstraction in src/services
- State: React Query for server state; Lightweight client state (Zustand or simple hooks) [pending confirmation]; Supabase as source of truth

Domain Modules:
- Controls
- Audits
- Findings
- Compliance
- Risks
- Workflows
- AI Configuration/Generation
- Users/Auth/Profiles
- Analytics
- Document management
- Policy management
- Vendor management
- Incident management
- Asset management
- Training and certification
- Advanced Analytics
- Settings



Key Design Patterns:
- Feature-first directory structure with domain services in src/services/*
- Thin UI components; data access via service layer (e.g., controlService, auditService)
- DTO-style mapping at service boundary where needed
- Centralized Supabase client in src/lib/supabase.ts
- RLS-first database design; row-level access enforced at DB
- SQL-first migrations in sql/** with module-oriented files
- Reusable UI primitives in src/components/ui (button, input)
- Progressive enhancement for AI features (graceful fallback when AI unavailable)
- Error Boundary at app shell level to isolate failures per route
- Internationalization keys colocated with features; language selector in Settings
- Lazy-loaded route modules for heavy domains (audits, controls, workflows)

Data Access & RLS Patterns:
- Policies: per-module policies defined in sql/*/ and sql/migrations/*
- Use Supabase authenticated client in browser; apply minimal server secrets
- Role separation: anon, authenticated, service role for migrations/maintenance
- Views and functions where complex joins or security predicates needed

Error Handling & Observability:
- Service methods return typed results; handle Supabase errors centrally
- UI: bubble user-friendly errors; log technical details to console (dev) or logging service (prod)
- Database: use Postgres functions for critical side-effects with guard-rails

Workflow & Approvals Pattern:
- Approval states via enums; transitions enforced by DB functions and RLS
- Timeline components for auditability (e.g., ApprovalTimeline)

AI Integration Pattern:
- aiService mediates model provider (Ollama/local vs remote, openai, claude or open router)
- Prompt templates versioned; deterministic inputs; include safety checks
- Fallbacks when AI unreachable; diagnostics page (OllamaDiagnostic)

Security & Permissions:
- Principle of least privilege in RLS
- Use Supabase Auth JWT claims for org/user scoping
- Separate admin-only UIs with ProtectedRoute

Testing & Verification:
- Unit tests colocated under src/__tests__ (components and services)
- Integration tests using MSW for Supabase API boundaries
- E2E baseline with Playwright for critical flows (audits, controls)
- SQL verification scripts under sql/diagnostics and sql/**/verify*.sql

Performance:
- Client-side pagination and lazy-loaded routes for large modules
- DB indexes aligned with queries; migration scripts include index creation
- Avoid N+1 via views or RPC functions
- Bundle analysis via vite-bundle-visualizer; tree-shake Radix/Framer Motion when possible

Internationalization:
- i18n scaffolding in src/i18n with index.ts as entry; keys colocated by feature

Open Questions / To Validate:
- Global state solution confirmation
- Background jobs cadence for compliance checks
