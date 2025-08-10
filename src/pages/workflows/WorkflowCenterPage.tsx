import React from 'react';
import WorkflowCenter from './WorkflowCenter';

const WorkflowCenterPage: React.FC = () => {
  // For the standalone workflow center, we'll use a default entity type
  // This could be enhanced to allow users to select an entity type and ID
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Center</h1>
        <p className="text-gray-600">Manage workflows and approvals for your entities</p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          <strong>Note:</strong> This is a standalone workflow center. For entity-specific workflows, 
          please navigate to the respective entity details page (e.g., Audit Details, Finding Details).
        </p>
      </div>

      {/* Placeholder for standalone workflow management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Management</h2>
        <p className="text-gray-600 mb-6">
          This page will provide a comprehensive view of all workflows and approvals across the organization.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Available Workflows</h3>
            <p className="text-sm text-gray-600">View and manage workflow templates</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Active Approvals</h3>
            <p className="text-sm text-gray-600">Monitor ongoing approval processes</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Approval History</h3>
            <p className="text-sm text-gray-600">Review completed approvals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCenterPage;
