# Product Context

Why This Project Exists:
- Compliance, audit, and risk teams rely on fragmented tools and manual processes that slow audits and reduce visibility.
- A unified, AI-assisted GRC platform reduces friction, improves mapping accuracy, and accelerates audit readiness.

Target Users & Use Cases:
- Personas:
  - Compliance Manager: Establish frameworks, map controls, monitor coverage, generate reports.
  - Business Users / Control Owners: Maintain controls, upload evidence, respond to findings.
  - Auditor / Lead Auditor: Plan audits, collect evidence, track findings, produce reports.
  - Security Lead / CISO: View risk posture, approve treatments, monitor KPIs.
  - Admin: Manage users, organizations, permissions, and environment configuration.
- Primary Use Cases:
  - Define and maintain frameworks/requirements; map controls to requirements.
  - Plan and execute audits; capture findings; generate audit reports.
  - Identify and assess risks; apply scoring; track mitigations.
  - Orchestrate workflows for approvals and scheduling.
  - Use AI to draft controls, suggest mappings, and accelerate audit content.

User Experience Goals:
- Clarity and speed with low-friction forms and sensible defaults.
- Transparency and auditability with timelines and clear status indicators.
- Accessible navigation; robust feedback with loading and error states.
- Internationalization-ready with language selector and RTL support.

Value Proposition:
- Reduce time-to-audit and evidence collection through structured workflows.
- Increase mapping coverage and evidence quality via guided UI and AI suggestions.
- Improve risk visibility and decision-making with dashboards and reports.

Competitive Landscape / Alternatives:
- Internal spreadsheets and email workflows.
- Legacy GRC tools with heavy configuration overhead.
- Differentiator: modern UX, SQL-first transparency, and AI embedded across modules.

Core Workflows (Narrative):
- Controls lifecycle: create → map → review → approve → monitor
- Audits lifecycle: plan → execute → record evidence/findings → report
- Risks lifecycle: identify → assess → score → treat → monitor
- Findings lifecycle: open → assign → remediate → validate → close
- Approvals workflow: initiate → notify → approve/reject → record trail
- AI assistance points:
  - Control authoring and mapping suggestions (docs/ENHANCED_AI_CONTROL_GENERATOR.md)
  - Audit content generation and diagnostics (src/services/aiService.ts, components/ai/*)

Success Metrics:
- Adoption: weekly active users per role; number of modules used per week.
- Efficiency: time to create audit and compile report; time to map a control.
- Quality: reduction in unmapped requirements; higher evidence completeness.
- Compliance posture: audit completion lead time; recurrence rate of issues.

Acceptance Criteria (Product):
- Users can complete end-to-end audit planning to reporting with RLS-protected data.
- Controls can be mapped to frameworks with evidence attached and access-controlled.
- Risks can be assessed with a persistent scoring history and mitigation tracking.
- Internationalization and accessibility baselines met on key flows.
- AI features provide deterministic, reviewable outputs with diagnostics.

Open Questions:
- Finalize supported AI providers and toggling strategy (local vs remote).
- Define scheduling cadences and background job model for workflows.
- Confirm global state approach (Zustand vs hooks-only) and document usage.
