import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { 
  AlertTriangle, 
  Save, 
  ArrowLeft, 
  Calendar,
  Users,
  Server,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { itSecurityService, ITSecurityIncidentFormData } from '../../../services/itSecurityService';
import { IncidentSeverity, IncidentStatus, IncidentPriority, IncidentType } from '../../../types/itSecurity';

const CreateIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ITSecurityIncidentFormData>({
    title: '',
    description: '',
    incident_type: 'other',
    severity: 'medium',
    priority: 'medium',
    detected_at: new Date().toISOString().slice(0, 16),
    reported_at: new Date().toISOString().slice(0, 16),
    affected_systems: [],
    affected_users: undefined,
    data_breach: false,
    data_types_affected: [],
    regulatory_impact: [],
    financial_impact: undefined,
    reputation_impact: undefined,
    assigned_to: undefined,
    incident_manager_id: undefined,
    business_unit_id: undefined
  });

  const [newSystem, setNewSystem] = useState('');
  const [newDataType, setNewDataType] = useState('');
  const [newRegulatoryImpact, setNewRegulatoryImpact] = useState('');

  const incidentTypes: { value: IncidentType; label: string }[] = [
    { value: 'malware', label: 'Malware' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'data_breach', label: 'Data Breach' },
    { value: 'ddos', label: 'DDoS Attack' },
    { value: 'insider_threat', label: 'Insider Threat' },
    { value: 'physical_security', label: 'Physical Security' },
    { value: 'social_engineering', label: 'Social Engineering' },
    { value: 'system_compromise', label: 'System Compromise' },
    { value: 'network_intrusion', label: 'Network Intrusion' },
    { value: 'application_vulnerability', label: 'Application Vulnerability' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels: { value: IncidentSeverity; label: string; color: string }[] = [
    { value: 'critical', label: 'Critical', color: 'bg-red-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'low', label: 'Low', color: 'bg-green-500' }
  ];

  const priorityLevels: { value: IncidentPriority; label: string; color: string }[] = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'low', label: 'Low', color: 'bg-green-500' }
  ];

  const dataTypes = [
    'Personal Identifiable Information (PII)',
    'Payment Card Data',
    'Health Information (PHI)',
    'Financial Data',
    'Intellectual Property',
    'Trade Secrets',
    'Employee Data',
    'Customer Data',
    'System Credentials',
    'Other'
  ];

  const regulatoryFrameworks = [
    'GDPR',
    'CCPA',
    'HIPAA',
    'SOX',
    'PCI DSS',
    'FERPA',
    'GLBA',
    'ISO 27001',
    'NIST Framework',
    'Other'
  ];

  const handleInputChange = (field: keyof ITSecurityIncidentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAffectedSystem = () => {
    if (newSystem.trim()) {
      setFormData(prev => ({
        ...prev,
        affected_systems: [...prev.affected_systems, newSystem.trim()]
      }));
      setNewSystem('');
    }
  };

  const removeAffectedSystem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      affected_systems: prev.affected_systems.filter((_, i) => i !== index)
    }));
  };

  const addDataType = () => {
    if (newDataType.trim()) {
      setFormData(prev => ({
        ...prev,
        data_types_affected: [...prev.data_types_affected, newDataType.trim()]
      }));
      setNewDataType('');
    }
  };

  const removeDataType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      data_types_affected: prev.data_types_affected.filter((_, i) => i !== index)
    }));
  };

  const addRegulatoryImpact = () => {
    if (newRegulatoryImpact.trim()) {
      setFormData(prev => ({
        ...prev,
        regulatory_impact: [...prev.regulatory_impact, newRegulatoryImpact.trim()]
      }));
      setNewRegulatoryImpact('');
    }
  };

  const removeRegulatoryImpact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      regulatory_impact: prev.regulatory_impact.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await itSecurityService.incidents.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/it-security/incidents');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-600 mb-2">Incident Created Successfully</h2>
          <p className="text-gray-600">Redirecting to incidents list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/it-security/incidents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Incidents
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Security Incident</h1>
            <p className="text-gray-600 mt-2">
              Create a new security incident report
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Incident Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the incident"
                  required
                />
              </div>
              <div>
                <Label htmlFor="incident_type">Incident Type *</Label>
                <select
                  id="incident_type"
                  value={formData.incident_type}
                  onChange={(e) => handleInputChange('incident_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {incidentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the incident, including what happened, when it was discovered, and any immediate actions taken"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Severity *</Label>
                <div className="flex space-x-2 mt-2">
                  {severityLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange('severity', level.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.severity === level.value
                          ? `${level.color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Priority *</Label>
                <div className="flex space-x-2 mt-2">
                  {priorityLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange('priority', level.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.priority === level.value
                          ? `${level.color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="detected_at">When Detected *</Label>
                <Input
                  id="detected_at"
                  type="datetime-local"
                  value={formData.detected_at}
                  onChange={(e) => handleInputChange('detected_at', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reported_at">When Reported *</Label>
                <Input
                  id="reported_at"
                  type="datetime-local"
                  value={formData.reported_at}
                  onChange={(e) => handleInputChange('reported_at', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Impact Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Affected Systems</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newSystem}
                  onChange={(e) => setNewSystem(e.target.value)}
                  placeholder="Enter system name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAffectedSystem())}
                />
                <Button type="button" onClick={addAffectedSystem} variant="outline">
                  Add
                </Button>
              </div>
              {formData.affected_systems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.affected_systems.map((system, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center">
                      {system}
                      <button
                        type="button"
                        onClick={() => removeAffectedSystem(index)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="affected_users">Number of Affected Users</Label>
                <Input
                  id="affected_users"
                  type="number"
                  value={formData.affected_users || ''}
                  onChange={(e) => handleInputChange('affected_users', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Estimated number"
                />
              </div>
              <div>
                <Label htmlFor="financial_impact">Financial Impact ($)</Label>
                <Input
                  id="financial_impact"
                  type="number"
                  value={formData.financial_impact || ''}
                  onChange={(e) => handleInputChange('financial_impact', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Estimated cost"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reputation_impact">Reputation Impact</Label>
              <select
                id="reputation_impact"
                value={formData.reputation_impact || ''}
                onChange={(e) => handleInputChange('reputation_impact', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select impact level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Breach Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Data Breach Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="data_breach"
                checked={formData.data_breach}
                onChange={(e) => handleInputChange('data_breach', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="data_breach">This incident involves a data breach</Label>
            </div>

            {formData.data_breach && (
              <div className="space-y-4">
                <div>
                  <Label>Types of Data Affected</Label>
                  <div className="flex space-x-2 mt-2">
                    <select
                      value={newDataType}
                      onChange={(e) => setNewDataType(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select data type</option>
                      {dataTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <Button type="button" onClick={addDataType} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.data_types_affected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.data_types_affected.map((type, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {type}
                          <button
                            type="button"
                            onClick={() => removeDataType(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Regulatory Impact</Label>
                  <div className="flex space-x-2 mt-2">
                    <select
                      value={newRegulatoryImpact}
                      onChange={(e) => setNewRegulatoryImpact(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select framework</option>
                      {regulatoryFrameworks.map(framework => (
                        <option key={framework} value={framework}>{framework}</option>
                      ))}
                    </select>
                    <Button type="button" onClick={addRegulatoryImpact} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.regulatory_impact.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.regulatory_impact.map((impact, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {impact}
                          <button
                            type="button"
                            onClick={() => removeRegulatoryImpact(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link to="/it-security/incidents">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Create Incident
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateIncidentPage;
