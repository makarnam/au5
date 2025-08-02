Compliance Module - Architecture, Data Model, APIs, and UI Plan

Overview
The compliance module enables organizations to onboard frameworks, manage requirements, scope applicability, map to controls/policies, assess gaps, capture evidence, raise exceptions, run attestations, and monitor posture over time. It reuses existing GRC entities (controls, evidence_files, audits, workflows, notifications, users, business_units) and adds compliance-specific tables.

Scope
- Frameworks: catalog of standards (ISO 27001, SOC 2, NIST 800-53, PCI DSS, etc.)
- Sections: optional hierarchical grouping (domains/clauses)
- Requirements: authoritative statements to be met
- Profiles: implementation scope per BU/system
- Applicability: which requirements apply per profile
- Mapping: requirement ↔ control mapping and optional policies
- Evidence: artifacts per requirement/profile
- Assessments: self/gap assessment against each requirement
- Attestations: formal statements for a period (e.g., quarterly/annual)
- Exceptions: deviations with compensating controls and approval flow
- Posture: computed status/score snapshots over time
- Tasks: lightweight follow-ups tied to requirements

Database
Migration file created:
- sql/compliance/01_compliance_module.sql

Core Entities
- compliance_frameworks(code, name, version, authority, category, is_active)
- compliance_sections(framework_id, parent_section_id, code, title)
- compliance_requirements(framework_id, section_id, requirement_code, title, text, guidance, priority, is_active)
- compliance_profiles(framework_id, business_unit_id, owner_id, is_active, tags)
- compliance_profile_requirements(profile_id, requirement_id, applicable, notes)
- requirement_controls_map(requirement_id, control_id, mapping_strength, notes)
- requirement_policies_map(requirement_id, policy_id, policy_name, mapping_notes)
- compliance_evidence(requirement_id, profile_id, evidence_source, title, evidence_file_id, external_url, collected_by, expires_at, is_current)
- compliance_assessments(framework_id, profile_id, requirement_id, status, justification, target_remediation_date, owner_id, reviewer_id, score)
- compliance_attestations(framework_id, profile_id, period_start, period_end, status, attestor_id, statement, attachments)
- compliance_exceptions(framework_id, profile_id, requirement_id, status, compensating_controls, effective window, approvals)
- compliance_certification_cycles(framework_id, profile_id, name, period, status, external_auditor)
- compliance_posture_snapshots(framework_id, profile_id, snapshot_date, counts by status, overall_score)
- compliance_tasks(framework_id/profile_id/requirement_id, title, status, priority, assignee_id, due_date)

Enums
- compliance_status: unknown, compliant, partially_compliant, non_compliant, not_applicable
- attestation_status: draft, in_progress, submitted, approved, rejected, expired
- exception_status: proposed, approved, rejected, in_effect, expired, withdrawn
- evidence_type: document, screenshot, ticket, system_export, url, other

Views and Functions
- public.v_requirement_posture: requirement posture plus flag for active exception
- public.compute_compliance_snapshot(framework, profile, date): populates/updates daily snapshot

RLS
The tables are ENABLE ROW LEVEL SECURITY in the migration. Apply policies following existing modules:
- Read: users with role in ['admin','cro','supervisor_auditor','auditor','reviewer'] OR same business_unit for profile-scoped entities.
- Write: created_by = auth.uid() or role-based checks.
- Profile scoping: joins to compliance_profiles.business_unit_id to restrict access.

Workflow Integration
- approval_requests.entity_type currently: ('audit','finding','control','risk'). If needed, extend to include 'compliance' by updating the CHECK constraint (commented block in 01_compliance_module.sql).
- Typical flows:
  - Assessment review (submit → approve/reject)
  - Exception approval (proposed → approved/in_effect/rejected)
  - Attestation approval (submitted → approved/rejected)

Notifications
Use public.notifications for due reminders:
- upcoming target_remediation_date on assessments
- attestation window open/close
- exception expiry approaching
Crons can call compute_compliance_snapshot nightly and create notifications as needed.

APIs (Supabase client)
A thin service is added:
- src/services/compliance.ts
  - list/create/update/delete frameworks
  - list/upsert requirements
  - list/create profiles
  - list/upsert assessments
  - map requirement to a control
  - list exceptions
  - compute_compliance_snapshot RPC

Frontend
Initial page created:
- src/pages/compliance/RequirementsBrowser.tsx
  - inputs a framework UUID and lists requirements

Planned pages/components (skeletons)
Pages
- FrameworksList.tsx: list/create/edit frameworks
- FrameworkEditor.tsx: edit framework metadata and import requirements
- RequirementsBrowser.tsx: browse/filter/search requirements, open details
- ProfilesList.tsx: list profiles per framework
- ProfileEditor.tsx: edit scope/applicability
- AssessmentsBoard.tsx: bulk update assessment status/owners/due dates
- Attestations.tsx: manage attestations and statuses
- Exceptions.tsx: manage exceptions and approvals
- PostureDashboard.tsx: show status breakdown and trends

Components
- RequirementDetail.tsx
- RequirementMapping.tsx
- EvidenceList.tsx
- AssessmentEditor.tsx
- AttestationEditor.tsx
- ExceptionEditor.tsx
- PostureSummary.tsx

Navigation
Add menu entries under the existing Sidebar to point to:
- Compliance → Frameworks
- Compliance → Requirements
- Compliance → Profiles
- Compliance → Assessments
- Compliance → Attestations
- Compliance → Exceptions
- Compliance → Posture

Posture Calculation
Score = round(((compliant + 0.5 * partial) / total) * 100), where total includes unknown and not_applicable to make the numerator meaningful for overall maturity; adjust per policy if N/A should be excluded.

Seed and Jobs (Optional)
Create a companion file sql/compliance/02_compliance_seeds_and_jobs.sql to:
- Insert framework shells (ISO 27001:2022, SOC 2 TSC 2017, NIST SP 800-53 Rev5)
- Example profiles and a few requirements for demo
- pg_cron or Supabase scheduled function to call compute_compliance_snapshot nightly

Design Principles
- Non-invasive: Reuses existing controls/evidence/workflows
- Extensible: Optional policies mapping table without hard FK dependency
- Scoped: Profiles drive BU/system scope and RLS gating
- Auditable: Use existing audit_logs if required by enabling triggers or app-side logging
- Performant: Aggregations stored in snapshots for dashboards

Next Steps (safe to apply incrementally; DB scripts already migrated per user note)
1) Add Sidebar links and route entries for new pages.
2) Implement FrameworksList and ProfileEditor skeletons and wire to ComplianceService.
3) Add minimal RLS policies referencing existing role/bu model.
4) Add optional seeds and nightly snapshot schedule using compute_compliance_snapshot.

File Index Added
- sql/compliance/01_compliance_module.sql
- src/services/compliance.ts
- src/pages/compliance/RequirementsBrowser.tsx