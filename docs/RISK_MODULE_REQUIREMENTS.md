# Risk Module Requirements

Source: [risk_module_requirements.md/risk_module_requirements.md/risk_module.md](risk_module_requirements.md/risk_module_requirements.md/risk_module.md)

This document structures the provided requirements into traceable items with IDs, phases, and acceptance criteria. Use these IDs in commits, PRs, migrations, and UI work.

## Legend
- ID format: R-[AREA]-NNN
  - AREA:
    - REG: Registry & Identification
    - ASM: Assessment
    - TRT: Treatment & Controls
    - MON: Monitoring & Reporting
    - UX: User Experience
    - ADV: Advanced Capabilities
    - MET: Success Metrics
    - PRI: Development Priorities
- Phase: P1 (MVP), P2 (Advanced Analytics), P3 (Integrations), P4 (AI/ML)
- AC: Acceptance Criteria

---

## 1. Risk Registry & Identification

- R-REG-001 (P1) Risk Catalog
  - Desc: Centralized repository for all organizational risks.
  - AC:
    - Risks are stored in normalized tables with RLS.
    - CRUD via PostgREST and UI list/detail pages exist.
    - Unique key and audit trail present.
- R-REG-002 (P1) Risk Categories
  - Desc: Support standard frameworks (COSO, ISO 31000, NIST).
  - AC:
    - Category taxonomy table with seed data for COSO, ISO 31000, NIST.
    - Risks can associate with one primary category and many tags.
- R-REG-003 (P2) Risk Hierarchies
  - Desc: Parent-child relationships and risk groupings.
  - AC:
    - Self-referential parent_id, adjacency or nested set support.
    - Aggregations roll-up residual/inherent scores to parents.
- R-REG-004 (P2) Risk Templates
  - Desc: Pre-built risk scenarios for common business areas.
  - AC:
    - Template table, instantiation function to create risk from template.
    - UI wizard provides template selection.
- R-REG-005 (P1) Custom Risk Creation
  - Desc: Allow users to define organization-specific risks.
  - AC:
    - Create form with validation: title, description, owner, category, appetite link.
    - Audit log entry created on creation/update.

## 2. Risk Assessment Engine

- R-ASM-001 (P1) Qualitative Assessment Matrices
  - Desc: Likelihood × Impact matrices (3×3, 4×4, 5×5).
  - AC:
    - Configurable matrix size, enumerations persisted.
    - Score computation function returns inherent/residual qualitative score.
- R-ASM-002 (P3/P4) Quantitative Assessment
  - Desc: Monte Carlo simulations, VaR calculations.
  - AC:
    - Stored procedure accepts distributions, iterations; returns percentile metrics.
    - VaR function available; results saved as assessment snapshots.
- R-ASM-003 (P2) Multi-dimensional Scoring
  - Desc: Consider velocity, detectability, complexity.
  - AC:
    - Additional dimensions supported with weights; final normalized score computed.
- R-ASM-004 (P1) Inherent vs Residual Risk
  - Desc: Track risk levels before and after controls.
  - AC:
    - Assessment records capture both inherent and residual, linked to control effectiveness at time of assessment.
- R-ASM-005 (P1) Risk Appetite Integration
  - Desc: Color-coded indicators against defined thresholds.
  - AC:
    - Appetite thresholds table at org/profile level; score mapping to Red/Amber/Green.

## 3. Risk Treatment & Controls

- R-TRT-001 (P1) Control Library
  - Desc: Centralized repository of risk controls.
  - AC:
    - Controls table exists (re-use controls module). Many-to-many mapping risks_controls.
- R-TRT-002 (P2) Control Effectiveness
  - Desc: Track design and operational effectiveness.
  - AC:
    - Effectiveness ratings with history and test references.
- R-TRT-003 (P1) Treatment Strategies
  - Desc: Accept, Avoid, Transfer, Mitigate.
  - AC:
    - Enum strategy with governance checks; stored function validates transitions.
- R-TRT-004 (P1) Action Plans
  - Desc: Remediation workflows with owners and deadlines.
  - AC:
    - Tasks with owner, due date, status; notifications on SLA breaches; ties into workflows module.
- R-TRT-005 (P2) Control Testing
  - Desc: Schedule and track control assessments.
  - AC:
    - Link to controls test schedules; outcome feeds control effectiveness.

## 4. Risk Monitoring & Reporting

- R-MON-001 (P2) Risk Dashboards
  - Desc: Executive and operational views.
  - AC:
    - Dashboard views with KPIs, role-based visibility.
- R-MON-002 (P2) Heat Maps
  - Desc: Visual risk landscape.
  - AC:
    - Matrix heatmap by likelihood/impact with counts; drill-through to risks.
- R-MON-003 (P2) Trend Analysis
  - Desc: Risk evolution over time.
  - AC:
    - Time-series of residual/inherent, sparkline charts, filters by category/owner.
- R-MON-004 (P2) KRIs
  - Desc: Automated monitoring and alerting.
  - AC:
    - KRI definitions with thresholds, data source reference, breach detection job; notifications created.
- R-MON-005 (P3) Regulatory Reporting
  - Desc: Pre-built templates for frameworks.
  - AC:
    - Parameterized report queries and export to PDF/CSV.

## Key Features to Implement — User Experience

- R-UX-001 (P1) Risk Wizard
  - Desc: Guided risk identification and assessment.
  - AC:
    - Multi-step wizard: details → categories → assessment → controls → treatment → review.
    - Route exists at /risks/create-wizard and is accessible from Risks list. [Implemented in UI: ['src/pages/risks/CreateRiskWizard.tsx'](src/pages/risks/CreateRiskWizard.tsx)]
- R-UX-002 (P2) Bulk Operations
  - Desc: Import/export for large populations.
  - AC:
    - CSV/Excel import with validation report; export with filters.
- R-UX-003 (P1) Advanced Search
  - Desc: Filter/sort by multiple criteria.
  - AC:
    - Server-side filtering via PostgREST; saved views.
    - Baseline filters wired in service/store for list retrieval. [Partially in P1: ['src/services/riskService.ts'](src/services/riskService.ts)]
- R-UX-004 (P2) Customizable Views
  - Desc: User-defined dashboards and reports.
  - AC:
    - Persisted layouts and saved widgets per user.
- R-UX-005 (P1) Notification System
  - Desc: Alerts for risk threshold breaches.
  - AC:
    - Hooks to notifications RPC; unsubscribe/subscribe per user.
    - Appetite breach and task-SLA hooks planned at store mutation boundaries (assessment/treatment). [Planned P1 hooks]

## Advanced Capabilities

- R-ADV-001 (P3) Risk Correlation Analysis
  - Desc: Identify interconnected risks.
  - AC:
    - Association matrix or graph representation; top-N correlated pairs.
- R-ADV-002 (P3) Scenario Modeling
  - Desc: What-if analysis.
  - AC:
    - Temporarily adjust parameters; recompute portfolio metrics without persisting.
- R-ADV-003 (P3) Third-Party Risk
  - Desc: Vendor/partner assessments.
  - AC:
    - Link risks to vendors; vendor profile scoring; reporting views.
- R-ADV-004 (P3) Risk Aggregation
  - Desc: Portfolio-level calculations.
  - AC:
    - Aggregation by BU/category, with de-duplication logic and correlation factor.
- R-ADV-005 (P4) Machine Learning
  - Desc: Prediction/anomaly detection.
  - AC:
    - Feature store outline, batch inference job, evaluation metrics.

## Success Metrics

- R-MET-001 (P1→) User Adoption
  - AC: Track MAU and usage of key features.
- R-MET-002 (P1→) Risk Coverage
  - AC: % of processes with risks; computed monthly.
- R-MET-003 (P1→) Response Time
  - AC: Median time identification→treatment; report and trend.
- R-MET-004 (P2→) Compliance Rate
  - AC: Adherence to policies; report by BU.
- R-MET-005 (P3→) ROI Measurement
  - AC: Savings estimation model and KPI.

## Development Priorities

- R-PRI-001 Phase 1 (P1): Basic registry and assessment
  - Scope: R-REG-001/002/005, R-ASM-001/004/005, R-TRT-003/004, R-UX-001/003/005, instrumentation for R-MET-001/002/003.
  - Current Status (P1):
    - SQL schema, RLS, RPCs and seeds applied to Supabase. [Executed via MCP]
    - UI routes/pages: RisksList, CreateRiskPage, RiskDetails (lazy), CreateRiskWizard (lazy) available. [See ['src/App.tsx'](src/App.tsx:83)]
    - Service/store wired for list/detail and mutations. [See ['src/services/riskService.ts'](src/services/riskService.ts), ['src/store/riskStore.ts'](src/store/riskStore.ts)]
    - Notifications: appetite breach and task SLA hooks planned at store mutation points; to be implemented next.
- R-PRI-002 Phase 2 (P2): Advanced analytics and reporting
  - Scope: R-REG-003/004, R-ASM-003, R-TRT-002/005, R-MON-001/002/003/004, R-UX-002/004, R-MET-004.
- R-PRI-003 Phase 3 (P3): Integrations
  - Scope: R-ASM-002 (quant parts that need infra), R-MON-005, R-ADV-001/002/003/004, R-MET-005.
- R-PRI-004 Phase 4 (P4): AI/ML
  - Scope: R-ASM-002 full, R-ADV-005.
