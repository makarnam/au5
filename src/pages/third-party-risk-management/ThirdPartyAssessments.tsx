import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import VendorAssessmentWorkflow from '../../components/vendors/VendorAssessmentWorkflow';

const ThirdPartyAssessments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Third Party Assessments</h2>
        <p className="text-gray-600">Manage third party risk assessments and workflows</p>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflows">Assessment Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <VendorAssessmentWorkflow />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThirdPartyAssessments;
