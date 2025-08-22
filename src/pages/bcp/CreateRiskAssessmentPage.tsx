import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { bcpService } from '../../services/bcpService';
import { CreateRiskAssessmentForm } from '../../types/bcp';

const CreateRiskAssessmentPage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateRiskAssessmentForm>({
    risk_name: '',
    description: '',
    risk_category: 'operational',
    likelihood: 'medium',
    impact: 'medium',
    risk_score: 0,
    risk_level: 'medium',
    mitigation_strategies: '',
    contingency_plans: '',
    responsible_party: '',
    review_frequency: 'quarterly',
    next_review_date: null,
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      const planData = await bcpService.getPlanById(planId!);
      setPlan(planData);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const calculateRiskScore = (likelihood: string, impact: string) => {
    const likelihoodScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
    
    const score = (likelihoodScores[likelihood as keyof typeof likelihoodScores] || 2) * 
                  (impactScores[impact as keyof typeof impactScores] || 2);
    
    let level = 'low';
    if (score >= 12) level = 'critical';
    else if (score >= 8) level = 'high';
    else if (score >= 4) level = 'medium';
    
    return { score, level };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    setLoading(true);
    try {
      await bcpService.createRiskAssessment({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating risk assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRiskAssessmentForm, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };

    // Recalculate risk score when likelihood or impact changes
    if (field === 'likelihood' || field === 'impact') {
      const { score, level } = calculateRiskScore(
        field === 'likelihood' ? value : formData.likelihood,
        field === 'impact' ? value : formData.impact
      );
      newFormData.risk_score = score;
      newFormData.risk_level = level;
    }

    setFormData(newFormData);
  };

  if (!plan) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bcp/${planId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Risk Assessment</h1>
            <p className="text-muted-foreground">
              Add a risk assessment to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Information */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Information</CardTitle>
              <CardDescription>Define the risk details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="risk_name">Risk Name *</Label>
                <Input
                  id="risk_name"
                  value={formData.risk_name}
                  onChange={(e) => handleInputChange('risk_name', e.target.value)}
                  placeholder="e.g., Data Center Power Failure"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the risk and its potential impact"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_category">Risk Category</Label>
                <Select
                  value={formData.risk_category}
                  onValueChange={(value) => handleInputChange('risk_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="reputational">Reputational</SelectItem>
                    <SelectItem value="technological">Technological</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Evaluate likelihood and impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="likelihood">Likelihood</Label>
                <Select
                  value={formData.likelihood}
                  onValueChange={(value) => handleInputChange('likelihood', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Rare (1-10%)</SelectItem>
                    <SelectItem value="medium">Medium - Occasional (11-40%)</SelectItem>
                    <SelectItem value="high">High - Likely (41-70%)</SelectItem>
                    <SelectItem value="critical">Critical - Very Likely (71-100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact">Impact</Label>
                <Select
                  value={formData.impact}
                  onValueChange={(value) => handleInputChange('impact', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor impact</SelectItem>
                    <SelectItem value="medium">Medium - Moderate impact</SelectItem>
                    <SelectItem value="high">High - Significant impact</SelectItem>
                    <SelectItem value="critical">Critical - Severe impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Risk Score</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={formData.risk_score}
                    readOnly
                    className="bg-muted"
                  />
                  <Badge variant={
                    formData.risk_level === 'critical' ? 'destructive' :
                    formData.risk_level === 'high' ? 'default' :
                    formData.risk_level === 'medium' ? 'secondary' : 'outline'
                  }>
                    {formData.risk_level.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically calculated from likelihood × impact
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mitigation & Contingency */}
          <Card>
            <CardHeader>
              <CardTitle>Mitigation & Contingency</CardTitle>
              <CardDescription>Risk mitigation strategies and contingency plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mitigation_strategies">Mitigation Strategies</Label>
                <Textarea
                  id="mitigation_strategies"
                  value={formData.mitigation_strategies}
                  onChange={(e) => handleInputChange('mitigation_strategies', e.target.value)}
                  placeholder="Describe strategies to reduce likelihood or impact"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contingency_plans">Contingency Plans</Label>
                <Textarea
                  id="contingency_plans"
                  value={formData.contingency_plans}
                  onChange={(e) => handleInputChange('contingency_plans', e.target.value)}
                  placeholder="Describe backup plans if risk materializes"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible_party">Responsible Party</Label>
                <Input
                  id="responsible_party"
                  value={formData.responsible_party}
                  onChange={(e) => handleInputChange('responsible_party', e.target.value)}
                  placeholder="Person or team responsible for managing this risk"
                />
              </div>
            </CardContent>
          </Card>

          {/* Review & Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Review & Monitoring</CardTitle>
              <CardDescription>Review frequency and monitoring schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review_frequency">Review Frequency</Label>
                <Select
                  value={formData.review_frequency}
                  onValueChange={(value) => handleInputChange('review_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annually">Semi-Annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="as_needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input
                  id="next_review_date"
                  type="date"
                  value={formData.next_review_date || ''}
                  onChange={(e) => handleInputChange('next_review_date', e.target.value || null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional information or notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes, historical context, or important considerations"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/bcp/${planId}`)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Risk Assessment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRiskAssessmentPage;
