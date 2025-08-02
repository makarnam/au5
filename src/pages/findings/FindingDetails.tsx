import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ArrowLeft } from 'lucide-react';

const FindingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/findings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Search className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Finding Details</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding ID: {id}</h2>
        <p className="text-gray-600">
          This page will contain the detailed finding information including severity assessment,
          remediation plans, evidence documentation, and resolution tracking.
        </p>
      </div>
    </div>
  );
};

export default FindingDetails;
