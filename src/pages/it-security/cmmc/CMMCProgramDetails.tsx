import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Award,
  TrendingUp,
  Loader2,
  BarChart3,
  Activity,
  CheckSquare,
  XCircle
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { CMMCManagement } from '../../../types/itSecurity';

const CMMCProgramDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<CMMCManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCMMCProgram();
    }
  }, [id]);

  const loadCMMCProgram = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.cmmcManagement.getById(id!);
      setProgram(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CMMC program');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'implementation': return 'bg-yellow-100 text-yellow-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      case 'certified': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'not_certified': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'certified': return 'bg-green-100 text-green-800';
      case 'surveillance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-purple-100 text-purple-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading CMMC program...</span>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/it-security/cmmc')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CMMC Programs
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error || 'CMMC program not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/it-security/cmmc')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CMMC Programs
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
            <p className="text-gray-600">CMMC Program Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/it-security/cmmc/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Program
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-lg font-semibold">Level {program.current_level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Target Level</p>
                <p className="text-lg font-semibold">Level {program.target_level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(program.status)}>
                  {program.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Certification</p>
                <Badge className={getCertificationStatusColor(program.certification_status)}>
                  {program.certification_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="levels">CMMC Levels</TabsTrigger>
          <TabsTrigger value="assessment">Assessment Details</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">CMMC ID</label>
                  <p className="text-gray-900">{program.cmmc_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{program.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scope</label>
                  <p className="text-gray-900">{program.scope || 'No scope defined'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Implementation Start Date</label>
                  <p className="text-gray-900">{formatDate(program.implementation_start_date)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Level Progress</label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current: Level {program.current_level}</span>
                      <span>Target: Level {program.target_level}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(program.current_level / program.target_level) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(program.status)}>
                      {program.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certification Status</label>
                  <div className="mt-1">
                    <Badge className={getCertificationStatusColor(program.certification_status)}>
                      {program.certification_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                CMMC Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Level</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getLevelColor(program.current_level)}>
                        Level {program.current_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {program.current_level === 1 && 'Basic cyber hygiene practices (17 practices)'}
                      {program.current_level === 2 && 'Intermediate cyber hygiene (55 practices)'}
                      {program.current_level === 3 && 'Good cyber hygiene (110 practices)'}
                      {program.current_level === 4 && 'Proactive (156 practices)'}
                      {program.current_level === 5 && 'Advanced/Progressive (171 practices)'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Target Level</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getLevelColor(program.target_level)}>
                        Level {program.target_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {program.target_level === 1 && 'Basic cyber hygiene practices (17 practices)'}
                      {program.target_level === 2 && 'Intermediate cyber hygiene (55 practices)'}
                      {program.target_level === 3 && 'Good cyber hygiene (110 practices)'}
                      {program.target_level === 4 && 'Proactive (156 practices)'}
                      {program.target_level === 5 && 'Advanced/Progressive (171 practices)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">CMMC Level Overview</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Level 1:</strong> Basic cyber hygiene practices (17 practices)</p>
                  <p><strong>Level 2:</strong> Intermediate cyber hygiene (55 practices)</p>
                  <p><strong>Level 3:</strong> Good cyber hygiene (110 practices)</p>
                  <p><strong>Level 4:</strong> Proactive (156 practices)</p>
                  <p><strong>Level 5:</strong> Advanced/Progressive (171 practices)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Target Certification Date</label>
                  <p className="text-gray-900">{formatDate(program.target_certification_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certification Date</label>
                  <p className="text-gray-900">{formatDate(program.certification_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Next Assessment Date</label>
                  <p className="text-gray-900">{formatDate(program.next_assessment_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gap Assessment Date</label>
                  <p className="text-gray-900">{formatDate(program.gap_assessment_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">C3PAO Company</label>
                  <p className="text-gray-900">{program.c3pao_company || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">C3PAO Contact</label>
                  <p className="text-gray-900">{program.c3pao_contact || 'Not specified'}</p>
                </div>
              </div>

              {program.gap_assessment_results && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Gap Assessment Results</label>
                  <div className="mt-1 bg-gray-50 rounded-md p-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{program.gap_assessment_results}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Implementation Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {program.implementation_plan && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Implementation Plan</label>
                  <div className="mt-1 bg-gray-50 rounded-md p-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{program.implementation_plan}</p>
                  </div>
                </div>
              )}

              {program.corrective_actions && program.corrective_actions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Corrective Actions</label>
                  <div className="mt-2 space-y-2">
                    {program.corrective_actions.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-900">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">CMMC Manager</label>
                  {program.cmmc_manager ? (
                    <div className="mt-1">
                      <p className="text-gray-900 font-medium">
                        {program.cmmc_manager.first_name} {program.cmmc_manager.last_name}
                      </p>
                      <p className="text-gray-600 text-sm">{program.cmmc_manager.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">Not assigned</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Assessor</label>
                  {program.assessor ? (
                    <div className="mt-1">
                      <p className="text-gray-900 font-medium">
                        {program.assessor.first_name} {program.assessor.last_name}
                      </p>
                      <p className="text-gray-600 text-sm">{program.assessor.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">Not assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Program History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{formatDate(program.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">{formatDate(program.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMMCProgramDetails;
