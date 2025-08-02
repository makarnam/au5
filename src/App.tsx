import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import "./i18n";

// Components
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/Dashboard";
import AuditsList from "./pages/audits/AuditsList";
import AuditDetails from "./pages/audits/AuditDetails";
import CreateAuditPage from "./pages/audits/CreateAuditPage";
import ControlsList from "./pages/controls/ControlsList";
import ControlDetails from "./pages/controls/ControlDetails";
import CreateControlSetPage from "./pages/controls/controlsets/CreateControlSetPage";
import AIGenerateControlSetPage from "./pages/controls/controlsets/AIGenerateControlSetPage";
import EditControlSetPage from "./pages/controls/controlsets/EditControlSetPage";
import EnhancedAIControlDemo from "./pages/controls/EnhancedAIControlDemo";
import RisksList from "./pages/risks/RisksList";
import RiskDetails from "./pages/risks/RiskDetails";
import CreateRiskPage from "./pages/risks/CreateRiskPage";
import EditRiskPage from "./pages/risks/EditRiskPage";
import FindingsList from "./pages/findings/FindingsList";
import FindingDetails from "./pages/findings/FindingDetails";
import UsersList from "./pages/users/UsersList";
import UserDetails from "./pages/users/UserDetails";
import WorkflowsList from "./pages/workflows/WorkflowsList";
import WorkflowDetails from "./pages/workflows/WorkflowDetails";
import AIAssistant from "./pages/ai/AIAssistant";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";

// Coming Soon Pages
import ComplianceFrameworks from "./pages/compliance/ComplianceFrameworks";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";
import DocumentManagement from "./pages/documents/DocumentManagement";
import PolicyManagement from "./pages/policies/PolicyManagement";
import IncidentManagement from "./pages/incidents/IncidentManagement";
import VendorManagement from "./pages/vendors/VendorManagement";
import TrainingCertification from "./pages/training/TrainingCertification";
import AssetManagement from "./pages/assets/AssetManagement";
import ComingSoonAdmin from "./pages/admin/ComingSoonAdmin";
import EditAuditPage from "./pages/audits/EditAuditPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { user, initialized, loading, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner
          size="xl"
          text="Initializing Application..."
          variant="pulse"
        />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Routes>
            {/* Public routes */}
            <Route
              path="/signin"
              element={user ? <Navigate to="/dashboard" replace /> : <SignIn />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/dashboard" replace /> : <SignUp />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Audit Management */}
              <Route path="audits" element={<AuditsList />} />
              <Route path="audits/create" element={<CreateAuditPage />} />
              <Route path="audits/:id" element={<AuditDetails />} />
              <Route path="audits/:id/edit" element={<EditAuditPage />} />

              {/* Control Management */}
              <Route path="controls" element={<ControlsList />} />
              <Route
                path="controls/create"
                element={<CreateControlSetPage />}
              />
              <Route
                path="controls/generate"
                element={<AIGenerateControlSetPage />}
              />
              <Route
                path="controls/enhanced-ai-demo"
                element={<EnhancedAIControlDemo />}
              />
              <Route path="controls/:id" element={<ControlDetails />} />
              <Route
                path="controls/:id/edit"
                element={<EditControlSetPage />}
              />

              {/* Risk Management */}
              <Route path="risks" element={<RisksList />} />
              <Route path="risks/create" element={<ProtectedRoute requiredRole={['auditor','supervisor_auditor','admin','super_admin']}><div><CreateRiskPage /></div></ProtectedRoute>} />
              <Route path="risks/:id" element={<RiskDetails />} />
              <Route path="risks/:id/edit" element={<ProtectedRoute requiredRole={['auditor','supervisor_auditor','admin','super_admin']}><div><EditRiskPage /></div></ProtectedRoute>} />

              {/* Findings Management */}
              <Route path="findings" element={<FindingsList />} />
              <Route path="findings/:id" element={<FindingDetails />} />

              {/* User Management */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole={["super_admin", "admin"]}>
                    <UsersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/:id"
                element={
                  <ProtectedRoute requiredRole={["super_admin", "admin"]}>
                    <UserDetails />
                  </ProtectedRoute>
                }
              />

              {/* Workflow Management */}
              <Route
                path="workflows"
                element={
                  <ProtectedRoute
                    requiredRole={["super_admin", "admin", "cro"]}
                  >
                    <WorkflowsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="workflows/:id"
                element={
                  <ProtectedRoute
                    requiredRole={["super_admin", "admin", "cro"]}
                  >
                    <WorkflowDetails />
                  </ProtectedRoute>
                }
              />

              {/* AI Assistant */}
              <Route path="ai-assistant" element={<AIAssistant />} />

              {/* Coming Soon Modules */}
              <Route path="compliance" element={<ComplianceFrameworks />} />
              <Route path="analytics" element={<AdvancedAnalytics />} />
              <Route path="documents" element={<DocumentManagement />} />
              <Route path="policies" element={<PolicyManagement />} />
              <Route path="incidents" element={<IncidentManagement />} />
              <Route path="vendors" element={<VendorManagement />} />
              <Route path="training" element={<TrainingCertification />} />
              <Route path="assets" element={<AssetManagement />} />

              {/* Admin Routes */}
              <Route
                path="admin/coming-soon"
                element={
                  <ProtectedRoute requiredRole={["super_admin", "admin"]}>
                    <ComingSoonAdmin />
                  </ProtectedRoute>
                }
              />

              {/* Settings and Profile */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole={["super_admin", "admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch all - redirect to signin if not authenticated, dashboard if authenticated */}
            <Route
              path="*"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
          </Routes>
        </div>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#363636",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e5e7eb",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
