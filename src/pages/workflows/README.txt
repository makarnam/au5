Temporary note: Workflow UI pages and services have been added.
Integration steps:
1) In AuditDetails.tsx and FindingDetails.tsx, import and render WorkflowCenter with the entity id.
2) Optionally add a route to ApprovalInbox at /workflows/inbox in your router.
3) Ensure migrations under sql/workflows are run on your Supabase instance in order (01 -> 05).

Code snippets:

// AuditDetails.tsx (inside component render, after audit loaded)
import WorkflowCenter from '../workflows/WorkflowCenter';
// ...
{audit?.id ? <WorkflowCenter entityType="audit" entityId={audit.id} /> : null}

// FindingDetails.tsx (inside component render, after finding loaded)
import WorkflowCenter from '../workflows/WorkflowCenter';
// ...
{finding?.id ? <WorkflowCenter entityType="finding" entityId={finding.id} /> : null}

// Router: add ApprovalInbox
import ApprovalInbox from './workflows/ApprovalInbox';
// ...
<Route path="/workflows/inbox" element={<ApprovalInbox />} />
