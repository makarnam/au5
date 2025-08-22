import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { supabase } from '../../lib/supabase';

interface ComplianceFramework {
  id: string;
  code: string;
  name: string;
  version: string;
  description: string;
  authority: string;
  category: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  ai_generated: boolean;
}

interface ComplianceRequirement {
  id: string;
  framework_id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  framework?: ComplianceFramework;
}

interface ComplianceAssessment {
  id: string;
  framework_id: string;
  assessment_date: string;
  status: string;
  compliance_score: number;
  total_requirements: number;
  compliant_requirements: number;
  non_compliant_requirements: number;
  partial_requirements: number;
  created_by: string;
  created_at: string;
  framework?: ComplianceFramework;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'automated' | 'manual' | 'scheduled';
  framework_id: string;
  requirement_id: string;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  last_executed?: string;
  next_execution?: string;
  execution_frequency: string;
  created_at: string;
  framework?: ComplianceFramework;
  requirement?: ComplianceRequirement;
}

interface ComplianceWorkflow {
  id: string;
  name: string;
  description: string;
  workflow_type: 'assessment' | 'remediation' | 'approval' | 'notification';
  trigger_conditions: any[];
  steps: any[];
  is_active: boolean;
  created_at: string;
}

interface ComplianceException {
  id: string;
  requirement_id: string;
  framework_id: string;
  exception_type: string;
  reason: string;
  justification: string;
  approved_by?: string;
  approved_at?: string;
  expiry_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_by: string;
  created_at: string;
  requirement?: ComplianceRequirement;
  framework?: ComplianceFramework;
}

interface ComplianceEvidence {
  id: string;
  requirement_id: string;
  assessment_id: string;
  evidence_type: string;
  description: string;
  file_url?: string;
  collected_at: string;
  collected_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function ComplianceAutomationDashboard() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([]);
  const [exceptions, setExceptions] = useState<ComplianceException[]>([]);
  const [evidence, setEvidence] = useState<ComplianceEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [stats, setStats] = useState({
    totalFrameworks: 0,
    activeFrameworks: 0,
    totalRequirements: 0,
    compliantRequirements: 0,
    nonCompliantRequirements: 0,
    activeRules: 0,
    pendingExceptions: 0,
    averageComplianceScore: 0
  });

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);

      // Load frameworks
      const { data: frameworksData } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .order('name');

      // Load requirements with framework data
      const { data: requirementsData } = await supabase
        .from('compliance_requirements')
        .select(`
          *,
          framework:compliance_frameworks(*)
        `)
        .order('code');

      // Load assessments with framework data
      const { data: assessmentsData } = await supabase
        .from('compliance_assessments')
        .select(`
          *,
          framework:compliance_frameworks(*)
        `)
        .order('assessment_date', { ascending: false });

      // Load compliance rules
      const { data: rulesData } = await supabase
        .from('compliance_rules')
        .select(`
          *,
          framework:compliance_frameworks(*),
          requirement:compliance_requirements(*)
        `)
        .eq('is_active', true);

      // Load compliance workflows
      const { data: workflowsData } = await supabase
        .from('compliance_workflows')
        .select('*')
        .eq('is_active', true);

      // Load compliance exceptions
      const { data: exceptionsData } = await supabase
        .from('compliance_exceptions')
        .select(`
          *,
          requirement:compliance_requirements(*),
          framework:compliance_frameworks(*)
        `)
        .order('created_at', { ascending: false });

      // Load compliance evidence
      const { data: evidenceData } = await supabase
        .from('compliance_evidence')
        .select('*')
        .order('collected_at', { ascending: false });

      setFrameworks(frameworksData || []);
      setRequirements(requirementsData || []);
      setAssessments(assessmentsData || []);
      setRules(rulesData || []);
      setWorkflows(workflowsData || []);
      setExceptions(exceptionsData || []);
      setEvidence(evidenceData || []);

      // Calculate statistics
      const activeFrameworks = frameworksData?.filter(f => f.is_active).length || 0;
      const compliantRequirements = assessmentsData?.reduce((total, assessment) => total + assessment.compliant_requirements, 0) || 0;
      const nonCompliantRequirements = assessmentsData?.reduce((total, assessment) => total + assessment.non_compliant_requirements, 0) || 0;
      const activeRules = rulesData?.filter(r => r.is_active).length || 0;
      const pendingExceptions = exceptionsData?.filter(e => e.status === 'pending').length || 0;
      const averageComplianceScore = assessmentsData?.length > 0 
        ? assessmentsData.reduce((total, assessment) => total + assessment.compliance_score, 0) / assessmentsData.length 
        : 0;

      setStats({
        totalFrameworks: frameworksData?.length || 0,
        activeFrameworks,
        totalRequirements: requirementsData?.length || 0,
        compliantRequirements,
        nonCompliantRequirements,
        activeRules,
        pendingExceptions,
        averageComplianceScore
      });

    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'automated': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const runAutomatedAssessment = async (frameworkId: string) => {
    try {
      // This would trigger the automated compliance checking
      console.log('Running automated assessment for framework:', frameworkId);
      
      // Simulate assessment process
      const { error } = await supabase
        .from('compliance_assessments')
        .insert([{
          framework_id: frameworkId,
          assessment_date: new Date().toISOString(),
          status: 'in_progress',
          compliance_score: 0,
          total_requirements: 0,
          compliant_requirements: 0,
          non_compliant_requirements: 0,
          partial_requirements: 0,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
      await loadComplianceData();
    } catch (error) {
      console.error('Error running automated assessment:', error);
    }
  };

  const createComplianceRule = async (ruleData: Partial<ComplianceRule>) => {
    try {
      const { error } = await supabase
        .from('compliance_rules')
        .insert([ruleData]);

      if (error) throw error;
      await loadComplianceData();
    } catch (error) {
      console.error('Error creating compliance rule:', error);
    }
  };

  const createComplianceWorkflow = async (workflowData: Partial<ComplianceWorkflow>) => {
    try {
      const { error } = await supabase
        .from('compliance_workflows')
        .insert([workflowData]);

      if (error) throw error;
      await loadComplianceData();
    } catch (error) {
      console.error('Error creating compliance workflow:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compliance Automation</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Create Rule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Compliance Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input id="rule-name" placeholder="Enter rule name" />
                </div>
                <div>
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea id="rule-description" placeholder="Enter rule description" />
                </div>
                <div>
                  <Label htmlFor="rule-type">Rule Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automated">Automated</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rule-framework">Framework</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {}}>Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Run Assessment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Automated Assessment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assessment-framework">Framework</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.filter(f => f.is_active).map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {}}>Run Assessment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Frameworks</CardTitle>
            <Badge variant="secondary">Compliance</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFrameworks}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalFrameworks} total frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Badge variant="outline">Average</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageComplianceScore.toFixed(1)}%</div>
            <Progress value={stats.averageComplianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Badge variant="outline">Automation</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">
              Automated compliance checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Exceptions</CardTitle>
            <Badge variant="destructive">Attention</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingExceptions}</div>
            <p className="text-xs text-muted-foreground">
              Require approval
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="rules">Rules Engine</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{assessment.framework?.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{assessment.compliance_score}%</div>
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.slice(0, 5).map((rule) => (
                    <div key={rule.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRuleTypeColor(rule.rule_type)}>
                            {rule.rule_type}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {rule.framework?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{framework.name}</h3>
                        <p className="text-sm text-gray-500">{framework.code} v{framework.version}</p>
                      </div>
                      <Badge variant={framework.is_active ? "default" : "secondary"}>
                        {framework.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{framework.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Authority: {framework.authority}</span>
                      <span>Category: {framework.category}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedFramework(framework)}>
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => runAutomatedAssessment(framework.id)}>
                        Assess
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Rules Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{rule.name}</h3>
                          <Badge className={getRuleTypeColor(rule.rule_type)}>
                            {rule.rule_type}
                          </Badge>
                          <Badge variant={rule.is_active ? "default" : "secondary"}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Framework: {rule.framework?.name}</span>
                          <span>Requirement: {rule.requirement?.code}</span>
                          <span>Frequency: {rule.execution_frequency}</span>
                        </div>
                        {rule.last_executed && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last executed: {new Date(rule.last_executed).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">Execute Now</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{workflow.name}</h3>
                        <p className="text-sm text-gray-500">{workflow.workflow_type}</p>
                      </div>
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      Steps: {workflow.steps.length}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm">Execute</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{assessment.framework?.name}</h3>
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <div className="font-medium">{assessment.compliance_score}%</div>
                            <div className="text-gray-500">Score</div>
                          </div>
                          <div>
                            <div className="font-medium">{assessment.compliant_requirements}</div>
                            <div className="text-gray-500">Compliant</div>
                          </div>
                          <div>
                            <div className="font-medium">{assessment.non_compliant_requirements}</div>
                            <div className="text-gray-500">Non-Compliant</div>
                          </div>
                          <div>
                            <div className="font-medium">{assessment.partial_requirements}</div>
                            <div className="text-gray-500">Partial</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Assessment Date: {new Date(assessment.assessment_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Export Report</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exceptions.map((exception) => (
                  <div key={exception.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{exception.requirement?.title}</h3>
                          <Badge className={getStatusColor(exception.status)}>
                            {exception.status}
                          </Badge>
                          <Badge variant="outline">{exception.exception_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{exception.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Framework: {exception.framework?.name}</span>
                          <span>Created: {new Date(exception.created_at).toLocaleDateString()}</span>
                          {exception.expiry_date && (
                            <span>Expires: {new Date(exception.expiry_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {exception.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">Reject</Button>
                            <Button size="sm">Approve</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
