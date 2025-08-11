import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIModel, AIControl, AIRiskAssessment, AIModelMonitoring, AIModelControl } from '../../types/aiGovernance';
import { 
  Edit, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Eye
} from 'lucide-react';

const AIModelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<AIModel | null>(null);
  const [controls, setControls] = useState<AIModelControl[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<AIRiskAssessment[]>([]);
  const [monitoringData, setMonitoringData] = useState<AIModelMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadModelData();
    }
  }, [id]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      const [modelData, controlsData, assessmentsData, monitoringData] = await Promise.all([
        aiGovernanceService.getAIModel(id!),
        aiGovernanceService.getAIModelControls(id!),
        aiGovernanceService.getAIRiskAssessments({ filters: { model_id: [id!] } }),
        aiGovernanceService.getAIModelMonitoring(id!)
      ]);

      setModel(modelData);
      setControls(controlsData);
      setRiskAssessments(assessmentsData.data);
      setMonitoringData(monitoringData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!model || !confirm('Are you sure you want to delete this AI model?')) return;

    try {
      await aiGovernanceService.deleteAIModel(model.id);
      navigate('/ai-governance/models');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!model) return <div>Model not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{model.name}</h1>
          <p className="text-gray-600 mt-2">{model.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/ai-governance/models/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Model Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Settings className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">{model.model_type.toUpperCase()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">{model.provider}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getRiskLevelColor(model.risk_level)}>
              {model.risk_level.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getComplianceStatusColor(model.compliance_status)}>
              {model.compliance_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Version</label>
                    <p className="text-sm">{model.version || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Environment</label>
                    <p className="text-sm capitalize">{model.deployment_environment}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Active Status</label>
                    <div className="flex items-center">
                      {model.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className="text-sm">{model.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-sm">{new Date(model.last_updated).toLocaleDateString()}</p>
                  </div>
                </div>

                {model.owner && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Owner</label>
                    <div className="flex items-center mt-1">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {model.owner.first_name} {model.owner.last_name} ({model.owner.email})
                      </span>
                    </div>
                  </div>
                )}

                {model.business_unit && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Unit</label>
                    <div className="flex items-center mt-1">
                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{model.business_unit.name} ({model.business_unit.code})</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data & Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Data & Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {model.data_sources && model.data_sources.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data Sources</label>
                    <div className="mt-1 space-y-1">
                      {model.data_sources.map((source, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          {source}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {model.training_data_description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Training Data</label>
                    <p className="text-sm mt-1">{model.training_data_description}</p>
                  </div>
                )}

                {model.model_performance_metrics && Object.keys(model.model_performance_metrics).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Performance Metrics</label>
                    <div className="mt-1 space-y-1">
                      {Object.entries(model.model_performance_metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium">{key}:</span>
                          <span>{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assigned Controls</h3>
            <Button
              onClick={() => navigate(`/ai-governance/models/${id}/assign-controls`)}
              variant="outline"
            >
              <Shield className="w-4 h-4 mr-2" />
              Assign Controls
            </Button>
          </div>

          {controls.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No controls assigned to this model</p>
                <Button
                  onClick={() => navigate(`/ai-governance/models/${id}/assign-controls`)}
                  className="mt-4"
                >
                  Assign Controls
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {controls.map((control) => (
                <Card key={control.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{control.control?.title}</h4>
                          <Badge variant="outline">{control.control?.control_code}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{control.control?.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Status: {control.implementation_status.replace('_', ' ')}
                          </span>
                          {control.testing_result && (
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              Test: {control.testing_result}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/ai-governance/controls/${control.control_id}`)}
                      >
                        View Control
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Risk Assessments</h3>
            <Button
              onClick={() => navigate(`/ai-governance/assessments/create?model_id=${id}`)}
              variant="outline"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>

          {riskAssessments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No risk assessments found for this model</p>
                <Button
                  onClick={() => navigate(`/ai-governance/assessments/create?model_id=${id}`)}
                  className="mt-4"
                >
                  Create Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {riskAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{assessment.assessment_name}</h4>
                          <Badge className={getRiskLevelColor(assessment.risk_level)}>
                            {assessment.risk_level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {assessment.assessment_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Domain: {assessment.risk_domain} | 
                          Date: {new Date(assessment.assessment_date).toLocaleDateString()}
                        </p>
                        {assessment.findings && (
                          <p className="text-sm text-gray-700">{assessment.findings}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/ai-governance/assessments/${assessment.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Monitoring Data</h3>
            <Button
              onClick={() => navigate(`/ai-governance/monitoring/add?model_id=${id}`)}
              variant="outline"
            >
              <Activity className="w-4 h-4 mr-2" />
              Add Data
            </Button>
          </div>

          {monitoringData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No monitoring data available for this model</p>
                <Button
                  onClick={() => navigate(`/ai-governance/monitoring/add?model_id=${id}`)}
                  className="mt-4"
                >
                  Add Monitoring Data
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {monitoringData.map((monitoring) => (
                <Card key={monitoring.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{monitoring.metric_name}</h4>
                          <Badge variant="outline">
                            {monitoring.monitoring_type.replace('_', ' ')}
                          </Badge>
                          {monitoring.alert_triggered && (
                            <Badge className="bg-red-100 text-red-800">
                              Alert
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Value:</span> {monitoring.metric_value || 'N/A'}
                            {monitoring.metric_unit && ` ${monitoring.metric_unit}`}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(monitoring.monitoring_date).toLocaleDateString()}
                          </div>
                        </div>
                        {monitoring.alert_message && (
                          <p className="text-sm text-red-600 mt-2">{monitoring.alert_message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIModelDetails;
