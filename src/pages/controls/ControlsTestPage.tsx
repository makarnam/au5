import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Plus,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Bot,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { controlService } from "../../services/controlService";
import { ControlSet, Control } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

const ControlsTestPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    databaseConnection: boolean | null;
    controlSetsLoad: boolean | null;
    controlCreate: boolean | null;
    controlUpdate: boolean | null;
    controlDelete: boolean | null;
  }>({
    databaseConnection: null,
    controlSetsLoad: null,
    controlCreate: null,
    controlUpdate: null,
    controlDelete: null,
  });

  const [controlSets, setControlSets] = useState<ControlSet[]>([]);
  const [testControlSet, setTestControlSet] = useState<ControlSet | null>(null);
  const [testControl, setTestControl] = useState<Control | null>(null);

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({
      databaseConnection: null,
      controlSetsLoad: null,
      controlCreate: null,
      controlUpdate: null,
      controlDelete: null,
    });

    try {
      // Test 1: Database connection & Load control sets
      console.log("Testing control sets load...");
      const controlSetsData = await controlService.getControlSetsByAudit();
      setControlSets(controlSetsData);
      setTestResults(prev => ({ ...prev, databaseConnection: true, controlSetsLoad: true }));
      toast.success("✓ Database connection and control sets load successful");

      // Test 2: Create test control set
      console.log("Testing control set creation...");
      const testControlSetData = {
        name: "Test Control Set",
        description: "This is a test control set created for testing purposes",
        framework: "TEST",
      };

      const createdControlSet = await controlService.createControlSet(testControlSetData);
      setTestControlSet(createdControlSet);
      setTestResults(prev => ({ ...prev, controlCreate: true }));
      toast.success("✓ Control set creation successful");

      // Test 3: Create test control
      console.log("Testing control creation...");
      const testControlData = {
        control_code: "TEST-001",
        title: "Test Control",
        description: "This is a test control for verification purposes",
        control_type: "preventive" as const,
        frequency: "monthly" as const,
        process_area: "Testing",
        testing_procedure: "Verify this control is working correctly",
        evidence_requirements: "Test logs and documentation",
        effectiveness: "not_tested" as const,
        is_automated: false,
      };

      const createdControl = await controlService.createControl(
        createdControlSet.id,
        testControlData
      );
      setTestControl(createdControl);
      toast.success("✓ Control creation successful");

      // Test 4: Update test control
      console.log("Testing control update...");
      await controlService.updateControl(createdControl.id, {
        title: "Updated Test Control",
        description: "This control has been updated during testing",
      });
      setTestResults(prev => ({ ...prev, controlUpdate: true }));
      toast.success("✓ Control update successful");

      // Test 5: Delete test control and control set
      console.log("Testing control deletion...");
      await controlService.deleteControl(createdControl.id);
      await controlService.deleteControlSet(createdControlSet.id);
      setTestResults(prev => ({ ...prev, controlDelete: true }));
      toast.success("✓ Control deletion successful");

      toast.success("🎉 All tests passed! Controls module is working correctly.");

    } catch (error) {
      console.error("Test failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("invalid input syntax for type uuid")) {
        setTestResults(prev => ({ ...prev, databaseConnection: false }));
        toast.error("❌ Database connection failed - UUID validation error");
      } else if (errorMessage.includes("User not authenticated")) {
        toast.error("❌ Authentication required - Please log in");
      } else {
        toast.error(`❌ Test failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    setLoading(true);
    try {
      // Create a sample control set with controls
      const sampleControlSet = await controlService.createControlSet({
        name: "ISO 27001 Sample Controls",
        description: "Sample control set based on ISO 27001 Information Security Management System",
        framework: "ISO 27001",
      });

      const sampleControls = [
        {
          control_code: "A.9.1.1",
          title: "Access Control Policy",
          description: "An access control policy shall be established, documented and reviewed based on business and information security requirements.",
          control_type: "directive" as const,
          frequency: "annually" as const,
          process_area: "Access Control",
          testing_procedure: "Review access control policy documentation and approval records",
          evidence_requirements: "Access control policy document, management approval, review records",
          effectiveness: "not_tested" as const,
          is_automated: false,
        },
        {
          control_code: "A.9.2.1",
          title: "User Registration and De-registration",
          description: "A formal user registration and de-registration process shall be implemented to enable assignment of access rights.",
          control_type: "preventive" as const,
          frequency: "continuous" as const,
          process_area: "User Access Management",
          testing_procedure: "Review user registration/de-registration procedures and sample user accounts",
          evidence_requirements: "User registration forms, de-registration records, access assignment documentation",
          effectiveness: "not_tested" as const,
          is_automated: true,
        },
        {
          control_code: "A.12.6.1",
          title: "Management of Technical Vulnerabilities",
          description: "Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion.",
          control_type: "detective" as const,
          frequency: "weekly" as const,
          process_area: "Vulnerability Management",
          testing_procedure: "Review vulnerability scanning reports and remediation tracking",
          evidence_requirements: "Vulnerability scan reports, remediation tracking logs, patch management records",
          effectiveness: "not_tested" as const,
          is_automated: true,
        },
      ];

      await controlService.createMultipleControls(sampleControlSet.id, sampleControls);

      toast.success("✓ Sample data created successfully");

      // Refresh the control sets list
      const updatedControlSets = await controlService.getControlSetsByAudit();
      setControlSets(updatedControlSets);

    } catch (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return "Not tested";
    if (status === true) return "Passed";
    return "Failed";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                Controls Module Test Page
              </h1>
              <p className="text-gray-600 mt-2">
                Test the controls module functionality and database connectivity
              </p>
            </div>
            <button
              onClick={() => navigate("/controls")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Controls
            </button>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Run All Tests
            </button>

            <button
              onClick={createSampleData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-2" />
              Create Sample Data
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(testResults.databaseConnection)}
                <span className="ml-3 font-medium">Database Connection</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.databaseConnection)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(testResults.controlSetsLoad)}
                <span className="ml-3 font-medium">Control Sets Load</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.controlSetsLoad)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(testResults.controlCreate)}
                <span className="ml-3 font-medium">Control Creation</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.controlCreate)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(testResults.controlUpdate)}
                <span className="ml-3 font-medium">Control Update</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.controlUpdate)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(testResults.controlDelete)}
                <span className="ml-3 font-medium">Control Deletion</span>
              </div>
              <span className="text-sm text-gray-600">
                {getStatusText(testResults.controlDelete)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Control Sets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Control Sets ({controlSets.length})
          </h2>
          {controlSets.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No control sets found</p>
              <p className="text-sm text-gray-500 mt-2">
                Run tests or create sample data to see control sets here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {controlSets.map((controlSet) => (
                <div
                  key={controlSet.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/controls/${controlSet.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{controlSet.name}</h3>
                    {controlSet.ai_generated && (
                      <Bot className="w-4 h-4 text-purple-600" title="AI Generated" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{controlSet.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{controlSet.framework}</span>
                    <span>{controlSet.controls_count || 0} controls</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. <strong>Run All Tests</strong> - Verifies database connectivity and CRUD operations</p>
            <p>2. <strong>Create Sample Data</strong> - Adds ISO 27001 sample controls for testing</p>
            <p>3. <strong>Check Results</strong> - Review test status and any error messages</p>
            <p>4. <strong>Navigate to Controls</strong> - Use the main controls interface once tests pass</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsTestPage;
