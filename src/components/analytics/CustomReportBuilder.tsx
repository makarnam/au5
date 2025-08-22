import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter, Treemap
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';

interface ReportSection {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  chartType?: string;
  dataSource?: string;
  dataKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  width?: number;
  height?: number;
  position: { x: number; y: number };
  data?: any[];
}

interface Report {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  created_at: string;
  updated_at: string;
}

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'radar', label: 'Radar Chart' },
  { value: 'scatter', label: 'Scatter Chart' },
  { value: 'treemap', label: 'Treemap' },
  { value: 'composed', label: 'Composed Chart' }
];

const DATA_SOURCES = [
  { value: 'v_monthly_audit_metrics', label: 'Monthly Audit Metrics' },
  { value: 'v_risk_trends', label: 'Risk Trends' },
  { value: 'v_requirement_posture', label: 'Requirement Posture' },
  { value: 'v_audit_performance_metrics', label: 'Audit Performance Metrics' },
  { value: 'v_team_workload', label: 'Team Workload' },
  { value: 'v_ai_usage_analytics', label: 'AI Usage Analytics' },
  { value: 'v_risk_dashboard', label: 'Risk Dashboard' },
  { value: 'v_compliance_assessments', label: 'Compliance Assessments' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function CustomReportBuilder() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ReportSection | null>(null);
  const [availableData, setAvailableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const createNewReport = () => {
    const newReport: Report = {
      id: `report_${Date.now()}`,
      name: 'New Report',
      description: '',
      sections: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCurrentReport(newReport);
    setIsEditing(true);
  };

  const addSection = (type: ReportSection['type']) => {
    if (!currentReport) return;

    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 0, y: currentReport.sections.length * 100 },
      width: 400,
      height: 300
    };

    const updatedReport = {
      ...currentReport,
      sections: [...currentReport.sections, newSection]
    };
    setCurrentReport(updatedReport);
    setSelectedSection(newSection);
  };

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    if (!currentReport) return;

    const updatedSections = currentReport.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    const updatedReport = {
      ...currentReport,
      sections: updatedSections
    };
    setCurrentReport(updatedReport);
  };

  const removeSection = (sectionId: string) => {
    if (!currentReport) return;

    const updatedSections = currentReport.sections.filter(section => section.id !== sectionId);
    const updatedReport = {
      ...currentReport,
      sections: updatedSections
    };
    setCurrentReport(updatedReport);
    setSelectedSection(null);
  };

  const loadDataSource = async (dataSource: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(dataSource)
        .select('*')
        .limit(50);

      if (error) throw error;
      setAvailableData(data || []);
    } catch (error) {
      console.error('Error loading data source:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (section: ReportSection) => {
    if (!section.data || section.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No data available
        </div>
      );
    }

    const commonProps = {
      data: section.data,
      width: section.width || 400,
      height: section.height || 300
    };

    switch (section.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={section.xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={section.yAxisKey} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={section.xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={section.yAxisKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={section.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={section.yAxisKey}
              >
                {section.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={section.xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={section.yAxisKey} stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={section.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={section.xAxisKey} />
              <PolarRadiusAxis />
              <Radar name="Data" dataKey={section.yAxisKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={section.xAxisKey} />
              <YAxis dataKey={section.yAxisKey} />
              <Tooltip />
              <Legend />
              <Scatter name="Data" dataKey={section.yAxisKey} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={section.data}
              dataKey={section.yAxisKey}
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const renderSection = (section: ReportSection) => {
    const isSelected = selectedSection?.id === section.id;

    return (
      <Card
        key={section.id}
        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setSelectedSection(section)}
        style={{
          position: 'absolute',
          left: section.position.x,
          top: section.position.y,
          width: section.width,
          height: section.height
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">{section.title}</CardTitle>
            <div className="flex gap-1">
              <Badge variant="outline">{section.type}</Badge>
              {section.chartType && <Badge variant="secondary">{section.chartType}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {section.type === 'chart' && renderChart(section)}
          {section.type === 'metric' && (
            <div className="text-center">
              <div className="text-3xl font-bold">
                {section.data?.[0]?.[section.dataKey || 'value'] || '0'}
              </div>
              <div className="text-sm text-gray-500">{section.title}</div>
            </div>
          )}
          {section.type === 'text' && (
            <div className="text-sm">
              {section.data?.[0]?.text || 'Add text content'}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const saveReport = async () => {
    if (!currentReport) return;

    try {
      const { error } = await supabase
        .from('custom_reports')
        .upsert({
          id: currentReport.id,
          name: currentReport.name,
          description: currentReport.description,
          sections: currentReport.sections,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await loadReports();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 p-4 border-r">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Report Builder</h2>
            <Button size="sm" onClick={createNewReport}>
              New Report
            </Button>
          </div>

          {isEditing && currentReport && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={currentReport.name}
                  onChange={(e) => setCurrentReport({ ...currentReport, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={currentReport.description}
                  onChange={(e) => setCurrentReport({ ...currentReport, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Add Section</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => addSection('chart')}>Chart</Button>
                  <Button size="sm" onClick={() => addSection('metric')}>Metric</Button>
                  <Button size="sm" onClick={() => addSection('table')}>Table</Button>
                  <Button size="sm" onClick={() => addSection('text')}>Text</Button>
                </div>
              </div>

              {selectedSection && (
                <div className="space-y-4 border-t pt-4">
                  <Label>Section Properties</Label>
                  
                  <div>
                    <Label htmlFor="section-title">Title</Label>
                    <Input
                      id="section-title"
                      value={selectedSection.title}
                      onChange={(e) => updateSection(selectedSection.id, { title: e.target.value })}
                    />
                  </div>

                  {selectedSection.type === 'chart' && (
                    <>
                      <div>
                        <Label htmlFor="chart-type">Chart Type</Label>
                        <Select
                          value={selectedSection.chartType}
                          onValueChange={(value) => updateSection(selectedSection.id, { chartType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CHART_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="data-source">Data Source</Label>
                        <Select
                          value={selectedSection.dataSource}
                          onValueChange={(value) => {
                            updateSection(selectedSection.id, { dataSource: value });
                            loadDataSource(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent>
                            {DATA_SOURCES.map((source) => (
                              <SelectItem key={source.value} value={source.value}>
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {availableData.length > 0 && (
                        <>
                          <div>
                            <Label htmlFor="x-axis">X Axis Key</Label>
                            <Select
                              value={selectedSection.xAxisKey}
                              onValueChange={(value) => updateSection(selectedSection.id, { xAxisKey: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select X axis" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(availableData[0] || {}).map((key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="y-axis">Y Axis Key</Label>
                            <Select
                              value={selectedSection.yAxisKey}
                              onValueChange={(value) => updateSection(selectedSection.id, { yAxisKey: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Y axis" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(availableData[0] || {}).map((key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => updateSection(selectedSection.id, { data: availableData })}
                          >
                            Load Data
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeSection(selectedSection.id)}
                  >
                    Remove Section
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={saveReport} className="flex-1">
                  Save Report
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <Label>Saved Reports</Label>
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setCurrentReport(report)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">{report.description}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(report.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-white">
        {currentReport ? (
          <div className="relative w-full h-full overflow-auto">
            {currentReport.sections.map(renderSection)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a report or create a new one to get started
          </div>
        )}
      </div>
    </div>
  );
}
