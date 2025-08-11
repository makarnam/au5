import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
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
  ExternalLink
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { ITSecurityPolicy } from '../../../types/itSecurity';

const PolicyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<ITSecurityPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPolicy();
    }
  }, [id]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.policies.getById(id!);
      setPolicy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policy');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'access_control': return 'bg-blue-100 text-blue-800';
      case 'data_protection': return 'bg-green-100 text-green-800';
      case 'network_security': return 'bg-purple-100 text-purple-800';
      case 'incident_response': return 'bg-red-100 text-red-800';
      case 'business_continuity': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-blue-100 text-blue-800';
      case 'physical': return 'bg-orange-100 text-orange-800';
      case 'organizational': return 'bg-green-100 text-green-800';
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

  if (error || !policy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Policy not found'}</p>
          <Button onClick={() => navigate('/it-security/policies')}>Back to Policies</Button>
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
            onClick={() => navigate('/it-security/policies')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{policy.title}</h1>
            <p className="text-gray-600">Policy Code: {policy.policy_code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/it-security/policies/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Badge className={getStatusColor(policy.status)}>
            {policy.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPolicyTypeColor(policy.policy_type)}>
            {policy.policy_type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Policy Content</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Policy Code</label>
                  <p className="text-sm text-gray-900">{policy.policy_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Version</label>
                  <p className="text-sm text-gray-900">{policy.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <Badge className={getCategoryColor(policy.category)}>
                    {policy.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{policy.description}</p>
                </div>
                {policy.scope && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scope</label>
                    <p className="text-sm text-gray-900">{policy.scope}</p>
                  </div>
                )}
                {policy.exceptions && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Exceptions</label>
                    <p className="text-sm text-gray-900">{policy.exceptions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Dates & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Effective Date</label>
                  <p className="text-sm text-gray-900">{formatDate(policy.effective_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Review Date</label>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm ${isOverdue(policy.review_date) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(policy.review_date)}
                    </p>
                    {isOverdue(policy.review_date) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Review Date</label>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm ${isOverdue(policy.next_review_date) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(policy.next_review_date)}
                    </p>
                    {isOverdue(policy.next_review_date) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(policy.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(policy.updated_at)}</p>
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
                  onClick={() => navigate(`/it-security/policies/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Policy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(policy.policy_code);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Policy Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const blob = new Blob([policy.content || ''], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${policy.policy_code}_policy.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Content
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

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Policy Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policy.content ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-900">
                    {policy.content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No policy content available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Frameworks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Compliance Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policy.compliance_frameworks && policy.compliance_frameworks.length > 0 ? (
                  <div className="space-y-2">
                    {policy.compliance_frameworks.map((framework, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No compliance frameworks specified</p>
                )}
              </CardContent>
            </Card>

            {/* Related Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Related Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policy.related_policies && policy.related_policies.length > 0 ? (
                  <div className="space-y-2">
                    {policy.related_policies.map((relatedPolicy, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                          {relatedPolicy}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No related policies specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Owner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Policy Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policy.owner ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">
                        {policy.owner.first_name} {policy.owner.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{policy.owner.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No policy owner assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Approver */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approver
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policy.approver ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">
                        {policy.approver.first_name} {policy.approver.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{policy.approver.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No approver assigned</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Business Unit */}
          {policy.business_unit && (
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
                    <p className="text-sm text-gray-900">{policy.business_unit.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Code</label>
                    <p className="text-sm text-gray-900">{policy.business_unit.code}</p>
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
                Policy History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Policy Created</p>
                    <p className="text-xs text-gray-500">{formatDate(policy.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(policy.updated_at)}</p>
                  </div>
                </div>
                {policy.effective_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Effective Date</p>
                      <p className="text-xs text-gray-500">{formatDate(policy.effective_date)}</p>
                    </div>
                  </div>
                )}
                {policy.review_date && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Review Date</p>
                      <p className="text-xs text-gray-500">{formatDate(policy.review_date)}</p>
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

export default PolicyDetails;
