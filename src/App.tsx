import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AuditsList from './pages/audits/AuditsList';
import FindingsList from './pages/findings/FindingsList';
import ControlsList from './pages/controls/ControlsList';
import Risks from './components/Risks';
import RequirementsBrowser from './pages/compliance/RequirementsBrowser';
import FrameworksList from './pages/compliance/FrameworksList';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import AIAssistant from './pages/ai/AIAssistant';
import Settings from './components/Settings';
import CreateAuditPage from './pages/audits/CreateAuditPage';
import ScheduleAuditPage from './pages/audits/ScheduleAuditPage';
import CreateControlSetPage from './pages/controls/controlsets/CreateControlSetPage';
import CreateRiskPage from './pages/risks/CreateRiskPage';
import RisksList from './pages/risks/RisksList';
import ProfilesList from './pages/compliance/ProfilesList';

const LazyWorkflowsHome = React.lazy(() => import('./pages/workflows/WorkflowsHome'));
const LazyWorkflowInstance = React.lazy(() => import('./pages/workflows/WorkflowInstance'));

function Placeholder({ title }: { title: string }) {
  return <div className="p-6 text-lg font-semibold">{title} - Coming soon</div>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth/sign-in" element={<SignIn />} />
        <Route path="/auth/sign-up" element={<SignUp />} />

        {/* Protected app routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard and canonical redirect */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />

          {/* Core */}
          <Route path="audits" element={<AuditsList />} />
          <Route path="audits/create" element={<CreateAuditPage />} />
          <Route path="audits/:auditId/schedule" element={<ScheduleAuditPage />} />
          <Route path="audits/schedules" element={<Placeholder title="Upcoming Schedules (WIP)" />} />
          <Route path="findings" element={<FindingsList />} />
          <Route path="controls" element={<ControlsList />} />
          <Route path="controls/create" element={<CreateControlSetPage />} />
          {/* Risks */}
          <Route path="risks" element={<RisksList />} />
          <Route path="risks/create" element={<CreateRiskPage />} />

          {/* AI */}
          <Route path="ai/assistant" element={<AIAssistant />} />

          {/* Workflows Module */}
          <Route
            path="workflows/home"
            element={
              <React.Suspense fallback={<Placeholder title="Loading" />}>
                <LazyWorkflowsHome />
              </React.Suspense>
            }
          />
          <Route
            path="workflows/instances/:id"
            element={
              <React.Suspense fallback={<Placeholder title="Loading" />}>
                {/*
                  Lazy import WorkflowInstance to keep bundle smaller.
                  File exists at src/pages/workflows/WorkflowInstance.tsx
                */}
                <LazyWorkflowInstance />
              </React.Suspense>
            }
          />

          {/* Compliance */}
          <Route path="compliance/frameworks" element={<FrameworksList />} />
          <Route path="compliance/requirements" element={<RequirementsBrowser />} />
          <Route path="compliance/profiles" element={<ProfilesList />} />
          <Route path="compliance/assessments" element={<Placeholder title="Compliance Assessments" />} />
          <Route path="compliance/attestations" element={<Placeholder title="Compliance Attestations" />} />
          <Route path="compliance/exceptions" element={<Placeholder title="Compliance Exceptions" />} />
          <Route path="compliance/posture" element={<Placeholder title="Compliance Posture" />} />

          {/* Users and Settings */}
          <Route path="users" element={<Placeholder title="Users" />} />
          <Route path="settings" element={<Settings />} />

          {/* Workflows */}
          <Route path="workflows" element={<Navigate to="/workflows/home" replace />} />
          <Route path="workflows/*" element={<Placeholder title="Workflow Center" />} />
        </Route>

        {/* Fallback: redirect unknown to auth sign-in */}
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </Router>
  );
}
