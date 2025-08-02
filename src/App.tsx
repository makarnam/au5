import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RisksList from './pages/risks/RisksList';
import RiskDetails from './pages/risks/RiskDetails';
import CreateRiskPage from './pages/risks/CreateRiskPage';
import EditRiskPage from './pages/risks/EditRiskPage';
import ControlsList from './pages/controls/ControlsList';
import ControlDetails from './pages/controls/ControlDetails';
import CreateControlPage from './pages/controls/CreateControlPage';
import EditControlPage from './pages/controls/ControlDetails';
import AuditsList from './pages/audits/AuditsList';
import AuditDetails from './pages/audits/AuditDetails';
import CreateAuditPage from './pages/audits/CreateAuditPage';
import EditAuditPage from './pages/audits/EditAuditPage';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Findings pages (new)
import FindingsList from './pages/findings/FindingsList';
import CreateFindingPage from './pages/findings/CreateFindingPage';
import EditFindingPage from './pages/findings/EditFindingPage';
import FindingDetails from './pages/findings/FindingDetails';

function App() {
  return (
    <Router>
      <Routes>
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

          {/* Risks */}
          <Route path="risks" element={<RisksList />} />
          <Route path="risks/create" element={<CreateRiskPage />} />
          <Route path="risks/:id" element={<RiskDetails />} />
          <Route path="risks/:id/edit" element={<EditRiskPage />} />

          {/* Controls */}
          <Route path="controls" element={<ControlsList />} />
          <Route path="controls/create" element={<CreateControlPage />} />
          <Route path="controls/:id" element={<ControlDetails />} />
          <Route path="controls/:id/edit" element={<EditControlPage />} />

          {/* Audits */}
          <Route path="audits" element={<AuditsList />} />
          <Route path="audits/create" element={<CreateAuditPage />} />
          <Route path="audits/:id" element={<AuditDetails />} />
          <Route path="audits/:id/edit" element={<EditAuditPage />} />
          {/* Findings (new) */}
          <Route path="findings" element={<FindingsList />} />
          <Route path="findings/create" element={<CreateFindingPage />} />
          <Route path="findings/:id" element={<FindingDetails />} />
          <Route path="findings/:id/edit" element={<EditFindingPage />} />

          {/* Findings (new) */}
          <Route path="findings" element={<FindingsList />} />
          <Route path="findings/create" element={<CreateFindingPage />} />
          <Route path="findings/:id" element={<FindingDetails />} />
          <Route path="findings/:id/edit" element={<EditFindingPage />} />

          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
