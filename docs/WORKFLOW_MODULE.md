# Workflow & Approval Module

This module adds customizable, role-based approval workflows for audits and findings with 3 approval levels:
1) Level 1: auditor or supervisor_auditor
2) Level 2: business_unit_manager
3) Level 3: admin or cro

It includes SQL migrations, Supabase RPCs, and React UI components.

## Contents

SQL (run in order):
- sql/workflows/01_workflow_enums.sql
- sql/workflows/02_workflow_tables.sql
- sql/workflows/03_workflow_functions.sql
- sql/workflows/04_workflow_rls.sql
- sql/workflows/05_workflow_sample_data.sql

Frontend:
- src/services/workflows.ts
- src/components/workflows/ApproveRejectDialog.tsx
- src/components/workflows/ApprovalTimeline.tsx
- src/pages/workflows/WorkflowCenter.tsx
- src/pages/workflows/ApprovalInbox.tsx

## Database Overview

Tables:
- public.workflows: Workflow templates per entity_type ('audit' | 'finding')
- public.workflow_steps: Template steps per workflow
- public.approval_requests: Workflow instances per entity
- public.approval_request_steps: Materialized steps for each request
- public.approval_actions: Action log (approve/reject/revision/skip)

Views:
- public.v_pending_approvals: Current user's pending step assignments for quick inbox

Enums:
- public.workflow_entity_type
- public.approval_request_status
- public.approval_step_status
- public.approval_action

Functions:
- public.fn_start_approval_request(entity_type, entity_id, workflow_id) -> request_id
- public.fn_perform_approval_action(request_id, action, comments)
- public.rpc_start_approval(text, uuid, uuid) -> uuid (Supabase RPC wrapper)
- public.rpc_approve/reject/request_revision/skip_step
- public.fn_required_roles_for_step(step_order) -> text[]
- public.fn_user_has_any_role(user_id, text[])
- public.fn_current_user_has_any_role(text[])

RLS:
- Read access for creators/requesters and approvers; full access for admin/cro.
- Writes are performed via SECURITY DEFINER RPCs.

## How it works

1) Admin defines a workflow template (pre-seeded examples included) for each entity type (audit/finding), with ordered steps mapping to roles.
2) A user starts an approval request for an entity by selecting a workflow (WorkflowCenter UI). This clones template steps for the request instance.
3) Approvers use the Approval Inbox to approve, reject, request revision, or skip the current step. Role constraints are enforced by the server functions. Requests advance step-by-step until final approval or rejection.
4) On final approval, the entity is updated:
   - audits.approval_status = 'approved', approved_by/approved_at set.
   - findings.workflow_status = 'approved'.

## UI Integration Patterns

- WorkflowCenter: Allow starting and viewing approval timelines for a given entityType and entityId. Embed in AuditDetails and FindingDetails pages.
- ApprovalInbox: A global page that shows all pending approvals for the current user/role.

Example integration in a details page (pseudo):
- Place: under entity header, show current approval status if any.
- Render: <WorkflowCenter entityType="audit" entityId={audit.id} />

## Testing Checklist

1) Run migrations in order in your Supabase instance.
2) Ensure public.users table has users with roles: auditor, supervisor_auditor, business_unit_manager, admin or cro.
3) Using a user with auditor role:
   - Start an approval for an audit (status changes to 'pending_approval').
   - Approve from Level 1; request should move to Level 2.
4) Using business_unit_manager role:
   - Approve Level 2; request should move to Level 3.
5) Using admin or cro role:
   - Approve Level 3; request becomes 'approved', audit.approval_status becomes 'approved'.
6) Verify ApprovalInbox lists appropriate pending steps.
7) Try reject and request_revision flows; entity statuses update accordingly.

## Notes

- Sample templates provided:
  - "Audit 3-Level Approval" for audits
  - "Finding 3-Level Approval" for findings
- You can add more templates/steps and assign a specific assignee_id to override role resolution per step.
- Extendable to controls/risks by adding entity types and updating the enums/RPCs.
