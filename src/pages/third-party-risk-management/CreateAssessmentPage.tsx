import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  User,
  Shield,
  TrendingUp,
  FileText,
  Target
} from 'lucide-react';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyAssessmentFormData } from '../../types/thirdPartyRiskManagement';
import { Link, useNavigate } from 'react-router-dom';

const CreateAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<ThirdPartyAssessmentFormData>({
    third_party_id: '',
    assessment_type: 'initial',
    assessment_date: new Date().toISOString().split('T')[0],
    assessor_id: '',
    financial_risk_score: null,
    operational_risk_score: null,
    compliance_risk_score: null,
    security_risk_score: null,
    reputational_risk_score: null,
    strategic_risk_score: null,
    findings_summary: '',
    recommendations: '',
    mitigation_actions: '',
    follow_up_required: false,
    follow_up_date: ''
  });

  const assessmentTypes = ['initial', 'periodic', 'incident_based', 'contract_renewal'];

  useEffect(() => {
    loadThirdParties();
    loadUsers();
  }, []);

  const loadThirdParties = async () => {
    try {
      const result = await thirdPartyRiskManagementService.getThirdParties();
      if (!result.error) {
        setThirdParties(result.data);
      }
    } catch (err) {
      console.error('Failed to load third parties:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await thirdPartyRiskManagementService.getUsers();
      if (!result.error) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleInputChange = (field: keyof ThirdPartyAssessmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateOverallRiskScore = () => {
    const scores = [
      formData.financial_risk_score,
      formData.operational_risk_score,
      formData.compliance_risk_score,
      formData.security_risk_score,
      formData.reputational_risk_score,
      formData.strategic_risk_score
    ].filter(score => score !== null && score !== undefined) as number[];

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score <= 25) return 'low';
    if (score <= 50) return 'medium';
    if (score <= 75) return 'high';
    return 'critical';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.third_party_id) {
      setError('Third party is required');
      return;
    }

    if (!formData.assessment_date) {
      setError('Assessment date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate overall risk score and risk level
      const overallRiskScore = calculateOverallRiskScore();
      const riskLevel = getRiskLevel(overallRiskScore);

      const assessmentData = {
        ...formData,
        overall_risk_score: overallRiskScore,
        risk_level: riskLevel,
        status: 'draft',
        approval_status: 'pending'
      };

      const result = await thirdPartyRiskManagementService.createAssessment(assessmentData);
      
      if (result.error) {
        console.error('Assessment creation error:', result.error);
        throw new Error('Failed to create assessment');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/third-party-risk-management/assessments');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const overallRiskScore = calculateOverallRiskScore();
  const riskLevel = getRiskLevel(overallRiskScore);

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link to="/third-party-risk-management/assessments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
          <p className="text-gray-600 mt-2">Create a new third-party risk assessment</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-600">Assessment created successfully! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Assessment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="third_party_id">Third Party *</Label>
                <select
                  id="third_party_id"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.third_party_id}
                  onChange={(e) => handleInputChange('third_party_id', e.target.value)}
                  required
                >
                  <option value="">Select Third Party</option>
                  {thirdParties.map(party => (
                    <option key={party.id} value={party.id}>
                      {party.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="assessment_type">Assessment Type *</Label>
                <select
                  id="assessment_type"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.assessment_type}
                  onChange={(e) => handleInputChange('assessment_type', e.target.value)}
                  required
                >
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="assessment_date">Assessment Date *</Label>
                <Input
                  id="assessment_date"
                  type="date"
                  value={formData.assessment_date}
                  onChange={(e) => handleInputChange('assessment_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="assessor_id">Assessor</Label>
                <select
                  id="assessor_id"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.assessor_id}
                  onChange={(e) => handleInputChange('assessor_id', e.target.value || null)}
                >
                  <option value="">Select Assessor</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Risk Assessment Scores</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="financial_risk_score">Financial Risk Score (0-100)</Label>
                <Input
                  id="financial_risk_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.financial_risk_score || ''}
                  onChange={(e) => handleInputChange('financial_risk_score', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="operational_risk_score">Operational Risk Score (0-100)</Label>
                <Input
                  id="operational_risk_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.operational_risk_score || ''}
                  onChange={(e) => handleInputChange('operational_risk_score', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="compliance_risk_score">Compliance Risk Score (0-100)</Label>
                <Input
                  id="compliance_risk_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.compliance_risk_score || ''}
                  onChange={(e) => handleInputChange('compliance_risk_score', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="security_risk_score">Security Risk Score (0-100)</Label>
                <Input
                  id="security_risk_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.security_risk_score || ''}
                  onChange={(e) => handleInputChange('security_risk_score', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="reputational_risk_score">Reputational Risk Score (0-100)</Label>
                <Input
                  id="reputational_risk_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.reputational_risk_score || ''}
                  onChange={(e) => handleInputChange('reputational_risk_score', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="strategic_risk_score">Strategic Risk Score (0-100)</Label>
                <Input
                  id="strategic_risk_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.strategic_risk_score || ''}
                  onChange={(e) => handleInputChange('strategic_risk_score', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter score"
                />
              </div>
            </div>

            {/* Overall Risk Score Display */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Overall Risk Score</h3>
                  <p className="text-sm text-gray-600">Calculated average of all risk scores</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{overallRiskScore}</div>
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(riskLevel)}`}>
                    {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Assessment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="findings_summary">Findings Summary</Label>
              <Textarea
                id="findings_summary"
                value={formData.findings_summary}
                onChange={(e) => handleInputChange('findings_summary', e.target.value)}
                placeholder="Enter findings summary"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="Enter recommendations"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="mitigation_actions">Mitigation Actions</Label>
              <Textarea
                id="mitigation_actions"
                value={formData.mitigation_actions}
                onChange={(e) => handleInputChange('mitigation_actions', e.target.value)}
                placeholder="Enter mitigation actions"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="follow_up_required">Follow-up Required</Label>
              </div>

              {formData.follow_up_required && (
                <div>
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link to="/third-party-risk-management/assessments">
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Assessment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssessmentPage;
