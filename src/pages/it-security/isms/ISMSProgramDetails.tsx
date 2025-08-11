import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
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
  Award,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { ISMSManagement } from '../../../types/itSecurity';

const ISMSProgramDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isms, setISMS] = useState<ISMSManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadISMS();
    }
  }, [id]);

  const loadISMS = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.isms.getById(id!);
      setISMS(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ISMS program');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'bg-green-100 text-green-800';
      case 'implementation': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      case 'surveillance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_certified': return 'bg-gray-100 text-gray-800';
      case 'surveillance': return 'bg-orange-100 text-orange-800';
      case 'recertification': return 'bg-purple-100 text-purple-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !isms) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'ISMS program not found'}</p>
          <Button onClick={() => navigate('/it-security/isms')}>Back to ISMS Programs</Button>
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
            onClick={() => navigate('/it-security/isms')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isms.title}</h1>
            <p className="text-gray-600">ISMS ID: {isms.isms_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/it-security/isms/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Badge className={getStatusColor(isms.status)}>
            {isms.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getCertificationStatusColor(isms.certification_status)}>
            {isms.certification_status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
          <TabsTrigger value="management">Management & Reviews</TabsTrigger>
          <TabsTrigger value="actions">Actions & Improvements</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ISMS ID</label>
                  <p className="text-sm text-gray-900">{isms.isms_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ISO Version</label>
                  <p className="text-sm text-gray-900">{isms.iso_version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{isms.description}</p>
                </div>
                {isms.scope && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scope</label>
                    <p className="text-sm text-gray-900">{isms.scope}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    isms.certification_status === 'certified' ? 'text-green-600' : 
                    isms.certification_status === 'in_progress' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {isms.certification_status === 'certified' ? '✓' : 
                     isms.certification_status === 'in_progress' ? '⟳' : '○'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {isms.certification_status.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                {isms.certification_body && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Certification Body</label>
                    <p className="text-sm text-gray-900">{isms.certification_body}</p>
                  </div>
                )}
                {isms.auditor_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Auditor Contact</label>
                    <p className="text-sm text-gray-900">{isms.auditor_contact}</p>
                  </div>
                )}
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
                  onClick={() => navigate(`/it-security/isms/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Program
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(isms.isms_id);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ISMS ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to certification tab
                    const certTab = document.querySelector('[data-value="certification"]') as HTMLElement;
                    if (certTab) certTab.click();
                  }}
                >
                  <Award className="h-4 w-4 mr-2" />
                  View Certification
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

        <TabsContent value="certification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certification Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certification Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isms.certification_body && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Certification Body</label>
                    <p className="text-sm text-gray-900">{isms.certification_body}</p>
                  </div>
                )}
                {isms.auditor_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Auditor Contact</label>
                    <p className="text-sm text-gray-900">{isms.auditor_contact}</p>
                  </div>
                )}
                {isms.certification_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Certification Date</label>
                    <p className="text-sm text-gray-900">{formatDate(isms.certification_date)}</p>
                  </div>
                )}
                {isms.recertification_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Recertification Date</label>
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm ${isOverdue(isms.recertification_date) ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(isms.recertification_date)}
                      </p>
                      {isOverdue(isms.recertification_date) && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
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
                {isms.implementation_start_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Implementation Start</label>
                    <p className="text-sm text-gray-900">{formatDate(isms.implementation_start_date)}</p>
                  </div>
                )}
                {isms.certification_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Certification Date</label>
                    <p className="text-sm text-gray-900">{formatDate(isms.certification_date)}</p>
                  </div>
                )}
                {isms.next_surveillance_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Next Surveillance</label>
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm ${isOverdue(isms.next_surveillance_date) ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(isms.next_surveillance_date)}
                      </p>
                      {isOverdue(isms.next_surveillance_date) && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                )}
                {isms.recertification_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Recertification</label>
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm ${isOverdue(isms.recertification_date) ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(isms.recertification_date)}
                      </p>
                      {isOverdue(isms.recertification_date) && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Management Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Management Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isms.risk_assessment_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Risk Assessment Date</label>
                    <p className="text-sm text-gray-900">{formatDate(isms.risk_assessment_date)}</p>
                  </div>
                )}
                {isms.management_review_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Management Review Date</label>
                    <p className="text-sm text-gray-900">{formatDate(isms.management_review_date)}</p>
                  </div>
                )}
                {isms.internal_audit_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Internal Audit Date</label>
                    <p className="text-sm text-gray-900">{formatDate(isms.internal_audit_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statement of Applicability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Statement of Applicability
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isms.statement_of_applicability ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900">
                      {isms.statement_of_applicability}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No Statement of Applicability available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Corrective Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Corrective Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isms.corrective_actions && isms.corrective_actions.length > 0 ? (
                  <div className="space-y-2">
                    {isms.corrective_actions.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-900">{action}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No corrective actions recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Preventive Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Preventive Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isms.preventive_actions && isms.preventive_actions.length > 0 ? (
                  <div className="space-y-2">
                    {isms.preventive_actions.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-900">{action}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No preventive actions recorded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Continual Improvement Plan */}
          {isms.continual_improvement_plan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Continual Improvement Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">
                    {isms.continual_improvement_plan}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ISMS Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  ISMS Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isms.isms_manager ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">
                        {isms.isms_manager.first_name} {isms.isms_manager.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{isms.isms_manager.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No ISMS manager assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Management Representative */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Management Representative
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isms.management_representative ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">
                        {isms.management_representative.first_name} {isms.management_representative.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{isms.management_representative.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No management representative assigned</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Business Unit */}
          {isms.business_unit && (
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
                    <p className="text-sm text-gray-900">{isms.business_unit.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Code</label>
                    <p className="text-sm text-gray-900">{isms.business_unit.code}</p>
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
                Program History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Program Created</p>
                    <p className="text-xs text-gray-500">{formatDate(isms.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(isms.updated_at)}</p>
                  </div>
                </div>
                {isms.implementation_start_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Implementation Started</p>
                      <p className="text-xs text-gray-500">{formatDate(isms.implementation_start_date)}</p>
                    </div>
                  </div>
                )}
                {isms.certification_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Certification Achieved</p>
                      <p className="text-xs text-gray-500">{formatDate(isms.certification_date)}</p>
                    </div>
                  </div>
                )}
                {isms.risk_assessment_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Risk Assessment</p>
                      <p className="text-xs text-gray-500">{formatDate(isms.risk_assessment_date)}</p>
                    </div>
                  </div>
                )}
                {isms.management_review_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Management Review</p>
                      <p className="text-xs text-gray-500">{formatDate(isms.management_review_date)}</p>
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

export default ISMSProgramDetails;
