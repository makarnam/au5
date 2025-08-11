import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Calculator, 
  Globe,
  Users,
  Building2,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { 
  DoubleMaterialityAssessment, 
  DoubleMaterialityAssessmentFormData,
  ESGCategory,
  MaterialityLevel 
} from '../../types';

interface DoubleMaterialityCalculatorProps {
  className?: string;
  onAssessmentComplete?: (assessment: DoubleMaterialityAssessment) => void;
}

const DoubleMaterialityCalculator: React.FC<DoubleMaterialityCalculatorProps> = ({ 
  className, 
  onAssessmentComplete 
}) => {
  const [assessments, setAssessments] = useState<DoubleMaterialityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAssessment, setCurrentAssessment] = useState<Partial<DoubleMaterialityAssessmentFormData>>({
    topic_name: '',
    topic_category: 'environmental',
    impact_materiality_score: undefined,
    financial_materiality_score: undefined,
    impact_description: '',
    financial_impact_description: '',
    stakeholders_affected: [],
    business_units_affected: [],
    mitigation_strategies: '',
    monitoring_frequency: 'quarterly',
    assessment_date: new Date().toISOString().split('T')[0],
  });
  const [newStakeholder, setNewStakeholder] = useState('');
  const [newBusinessUnit, setNewBusinessUnit] = useState('');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await esgService.getDoubleMaterialityAssessments();
      setAssessments(response.data);
    } catch (error) {
      console.error('Error loading materiality assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMaterialityLevel = (impactScore: number, financialScore: number): MaterialityLevel => {
    const combinedScore = (impactScore + financialScore) / 2;
    
    if (combinedScore >= 4.5) return 'critical';
    if (combinedScore >= 3.5) return 'high';
    if (combinedScore >= 2.5) return 'medium';
    return 'low';
  };

  const getMaterialityColor = (level: MaterialityLevel) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: ESGCategory) => {
    switch (category) {
      case 'environmental':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'social':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'governance':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const handleInputChange = (field: keyof DoubleMaterialityAssessmentFormData, value: any) => {
    setCurrentAssessment(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addStakeholder = () => {
    if (newStakeholder.trim()) {
      setCurrentAssessment(prev => ({
        ...prev,
        stakeholders_affected: [...(prev.stakeholders_affected || []), newStakeholder.trim()],
      }));
      setNewStakeholder('');
    }
  };

  const removeStakeholder = (index: number) => {
    setCurrentAssessment(prev => ({
      ...prev,
      stakeholders_affected: prev.stakeholders_affected?.filter((_, i) => i !== index) || [],
    }));
  };

  const addBusinessUnit = () => {
    if (newBusinessUnit.trim()) {
      setCurrentAssessment(prev => ({
        ...prev,
        business_units_affected: [...(prev.business_units_affected || []), newBusinessUnit.trim()],
      }));
      setNewBusinessUnit('');
    }
  };

  const removeBusinessUnit = (index: number) => {
    setCurrentAssessment(prev => ({
      ...prev,
      business_units_affected: prev.business_units_affected?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentAssessment.topic_name || 
          !currentAssessment.impact_materiality_score || 
          !currentAssessment.financial_materiality_score) {
        alert('Please fill in all required fields');
        return;
      }

      const assessment = await esgService.createDoubleMaterialityAssessment(
        currentAssessment as DoubleMaterialityAssessmentFormData
      );

      setAssessments(prev => [assessment, ...prev]);
      setCurrentAssessment({
        topic_name: '',
        topic_category: 'environmental',
        impact_materiality_score: undefined,
        financial_materiality_score: undefined,
        impact_description: '',
        financial_impact_description: '',
        stakeholders_affected: [],
        business_units_affected: [],
        mitigation_strategies: '',
        monitoring_frequency: 'quarterly',
        assessment_date: new Date().toISOString().split('T')[0],
      });

      onAssessmentComplete?.(assessment);
    } catch (error) {
      console.error('Error creating materiality assessment:', error);
    }
  };

  const getScoreDescription = (score: number) => {
    if (score >= 4.5) return 'Very High';
    if (score >= 3.5) return 'High';
    if (score >= 2.5) return 'Medium';
    if (score >= 1.5) return 'Low';
    return 'Very Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Double Materiality Calculator</h1>
          <p className="text-muted-foreground">
            Assess ESG topics from both impact and financial materiality perspectives
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">ESG Materiality Assessment Tool</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assessment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Materiality Assessment</CardTitle>
            <CardDescription>
              Evaluate ESG topics for both impact and financial materiality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic_name">Topic Name *</Label>
                <Input
                  id="topic_name"
                  value={currentAssessment.topic_name}
                  onChange={(e) => handleInputChange('topic_name', e.target.value)}
                  placeholder="e.g., Carbon Emissions, Data Privacy, Board Diversity"
                />
              </div>

              <div>
                <Label htmlFor="topic_category">ESG Category *</Label>
                <select
                  id="topic_category"
                  value={currentAssessment.topic_category}
                  onChange={(e) => handleInputChange('topic_category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="environmental">Environmental</option>
                  <option value="social">Social</option>
                  <option value="governance">Governance</option>
                </select>
              </div>

              <div>
                <Label htmlFor="assessment_date">Assessment Date *</Label>
                <Input
                  id="assessment_date"
                  type="date"
                  value={currentAssessment.assessment_date}
                  onChange={(e) => handleInputChange('assessment_date', e.target.value)}
                />
              </div>
            </div>

            {/* Materiality Scores */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Materiality Scores (1-5 scale)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="impact_score">Impact Materiality *</Label>
                  <select
                    id="impact_score"
                    value={currentAssessment.impact_materiality_score || ''}
                    onChange={(e) => handleInputChange('impact_materiality_score', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score</option>
                    <option value="1">1 - Very Low</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Very High</option>
                  </select>
                  {currentAssessment.impact_materiality_score && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getScoreDescription(currentAssessment.impact_materiality_score)} impact
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="financial_score">Financial Materiality *</Label>
                  <select
                    id="financial_score"
                    value={currentAssessment.financial_materiality_score || ''}
                    onChange={(e) => handleInputChange('financial_materiality_score', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score</option>
                    <option value="1">1 - Very Low</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Very High</option>
                  </select>
                  {currentAssessment.financial_materiality_score && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getScoreDescription(currentAssessment.financial_materiality_score)} financial impact
                    </p>
                  )}
                </div>
              </div>

              {/* Combined Score Display */}
              {currentAssessment.impact_materiality_score && currentAssessment.financial_materiality_score && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Combined Materiality Score:</span>
                    <Badge className={getMaterialityColor(
                      calculateMaterialityLevel(
                        currentAssessment.impact_materiality_score,
                        currentAssessment.financial_materiality_score
                      )
                    )}>
                      {((currentAssessment.impact_materiality_score + currentAssessment.financial_materiality_score) / 2).toFixed(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Level: {calculateMaterialityLevel(
                      currentAssessment.impact_materiality_score,
                      currentAssessment.financial_materiality_score
                    ).toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {/* Descriptions */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="impact_description">Impact Description</Label>
                <Textarea
                  id="impact_description"
                  value={currentAssessment.impact_description}
                  onChange={(e) => handleInputChange('impact_description', e.target.value)}
                  placeholder="Describe the environmental, social, or governance impact..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="financial_description">Financial Impact Description</Label>
                <Textarea
                  id="financial_description"
                  value={currentAssessment.financial_impact_description}
                  onChange={(e) => handleInputChange('financial_impact_description', e.target.value)}
                  placeholder="Describe the potential financial implications..."
                  rows={3}
                />
              </div>
            </div>

            {/* Stakeholders */}
            <div className="space-y-3">
              <Label>Stakeholders Affected</Label>
              <div className="flex space-x-2">
                <Input
                  value={newStakeholder}
                  onChange={(e) => setNewStakeholder(e.target.value)}
                  placeholder="Add stakeholder..."
                  onKeyPress={(e) => e.key === 'Enter' && addStakeholder()}
                />
                <Button onClick={addStakeholder} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentAssessment.stakeholders_affected?.map((stakeholder, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{stakeholder}</span>
                    <button
                      onClick={() => removeStakeholder(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Business Units */}
            <div className="space-y-3">
              <Label>Business Units Affected</Label>
              <div className="flex space-x-2">
                <Input
                  value={newBusinessUnit}
                  onChange={(e) => setNewBusinessUnit(e.target.value)}
                  placeholder="Add business unit..."
                  onKeyPress={(e) => e.key === 'Enter' && addBusinessUnit()}
                />
                <Button onClick={addBusinessUnit} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentAssessment.business_units_affected?.map((unit, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{unit}</span>
                    <button
                      onClick={() => removeBusinessUnit(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Additional Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="mitigation_strategies">Mitigation Strategies</Label>
                <Textarea
                  id="mitigation_strategies"
                  value={currentAssessment.mitigation_strategies}
                  onChange={(e) => handleInputChange('mitigation_strategies', e.target.value)}
                  placeholder="Describe strategies to address materiality risks..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="monitoring_frequency">Monitoring Frequency</Label>
                <select
                  id="monitoring_frequency"
                  value={currentAssessment.monitoring_frequency}
                  onChange={(e) => handleInputChange('monitoring_frequency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annually">Semi-Annually</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </CardContent>
        </Card>

        {/* Assessment Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materiality Matrix</CardTitle>
            <CardDescription>
              Recent assessments and their materiality levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assessments yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first materiality assessment to see results here
                  </p>
                </div>
              ) : (
                assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(assessment.topic_category)}
                        <h4 className="font-medium">{assessment.topic_name}</h4>
                      </div>
                      <Badge className={getMaterialityColor(assessment.materiality_level)}>
                        {assessment.materiality_level.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Impact Score:</span>
                        <span className="ml-2 font-medium">{assessment.impact_materiality_score}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Financial Score:</span>
                        <span className="ml-2 font-medium">{assessment.financial_materiality_score}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Combined Score:</span>
                        <span className="ml-2 font-medium">
                          {assessment.combined_materiality_score?.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium capitalize">{assessment.topic_category}</span>
                      </div>
                    </div>

                    {assessment.impact_description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Impact:</span> {assessment.impact_description}
                      </p>
                    )}

                    {assessment.financial_impact_description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Financial:</span> {assessment.financial_impact_description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Assessed: {new Date(assessment.assessment_date).toLocaleDateString()}</span>
                      {assessment.assessor && (
                        <span>By: {assessment.assessor.first_name} {assessment.assessor.last_name}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoubleMaterialityCalculator;
