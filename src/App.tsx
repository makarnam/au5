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

// AI Governance Pages
import AIGovernanceDashboard from "./pages/ai-governance/AIGovernanceDashboard";
import AIModelsList from "./pages/ai-governance/AIModelsList";
import AIControlsList from "./pages/ai-governance/AIControlsList";

// Other Pages
import BCPDashboard from "./pages/bcp/BCPDashboard";
import CreatePlanPage from "./pages/bcp/CreatePlanPage";
import PlanDetails from "./pages/bcp/PlanDetails";

// Resilience Management
import ResilienceDashboard from "./pages/resilience/ResilienceDashboard";
import BusinessImpactAnalysis from "./pages/resilience/BusinessImpactAnalysis";
import BusinessImpactAnalysisList from "./pages/resilience/BusinessImpactAnalysisList";
import ResilienceIncidentManagement from "./pages/resilience/IncidentManagement";
import CrisisManagement from "./pages/resilience/CrisisManagement";
import ScenarioAnalysis from "./pages/resilience/ScenarioAnalysis";
import ResilienceMetrics from "./pages/resilience/ResilienceMetrics";
import AssetManagement from "./pages/assets/AssetManagement";
import DocumentManagement from "./pages/documents/DocumentManagement";
import DocumentManagementTest from "./pages/documents/DocumentManagementTest";

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

// Third Party Risk Management Pages
import ThirdPartyRiskManagementDashboard from "./pages/third-party-risk-management/ThirdPartyRiskManagementDashboard";
import ThirdPartyCatalog from "./pages/third-party-risk-management/ThirdPartyCatalog";
import CreateThirdPartyPage from "./pages/third-party-risk-management/CreateThirdPartyPage";
import ThirdPartyAssessments from "./pages/third-party-risk-management/ThirdPartyAssessments";
import CreateAssessmentPage from "./pages/third-party-risk-management/CreateAssessmentPage";
import ThirdPartyIncidentManagement from "./pages/third-party-risk-management/IncidentManagement";
import ContractManagement from "./pages/third-party-risk-management/ContractManagement";
import PerformanceMonitoring from "./pages/third-party-risk-management/PerformanceMonitoring";
import SecurityMonitoring from "./pages/third-party-risk-management/SecurityMonitoring";
import DueDiligenceWorkflow from "./pages/third-party-risk-management/DueDiligenceWorkflow";
import EngagementManagement from "./pages/third-party-risk-management/EngagementManagement";
import CreateEngagementPage from "./pages/third-party-risk-management/CreateEngagementPage";
import EditEngagementPage from "./pages/third-party-risk-management/EditEngagementPage";

// ESG Management Pages
import ESGDashboardPage from "./pages/esg/ESGDashboardPage";
import ESGProgramsPage from "./pages/esg/ESGProgramsPage";
import DoubleMaterialityPage from "./pages/esg/DoubleMaterialityPage";
import ESGComprehensivePage from "./pages/esg/ESGComprehensivePage";

// IT Security Management Pages
import ITSecurityDashboard from "./pages/it-security/ITSecurityDashboard";
import IncidentsList from "./pages/it-security/incidents/IncidentsList";
import CreateIncidentPage from "./pages/it-security/incidents/CreateIncidentPage";
import VulnerabilitiesList from "./pages/it-security/VulnerabilitiesList";
import CreateVulnerabilityPage from "./pages/it-security/vulnerabilities/CreateVulnerabilityPage";
import EditVulnerabilityPage from "./pages/it-security/vulnerabilities/EditVulnerabilityPage";
import VulnerabilityDetails from "./pages/it-security/vulnerabilities/VulnerabilityDetails";
import ITSecurityControlsList from "./pages/it-security/ControlsList";
import ITSecurityCreateControlPage from "./pages/it-security/controls/CreateControlPage";
import ITSecurityEditControlPage from "./pages/it-security/controls/EditControlPage";
import ITSecurityControlDetails from "./pages/it-security/controls/ControlDetails";
import ITSecurityPoliciesList from "./pages/it-security/PoliciesList";
import PCICompliance from "./pages/it-security/PCICompliance";
import CreatePCIAssessmentPage from "./pages/it-security/pci-compliance/CreatePCIAssessmentPage";
import PCIAssessmentDetails from "./pages/it-security/pci-compliance/PCIAssessmentDetails";
import EditPCIAssessmentPage from "./pages/it-security/pci-compliance/EditPCIAssessmentPage";
import ISMSManagement from "./pages/it-security/ISMSManagement";
import CreateISMSProgramPage from "./pages/it-security/isms/CreateISMSProgramPage";
import ISMSProgramDetails from "./pages/it-security/isms/ISMSProgramDetails";
import EditISMSProgramPage from "./pages/it-security/isms/EditISMSProgramPage";
import CMMCManagement from "./pages/it-security/CMMCManagement";
import CreateCMMCProgramPage from "./pages/it-security/cmmc/CreateCMMCProgramPage";
import CMMCProgramDetails from "./pages/it-security/cmmc/CMMCProgramDetails";
import EditCMMCProgramPage from "./pages/it-security/cmmc/EditCMMCProgramPage";
import ITSecurityMonitoring from "./pages/it-security/SecurityMonitoring";
import SecurityAssets from "./pages/it-security/SecurityAssets";

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

          {/* AI Governance */}
          <Route path="ai-governance" element={<AIGovernanceDashboard />} />
          <Route path="ai-governance/dashboard" element={<AIGovernanceDashboard />} />
          <Route path="ai-governance/models" element={<AIModelsList />} />
          <Route path="ai-governance/controls" element={<AIControlsList />} />

          {/* BCP */}
          <Route path="bcp" element={<BCPDashboard />} />
          <Route path="bcp/create" element={<CreatePlanPage />} />
          <Route path="bcp/:id" element={<PlanDetails />} />

          {/* Resilience Management */}
          <Route path="resilience" element={<ResilienceDashboard />} />
          <Route path="resilience/bia" element={<BusinessImpactAnalysisList />} />
          <Route path="resilience/bia/:id" element={<BusinessImpactAnalysis />} />
          <Route path="resilience/incidents" element={<ResilienceIncidentManagement />} />
          <Route path="resilience/crisis" element={<CrisisManagement />} />
          <Route path="resilience/scenarios" element={<ScenarioAnalysis />} />
          <Route path="resilience/metrics" element={<ResilienceMetrics />} />

          {/* Assets */}
          <Route path="assets" element={<AssetManagement />} />

          {/* Documents */}
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="documents/test" element={<DocumentManagementTest />} />
          <Route path="documents/full" element={<DocumentManagement />} />

          {/* Incidents */}
          <Route path="incidents" element={<IncidentManagement />} />

          {/* Vendors */}
          <Route path="vendors" element={<VendorManagement />} />

          {/* Third Party Risk Management */}
          <Route path="third-party-risk-management" element={<ThirdPartyRiskManagementDashboard />} />
          <Route path="third-party-risk-management/catalog" element={<ThirdPartyCatalog />} />
          <Route path="third-party-risk-management/create" element={<CreateThirdPartyPage />} />
          <Route path="third-party-risk-management/assessments" element={<ThirdPartyAssessments />} />
          <Route path="third-party-risk-management/assessments/create" element={<CreateAssessmentPage />} />
          <Route path="third-party-risk-management/engagements" element={<EngagementManagement />} />
          <Route path="third-party-risk-management/engagements/create" element={<CreateEngagementPage />} />
          <Route path="third-party-risk-management/engagements/:id/edit" element={<EditEngagementPage />} />
          <Route path="third-party-risk-management/incidents" element={<ThirdPartyIncidentManagement />} />
          <Route path="third-party-risk-management/contracts" element={<ContractManagement />} />
          <Route path="third-party-risk-management/performance" element={<PerformanceMonitoring />} />
          <Route path="third-party-risk-management/security" element={<SecurityMonitoring />} />
          <Route path="third-party-risk-management/due-diligence" element={<DueDiligenceWorkflow />} />

          {/* ESG Management */}
          <Route path="esg" element={<ESGDashboardPage />} />
          <Route path="esg/comprehensive" element={<ESGComprehensivePage />} />
          <Route path="esg/programs" element={<ESGProgramsPage />} />
          <Route path="esg/materiality" element={<DoubleMaterialityPage />} />

          {/* IT Security Management */}
          <Route path="it-security" element={<ITSecurityDashboard />} />
          <Route path="it-security/incidents" element={<IncidentsList />} />
          <Route path="it-security/incidents/create" element={<CreateIncidentPage />} />
          <Route path="it-security/vulnerabilities" element={<VulnerabilitiesList />} />
          <Route path="it-security/vulnerabilities/create" element={<CreateVulnerabilityPage />} />
          <Route path="it-security/vulnerabilities/:id" element={<VulnerabilityDetails />} />
          <Route path="it-security/vulnerabilities/:id/edit" element={<EditVulnerabilityPage />} />
          <Route path="it-security/controls" element={<ITSecurityControlsList />} />
          <Route path="it-security/controls/create" element={<ITSecurityCreateControlPage />} />
          <Route path="it-security/controls/:id" element={<ITSecurityControlDetails />} />
          <Route path="it-security/controls/:id/edit" element={<ITSecurityEditControlPage />} />
          <Route path="it-security/policies" element={<ITSecurityPoliciesList />} />
          
          {/* PCI Compliance */}
          <Route path="it-security/pci" element={<PCICompliance />} />
          <Route path="it-security/pci-compliance" element={<PCICompliance />} />
          <Route path="it-security/pci-compliance/create" element={<CreatePCIAssessmentPage />} />
          <Route path="it-security/pci-compliance/:id" element={<PCIAssessmentDetails />} />
          <Route path="it-security/pci-compliance/:id/edit" element={<EditPCIAssessmentPage />} />
          
          {/* ISMS Management */}
          <Route path="it-security/isms" element={<ISMSManagement />} />
          <Route path="it-security/isms/create" element={<CreateISMSProgramPage />} />
          <Route path="it-security/isms/:id" element={<ISMSProgramDetails />} />
          <Route path="it-security/isms/:id/edit" element={<EditISMSProgramPage />} />
          
          {/* CMMC Management */}
          <Route path="it-security/cmmc" element={<CMMCManagement />} />
          <Route path="it-security/cmmc/create" element={<CreateCMMCProgramPage />} />
          <Route path="it-security/cmmc/:id" element={<CMMCProgramDetails />} />
          <Route path="it-security/cmmc/:id/edit" element={<EditCMMCProgramPage />} />
          
          <Route path="it-security/monitoring" element={<ITSecurityMonitoring />} />
          <Route path="it-security/assets" element={<SecurityAssets />} />

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
