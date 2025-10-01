import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/aiService';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Lightbulb,
  Target,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText
} from 'lucide-react';

interface RootCauseAnalysisProps {
  incidentId: string;
  onAnalysisUpdate?: () => void;
}

interface RootCause {
  id: string;
  incident_id: string;
  cause_type: 'human_error' | 'process_failure' | 'technical_issue' | 'external_factor' | 'organizational' | 'other';
  description: string;
  contributing_factors: string[];
  evidence: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 1-5
  impact: number; // 1-5
  risk_score: number;
  mitigation_actions: string[];
  preventive_measures: string[];
  ai_generated: boolean;
  confidence_score?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ContributingFactor {
  id: string;
  root_cause_id: string;
  factor: string;
  category: 'people' | 'process' | 'technology' | 'environment';
  description?: string;
  created_at: string;
}

const CAUSE_TYPES = [
  { value: 'human_error', label: 'Human Error', icon: Users },
  { value: 'process_failure', label: 'Process Failure', icon: GitBranch },
  { value: 'technical_issue', label: 'Technical Issue', icon: AlertTriangle },
  { value: 'external_factor', label: 'External Factor', icon: Target },
  { value: 'organizational', label: 'Organizational', icon: FileText },
  { value: 'other', label: 'Other', icon: Lightbulb }
];

const CATEGORIES = [
  { value: 'people', label: 'People', color: 'bg-blue-100 text-blue-800' },
  { value: 'process', label: 'Process', color: 'bg-green-100 text-green-800' },
  { value: 'technology', label: 'Technology', color: 'bg-purple-100 text-purple-800' },
  { value: 'environment', label: 'Environment', color: 'bg-orange-100 text-orange-800' }
];

const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function RootCauseAnalysis({
  incidentId,
  onAnalysisUpdate
}: RootCauseAnalysisProps) {
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [contributingFactors, setContributingFactors] = useState<ContributingFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingCause, setEditingCause] = useState<RootCause | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRootCauseAnalysis();
  }, [incidentId]);

  async function loadRootCauseAnalysis() {
    try {
      setLoading(true);
      setError(null);

      // Load root causes
      const { data: causes, error: causesError } = await supabase
        .from('incident_root_causes')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at');

      if (causesError) throw causesError;

      // Load contributing factors
      const { data: factors, error: factorsError } = await supabase
        .from('incident_contributing_factors')
        .select('*')
        .in('root_cause_id', causes?.map(c => c.id) || [])
        .order('created_at');

      if (factorsError) throw factorsError;

      setRootCauses(causes || []);
      setContributingFactors(factors || []);
    } catch (err) {
      console.error('Error loading root cause analysis:', err);
      setError('Failed to load root cause analysis');
    } finally {
      setLoading(false);
    }
  }

  async function generateAIAnalysis() {
    try {
      setAnalyzing(true);
      setError(null);

      // Get incident details
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (incidentError) throw incidentError;

      // Generate AI analysis
      const analysisPrompt = `
        Analyze this incident and identify potential root causes:

        Incident Details:
        - Title: ${incident.title}
        - Type: ${incident.incident_type}
        - Severity: ${incident.severity}
        - Description: ${incident.description}
        - Affected Systems: ${incident.affected_systems?.join(', ') || 'N/A'}

        Please provide a comprehensive root cause analysis including:
        1. Primary root causes with categories
        2. Contributing factors (People, Process, Technology, Environment)
        3. Evidence supporting each cause
        4. Mitigation actions
        5. Preventive measures
        6. Risk assessment (probability 1-5, impact 1-5)

        Format the response as JSON with the following structure:
        {
          "root_causes": [
            {
              "cause_type": "human_error|process_failure|technical_issue|external_factor|organizational|other",
              "description": "Detailed description",
              "contributing_factors": ["factor1", "factor2"],
              "evidence": ["evidence1", "evidence2"],
              "severity": "low|medium|high|critical",
              "probability": 1-5,
              "impact": 1-5,
              "mitigation_actions": ["action1", "action2"],
              "preventive_measures": ["measure1", "measure2"]
            }
          ]
        }
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt: analysisPrompt,
        context: `Incident ID: ${incidentId}, Analysis Type: root_cause`,
        fieldType: 'finding_root_cause',
        auditData: {}
      });

      if (aiResponse && aiResponse.content) {
        // Parse AI response and save to database
        const analysisData = JSON.parse(aiResponse.content);

        for (const causeData of analysisData.root_causes) {
          const riskScore = (causeData.probability * causeData.impact);

          const { data: newCause, error: causeError } = await supabase
            .from('incident_root_causes')
            .insert({
              incident_id: incidentId,
              cause_type: causeData.cause_type,
              description: causeData.description,
              contributing_factors: causeData.contributing_factors,
              evidence: causeData.evidence,
              severity: causeData.severity,
              probability: causeData.probability,
              impact: causeData.impact,
              risk_score: riskScore,
              mitigation_actions: causeData.mitigation_actions,
              preventive_measures: causeData.preventive_measures,
              ai_generated: true,
              confidence_score: 0.8
            })
            .select()
            .single();

          if (causeError) throw causeError;

          // Add contributing factors
          if (newCause && causeData.contributing_factors) {
            const factors = causeData.contributing_factors.map((factor: string, index: number) => ({
              root_cause_id: newCause.id,
              factor: factor,
              category: ['people', 'process', 'technology', 'environment'][index % 4] as any
            }));

            const { error: factorsError } = await supabase
              .from('incident_contributing_factors')
              .insert(factors);

            if (factorsError) console.error('Error saving contributing factors:', factorsError);
          }
        }

        await loadRootCauseAnalysis();
        onAnalysisUpdate?.();
      }
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate AI analysis');
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveRootCause(causeData: Partial<RootCause>) {
    try {
      setError(null);

      if (editingCause) {
        // Update existing cause
        const { error } = await supabase
          .from('incident_root_causes')
          .update({
            ...causeData,
            risk_score: (causeData.probability || 1) * (causeData.impact || 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCause.id);

        if (error) throw error;
      } else {
        // Create new cause
        const { error } = await supabase
          .from('incident_root_causes')
          .insert({
            incident_id: incidentId,
            ...causeData,
            risk_score: (causeData.probability || 1) * (causeData.impact || 1),
            ai_generated: false
          });

        if (error) throw error;
      }

      await loadRootCauseAnalysis();
      onAnalysisUpdate?.();
      setIsDialogOpen(false);
      setEditingCause(null);
    } catch (err) {
      console.error('Error saving root cause:', err);
      setError('Failed to save root cause');
    }
  }

  async function deleteRootCause(causeId: string) {
    if (!confirm('Bu root cause analizini silmek istediğinizden emin misiniz?')) return;

    try {
      // Delete contributing factors first
      await supabase
        .from('incident_contributing_factors')
        .delete()
        .eq('root_cause_id', causeId);

      // Delete root cause
      const { error } = await supabase
        .from('incident_root_causes')
        .delete()
        .eq('id', causeId);

      if (error) throw error;

      await loadRootCauseAnalysis();
      onAnalysisUpdate?.();
    } catch (err) {
      console.error('Error deleting root cause:', err);
      setError('Failed to delete root cause');
    }
  }

  const getCauseTypeInfo = (type: string) => {
    return CAUSE_TYPES.find(ct => ct.value === type) || CAUSE_TYPES[5];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Root Cause Analysis <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Identify and analyze the underlying causes of the incident
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateAIAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                AI Analysis
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Root Cause
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCause ? 'Edit Root Cause' : 'Add Root Cause'}
                </DialogTitle>
              </DialogHeader>
              <RootCauseForm
                cause={editingCause}
                onSave={saveRootCause}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingCause(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {rootCauses.map((cause) => {
          const causeTypeInfo = getCauseTypeInfo(cause.cause_type);
          const CauseIcon = causeTypeInfo.icon;

          return (
            <Card key={cause.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${cause.ai_generated ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      <CauseIcon className={`w-5 h-5 ${cause.ai_generated ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{causeTypeInfo.label}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${SEVERITY_COLORS[cause.severity]}`}>
                          {cause.severity}
                        </span>
                        {cause.ai_generated && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{cause.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Risk Score:</span>{' '}
                          <span className={`font-semibold ${
                            cause.risk_score >= 15 ? 'text-red-600' :
                            cause.risk_score >= 10 ? 'text-orange-600' :
                            cause.risk_score >= 5 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {cause.risk_score} ({cause.probability}×{cause.impact})
                          </span>
                        </div>
                        {cause.confidence_score && (
                          <div>
                            <span className="font-medium">AI Confidence:</span>{' '}
                            <span className="text-purple-600">
                              {(cause.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingCause(cause);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRootCause(cause.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contributing Factors */}
                {cause.contributing_factors && cause.contributing_factors.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Contributing Factors:</h5>
                    <div className="flex flex-wrap gap-2">
                      {cause.contributing_factors.map((factor, index) => {
                        const category = CATEGORIES[index % CATEGORIES.length];
                        return (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${category.color}`}
                          >
                            {factor}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evidence */}
                {cause.evidence && cause.evidence.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Evidence:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {cause.evidence.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mitigation Actions */}
                {cause.mitigation_actions && cause.mitigation_actions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Mitigation Actions:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {cause.mitigation_actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preventive Measures */}
                {cause.preventive_measures && cause.preventive_measures.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Preventive Measures:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {cause.preventive_measures.map((measure, index) => (
                        <li key={index}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {rootCauses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Root Cause Analysis</h3>
              <p className="text-gray-600 mb-6">
                Start by using AI analysis to identify potential root causes, or manually add root causes.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={generateAIAnalysis} disabled={analyzing}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface RootCauseFormProps {
  cause?: RootCause | null;
  onSave: (data: Partial<RootCause>) => void;
  onCancel: () => void;
}

const RootCauseForm: React.FC<RootCauseFormProps> = ({
  cause,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    cause_type: cause?.cause_type || 'human_error',
    description: cause?.description || '',
    contributing_factors: cause?.contributing_factors || [''],
    evidence: cause?.evidence || [''],
    severity: cause?.severity || 'medium',
    probability: cause?.probability || 3,
    impact: cause?.impact || 3,
    mitigation_actions: cause?.mitigation_actions || [''],
    preventive_measures: cause?.preventive_measures || ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty strings
    const cleanedData = {
      ...formData,
      contributing_factors: formData.contributing_factors.filter(f => f.trim()),
      evidence: formData.evidence.filter(e => e.trim()),
      mitigation_actions: formData.mitigation_actions.filter(a => a.trim()),
      preventive_measures: formData.preventive_measures.filter(m => m.trim())
    };
    onSave(cleanedData);
  };

  const addItem = (field: keyof typeof formData) => {
    if (Array.isArray(formData[field])) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), '']
      }));
    }
  };

  const updateItem = (field: keyof typeof formData, index: number, value: string) => {
    if (Array.isArray(formData[field])) {
      const newArray = [...(formData[field] as string[])];
      newArray[index] = value;
      setFormData(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  const removeItem = (field: keyof typeof formData, index: number) => {
    if (Array.isArray(formData[field])) {
      const newArray = (formData[field] as string[]).filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cause_type">Cause Type</Label>
          <Select
            value={formData.cause_type}
            onValueChange={(value: RootCause['cause_type']) =>
              setFormData(prev => ({ ...prev, cause_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAUSE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select
            value={formData.severity}
            onValueChange={(value: RootCause['severity']) =>
              setFormData(prev => ({ ...prev, severity: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the root cause in detail..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Probability (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.probability}
            onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Impact (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={formData.impact}
            onChange={(e) => setFormData(prev => ({ ...prev, impact: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      {/* Contributing Factors */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Contributing Factors</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem('contributing_factors')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        {formData.contributing_factors.map((factor, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={factor}
              onChange={(e) => updateItem('contributing_factors', index, e.target.value)}
              placeholder="Enter contributing factor..."
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem('contributing_factors', index)}
              disabled={formData.contributing_factors.length === 1}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Evidence */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Evidence</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem('evidence')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        {formData.evidence.map((evidence, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={evidence}
              onChange={(e) => updateItem('evidence', index, e.target.value)}
              placeholder="Enter evidence..."
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem('evidence', index)}
              disabled={formData.evidence.length === 1}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Mitigation Actions */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Mitigation Actions</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem('mitigation_actions')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        {formData.mitigation_actions.map((action, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={action}
              onChange={(e) => updateItem('mitigation_actions', index, e.target.value)}
              placeholder="Enter mitigation action..."
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem('mitigation_actions', index)}
              disabled={formData.mitigation_actions.length === 1}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Preventive Measures */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Preventive Measures</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem('preventive_measures')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        {formData.preventive_measures.map((measure, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={measure}
              onChange={(e) => updateItem('preventive_measures', index, e.target.value)}
              placeholder="Enter preventive measure..."
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem('preventive_measures', index)}
              disabled={formData.preventive_measures.length === 1}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {cause ? 'Update Root Cause' : 'Add Root Cause'}
        </Button>
      </div>
    </form>
  );
};