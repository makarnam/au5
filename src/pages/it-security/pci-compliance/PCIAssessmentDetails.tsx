import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  CreditCard, 
  Shield, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Copy,
  Download,
  History,
  Target,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { PCICompliance } from '../../../types/itSecurity';

const PCIAssessmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<PCICompliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAssessment();
    }
  }, [id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.pciCompliance.getById(id!);
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'remediated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssessmentTypeColor = (type: string) => {
    switch (type) {
      case 'roc': return 'bg-blue-100 text-blue-800';
      case 'saq_a': return 'bg-green-100 text-green-800';
      case 'saq_d': return 'bg-purple-100 text-purple-800';
      case 'saq_c': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMerchantLevelColor = (level: string) => {
    switch (level) {
      case 'level_1': return 'bg-red-100 text-red-800';
      case 'level_2': return 'bg-orange-100 text-orange-800';
      case 'level_3': return 'bg-yellow-100 text-yellow-800';
      case 'level_4': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getComplianceScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Assessment not found'}</p>
          <Button onClick={() => navigate('/it-security/pci-compliance')}>Back to PCI Compliance</Button>
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
            onClick={() => navigate('/it-security/pci-compliance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-gray-600">Assessment ID: {assessment.assessment_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/it-security/pci-compliance/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Badge className={getStatusColor(assessment.status)}>
            {assessment.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getAssessmentTypeColor(assessment.assessment_type)}>
            {assessment.assessment_type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessment">Assessment Details</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assessment ID</label>
                  <p className="text-sm text-gray-900">{assessment.assessment_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">PCI DSS Version</label>
                  <p className="text-sm text-gray-900">{assessment.pci_dss_version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Merchant Level</label>
                  <Badge className={getMerchantLevelColor(assessment.merchant_level)}>
                    {assessment.merchant_level.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {assessment.service_provider_level && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Provider Level</label>
                    <Badge className={getMerchantLevelColor(assessment.service_provider_level)}>
                      {assessment.service_provider_level.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{assessment.description}</p>
                </div>
                {assessment.scope && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scope</label>
                    <p className="text-sm text-gray-900">{assessment.scope}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getComplianceScoreColor(assessment.compliance_score)}`}>
                    {assessment.compliance_score || 'N/A'}%
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Overall Compliance</p>
                </div>
                {assessment.compliance_score && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        assessment.compliance_score >= 90 ? 'bg-green-500' :
                        assessment.compliance_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${assessment.compliance_score}%` }}
                    ></div>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {assessment.non_compliant_requirements?.length || 0} non-compliant requirements
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate(`/it-security/pci-compliance/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assessment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(assessment.assessment_id);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Assessment ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to compliance tab
                    const complianceTab = document.querySelector('[data-value="compliance"]') as HTMLElement;
                    if (complianceTab) complianceTab.click();
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  View Compliance Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to history tab
                    const historyTab = document.querySelector('[data-value="history"]') as HTMLElement;
                    if (historyTab) historyTab.click();
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assessment Type</label>
                  <Badge className={getAssessmentTypeColor(assessment.assessment_type)}>
                    {assessment.assessment_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {assessment.saq_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">SAQ Type</label>
                    <p className="text-sm text-gray-900">{assessment.saq_type}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">ROC Attestation</label>
                  <div className="flex items-center space-x-2">
                    {assessment.roc_attestation ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-900">
                      {assessment.roc_attestation ? 'Required' : 'Not Required'}
                    </span>
                  </div>
                </div>
                {assessment.qsa_company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">QSA Company</label>
                    <p className="text-sm text-gray-900">{assessment.qsa_company}</p>
                  </div>
                )}
                {assessment.qsa_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">QSA Contact</label>
                    <p className="text-sm text-gray-900">{assessment.qsa_contact}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-sm text-gray-900">{formatDate(assessment.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm ${isOverdue(assessment.end_date) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(assessment.end_date)}
                    </p>
                    {isOverdue(assessment.end_date) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Assessment Date</label>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm ${isOverdue(assessment.next_assessment_date) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(assessment.next_assessment_date)}
                    </p>
                    {isOverdue(assessment.next_assessment_date) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {assessment.completed_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completed Date</label>
                    <p className="text-sm text-gray-900">{formatDate(assessment.completed_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Non-Compliant Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Non-Compliant Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.non_compliant_requirements && assessment.non_compliant_requirements.length > 0 ? (
                  <div className="space-y-2">
                    {assessment.non_compliant_requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-900">{requirement}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>All requirements are compliant</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Remediation Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Remediation Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.remediation_plan ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900">
                      {assessment.remediation_plan}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No remediation plan available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Assessor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.assessor ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">
                        {assessment.assessor.first_name} {assessment.assessor.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{assessment.assessor.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No assessor assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Reviewer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Reviewer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.reviewer ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">
                        {assessment.reviewer.first_name} {assessment.reviewer.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{assessment.reviewer.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No reviewer assigned</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Business Unit */}
          {assessment.business_unit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Business Unit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{assessment.business_unit.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Code</label>
                    <p className="text-sm text-gray-900">{assessment.business_unit.code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Assessment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assessment Created</p>
                    <p className="text-xs text-gray-500">{formatDate(assessment.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(assessment.updated_at)}</p>
                  </div>
                </div>
                {assessment.start_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assessment Started</p>
                      <p className="text-xs text-gray-500">{formatDate(assessment.start_date)}</p>
                    </div>
                  </div>
                )}
                {assessment.end_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assessment End Date</p>
                      <p className="text-xs text-gray-500">{formatDate(assessment.end_date)}</p>
                    </div>
                  </div>
                )}
                {assessment.completed_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assessment Completed</p>
                      <p className="text-xs text-gray-500">{formatDate(assessment.completed_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PCIAssessmentDetails;
