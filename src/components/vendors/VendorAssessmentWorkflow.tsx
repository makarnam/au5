import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Calculator,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Workflow,
  Target,
  Shield,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { workflowService } from '../../services/workflowService';
import type { ThirdParty, ThirdPartyAssessment } from '../../types/thirdPartyRiskManagement';

interface VendorAssessmentWorkflowProps {
  vendorId?: string;
}

interface AssessmentWorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
}

interface AssessmentWorkflow {
  id: string;
  vendor_id: string;
  assessment_id?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  current_step: number;
  steps: AssessmentWorkflowStep[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

const ASSESSMENT_WORKFLOW_STEPS = [
  {
    id: 'initial_request',
    name: 'Initial Assessment Request',
    description: 'Submit assessment request with basic vendor information',
    required_fields: ['vendor_name', 'assessment_type', 'requested_by']
  },
  {
    id: 'documentation_review',
    name: 'Documentation Review',
    description: 'Review vendor documentation and compliance certificates',
    required_fields: ['vendor_documents', 'compliance_checklist']
  },
  {
    id: 'risk_scoring',
    name: 'Risk Scoring',
    description: 'Perform detailed risk assessment and scoring',
    required_fields: ['financial_score', 'operational_score', 'security_score', 'compliance_score']
  },
  {
    id: 'approval_process',
    name: 'Approval Process',
    description: 'Review and approve assessment results',
    required_fields: ['reviewer_approval', 'final_decision']
  },
  {
    id: 'final_decision',
    name: 'Final Decision',
    description: 'Communicate final assessment decision to stakeholders',
    required_fields: ['decision_communication', 'next_steps']
  }
];

const VendorAssessmentWorkflow: React.FC<VendorAssessmentWorkflowProps> = ({ vendorId }) => {
  const [vendor, setVendor] = useState<ThirdParty | null>(null);
  const [assessment, setAssessment] = useState<ThirdPartyAssessment | null>(null);
  const [workflow, setWorkflow] = useState<AssessmentWorkflow | null>(null);
  const [workflows, setWorkflows] = useState<AssessmentWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [selectedStep, setSelectedStep] = useState<AssessmentWorkflowStep | null>(null);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
    } else {
      loadWorkflows();
    }
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [vendorResult, assessmentResult] = await Promise.all([
        thirdPartyRiskManagementService.getThirdParty(vendorId!),
        thirdPartyRiskManagementService.getAssessments({ third_party_id: vendorId! }, 1, 1)
      ]);

      if (vendorResult.data) {
        setVendor(vendorResult.data);
      }

      if (assessmentResult.data && assessmentResult.data.length > 0) {
        setAssessment(assessmentResult.data[0]);
      }

      // Load or create workflow
      await loadWorkflow();
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      // Load all workflows (this would need to be implemented in the service)
      setWorkflows([]);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflow = async () => {
    try {
      // Check if workflow exists for this vendor
      // For now, create a mock workflow
      const mockWorkflow: AssessmentWorkflow = {
        id: 'workflow-1',
        vendor_id: vendorId!,
        assessment_id: assessment?.id,
        status: 'in_progress',
        current_step: 1,
        steps: ASSESSMENT_WORKFLOW_STEPS.map((step, index) => ({
          id: step.id,
          name: step.name,
          description: step.description,
          status: index === 0 ? 'in_progress' : index < 2 ? 'completed' : 'pending',
          assigned_to: 'user-1',
          due_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: index < 2 ? new Date().toISOString() : undefined,
          notes: index < 2 ? 'Step completed successfully' : undefined
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user-1'
      };

      setWorkflow(mockWorkflow);
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const createWorkflow = async () => {
    try {
      setIsCreatingWorkflow(true);

      const newWorkflow: AssessmentWorkflow = {
        id: `workflow-${Date.now()}`,
        vendor_id: vendorId!,
        status: 'in_progress',
        current_step: 0,
        steps: ASSESSMENT_WORKFLOW_STEPS.map(step => ({
          id: step.id,
          name: step.name,
          description: step.description,
          status: 'pending',
          assigned_to: 'user-1',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user-1'
      };

      setWorkflow(newWorkflow);
      toast.success('Assessment workflow created successfully');
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const updateStepStatus = async (stepId: string, newStatus: AssessmentWorkflowStep['status']) => {
    if (!workflow) return;

    try {
      const updatedSteps = workflow.steps.map(step =>
        step.id === stepId
          ? {
              ...step,
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : step.completed_at
            }
          : step
      );

      // Update current step based on completed steps
      const completedSteps = updatedSteps.filter(step => step.status === 'completed').length;
      const currentStep = Math.min(completedSteps + (updatedSteps[completedSteps]?.status === 'in_progress' ? 1 : 0), ASSESSMENT_WORKFLOW_STEPS.length);

      const updatedWorkflow: AssessmentWorkflow = {
        ...workflow,
        steps: updatedSteps,
        current_step: currentStep,
        status: (currentStep === ASSESSMENT_WORKFLOW_STEPS.length ? 'completed' : 'in_progress') as AssessmentWorkflow['status'],
        updated_at: new Date().toISOString()
      };

      setWorkflow(updatedWorkflow);
      toast.success(`Step ${newStatus === 'completed' ? 'completed' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error updating step status:', error);
      toast.error('Failed to update step status');
    }
  };

  const getStepIcon = (status: AssessmentWorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      case 'in_progress':
        return <Clock className='h-5 w-5 text-blue-600' />;
      case 'failed':
        return <AlertTriangle className='h-5 w-5 text-red-600' />;
      default:
        return <Clock className='h-5 w-5 text-gray-400' />;
    }
  };

  const getStepColor = (status: AssessmentWorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 border-blue-200';
      case 'failed':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getWorkflowProgress = () => {
    if (!workflow) return 0;
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vendorId) {
    // Show all workflows
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Vendor Assessment Workflows</h2>
            <p className='text-gray-600'>Manage assessment workflows for all vendors</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Assessment Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <div className='text-center py-8'>
                <Workflow className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No assessment workflows found.</p>
                <p className='text-sm text-gray-400 mt-2'>
                  Workflows will appear here when vendors are assessed.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((wf) => (
                    <TableRow key={wf.id}>
                      <TableCell>Vendor Name</TableCell>
                      <TableCell>
                        <Badge variant={wf.status === 'completed' ? 'default' : 'secondary'}>
                          {wf.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{wf.steps[wf.current_step]?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className='w-24'>
                          <Progress value={getWorkflowProgress()} className='h-2' />
                        </div>
                      </TableCell>
                      <TableCell>{new Date(wf.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size='sm' variant='ghost'>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vendor) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <p className='text-gray-500'>Vendor not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Vendor Assessment Workflow
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>Assessment workflow for {vendor.name}</p>
        </div>

        {!workflow && (
          <Button onClick={createWorkflow} disabled={isCreatingWorkflow}>
            {isCreatingWorkflow ? (
              <>
                <Clock className='h-4 w-4 mr-2 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Play className='h-4 w-4 mr-2' />
                Start Assessment Workflow
              </>
            )}
          </Button>
        )}
      </div>

      {workflow && (
        <>
          {/* Workflow Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Workflow className='h-5 w-5' />
                Workflow Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
                      {workflow.status.toUpperCase()}
                    </Badge>
                    <span className='text-sm text-gray-600'>
                      Step {workflow.current_step} of {workflow.steps.length}
                    </span>
                  </div>
                  <span className='text-sm font-medium'>{getWorkflowProgress()}% Complete</span>
                </div>

                <Progress value={getWorkflowProgress()} className='h-3' />

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                  <div className='text-center p-4 bg-green-50 rounded-lg'>
                    <div className='text-2xl font-bold text-green-600'>
                      {workflow.steps.filter(s => s.status === 'completed').length}
                    </div>
                    <p className='text-sm text-gray-600'>Completed Steps</p>
                  </div>
                  <div className='text-center p-4 bg-blue-50 rounded-lg'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {workflow.steps.filter(s => s.status === 'in_progress').length}
                    </div>
                    <p className='text-sm text-gray-600'>In Progress</p>
                  </div>
                  <div className='text-center p-4 bg-orange-50 rounded-lg'>
                    <div className='text-2xl font-bold text-orange-600'>
                      {workflow.steps.filter(s => s.status === 'pending').length}
                    </div>
                    <p className='text-sm text-gray-600'>Pending Steps</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {workflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 border-2 rounded-lg transition-all ${getStepColor(step.status)}`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <div className='mt-1'>
                          {getStepIcon(step.status)}
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h4 className='font-medium text-gray-900'>{step.name}</h4>
                            <Badge variant='outline' className='text-xs'>
                              Step {index + 1}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mb-2'>{step.description}</p>

                          {step.assigned_to && (
                            <div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
                              <User className='h-4 w-4' />
                              <span>Assigned to: {step.assigned_to}</span>
                            </div>
                          )}

                          {step.due_date && (
                            <div className='flex items-center gap-2 text-sm text-gray-500'>
                              <Clock className='h-4 w-4' />
                              <span>Due: {new Date(step.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setSelectedStep(step);
                            setIsStepDialogOpen(true);
                          }}
                        >
                          <Eye className='h-4 w-4 mr-1' />
                          View
                        </Button>

                        {step.status === 'pending' && (
                          <Button
                            size='sm'
                            onClick={() => updateStepStatus(step.id, 'in_progress')}
                          >
                            <Play className='h-4 w-4 mr-1' />
                            Start
                          </Button>
                        )}

                        {step.status === 'in_progress' && (
                          <>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => updateStepStatus(step.id, 'completed')}
                            >
                              <CheckCircle className='h-4 w-4 mr-1' />
                              Complete
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => updateStepStatus(step.id, 'pending')}
                            >
                              <Pause className='h-4 w-4 mr-1' />
                              Pause
                            </Button>
                          </>
                        )}

                        {step.status === 'completed' && index > 0 && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => updateStepStatus(step.id, 'in_progress')}
                          >
                            <RotateCcw className='h-4 w-4 mr-1' />
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>

                    {step.notes && (
                      <div className='mt-3 p-3 bg-white rounded border'>
                        <p className='text-sm text-gray-700'>{step.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Step Details Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{selectedStep?.name}</DialogTitle>
            <DialogDescription>{selectedStep?.description}</DialogDescription>
          </DialogHeader>

          {selectedStep && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Status</label>
                  <div className='mt-1'>
                    <Badge variant={selectedStep.status === 'completed' ? 'default' : 'secondary'}>
                      {selectedStep.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium'>Assigned To</label>
                  <p className='text-sm text-gray-600 mt-1'>{selectedStep.assigned_to || 'Unassigned'}</p>
                </div>

                <div>
                  <label className='text-sm font-medium'>Due Date</label>
                  <p className='text-sm text-gray-600 mt-1'>
                    {selectedStep.due_date ? new Date(selectedStep.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>

                <div>
                  <label className='text-sm font-medium'>Completed At</label>
                  <p className='text-sm text-gray-600 mt-1'>
                    {selectedStep.completed_at ? new Date(selectedStep.completed_at).toLocaleDateString() : 'Not completed'}
                  </p>
                </div>
              </div>

              {selectedStep.notes && (
                <div>
                  <label className='text-sm font-medium'>Notes</label>
                  <div className='mt-1 p-3 bg-gray-50 rounded text-sm'>
                    {selectedStep.notes}
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsStepDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorAssessmentWorkflow;