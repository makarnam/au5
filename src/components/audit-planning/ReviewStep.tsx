import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Target, Settings, Users, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { AuditPlanningWizardData } from './form/validationSchemas';

interface ReviewStepProps {
  form: UseFormReturn<AuditPlanningWizardData>;
  users: any[];
  businessUnits: any[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({ form, users, businessUnits }) => {
  const { watch } = form;

  const planData = watch('planData');
  const planItems = watch('planItems') || [];

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  const getBusinessUnitName = (unitId: string) => {
    const unit = businessUnits.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown Unit';
  };

  const calculateTotalHours = () => {
    return planItems.reduce((total, item) => total + (item.planned_hours || 0), 0);
  };

  const calculateTotalBudget = () => {
    const totalHours = calculateTotalHours();
    const hourlyRate = 150; // Default hourly rate
    return totalHours * hourlyRate;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Audit Plan</h2>
        <p className="text-gray-600">
          Please review all the information before creating your audit plan
        </p>
      </div>

      {/* Plan Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Plan Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{planData.plan_name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{planData.plan_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{planData.plan_year}</span>
              </div>
              {planData.total_budget && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">${planData.total_budget.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Coverage Targets</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Risk-Based:</span>
                <span className="font-medium">{planData.risk_based_coverage_percentage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compliance:</span>
                <span className="font-medium">{planData.compliance_coverage_percentage || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {planData.description && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {planData.description}
            </p>
          </div>
        )}
      </div>

      {/* Strategic Objectives */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-600" />
          Strategic Objectives
        </h3>

        {planData.strategic_objectives && planData.strategic_objectives.length > 0 ? (
          <div className="space-y-3">
            {planData.strategic_objectives.map((objective, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-700">{objective}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No strategic objectives defined</p>
        )}
      </div>

      {/* Audit Plan Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-purple-600" />
          Audit Plan Items ({planItems.length})
        </h3>

        {planItems.length > 0 ? (
          <div className="space-y-4">
            {planItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{item.audit_title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.priority_level === 'critical' ? 'bg-red-100 text-red-800' :
                    item.priority_level === 'high' ? 'bg-orange-100 text-orange-800' :
                    item.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium capitalize">{item.audit_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Hours:</span>
                    <p className="font-medium">{item.planned_hours}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Team Size:</span>
                    <p className="font-medium">{item.team_size}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-medium">{item.audit_frequency_months} months</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Lead Auditor:</span>
                      <p className="font-medium">{getUserName(item.lead_auditor_id)}</p>
                    </div>
                    {item.business_unit_id && (
                      <div>
                        <span className="text-gray-600">Business Unit:</span>
                        <p className="font-medium">{getBusinessUnitName(item.business_unit_id)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No audit plan items defined</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Audits</p>
              <p className="text-xl font-bold text-gray-900">{planItems.length}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Team Size</p>
              <p className="text-xl font-bold text-gray-900">
                {planItems.reduce((total, item) => total + (item.team_size || 0), 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-xl font-bold text-gray-900">{calculateTotalHours()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Estimated Budget</p>
              <p className="text-xl font-bold text-gray-900">${calculateTotalBudget().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewStep;