import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  BarChart3,
  Table as TableIcon,
  Target,
  Search,
  Shield,
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useAuthStore } from "../store/authStore";
import { reportAIService } from "../services/reportAIService";

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export interface ReportSectionData {
  id: string;
  title: string;
  type: 'text' | 'chart' | 'table' | 'kpi' | 'finding' | 'risk' | 'control';
  content?: string;
  data?: any;
  configuration?: {
    chartType?: 'bar' | 'line' | 'pie';
    ai_enabled?: boolean;
    visible?: boolean;
    style?: 'default' | 'compact' | 'detailed';
  };
  ai_generated?: boolean;
}

// Text Section Component
export const TextSection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = async () => {
    if (!onUpdate || !data.configuration?.ai_enabled) return;

    setIsGenerating(true);
    try {
      // This would call the AI service to generate content
      const generatedContent = `AI-generated content for ${data.title} section. This is a placeholder for the actual AI-generated content that would be produced based on the report context and data sources.`;

      onUpdate({
        ...data,
        content: generatedContent,
        ai_generated: true,
      });
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
        {data.configuration?.ai_enabled && !data.content && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        )}
      </div>

      <div className="prose prose-sm max-w-none">
        {data.content ? (
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {data.content}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            {data.configuration?.ai_enabled
              ? "Click 'Generate with AI' to create content for this section"
              : "No content available"}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Chart Section Component
export const ChartSection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const chartType = data.configuration?.chartType || 'bar';
  const chartData = data.data || [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {data.content && (
        <div className="mt-4 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 text-sm">
            {data.content}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Table Section Component
export const TableSection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const tableData = data.data || [
    { id: 1, name: 'Item 1', value: 100, status: 'Active' },
    { id: 2, name: 'Item 2', value: 200, status: 'Inactive' },
    { id: 3, name: 'Item 3', value: 300, status: 'Active' },
  ];

  const columns = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).filter(key => key !== 'id');
  }, [tableData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TableIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row: any, index: number) => (
              <tr key={row.id || index}>
                {columns.map((column: string) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.content && (
        <div className="mt-4 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 text-sm">
            {data.content}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// KPI Section Component
export const KPISection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const kpiData = data.data || [
    { label: 'Total Audits', value: 24, change: 12, trend: 'up' },
    { label: 'Open Findings', value: 8, change: -3, trend: 'down' },
    { label: 'Compliance Score', value: 87, change: 5, trend: 'up' },
    { label: 'Risk Level', value: 'Medium', change: 0, trend: 'stable' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  {kpi.change !== 0 && (
                    <div className={`flex items-center space-x-1 text-sm ${getTrendColor(kpi.trend)}`}>
                      {getTrendIcon(kpi.trend)}
                      <span>{Math.abs(kpi.change)}% from last period</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.content && (
        <div className="mt-6 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {data.content}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Finding Section Component
export const FindingSection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const findings = data.data || [
    {
      id: 1,
      title: 'Access Control Weakness',
      severity: 'High',
      status: 'Open',
      description: 'Multiple users have excessive privileges',
      dueDate: '2024-02-15'
    },
    {
      id: 2,
      title: 'Data Encryption Gap',
      severity: 'Medium',
      status: 'In Progress',
      description: 'Some sensitive data not properly encrypted',
      dueDate: '2024-02-20'
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {findings.map((finding: any) => (
          <Card key={finding.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{finding.title}</h4>
                    <Badge className={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(finding.status)}>
                      {finding.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{finding.description}</p>
                  <p className="text-xs text-gray-500">Due: {finding.dueDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.content && (
        <div className="mt-6 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {data.content}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Risk Section Component
export const RiskSection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const risks = data.data || [
    {
      id: 1,
      title: 'Cybersecurity Threat',
      level: 'High',
      impact: 'High',
      likelihood: 'Medium',
      status: 'Mitigating',
      description: 'Potential data breach from external threats'
    },
    {
      id: 2,
      title: 'Compliance Risk',
      level: 'Medium',
      impact: 'Medium',
      likelihood: 'High',
      status: 'Monitoring',
      description: 'Regulatory changes may impact operations'
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateRiskScore = (impact: string, likelihood: string) => {
    const impactScore = { low: 1, medium: 2, high: 3 }[impact.toLowerCase()] || 1;
    const likelihoodScore = { low: 1, medium: 2, high: 3 }[likelihood.toLowerCase()] || 1;
    return impactScore * likelihoodScore;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {risks.map((risk: any) => (
          <Card key={risk.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{risk.title}</h4>
                    <Badge className={getRiskColor(risk.level)}>
                      {risk.level} Risk
                    </Badge>
                    <Badge variant="outline">
                      Score: {calculateRiskScore(risk.impact, risk.likelihood)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                    <div>
                      <span className="text-gray-600">Impact:</span> {risk.impact}
                    </div>
                    <div>
                      <span className="text-gray-600">Likelihood:</span> {risk.likelihood}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
                  <p className="text-xs text-gray-500">Status: {risk.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.content && (
        <div className="mt-6 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {data.content}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Control Section Component
export const ControlSection: React.FC<{ data: ReportSectionData; onUpdate?: (data: ReportSectionData) => void }> = ({
  data,
  onUpdate
}) => {
  const controls = data.data || [
    {
      id: 1,
      title: 'Access Control Policy',
      type: 'Preventive',
      status: 'Effective',
      effectiveness: 85,
      description: 'Multi-factor authentication required for all users'
    },
    {
      id: 2,
      title: 'Data Backup Procedure',
      type: 'Detective',
      status: 'Effective',
      effectiveness: 92,
      description: 'Daily automated backups with encryption'
    },
    {
      id: 3,
      title: 'Incident Response Plan',
      type: 'Corrective',
      status: 'Needs Improvement',
      effectiveness: 68,
      description: 'Security incident response and recovery procedures'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'effective':
        return 'bg-green-100 text-green-800';
      case 'needs improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'ineffective':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'preventive':
        return 'bg-blue-100 text-blue-800';
      case 'detective':
        return 'bg-purple-100 text-purple-800';
      case 'corrective':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {controls.map((control: any) => (
          <Card key={control.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{control.title}</h4>
                    <Badge className={getTypeColor(control.type)}>
                      {control.type}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(control.status)}>
                      {control.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{control.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Effectiveness:</span>
                    <Progress value={control.effectiveness} className="flex-1 max-w-xs" />
                    <span className="text-sm font-medium">{control.effectiveness}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.content && (
        <div className="mt-6 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {data.content}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Main ReportSection renderer
export const ReportSection: React.FC<{
  data: ReportSectionData;
  onUpdate?: (data: ReportSectionData) => void;
}> = ({ data, onUpdate }) => {
  switch (data.type) {
    case 'text':
      return <TextSection data={data} onUpdate={onUpdate} />;
    case 'chart':
      return <ChartSection data={data} onUpdate={onUpdate} />;
    case 'table':
      return <TableSection data={data} onUpdate={onUpdate} />;
    case 'kpi':
      return <KPISection data={data} onUpdate={onUpdate} />;
    case 'finding':
      return <FindingSection data={data} onUpdate={onUpdate} />;
    case 'risk':
      return <RiskSection data={data} onUpdate={onUpdate} />;
    case 'control':
      return <ControlSection data={data} onUpdate={onUpdate} />;
    default:
      return <TextSection data={data} onUpdate={onUpdate} />;
  }
};