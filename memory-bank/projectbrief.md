# Project Brief

Purpose:
- Establish an AI-powered GRC platform that unifies audits, risks, and compliance with strong RLS-backed data integrity.
- Serve as the single source of truth for scope, priorities, and constraints across modules.

Project Name:
- AI Auditor GRC

Problem Statement:
- Organizations struggle to coordinate audits, maintain compliance evidence, and quantify risk consistently.
- Existing tools are siloed or manual (spreadsheets), leading to inefficiencies, missed mappings, and poor audit readiness.

Goals & Outcomes:
- Primary:
  - Deliver an AI-assisted compliance and audit platform with secure, multi-tenant data (Supabase + RLS).
  - Provide structured workflows for audits, findings, risks, and compliance frameworks.
- Secondary:
  - Streamline controls management and mapping to frameworks.
  - Improve visibility via reporting and dashboards; accelerate content authoring with AI.
  - Establish clear developer ergonomics and repeatable SQL-first migrations.

Key Users & Personas:
- Compliance Manager
- Auditor / Lead Auditor
- Security Lead / CISO
- Admin
- Business Users / Control Owners

Core Features (High-Level):
- Controls module, Audits module, Findings module, Risk management, Compliance frameworks, Workflows
- AI generation (controls, mappings, audit content), Diagnostics for AI providers
- Reporting and dashboards for audit and compliance coverage

Success Criteria:
- Reduce time to create audits and collect evidence by X%
- Increase coverage of control-to-requirement mappings
- Shorten audit reporting cycle time
- Maintain strict access controls via RLS with no policy violations in tests

Non-Goals / Out of Scope:
- Building a full-featured ticketing system (integrations considered later)
- Server-side admin operations exposed to client (service role remains out of browser)
- Real-time collaboration beyond Supabase Realtime baseline

Constraints & Assumptions:
- Supabase Postgres in Cloud with RLS; SQL-first migrations split per module
- React + Vite + TypeScript + Tailwind; React Query for server state
- Optional local Ollama; AI abstracted via aiService; providers may expand later
- Use GitHub Actions for CI once introduced; avoid long-running server processes
- May use Supabase MCP for DB inspection/operations (when enabled)

Milestones:
- M1: Architecture + baseline modules (controls, audits, findings, risks, compliance schema)
- M2: AI integration (generation flows, diagnostics)
- M3: Workflows + reporting/analytics, scheduling
- M4: Stabilization, performance, i18n, CI/CD

Versioning & Governance:
- Source control: GitHub (origin)
- Branching strategy: Trunk-based with short-lived feature branches (to be validated)
- Code quality: ESLint, TypeScript checks, unit/integration tests; SQL verification scripts

Risks:
- AI provider reliability and cost variability; mitigation: abstraction + diagnostics
- RLS/policies complexity; mitigation: verification scripts and incremental rollout
- Scope creep across many modules; mitigation: enforce TODO.md AC per feature
