import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Audit Pages
import AuditsList from "./pages/audits/AuditsList";
import CreateAuditPage from "./pages/audits/CreateAuditPage";
import EditAuditPage from "./pages/audits/EditAuditPage";
import AuditDetails from "./pages/audits/AuditDetails";
import ScheduleAuditPage from "./pages/audits/ScheduleAuditPage";
import UpcomingSchedules from "./pages/audits/UpcomingSchedules";

// Audit Planning Pages
import AuditPlanningDashboard from "./pages/audit-planning/AuditPlanningDashboard";
import AuditUniversePage from "./pages/audit-planning/AuditUniverse";
import AuditPlans from "./pages/audit-planning/AuditPlans";
import ResourceManagement from "./pages/audit-planning/ResourceManagement";
import CreateAuditPlanPage from "./pages/audit-planning/CreatePlanPage";
import PlanDetailsPage from "./pages/audit-planning/PlanDetailsPage";
import CompetencyManagement from "./pages/audit-planning/CompetencyManagement";
import TrainingNeeds from "./pages/audit-planning/TrainingNeeds";

// Controls Pages
import ControlsList from "./pages/controls/ControlsList";
import CreateControlPage from "./pages/controls/CreateControlPage";
import ControlDetails from "./pages/controls/ControlDetails";
import ControlsTestPage from "./pages/controls/ControlsTestPage";
import EnhancedControlsPage from "./pages/controls/EnhancedControlsPage";
import EnhancedAIControlDemo from "./pages/controls/EnhancedAIControlDemo";

// Control Sets Pages
import CreateControlSetPage from "./pages/controls/controlsets/CreateControlSetPage";
import EditControlSetPage from "./pages/controls/controlsets/EditControlSetPage";
import AIGenerateControlSetPage from "./pages/controls/controlsets/AIGenerateControlSetPage";

// Findings Pages
import FindingsList from "./pages/findings/FindingsList";
import CreateFindingPage from "./pages/findings/CreateFindingPage";
import EditFindingPage from "./pages/findings/EditFindingPage";
import FindingDetails from "./pages/findings/FindingDetails";

// Risks Pages
import RisksList from "./pages/risks/RisksList";
import CreateRiskPage from "./pages/risks/CreateRiskPage";
import EditRiskPage from "./pages/risks/EditRiskPage";
import RiskDetails from "./pages/risks/RiskDetails";
import RiskDashboard from "./pages/risks/RiskDashboard";
import SecondRiskDashboard from "./pages/risks/SecondRiskDashboard";
import CreateRiskWizard from "./pages/risks/CreateRiskWizard";

// Risk Reviews Pages
import CreateReviewPage from "./pages/risks/reviews/CreateReviewPage";
import EditReviewPage from "./pages/risks/reviews/EditReviewPage";

// Risk Treatments Pages
import CreateTreatmentPage from "./pages/risks/treatments/CreateTreatmentPage";
import EditTreatmentPage from "./pages/risks/treatments/EditTreatmentPage";

// Compliance Pages
import ComplianceFrameworks from "./pages/compliance/ComplianceFrameworks";
import FrameworksList from "./pages/compliance/FrameworksList";
import ImportCompliance from "./pages/compliance/ImportCompliance";
import Importer2 from "./pages/compliance/Importer2";
import ProfileEditor from "./pages/compliance/ProfileEditor";
import ProfilesList from "./pages/compliance/ProfilesList";
import RequirementControlMapping from "./pages/compliance/RequirementControlMapping";
import RequirementsBrowser from "./pages/compliance/RequirementsBrowser";

// Policies Pages
import PoliciesList from "./pages/policies/PoliciesList";
import PolicyEditor from "./pages/policies/PolicyEditor";
import PolicyManagement from "./pages/policies/PolicyManagement";
import PolicyVersions from "./pages/policies/PolicyVersions";

// Privacy Pages
import PrivacyDashboard from "./pages/privacy/PrivacyDashboard";
import DPIAList from "./pages/privacy/DPIAList";
import RoPARegister from "./pages/privacy/RoPARegister";

// Regulations Pages
import RegulationList from "./pages/regulations/RegulationList";
import RegulationDetail from "./pages/regulations/RegulationDetail";
import ImpactDashboard from "./pages/regulations/ImpactDashboard";

// Workflows Pages
import WorkflowsHome from "./pages/workflows/WorkflowsHome";
import WorkflowsList from "./pages/workflows/WorkflowsList";
import WorkflowCenter from "./pages/workflows/WorkflowCenter";
import WorkflowCenterPage from "./pages/workflows/WorkflowCenterPage";
import WorkflowDetails from "./pages/workflows/WorkflowDetails";
import WorkflowInstance from "./pages/workflows/WorkflowInstance";
import ApprovalInbox from "./pages/workflows/ApprovalInbox";

// AI Pages
import AIAssistant from "./pages/ai/AIAssistant";
import RiskAIGeneration from "./pages/ai/RiskAIGeneration";

// Other Pages
import BCPDashboard from "./pages/bcp/BCPDashboard";
import CreatePlanPage from "./pages/bcp/CreatePlanPage";
import PlanDetails from "./pages/bcp/PlanDetails";
import AssetManagement from "./pages/assets/AssetManagement";
import DocumentManagement from "./pages/documents/DocumentManagement";
import IncidentManagement from "./pages/incidents/IncidentManagement";
import VendorManagement from "./pages/vendors/VendorManagement";
import UserDetails from "./pages/users/UserDetails";
import UsersList from "./pages/users/UsersList";
import UserManagementDashboard from "./pages/users/UserManagementDashboard";
import CreateUserPage from "./pages/users/CreateUserPage";
import InviteUserPage from "./pages/users/InviteUserPage";
import NotificationsInbox from "./pages/notifications/NotificationsInbox";
import TrainingCertification from "./pages/training/TrainingCertification";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";

// Admin Pages
import ComingSoonAdmin from "./pages/admin/ComingSoonAdmin";

// Governance Pages
import GovernanceDashboard from "./pages/governance/Dashboard";
import GovernanceCalendar from "./pages/governance/Calendar";
import GovernanceReporting from "./pages/governance/Reporting";
import GovernanceTraining from "./pages/governance/Training";

function App() {
  console.log("App component rendering...");
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/sign-in" element={<SignIn />} />
        <Route path="/auth/sign-up" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Profile & Settings */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />

          {/* Audits */}
          <Route path="audits" element={<AuditsList />} />
          <Route path="audits/create" element={<CreateAuditPage />} />
          <Route path="audits/:id" element={<AuditDetails />} />
          <Route path="audits/:id/edit" element={<EditAuditPage />} />
          <Route path="audits/schedule" element={<ScheduleAuditPage />} />
          <Route path="audits/schedules" element={<UpcomingSchedules />} />

          {/* Audit Planning */}
          <Route path="audit-planning" element={<AuditPlanningDashboard />} />
          <Route path="audit-planning/universe" element={<AuditUniversePage />} />
          <Route path="audit-planning/plans" element={<AuditPlans />} />
          <Route path="audit-planning/plans/create" element={<CreateAuditPlanPage />} />
          <Route path="audit-planning/plans/:id" element={<PlanDetailsPage />} />
          <Route path="audit-planning/resources" element={<ResourceManagement />} />
          <Route path="audit-planning/competencies" element={<CompetencyManagement />} />
          <Route path="audit-planning/training" element={<TrainingNeeds />} />

          {/* Controls */}
          <Route path="controls" element={<ControlsList />} />
          <Route path="controls/create" element={<CreateControlPage />} />
          <Route path="controls/:id" element={<ControlDetails />} />
          <Route path="controls/test" element={<ControlsTestPage />} />
          <Route path="controls/enhanced" element={<EnhancedControlsPage />} />
          <Route path="controls/ai-demo" element={<EnhancedAIControlDemo />} />

          {/* Control Sets */}
          <Route path="controls/control-sets/create" element={<CreateControlSetPage />} />
          <Route path="controls/control-sets/:id/edit" element={<EditControlSetPage />} />
          <Route path="controls/control-sets/ai-generate" element={<AIGenerateControlSetPage />} />

          {/* Findings */}
          <Route path="findings" element={<FindingsList />} />
          <Route path="findings/create" element={<CreateFindingPage />} />
          <Route path="findings/:id" element={<FindingDetails />} />
          <Route path="findings/:id/edit" element={<EditFindingPage />} />

          {/* Risks */}
          <Route path="risks" element={<RisksList />} />
          <Route path="risks/create" element={<CreateRiskPage />} />
          <Route path="risks/create-wizard" element={<CreateRiskWizard />} />
          <Route path="risks/:id" element={<RiskDetails />} />
          <Route path="risks/:id/edit" element={<EditRiskPage />} />
          <Route path="risks/dashboard" element={<RiskDashboard />} />
          <Route path="risks/dashboard2" element={<SecondRiskDashboard />} />

          {/* Risk Reviews */}
          <Route path="risks/:riskId/reviews/create" element={<CreateReviewPage />} />
          <Route path="risks/:riskId/reviews/:reviewId/edit" element={<EditReviewPage />} />

          {/* Risk Treatments */}
          <Route path="risks/:riskId/treatments/create" element={<CreateTreatmentPage />} />
          <Route path="risks/:riskId/treatments/:treatmentId/edit" element={<EditTreatmentPage />} />

          {/* Compliance */}
          <Route path="compliance" element={<ComplianceFrameworks />} />
          <Route path="compliance/frameworks" element={<FrameworksList />} />
          <Route path="compliance/import" element={<ImportCompliance />} />
          <Route path="compliance/import2" element={<Importer2 />} />
          <Route path="compliance/importer-2" element={<Importer2 />} />
          <Route path="compliance/profiles" element={<ProfilesList />} />
          <Route path="compliance/profiles/:id" element={<ProfileEditor />} />
          <Route path="compliance/requirements" element={<RequirementsBrowser />} />
          <Route path="compliance/mapping" element={<RequirementControlMapping />} />

          {/* Policies */}
          <Route path="policies" element={<PoliciesList />} />
          <Route path="policies/create" element={<PolicyEditor />} />
          <Route path="policies/:id" element={<PolicyManagement />} />
          <Route path="policies/:id/edit" element={<PolicyEditor />} />
          <Route path="policies/:id/versions" element={<PolicyVersions />} />

          {/* Privacy */}
          <Route path="privacy" element={<PrivacyDashboard />} />
          <Route path="privacy/dashboard" element={<PrivacyDashboard />} />
          <Route path="privacy/dpia" element={<DPIAList />} />
          <Route path="privacy/ropa" element={<RoPARegister />} />

          {/* Regulations */}
          <Route path="regulations" element={<RegulationList />} />
          <Route path="regulations/:id" element={<RegulationDetail />} />
          <Route path="regulations/impact" element={<ImpactDashboard />} />
          <Route path="regulations/impact-dashboard" element={<ImpactDashboard />} />

          {/* Workflows */}
          <Route path="workflows" element={<WorkflowsHome />} />
          <Route path="workflows/list" element={<WorkflowsList />} />
          <Route path="workflows/center" element={<WorkflowCenterPage />} />
          <Route path="workflows/:id" element={<WorkflowDetails />} />
          <Route path="workflows/:id/instance/:instanceId" element={<WorkflowInstance />} />
          <Route path="workflows/approvals" element={<ApprovalInbox />} />

          {/* AI */}
          <Route path="ai" element={<AIAssistant />} />
          <Route path="ai/risk-generation" element={<RiskAIGeneration />} />

          {/* BCP */}
          <Route path="bcp" element={<BCPDashboard />} />
          <Route path="bcp/create" element={<CreatePlanPage />} />
          <Route path="bcp/:id" element={<PlanDetails />} />

          {/* Assets */}
          <Route path="assets" element={<AssetManagement />} />

          {/* Documents */}
          <Route path="documents" element={<DocumentManagement />} />

          {/* Incidents */}
          <Route path="incidents" element={<IncidentManagement />} />

          {/* Vendors */}
          <Route path="vendors" element={<VendorManagement />} />

          {/* Users */}
          <Route path="users" element={<UsersList />} />
          <Route path="users/dashboard" element={<UserManagementDashboard />} />
          <Route path="users/create" element={<CreateUserPage />} />
          <Route path="users/invite" element={<InviteUserPage />} />
          <Route path="users/:id" element={<UserDetails />} />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationsInbox />} />

          {/* Training */}
          <Route path="training" element={<TrainingCertification />} />

          {/* Analytics */}
          <Route path="analytics" element={<AdvancedAnalytics />} />

          {/* Governance */}
          <Route path="governance" element={<GovernanceDashboard />} />
          <Route path="governance/dashboard" element={<GovernanceDashboard />} />
          <Route path="governance/calendar" element={<GovernanceCalendar />} />
          <Route path="governance/reporting" element={<GovernanceReporting />} />
          <Route path="governance/training" element={<GovernanceTraining />} />

          {/* Admin */}
          <Route path="admin" element={<ComingSoonAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
