import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Save, 
  Trash2, 
  Edit, 
  Copy, 
  Filter,
  Grid3X3,
  Building2,
  Shield,
  Plus,
  Eye,
  ArrowLeft,
  Printer,
  FileText,
  BarChart3,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MatrixTemplate, RiskControlMatrix, RiskControlMapping, MatrixCell } from '../../types/riskControlMatrix';
import riskControlMatrixService from '../../services/riskControlMatrixService';
import DragDropMatrix from './DragDropMatrix';

interface MatrixTemplateManagerProps {
  onTemplateApply?: (template: MatrixTemplate) => void;
  className?: string;
}

const MatrixTemplateManager: React.FC<MatrixTemplateManagerProps> = ({
  onTemplateApply,
  className = ""
}) => {
  const [templates, setTemplates] = useState<MatrixTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MatrixTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MatrixTemplate | null>(null);
  const [filter, setFilter] = useState({
    industry: '',
    framework: '',
    matrix_type: '',
    search: ''
  });

  // Matrix visualization state
  const [showMatrixVisualization, setShowMatrixVisualization] = useState(false);
  const [currentMatrix, setCurrentMatrix] = useState<RiskControlMatrix | null>(null);
  const [sampleRisks, setSampleRisks] = useState<any[]>([]);
  const [sampleControls, setSampleControls] = useState<any[]>([]);
  const [matrixMappings, setMatrixMappings] = useState<RiskControlMapping[]>([]);

  // Form state for creating/editing templates
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    matrix_type: '5x5' as '3x3' | '4x4' | '5x5' | 'custom',
    industry: 'none',
    framework: 'none',
    is_public: false
  });

  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await riskControlMatrixService.getTemplates({
        industry: filter.industry === 'all' ? undefined : filter.industry,
        framework: filter.framework === 'all' ? undefined : filter.framework,
        matrix_type: filter.matrix_type === 'all' ? undefined : filter.matrix_type
      });
      
      // Apply search filter
      const filteredData = filter.search 
        ? data.filter(t => 
            t.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            t.description.toLowerCase().includes(filter.search.toLowerCase())
          )
        : data;
      
      setTemplates(filteredData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data for matrix visualization
  const generateSampleData = (template: MatrixTemplate) => {
    const matrix: RiskControlMatrix = {
      id: `matrix-${Date.now()}`,
      name: template.name,
      description: template.description,
      matrix_type: template.matrix_type,
      risk_levels: ['low', 'medium', 'high', 'critical'],
      control_effectiveness_levels: ['excellent', 'good', 'adequate', 'weak', 'inadequate'],
      business_unit_id: 'sample-business-unit',
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const risks = [
      {
        id: 'risk-1',
        title: 'Data Breach Risk',
        description: 'Risk of unauthorized access to sensitive data',
        risk_level: 'high',
        category: 'Information Security',
        probability: 0.3,
        impact: 0.8,
        created_at: new Date().toISOString()
      },
      {
        id: 'risk-2',
        title: 'System Downtime',
        description: 'Risk of critical system failures',
        risk_level: 'medium',
        category: 'Operational',
        probability: 0.2,
        impact: 0.6,
        created_at: new Date().toISOString()
      },
      {
        id: 'risk-3',
        title: 'Compliance Violation',
        description: 'Risk of regulatory non-compliance',
        risk_level: 'critical',
        category: 'Compliance',
        probability: 0.1,
        impact: 0.9,
        created_at: new Date().toISOString()
      },
      {
        id: 'risk-4',
        title: 'Employee Turnover',
        description: 'Risk of key personnel leaving',
        risk_level: 'low',
        category: 'Human Resources',
        probability: 0.4,
        impact: 0.3,
        created_at: new Date().toISOString()
      },
      {
        id: 'risk-5',
        title: 'Supply Chain Disruption',
        description: 'Risk of supplier failures',
        risk_level: 'medium',
        category: 'Supply Chain',
        probability: 0.25,
        impact: 0.7,
        created_at: new Date().toISOString()
      }
    ];

    const controls = [
      {
        id: 'control-1',
        title: 'Access Control System',
        description: 'Multi-factor authentication and role-based access',
        control_type: 'Preventive',
        effectiveness: 'excellent',
        category: 'Information Security',
        created_at: new Date().toISOString()
      },
      {
        id: 'control-2',
        title: 'Backup and Recovery',
        description: 'Automated backup systems with disaster recovery',
        control_type: 'Detective',
        effectiveness: 'good',
        category: 'IT Operations',
        created_at: new Date().toISOString()
      },
      {
        id: 'control-3',
        title: 'Compliance Monitoring',
        description: 'Automated compliance checking and reporting',
        control_type: 'Preventive',
        effectiveness: 'adequate',
        category: 'Compliance',
        created_at: new Date().toISOString()
      },
      {
        id: 'control-4',
        title: 'Employee Training',
        description: 'Regular security awareness training',
        control_type: 'Preventive',
        effectiveness: 'weak',
        category: 'Human Resources',
        created_at: new Date().toISOString()
      },
      {
        id: 'control-5',
        title: 'Vendor Management',
        description: 'Supplier risk assessment and monitoring',
        control_type: 'Detective',
        effectiveness: 'inadequate',
        category: 'Supply Chain',
        created_at: new Date().toISOString()
      }
    ];

    return { matrix, risks, controls };
  };

  const handleVisualizeMatrix = (template: MatrixTemplate) => {
    const { matrix, risks, controls } = generateSampleData(template);
    setCurrentMatrix(matrix);
    setSampleRisks(risks);
    setSampleControls(controls);
    setMatrixMappings([]);
    setShowMatrixVisualization(true);
    setSelectedTemplate(template);
  };

  const handleMatrixMappingChange = (mapping: RiskControlMapping) => {
    setMatrixMappings(prev => {
      const existingIndex = prev.findIndex(m => m.id === mapping.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = mapping;
        return updated;
      } else {
        return [...prev, mapping];
      }
    });
  };

  const handleRiskDrop = (riskId: string, cellId: string) => {
    const risk = sampleRisks.find(r => r.id === riskId);
    const [x, y] = cellId.split('-').map(Number);
    const cell = getCellFromPosition(x, y);
    
    if (risk && cell && risk.risk_level === cell.risk_level) {
      const mapping: RiskControlMapping = {
        id: `mapping-${Date.now()}`,
        matrix_id: currentMatrix!.id,
        risk_id: riskId,
        control_id: '', // Will be set when control is dropped
        mapping_date: new Date().toISOString(),
        mapped_by: 'current-user',
        effectiveness_rating: 3,
        coverage_rating: 3,
        notes: `Risk "${risk.title}" mapped to ${cell.risk_level} risk level`,
        created_at: new Date().toISOString()
      };
      
      setMatrixMappings(prev => [...prev, mapping]);
      toast.success(`Risk "${risk.title}" mapped to cell`);
    } else {
      toast.error('Risk level does not match cell position');
    }
  };

  const handleControlDrop = (controlId: string, cellId: string) => {
    const control = sampleControls.find(c => c.id === controlId);
    const [x, y] = cellId.split('-').map(Number);
    const cell = getCellFromPosition(x, y);
    
    if (control && cell && control.effectiveness === cell.control_effectiveness) {
      // Find existing mapping for this cell and update it
      const existingMapping = matrixMappings.find(m => {
        const mappingCell = getCellFromPosition(
          parseInt(m.risk_id.split('-')[1]), 
          parseInt(m.risk_id.split('-')[2])
        );
        return mappingCell?.id === cellId;
      });
      
      if (existingMapping) {
        const updatedMapping = { ...existingMapping, control_id: controlId };
        handleMatrixMappingChange(updatedMapping);
        toast.success(`Control "${control.title}" mapped to existing risk mapping`);
      } else {
        const mapping: RiskControlMapping = {
          id: `mapping-${Date.now()}`,
          matrix_id: currentMatrix!.id,
          risk_id: '', // Will be set when risk is dropped
          control_id: controlId,
          mapping_date: new Date().toISOString(),
          mapped_by: 'current-user',
          effectiveness_rating: 3,
          coverage_rating: 3,
          notes: `Control "${control.title}" mapped to ${cell.control_effectiveness} effectiveness level`,
          created_at: new Date().toISOString()
        };
        
        setMatrixMappings(prev => [...prev, mapping]);
        toast.success(`Control "${control.title}" mapped to cell`);
      }
    } else {
      toast.error('Control effectiveness does not match cell position');
    }
  };

  const getCellFromPosition = (x: number, y: number): MatrixCell | null => {
    if (!currentMatrix) return null;
    
    const size = parseInt(currentMatrix.matrix_type.split('x')[0]);
    const riskLevel = getRiskLevelFromPosition(y, size);
    const controlEffectiveness = getControlEffectivenessFromPosition(x, size);
    
    return {
      id: `${x}-${y}`,
      matrix_id: currentMatrix.id,
      risk_level: riskLevel,
      control_effectiveness: controlEffectiveness,
      position_x: x,
      position_y: y,
      color_code: getCellColor(riskLevel),
      description: `${riskLevel} risk with ${controlEffectiveness} controls`,
      action_required: getActionRequired(riskLevel, controlEffectiveness),
      created_at: new Date().toISOString()
    };
  };

  const getRiskLevelFromPosition = (y: number, size: number): 'low' | 'medium' | 'high' | 'critical' => {
    const levels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    const index = Math.floor((y - 1) * levels.length / size);
    return levels[Math.min(index, levels.length - 1)];
  };

  const getControlEffectivenessFromPosition = (x: number, size: number): 'excellent' | 'good' | 'adequate' | 'weak' | 'inadequate' => {
    const levels: ('excellent' | 'good' | 'adequate' | 'weak' | 'inadequate')[] = ['excellent', 'good', 'adequate', 'weak', 'inadequate'];
    const index = Math.floor((x - 1) * levels.length / size);
    return levels[Math.min(index, levels.length - 1)];
  };

  const getCellColor = (riskLevel: string): string => {
    const riskColors: Record<string, string> = { 
      low: '#10b981', 
      medium: '#f59e0b', 
      high: '#ef4444', 
      critical: '#7c2d12' 
    };
    return riskColors[riskLevel] || '#6b7280';
  };

  const getActionRequired = (riskLevel: string, controlEffectiveness: string): string => {
    if (riskLevel === 'critical' && controlEffectiveness === 'inadequate') {
      return 'Immediate action required';
    } else if (riskLevel === 'high' && ['weak', 'inadequate'].includes(controlEffectiveness)) {
      return 'High priority action needed';
    } else if (riskLevel === 'medium' && controlEffectiveness === 'adequate') {
      return 'Monitor and improve';
    } else {
      return 'Acceptable risk level';
    }
  };

  const handleExportMatrix = (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    // Implementation for export functionality
    toast.success(`Matrix exported as ${format.toUpperCase()}`);
  };

  const handlePrintMatrix = () => {
    window.print();
  };

  const handleSaveAsTemplate = async () => {
    if (!currentMatrix) return;
    
    try {
      const templateData = {
        name: `${currentMatrix.name} - Saved Matrix`,
        description: `Matrix saved from visualization with ${matrixMappings.length} mappings`,
        matrix_type: currentMatrix.matrix_type,
        template_data: {
          matrix: currentMatrix,
          mappings: matrixMappings,
          risks: sampleRisks,
          controls: sampleControls
        },
        industry: selectedTemplate?.industry || '',
        framework: selectedTemplate?.framework || '',
        is_public: false
      };

      const newTemplate = await riskControlMatrixService.createTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Matrix saved as new template');
    } catch (error) {
      console.error('Error saving matrix as template:', error);
      toast.error('Failed to save matrix as template');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Template name is required');
        return;
      }

      const templateData = {
        name: formData.name,
        description: formData.description,
        matrix_type: formData.matrix_type as "5x5" | "4x4" | "3x3" | "custom",
        template_data: {}, // This will be populated when saving from an actual matrix
        industry: formData.industry === 'none' ? '' : formData.industry,
        framework: formData.framework === 'none' ? '' : formData.framework,
        is_public: formData.is_public
      };

      const newTemplate = await riskControlMatrixService.createTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Template created successfully');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const updatedTemplate = await riskControlMatrixService.updateTemplate(editingTemplate.id, {
        name: formData.name,
        description: formData.description,
        matrix_type: formData.matrix_type,
        industry: formData.industry === 'none' ? '' : formData.industry,
        framework: formData.framework === 'none' ? '' : formData.framework,
        is_public: formData.is_public
      });

      setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
      setEditingTemplate(null);
      setShowCreateForm(false);
      resetForm();
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await riskControlMatrixService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: MatrixTemplate) => {
    try {
      const duplicatedTemplate = await riskControlMatrixService.createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        matrix_type: template.matrix_type as "5x5" | "4x4" | "3x3" | "custom",
        template_data: template.template_data,
        industry: template.industry || '',
        framework: template.framework || '',
        is_public: false
      });

      setTemplates(prev => [duplicatedTemplate, ...prev]);
      toast.success('Template duplicated successfully');
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };



  const handleTemplateApply = (template: MatrixTemplate) => {
    onTemplateApply?.(template);
    toast.success(`Template "${template.name}" applied successfully`);
  };

  const startEditing = (template: MatrixTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      matrix_type: template.matrix_type,
      industry: template.industry || '',
      framework: template.framework || '',
      is_public: template.is_public
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      matrix_type: '5x5' as '3x3' | '4x4' | '5x5' | 'custom',
      industry: 'none',
      framework: 'none',
      is_public: false
    });
    setEditingTemplate(null);
  };

  const getMatrixTypeColor = (type: string) => {
    switch (type) {
      case '5x5': return 'bg-blue-100 text-blue-800';
      case '4x4': return 'bg-green-100 text-green-800';
      case '3x3': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const industries = [
    "Technology", "Financial Services", "Healthcare", "Manufacturing", 
    "Retail", "Energy", "Transportation", "Education", "Government", "Non-Profit"
  ];

  const frameworks = [
    "COSO", "ISO 27001", "SOX", "NIST", "COBIT", "PCI DSS", "ISO 31000", "Custom"
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {showMatrixVisualization ? 'Matrix Visualization' : 'Matrix Templates'}
          </h2>
          <p className="text-gray-600 mt-1">
            {showMatrixVisualization 
              ? `Visualizing: ${selectedTemplate?.name} - Drag & drop risks and controls to map them`
              : 'Save and manage matrix templates for reuse'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showMatrixVisualization && (
            <Button variant="outline" onClick={() => setShowMatrixVisualization(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          )}
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

            {/* Show either template management or matrix visualization */}
      {!showMatrixVisualization ? (
        <>
          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="matrix_type">Matrix Type</Label>
                    <Select value={formData.matrix_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, matrix_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3x3">3x3</SelectItem>
                        <SelectItem value="4x4">4x4</SelectItem>
                        <SelectItem value="5x5">5x5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="framework">Framework</Label>
                    <Select value={formData.framework} onValueChange={(value) => setFormData(prev => ({ ...prev, framework: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {frameworks.map(framework => (
                          <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                        ))}
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
                    placeholder="Enter template description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_public">Make template public</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search templates..."
                    value={filter.search}
                    onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select value={filter.industry} onValueChange={(value) => setFilter(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Framework</Label>
                  <Select value={filter.framework} onValueChange={(value) => setFilter(prev => ({ ...prev, framework: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All frameworks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All frameworks</SelectItem>
                      {frameworks.map(framework => (
                        <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Matrix Type</Label>
                  <Select value={filter.matrix_type} onValueChange={(value) => setFilter(prev => ({ ...prev, matrix_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="3x3">3x3</SelectItem>
                      <SelectItem value="4x4">4x4</SelectItem>
                      <SelectItem value="5x5">5x5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.is_public && (
                        <Badge variant="secondary" className="text-xs">Public</Badge>
                      )}
                      <Badge className={getMatrixTypeColor(template.matrix_type)}>
                        {template.matrix_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {template.industry && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {template.industry}
                        </div>
                      )}
                      {template.framework && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {template.framework}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                      <span>Template</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleVisualizeMatrix(template)}
                        className="flex-1"
                      >
                        <Grid3X3 className="w-3 h-3 mr-1" />
                        Visualize
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTemplateApply(template)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startEditing(template)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-600 mb-4">
                  Create your first template to get started
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Matrix Visualization */
        currentMatrix && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedTemplate?.name} - Matrix Visualization
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrintMatrix} className="flex items-center gap-1">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button onClick={() => handleExportMatrix('pdf')} className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Export PDF
                </Button>
                <Button onClick={() => handleExportMatrix('excel')} className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Export Excel
                </Button>
                <Button onClick={() => handleExportMatrix('csv')} className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button onClick={handleSaveAsTemplate} className="flex items-center gap-1">
                  <Save className="w-4 h-4" />
                  Save as Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DragDropMatrix
                matrix={currentMatrix}
                risks={sampleRisks}
                controls={sampleControls}
                mappings={matrixMappings}
                onMappingChange={handleMatrixMappingChange}
                onRiskDrop={handleRiskDrop}
                onControlDrop={handleControlDrop}
              />
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default MatrixTemplateManager;
