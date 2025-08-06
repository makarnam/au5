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
   - Status: Applied via MCP to Supabase (schema, RLS, RPCs, seeds)
   - Implemented objects (see ['sql/risks/01_phase1_risk_module.sql'](sql/risks/01_phase1_risk_module.sql)):
     - Tables: risks, risk_categories, risk_matrices, risk_assessments, risk_treatments, risk_controls, risk_appetite_thresholds
     - Helper: update_updated_at_column()
     - Functions: calculate_risk_score(), calculate_risk_level(), map_score_to_appetite(), create_risk_assessment(), start_risk_treatment()
     - Triggers: timestamps + update_risk_scores on risks
     - RLS: enabled + minimal policies for SELECT/INSERT/UPDATE for authenticated
     - Seeds: default 5x5 matrix, COSO/ISO/NIST categories, appetite thresholds
   - Deviations from initial outline:
     - risk_tags/risk_tag_map deferred (not required for P1 core flows)
     - risk_tasks deferred; using treatments table for SLA checks in P1

2) UI
   - Status: Routes and skeletons wired
   - Pages:
     - RisksList.tsx: present (search/filter improvements planned)
     - CreateRiskPage.tsx: present
     - CreateRiskWizard.tsx: implemented at ['src/pages/risks/CreateRiskWizard.tsx'](src/pages/risks/CreateRiskWizard.tsx) with 3 steps (Basics, Assessment, Targets)
     - RiskDetails.tsx: lazy route present; detail view to be iterated as tabs
   - Routing:
     - ['src/App.tsx'](src/App.tsx:83) includes /risks, /risks/create, /risks/create-wizard (lazy), /risks/:id (lazy)
   - Components (planned):
     - RiskWizardStepper.tsx (inline within wizard for P1)
     - RiskAssessmentForm.tsx (consolidate assessment inputs; backlog)
     - RiskSearchFilters.tsx (extract from RisksList; backlog)
   - Store/Service:
     - Service implemented: ['src/services/riskService.ts'](src/services/riskService.ts)
     - Store implemented: ['src/store/riskStore.ts'](src/store/riskStore.ts)

3) Notifications
   - Status: App-side hooks defined (to implement next)
   - Appetite breach hook:
     - After addAssessment, compute appetite via map_score_to_appetite(score,'org'); if 'red', call existing notification RPC (e.g., public.create_notification)
   - Task SLA hook:
     - After add/update treatment, if target_date < today AND status != 'completed', enqueue due-soon notification
   - Integration points:
     - Implement inside store mutations after successful service calls

4) Metrics instrumentation
   - Plan:
     - Emit events: risk created, assessment added, treatment started with timestamps
     - Can leverage existing audit trail or lightweight logging table (P1 optional)

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

- SQL (DONE)
  - Seeds and core tables created, functions/triggers/RLS applied

- Frontend (IN PROGRESS)
  - services/riskService.ts: CRUD + assessments + treatments (DONE)
  - store/riskStore.ts: filters and selection (DONE)
  - pages/risks/RisksList.tsx (EXISTS; enhance filters/search later)
  - pages/risks/CreateRiskWizard.tsx (DONE)
  - pages/risks/RiskDetails.tsx (ROUTE PRESENT; iterative UI upcoming)
  - components/risks/RiskAssessmentForm.tsx (PENDING)
  - components/risks/RiskSearchFilters.tsx (PENDING)

- Notifications (NEXT)
  - Hook appetite breach to notifications RPC (store.addAssessment)
  - Task due SLA notifier (store.addTreatment/updateTreatment)

## Notes on Existing Repo

- SQL foundation exists under sql/risks/*. We will extend via new migration files rather than editing existing ones, maintaining idempotency.
- UI routing: add routes in src/App.tsx for risks list, create, details.
- Follow established patterns from controls and audits modules for consistency.
