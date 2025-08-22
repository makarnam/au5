import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { supabase } from '../../lib/supabase';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  framework_id?: string;
  url?: string;
  estimated_minutes: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

interface TrainingAssignment {
  id: string;
  module_id: string;
  assigned_to: string;
  profile_id?: string;
  due_date?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  completed_at?: string;
  created_by: string;
  created_at: string;
  module?: TrainingModule;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface Certification {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  validity_months: number;
  is_active: boolean;
  created_at: string;
}

interface UserCertification {
  id: string;
  user_id: string;
  certification_id: string;
  issued_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending_renewal';
  certificate_url?: string;
  created_at: string;
  certification?: Certification;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: string[];
  target_audience: string;
  estimated_duration_hours: number;
  is_active: boolean;
  created_at: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  module_id: string;
  questions: any[];
  passing_score: number;
  time_limit_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface AssessmentResult {
  id: string;
  assessment_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
  answers: any[];
  created_at: string;
}

export default function TrainingManagementDashboard() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModules: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    overdueAssignments: 0,
    activeCertifications: 0,
    expiringCertifications: 0,
    averageCompletionRate: 0
  });

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);

      // Load training modules
      const { data: modulesData } = await supabase
        .from('training_modules')
        .select('*')
        .eq('is_active', true);

      // Load training assignments with related data
      const { data: assignmentsData } = await supabase
        .from('training_assignments')
        .select(`
          *,
          module:training_modules(*),
          user:users(id, email, full_name)
        `);

      // Load certifications
      const { data: certificationsData } = await supabase
        .from('certifications')
        .select('*')
        .eq('is_active', true);

      // Load user certifications with related data
      const { data: userCertificationsData } = await supabase
        .from('user_certifications')
        .select(`
          *,
          certification:certifications(*),
          user:users(id, email, full_name)
        `);

      // Load learning paths
      const { data: learningPathsData } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_active', true);

      // Load assessments
      const { data: assessmentsData } = await supabase
        .from('assessments')
        .select('*')
        .eq('is_active', true);

      // Load assessment results
      const { data: assessmentResultsData } = await supabase
        .from('assessment_results')
        .select('*');

      setModules(modulesData || []);
      setAssignments(assignmentsData || []);
      setCertifications(certificationsData || []);
      setUserCertifications(userCertificationsData || []);
      setLearningPaths(learningPathsData || []);
      setAssessments(assessmentsData || []);
      setAssessmentResults(assessmentResultsData || []);

      // Calculate statistics
      const activeAssignments = assignmentsData?.filter(a => a.status === 'assigned' || a.status === 'in_progress').length || 0;
      const completedAssignments = assignmentsData?.filter(a => a.status === 'completed').length || 0;
      const overdueAssignments = assignmentsData?.filter(a => a.status === 'overdue').length || 0;
      const activeCertifications = userCertificationsData?.filter(uc => uc.status === 'active').length || 0;
      const expiringCertifications = userCertificationsData?.filter(uc => {
        const expiryDate = new Date(uc.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && uc.status === 'active';
      }).length || 0;

      const totalAssignments = assignmentsData?.length || 0;
      const averageCompletionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      setStats({
        totalModules: modulesData?.length || 0,
        activeAssignments,
        completedAssignments,
        overdueAssignments,
        activeCertifications,
        expiringCertifications,
        averageCompletionRate
      });

    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold">Training & Certification Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Create Assignment</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Badge variant="secondary">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModules}</div>
            <p className="text-xs text-muted-foreground">
              Available for training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Badge variant="outline">In Progress</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueAssignments} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Badge variant="outline">Success</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletionRate.toFixed(1)}%</div>
            <Progress value={stats.averageCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Certifications</CardTitle>
            <Badge variant="outline">Valid</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCertifications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.expiringCertifications} expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{assignment.module?.title}</div>
                        <div className="text-sm text-gray-500">{assignment.user?.full_name || assignment.user?.email}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                        {assignment.due_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userCertifications.slice(0, 5).map((userCert) => (
                    <div key={userCert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{userCert.certification?.name}</div>
                        <div className="text-sm text-gray-500">{userCert.user?.full_name || userCert.user?.email}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getCertificationStatusColor(userCert.status)}>
                          {userCert.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(userCert.expiry_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Module</th>
                      <th className="text-left p-2">Assigned To</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Due Date</th>
                      <th className="text-left p-2">Completed</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{assignment.module?.title}</div>
                          <div className="text-sm text-gray-500">{assignment.module?.estimated_minutes} min</div>
                        </td>
                        <td className="p-2">{assignment.user?.full_name || assignment.user?.email}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="p-2">
                          {assignment.completed_at ? new Date(assignment.completed_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{cert.description}</div>
                          <div className="text-xs text-gray-400 mt-2">
                            Valid for {cert.validity_months} months
                          </div>
                        </div>
                        <Button size="sm">Assign</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userCertifications.map((userCert) => (
                    <div key={userCert.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{userCert.certification?.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {userCert.user?.full_name || userCert.user?.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Issued: {new Date(userCert.issued_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getCertificationStatusColor(userCert.status)}>
                            {userCert.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(userCert.expiry_date).toLocaleDateString()}
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

        <TabsContent value="learning-paths" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="p-4 border rounded-lg">
                    <div className="font-medium">{path.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{path.description}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      Duration: {path.estimated_duration_hours} hours
                    </div>
                    <div className="text-xs text-gray-400">
                      Target: {path.target_audience}
                    </div>
                    <div className="mt-3">
                      <Button size="sm" className="w-full">View Path</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{assessment.title}</div>
                          <div className="text-sm text-gray-500 mt-1">{assessment.description}</div>
                          <div className="text-xs text-gray-400 mt-2">
                            Time limit: {assessment.time_limit_minutes} min | 
                            Passing score: {assessment.passing_score}%
                          </div>
                        </div>
                        <Button size="sm">Take Assessment</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentResults.slice(0, 5).map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Assessment #{result.assessment_id}</div>
                          <div className="text-sm text-gray-500">
                            Score: {result.score}%
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(result.completed_at).toLocaleDateString()}
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
      </Tabs>
    </div>
  );
}
