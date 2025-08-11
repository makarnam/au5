import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Shield, 
  Target, 
  Activity, 
  BookOpen, 
  Users, 
  Calendar, 
  Tag, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText
} from 'lucide-react';

interface Control {
  id: string;
  name: string;
  description: string;
  control_type: 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'recovery';
  category: 'access_control' | 'network_security' | 'data_protection' | 'incident_response' | 'business_continuity' | 'compliance';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  implementation_status: 'not_implemented' | 'in_progress' | 'implemented' | 'testing' | 'operational';
  owner: string;
  responsible_team: string;
  implementation_date: string;
  review_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'as_needed';
  last_review_date: string;
  next_review_date: string;
  effectiveness_rating: number;
  cost: number;
  risk_mitigation: string;
  implementation_notes: string;
  testing_procedures: string;
  documentation: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const ControlDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [control, setControl] = useState<Control | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityConfig = {
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    low: { label: 'Low', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
  };

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Clock },
    draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-800', icon: FileText },
    deprecated: { label: 'Deprecated', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  };

  const implementationStatusConfig = {
    not_implemented: { label: 'Not Implemented', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    implemented: { label: 'Implemented', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    testing: { label: 'Testing', color: 'bg-purple-100 text-purple-800', icon: Activity },
    operational: { label: 'Operational', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  };

  // Mock data for demonstration
  const mockControl: Control = {
    id: '1',
    name: 'Multi-Factor Authentication',
    description: 'Implementation of multi-factor authentication for all user accounts to prevent unauthorized access. This control requires users to provide two or more authentication factors when accessing sensitive systems and data.',
    control_type: 'preventive',
    category: 'access_control',
    status: 'active',
    priority: 'critical',
    implementation_status: 'operational',
    owner: 'john.doe@company.com',
    responsible_team: 'IT Security Team',
    implementation_date: '2023-06-15',
    review_frequency: 'quarterly',
    last_review_date: '2024-01-15',
    next_review_date: '2024-04-15',
    effectiveness_rating: 9,
    cost: 15000,
    risk_mitigation: 'Reduces risk of unauthorized access by requiring multiple authentication factors. Significantly reduces the likelihood of account compromise through credential theft.',
    implementation_notes: 'Successfully implemented across all systems. User adoption rate is 95%. Training sessions were conducted for all employees. Some resistance initially but now widely accepted.',
    testing_procedures: 'Monthly testing of MFA bypass scenarios, quarterly penetration testing, annual security assessments, continuous monitoring of authentication logs',
    documentation: 'MFA Implementation Guide v2.1, User Training Manual, Technical Documentation, Incident Response Procedures',
    tags: ['authentication', 'access-control', 'critical', 'operational', 'mfa'],
    created_at: '2023-05-01T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  };

  useEffect(() => {
    const loadControl = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setControl(mockControl);
      } catch (error) {
        console.error('Error loading control:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadControl();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!control) return;
    
    if (!confirm('Are you sure you want to delete this control? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement API call to delete control
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/it-security/controls');
    } catch (error) {
      console.error('Error deleting control:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilReview = (reviewDate: string) => {
    const review = new Date(reviewDate);
    const today = new Date();
    const diffTime = review.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEffectivenessColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading control...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Control not found</h2>
          <p className="text-gray-600 mt-2">The control you're looking for doesn't exist.</p>
          <Link to="/it-security/controls">
            <Button className="mt-4">Back to Controls</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilReview = getDaysUntilReview(control.next_review_date);
  const isReviewOverdue = daysUntilReview < 0;
  const isReviewDueSoon = daysUntilReview <= 30 && daysUntilReview >= 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/it-security/controls">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Controls
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{control.name}</h1>
            <p className="text-gray-600">Control ID: {control.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link to={`/it-security/controls/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{control.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Control Type</h3>
                  <Badge variant="outline" className="capitalize">
                    {control.control_type}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                  <Badge variant="outline" className="capitalize">
                    {control.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Priority</h3>
                  <Badge className={priorityConfig[control.priority].color}>
                    {priorityConfig[control.priority].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <Badge className={statusConfig[control.status].color}>
                    {statusConfig[control.status].label}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Implementation Status</h3>
                  <Badge className={implementationStatusConfig[control.implementation_status].color}>
                    {implementationStatusConfig[control.implementation_status].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership and Responsibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Ownership and Responsibility</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Control Owner</h3>
                  <p className="text-gray-700">{control.owner || 'Not assigned'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Responsible Team</h3>
                  <p className="text-gray-700">{control.responsible_team || 'Not assigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation and Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Implementation and Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Implementation Date</h3>
                  <p className="text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {control.implementation_date ? formatDate(control.implementation_date) : 'Not set'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Review Frequency</h3>
                  <p className="text-gray-700 capitalize">
                    {control.review_frequency.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Last Review</h3>
                  <p className="text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {control.last_review_date ? formatDate(control.last_review_date) : 'Not reviewed'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Next Review</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-gray-700">{formatDate(control.next_review_date)}</span>
                    {isReviewOverdue && (
                      <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                    )}
                    {isReviewDueSoon && !isReviewOverdue && (
                      <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {isReviewOverdue 
                      ? `${Math.abs(daysUntilReview)} days overdue`
                      : isReviewDueSoon 
                        ? `${daysUntilReview} days remaining`
                        : `${daysUntilReview} days remaining`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics and Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Metrics and Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Effectiveness Rating</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`text-2xl font-bold ${getEffectivenessColor(control.effectiveness_rating)}`}>
                      {control.effectiveness_rating}
                    </div>
                    <span className="text-gray-500">/ 10</span>
                    {control.effectiveness_rating >= 8 && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                    {control.effectiveness_rating < 6 && (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Implementation Cost</h3>
                  <div className="text-2xl font-bold text-gray-900">
                    ${control.cost.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Total implementation cost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Mitigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Risk Mitigation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700">{control.risk_mitigation}</div>
            </CardContent>
          </Card>

          {/* Implementation Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Implementation Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700">{control.implementation_notes}</div>
            </CardContent>
          </Card>

          {/* Testing Procedures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Testing Procedures</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700">{control.testing_procedures}</div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Documentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700">{control.documentation}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {control.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">{formatDate(control.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">{formatDate(control.updated_at)}</p>
                </div>
              </div>
              {control.implementation_date && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Implemented</p>
                    <p className="text-sm text-gray-500">{formatDate(control.implementation_date)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/it-security/controls/${id}/edit`}>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Control
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Test Control
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Metrics
              </Button>
            </CardContent>
          </Card>

          {/* Related Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Related Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">
                <p>• Access Control Policy</p>
                <p>• Password Management</p>
                <p>• Session Management</p>
                <p>• Privileged Access</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ControlDetails;
