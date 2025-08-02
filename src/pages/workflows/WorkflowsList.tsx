import React from 'react';
import { useTranslation } from 'react-i18next';
import { Workflow } from 'lucide-react';

const WorkflowsList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Workflow className="w-8 h-8 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Workflow Management</h2>
        <p className="text-gray-600">
          This page will contain the workflow management functionality including workflow design,
          approval processes, step definitions, and automated workflow execution.
        </p>
      </div>
    </div>
  );
};

export default WorkflowsList;
