import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/aiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Download,
  Save,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Table as TableIcon,
  Wand2,
  Filter,
  Settings,
  Eye
} from 'lucide-react';

interface CustomReportBuilderProps {
  className?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'control' | 'incident' | 'compliance' | 'audit' | 'general';
  data_sources: DataSource[];
  filters: ReportFilter[];
  visualizations: Visualization[];
  calculations: Calculation[];
  is_template: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DataSource {
  id: string;
  table_name: string;
  alias: string;
  joins?: JoinCondition[];
  filters?: DataFilter[];
}

interface JoinCondition {
  table: string;
  on: string;
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
}

interface DataFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

interface ReportFilter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multiselect' | 'text' | 'number';
  field: string;
  label: string;
  required: boolean;
  options?: string[];
  default_value?: any;
}

interface Visualization {
  id: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'table';
  title: string;
  data_source: string;
  x_axis?: string;
  y_axis?: string;
  group_by?: string;
  filters?: DataFilter[];
  config: Record<string, any>;
}

interface Calculation {
  id: string;
  name: string;
  expression: string;
  data_type: 'number' | 'percentage' | 'currency' | 'text';
  format?: string;
}

interface ReportData {
  [key: string]: any[];
}

const AVAILABLE_TABLES = [
  'risks',
  'controls',
  'incidents',
  'audits',
  'findings',
  'compliance_frameworks',
  'workflows',
  'users',
  'business_units'
];

const VISUALIZATION_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'area', label: 'Area Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'table', label: 'Data Table', icon: TableIcon }
];

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000', '#0000ff'];

export default function CustomReportBuilder({ className = "" }: CustomReportBuilderProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportData, setReportData] = useState<ReportData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load report templates');
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(template: ReportTemplate, filters: Record<string, any> = {}) {
    try {
      setIsGenerating(true);
      setError(null);

      const reportData: ReportData = {};

      // Generate data for each data source
      for (const source of template.data_sources) {
        const data = await fetchDataSource(source, filters);
        reportData[source.alias] = data;
      }

      // Apply calculations
      for (const calc of template.calculations) {
        const result = await calculateMetric(calc, reportData);
        reportData[calc.name] = result;
      }

      setReportData(reportData);
      setPreviewMode(true);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  }

  async function fetchDataSource(source: DataSource, filters: Record<string, any>) {
    try {
      let query = supabase.from(source.table_name).select('*');

      // Apply data source filters
      if (source.filters) {
        for (const filter of source.filters) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'like':
              query = query.like(filter.column, `%${filter.value}%`);
              break;
            case 'in':
              query = query.in(filter.column, filter.value);
              break;
          }
        }
      }

      // Apply report filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      }

      const { data, error } = await query.limit(1000);
      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error(`Error fetching data from ${source.table_name}:`, err);
      return [];
    }
  }

  async function calculateMetric(calc: Calculation, data: ReportData): Promise<any> {
    try {
      // Simple calculation evaluation (in production, use a proper expression evaluator)
      const expression = calc.expression;

      // For now, return a mock calculation
      if (expression.includes('COUNT')) {
        return data[Object.keys(data)[0]]?.length || 0;
      }
      if (expression.includes('SUM')) {
        return data[Object.keys(data)[0]]?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
      }
      if (expression.includes('AVG')) {
        const items = data[Object.keys(data)[0]] || [];
        return items.length > 0 ? items.reduce((sum, item) => sum + (item.value || 0), 0) / items.length : 0;
      }

      return 0;
    } catch (err) {
      console.error('Error calculating metric:', err);
      return 0;
    }
  }

  async function saveTemplate(template: Partial<ReportTemplate>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const templateData = {
        ...template,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      if (selectedTemplate?.id) {
        // Update existing template
        const { error } = await supabase
          .from('report_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        templateData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('report_templates')
          .insert(templateData);

        if (error) throw error;
      }

      await loadTemplates();
      setIsDialogOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save report template');
    }
  }

  async function deleteTemplate(templateId: string) {
    if (!confirm('Are you sure you want to delete this report template?')) return;

    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      await loadTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete report template');
    }
  }

  async function generateAITemplate(description: string) {
    try {
      setIsGenerating(true);

      const prompt = `
        Generate a custom report template based on this description: "${description}"

        Create a comprehensive report template with:
        1. Appropriate data sources from available tables: ${AVAILABLE_TABLES.join(', ')}
        2. Relevant filters for the report
        3. Multiple visualizations (charts and tables)
        4. Key calculations and metrics
        5. Proper categorization

        Return the template as JSON with this structure:
        {
          "name": "Report Name",
          "description": "Report Description",
          "category": "risk|control|incident|compliance|audit|general",
          "data_sources": [
            {
              "table_name": "table_name",
              "alias": "alias",
              "filters": []
            }
          ],
          "filters": [
            {
              "name": "filter_name",
              "type": "date_range|select|text|number",
              "field": "field_name",
              "label": "Filter Label",
              "required": false
            }
          ],
          "visualizations": [
            {
              "type": "bar|line|pie|table",
              "title": "Chart Title",
              "data_source": "data_source_alias",
              "x_axis": "x_field",
              "y_axis": "y_field",
              "config": {}
            }
          ],
          "calculations": [
            {
              "name": "metric_name",
              "expression": "COUNT(*)",
              "data_type": "number"
            }
          ]
        }
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt,
        context: 'report_template_generation',
        fieldType: 'control_evaluation',
        auditData: {}
      });

      if (aiResponse?.content) {
        const template = JSON.parse(aiResponse.content);
        setSelectedTemplate(template);
        setIsDialogOpen(true);
      }
    } catch (err) {
      console.error('Error generating AI template:', err);
      setError('Failed to generate AI template');
    } finally {
      setIsGenerating(false);
    }
  }

  const renderVisualization = (viz: Visualization, data: any[]) => {
    const { type, title, config } = viz;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.x_axis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={viz.y_axis || 'value'} fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.x_axis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={viz.y_axis} stroke={CHART_COLORS[0]} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={viz.y_axis || 'value'}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0] || {}).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 50).map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell key={cellIndex}>{String(value)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return <div>Unsupported visualization type: {type}</div>;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Report Builder <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span></h2>
          <p className="text-gray-600">Create and manage custom reports with advanced analytics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            disabled={!selectedTemplate}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? 'Edit Report Template' : 'Create New Report Template'}
                </DialogTitle>
              </DialogHeader>
              <ReportTemplateForm
                template={selectedTemplate}
                onSave={saveTemplate}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setSelectedTemplate(null);
                }}
                onGenerateAI={generateAITemplate}
                isGenerating={isGenerating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Report Templates */}
      {!previewMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.category === 'risk' ? 'bg-red-100 text-red-800' :
                    template.category === 'control' ? 'bg-blue-100 text-blue-800' :
                    template.category === 'incident' ? 'bg-orange-100 text-orange-800' :
                    template.category === 'compliance' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {template.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Data Sources: {template.data_sources.length}</div>
                    <div>Visualizations: {template.visualizations.length}</div>
                    <div>Calculations: {template.calculations.length}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateReport(template)}
                      disabled={isGenerating}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Templates</h3>
                <p className="text-gray-600 mb-6">
                  Create your first custom report template to get started with advanced analytics.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Report
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Report Preview */}
      {previewMode && selectedTemplate && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{selectedTemplate.name}</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Template
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Report Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedTemplate.visualizations.map((viz) => (
              <Card key={viz.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {VISUALIZATION_TYPES.find(t => t.value === viz.type)?.icon &&
                      React.createElement(VISUALIZATION_TYPES.find(t => t.value === viz.type)!.icon, {
                        className: "w-5 h-5"
                      })
                    }
                    {viz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderVisualization(viz, reportData[viz.data_source] || [])}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calculations Summary */}
          {selectedTemplate.calculations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedTemplate.calculations.map((calc) => (
                    <div key={calc.id} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {typeof reportData[calc.name] === 'number'
                          ? reportData[calc.name].toLocaleString()
                          : reportData[calc.name]
                        }
                      </div>
                      <div className="text-sm text-gray-600">{calc.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

interface ReportTemplateFormProps {
  template?: ReportTemplate | null;
  onSave: (template: Partial<ReportTemplate>) => void;
  onCancel: () => void;
  onGenerateAI: (description: string) => void;
  isGenerating: boolean;
}

const ReportTemplateForm: React.FC<ReportTemplateFormProps> = ({
  template,
  onSave,
  onCancel,
  onGenerateAI,
  isGenerating
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'general',
    data_sources: template?.data_sources || [{ id: '1', table_name: 'risks', alias: 'risks' }],
    filters: template?.filters || [],
    visualizations: template?.visualizations || [],
    calculations: template?.calculations || [],
    is_template: template?.is_template ?? true
  });

  const [aiDescription, setAiDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addDataSource = () => {
    setFormData(prev => ({
      ...prev,
      data_sources: [...prev.data_sources, { id: Date.now().toString(), table_name: 'risks', alias: 'new_source' }]
    }));
  };

  const addVisualization = () => {
    setFormData(prev => ({
      ...prev,
      visualizations: [...prev.visualizations, {
        id: Date.now().toString(),
        type: 'bar',
        title: 'New Chart',
        data_source: formData.data_sources[0]?.alias || 'risks',
        config: {}
      }]
    }));
  };

  const addCalculation = () => {
    setFormData(prev => ({
      ...prev,
      calculations: [...prev.calculations, {
        id: Date.now().toString(),
        name: 'New Metric',
        expression: 'COUNT(*)',
        data_type: 'number'
      }]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Report Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter report name"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: ReportTemplate['category']) =>
              setFormData(prev => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="risk">Risk Management</SelectItem>
              <SelectItem value="control">Control Management</SelectItem>
              <SelectItem value="incident">Incident Management</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="audit">Audit Management</SelectItem>
              <SelectItem value="general">General</SelectItem>
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
          placeholder="Describe what this report shows..."
          rows={3}
        />
      </div>

      {/* AI Generation */}
      <div className="border rounded-lg p-4 bg-purple-50">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-600" />
          Generate with AI
        </h4>
        <div className="flex gap-2">
          <Input
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            placeholder="Describe the report you want to create..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => onGenerateAI(aiDescription)}
            disabled={isGenerating || !aiDescription.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      {/* Data Sources */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Data Sources</h4>
          <Button type="button" variant="outline" size="sm" onClick={addDataSource}>
            <Plus className="w-3 h-3 mr-1" />
            Add Source
          </Button>
        </div>
        <div className="space-y-2">
          {formData.data_sources.map((source, index) => (
            <div key={index} className="flex gap-2 items-center p-2 border rounded">
              <Select
                value={source.table_name}
                onValueChange={(value) => {
                  const newSources = [...formData.data_sources];
                  newSources[index].table_name = value;
                  setFormData(prev => ({ ...prev, data_sources: newSources }));
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TABLES.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={source.alias}
                onChange={(e) => {
                  const newSources = [...formData.data_sources];
                  newSources[index].alias = e.target.value;
                  setFormData(prev => ({ ...prev, data_sources: newSources }));
                }}
                placeholder="Alias"
                className="w-32"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Visualizations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Visualizations</h4>
          <Button type="button" variant="outline" size="sm" onClick={addVisualization}>
            <Plus className="w-3 h-3 mr-1" />
            Add Chart
          </Button>
        </div>
        <div className="space-y-2">
          {formData.visualizations.map((viz, index) => (
            <div key={viz.id} className="p-3 border rounded">
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={viz.type}
                  onValueChange={(value: Visualization['type']) => {
                    const newViz = [...formData.visualizations];
                    newViz[index].type = value;
                    setFormData(prev => ({ ...prev, visualizations: newViz }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISUALIZATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={viz.title}
                  onChange={(e) => {
                    const newViz = [...formData.visualizations];
                    newViz[index].title = e.target.value;
                    setFormData(prev => ({ ...prev, visualizations: newViz }));
                  }}
                  placeholder="Chart title"
                />
                <Select
                  value={viz.data_source}
                  onValueChange={(value) => {
                    const newViz = [...formData.visualizations];
                    newViz[index].data_source = value;
                    setFormData(prev => ({ ...prev, visualizations: newViz }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.data_sources.map((source) => (
                      <SelectItem key={source.alias} value={source.alias}>
                        {source.alias}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Calculations</h4>
          <Button type="button" variant="outline" size="sm" onClick={addCalculation}>
            <Plus className="w-3 h-3 mr-1" />
            Add Metric
          </Button>
        </div>
        <div className="space-y-2">
          {formData.calculations.map((calc, index) => (
            <div key={calc.id} className="flex gap-2 items-center p-2 border rounded">
              <Input
                value={calc.name}
                onChange={(e) => {
                  const newCalc = [...formData.calculations];
                  newCalc[index].name = e.target.value;
                  setFormData(prev => ({ ...prev, calculations: newCalc }));
                }}
                placeholder="Metric name"
                className="w-48"
              />
              <Input
                value={calc.expression}
                onChange={(e) => {
                  const newCalc = [...formData.calculations];
                  newCalc[index].expression = e.target.value;
                  setFormData(prev => ({ ...prev, calculations: newCalc }));
                }}
                placeholder="COUNT(*), SUM(field), AVG(field)"
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};