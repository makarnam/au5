import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AuditsList from './pages/audits/AuditsList';
import FindingsList from './pages/findings/FindingsList';
import ControlsList from './pages/controls/ControlsList';
import Risks from './components/Risks';
import ComplianceFrameworks from './pages/compliance/ComplianceFrameworks';
import RequirementsBrowser from './pages/compliance/RequirementsBrowser';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

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
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Existing */}
          <Route path="audits" element={<AuditsList />} />
          <Route path="findings" element={<FindingsList />} />
          <Route path="controls" element={<ControlsList />} />
          <Route path="risks" element={<Risks />} />

          {/* Compliance */}
          <Route path="compliance/frameworks" element={<ComplianceFrameworks />} />
          <Route path="compliance/requirements" element={<RequirementsBrowser />} />
          <Route path="compliance/profiles" element={<Placeholder title="Compliance Profiles" />} />
          <Route path="compliance/assessments" element={<Placeholder title="Compliance Assessments" />} />
          <Route path="compliance/attestations" element={<Placeholder title="Compliance Attestations" />} />
          <Route path="compliance/exceptions" element={<Placeholder title="Compliance Exceptions" />} />
          <Route path="compliance/posture" element={<Placeholder title="Compliance Posture" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<SignIn />} />
      </Routes>
    </Router>
  );
}
