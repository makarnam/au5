# Risk Module Implementation Plan

Sources:
- Requirements: [risk_module_requirements.md/risk_module_requirements.md/risk_module.md](risk_module_requirements.md/risk_module_requirements.md/risk_module.md)
- Structured IDs: [docs/RISK_MODULE_REQUIREMENTS.md](docs/RISK_MODULE_REQUIREMENTS.md)

This plan maps requirements to the existing codebase (SQL, API, UI) with phased delivery and concrete action items.

## Codebase Anchors

- SQL (schema, RLS, RPC):
  - sql/risks/: base module DDL and policies
  - sql/workflows/: generic workflow engine for action plans
  - sql/controls/: control library and testing
- API:
  - PostgREST auto-exposed from DB
  - Supabase RPC functions under public schema
- Frontend:
  - src/pages/risks/: risk pages (to be implemented)
  - src/services/: API clients
  - src/store/: zustand stores for risks
  - src/components/: reusable UI (wizard, heatmap)

## Phase Breakdown

### Phase 1 (P1): Basic registry and assessment

Scope: R-REG-001/002/005, R-ASM-001/004/005, R-TRT-003/004, R-UX-001/003/005, R-MET-001/002/003

Deliverables:
1) SQL
   - Create/verify risks core tables with RLS:
     - risks (id, title, description, owner_id, primary_category_id, status, created_at, updated_at)
     - risk_categories (id, code, label, framework)
     - risk_tags (id, label)
     - risk_tag_map (risk_id, tag_id)
     - risk_assessments (id, risk_id, matrix_size, likelihood, impact, inherent_score, residual_score, appetite_color, assessed_at, assessed_by)
     - risks_controls (risk_id, control_id, rationale)
     - risk_treatments (id, risk_id, strategy, status, created_by, created_at)
     - risk_tasks (id, risk_id, title, due_date, owner_id, status)
     - risk_appetite_thresholds (id, scope, min, max, color)
   - RPC:
     - calculate_qualitative_score(matrix_size, likelihood, impact) → score
     - map_score_to_appetite(score, scope) → color
     - start_risk_treatment(risk_id, strategy) → creates treatment and default tasks
   - Seeds:
     - risk_categories for COSO, ISO 31000, NIST
     - appetite thresholds default
   - Policies:
     - RLS aligning with project user model, owners/editors policy

2) UI
   - Pages:
     - RisksList.tsx: searchable, filterable list
     - CreateRiskWizard.tsx: multi-step wizard (details → category/tags → assessment → controls → treatment → review)
     - RiskDetails.tsx: header (status, owner, category), tabs: Overview, Assessments, Controls, Treatment, Tasks, History
   - Components:
     - RiskWizardStepper.tsx
     - RiskAssessmentForm.tsx (3×3, 4×4, 5×5 selectors)
     - RiskSearchFilters.tsx
   - Store/Service:
     - services/risks.ts: CRUD, assessments, treatments RPC
     - store/riskStore.ts: list, filters, selectedRisk

3) Notifications
   - Integrate with notifications RPC to emit on:
     - task overdue
     - appetite breach (residual_color in Red)

4) Metrics instrumentation
   - Log events for risk created, first assessment time, treatment started; enable dashboard queries later.

### Phase 2 (P2): Advanced analytics and reporting

Scope: R-REG-003/004, R-ASM-003, R-TRT-002/005, R-MON-001/002/003/004, R-UX-002/004, R-MET-004

Deliverables:
1) SQL
   - risk_templates + fn_instantiate_risk_from_template(template_id)
   - risk_hierarchy (parent_id on risks + closure view)
   - multi-dimensional scoring fields and weights table; score computation fn
   - control_effectiveness history, control_tests schedules, outcomes
   - KRI tables: kri_definitions, kri_sources, kri_results, thresholds, notifier job
   - Views:
     - v_risk_heatmap (counts by likelihood/impact)
     - v_risk_trend (time series per risk and category)
     - v_risk_kpis

2) UI
   - Dashboards:
     - ExecutiveDashboard.tsx (KPI cards, heatmap, trends)
     - OperationalDashboard.tsx (my risks, my tasks, KRIs)
   - Visualization:
     - HeatMap.tsx component (drill-through to filtered list)
     - TrendChart.tsx (sparklines)
   - Bulk:
     - ImportExport.tsx with CSV templates and validation preview
   - Customizable views:
     - Saved dashboards layout per user

3) Reporting
   - Export: CSV/Excel from current filters
   - Templates: configurable report presets

### Phase 3 (P3): Integrations and portfolio analytics

Scope: R-ASM-002 (quant infra), R-MON-005, R-ADV-001/002/003/004, R-MET-005

Deliverables:
- Quant assessment infra (Monte Carlo, VaR) via SQL/Edge Functions
- Regulatory reports templates and exporters
- Correlation graph model and UI
- Scenario modeling UI with non-persistent overlay
- Portfolio aggregation queries with correlation factor
- ROI metrics and reporting

### Phase 4 (P4): AI/ML

Scope: R-ASM-002 full, R-ADV-005
- Feature store outline, batch inference pipeline, model registry integration, evaluation dashboard.

## Mapping Requirements → Artifacts

- R-REG-001 → tables: risks, policies; UI: list/detail; API: CRUD
- R-REG-002 → tables: risk_categories, seeds; UI: pickers; API: list
- R-REG-005 → wizard step 1; service createRisk
- R-ASM-001 → function calculate_qualitative_score; UI: assessment form
- R-ASM-004 → risk_assessments schema; residual tied to controls
- R-ASM-005 → appetite tables + map function; UI color tags
- R-TRT-003 → enum strategy + fn_start_risk_treatment
- R-TRT-004 → risk_tasks + notifications
- R-UX-001 → CreateRiskWizard.tsx
- R-UX-003 → RiskSearchFilters.tsx with server-side query
- R-UX-005 → NotificationBell already exists; integrate breach events

## Initial Task List (P1 Sprint)

- SQL
  - Add risk_categories seeds: COSO, ISO 31000, NIST
  - Create risk_appetite_thresholds and map function
  - Add calculate_qualitative_score RPC
  - Create risk_assessments table
  - Create risks_controls M2M table
  - Create risk_treatments and risk_tasks
  - RLS for risks and child tables

- Frontend
  - services/risks.ts: CRUD + assessments + treatments
  - store/riskStore.ts: filters and selection
  - pages/risks/RisksList.tsx
  - pages/risks/CreateRiskWizard.tsx
  - pages/risks/RiskDetails.tsx
  - components/risks/RiskAssessmentForm.tsx
  - components/risks/RiskSearchFilters.tsx

- Notifications
  - Hook appetite breach to notifications RPC
  - Task due SLA notifier

## Notes on Existing Repo

- SQL foundation exists under sql/risks/*. We will extend via new migration files rather than editing existing ones, maintaining idempotency.
- UI routing: add routes in src/App.tsx for risks list, create, details.
- Follow established patterns from controls and audits modules for consistency.
