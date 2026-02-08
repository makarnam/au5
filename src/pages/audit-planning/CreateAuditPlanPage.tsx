import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuditPlanningForm from '../../components/audit-planning/AuditPlanningForm';
import { AuditPlanningWizardData } from '../../components/audit-planning/form/validationSchemas';
import { auditPlanningService } from '../../services/auditPlanningService';

export default function CreateAuditPlanPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAuditPlan = async (planData: AuditPlanningWizardData) => {
    setIsLoading(true);
    try {
      console.log('Creating audit plan with data:', planData);

      // Create the audit plan
      const createdPlan = await auditPlanningService.createAuditPlan(planData.planData);

      // Create plan items if any
      if (planData.planItems && planData.planItems.length > 0) {
        for (const item of planData.planItems) {
          await auditPlanningService.createAuditPlanItem({
            ...item,
            audit_plan_id: createdPlan.id,
          });
        }
      }

      console.log('Audit plan created successfully:', createdPlan);

      // Show success message and navigate
      toast.success('Audit plan created successfully!');
      navigate('/audit-planning/plans');
    } catch (error) {
      console.error('Error creating audit plan:', error);

      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          toast.error('You must be logged in to create an audit plan.');
        } else if (error.message.includes('Database error')) {
          toast.error('Database error occurred. Please check your data and try again.');
        } else {
          toast.error(`Failed to create audit plan: ${error.message}`);
        }
      } else {
        toast.error('Failed to create audit plan. Please try again.');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/audit-planning');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/audit-planning')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Audit Planning
          </button>
        </div>

        <AuditPlanningForm
          onSave={handleSaveAuditPlan}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}