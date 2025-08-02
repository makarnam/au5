import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

const FindingsList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Search className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Findings</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Findings Management</h2>
        <p className="text-gray-600">
          This page will contain the findings management functionality including finding identification,
          tracking, resolution, and reporting capabilities.
        </p>
      </div>
    </div>
  );
};

export default FindingsList;
