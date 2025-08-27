import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Target, AlertCircle, AlertTriangle, Zap, Info } from "lucide-react";

interface Finding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  description: string;
  category: string;
  audit_title?: string;
}

interface FindingVisualizationProps {
  findings: Finding[];
  showTable?: boolean;
  showNumbers?: boolean;
}

const FindingVisualization: React.FC<FindingVisualizationProps> = ({
  findings,
  showTable = false,
  showNumbers = true
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-500',
          progress: 95,
          icon: Zap
        };
      case 'high':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-500',
          progress: 75,
          icon: AlertTriangle
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-500',
          progress: 50,
          icon: AlertCircle
        };
      case 'low':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-500',
          progress: 25,
          icon: Info
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-500',
          progress: 0,
          icon: Target
        };
    }
  };

  const getSeverityIcon = (severity: string) => {
    const config = getSeverityColor(severity);
    return config.icon;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in progress':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityScore = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 95;
      case 'high':
        return 75;
      case 'medium':
        return 50;
      case 'low':
        return 25;
      default:
        return 0;
    }
  };

  if (showTable) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">#</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Bulgu</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Şiddet</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Kategori</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Durum</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Denetim</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding, index) => {
                const severityConfig = getSeverityColor(finding.severity);
                const SeverityIcon = getSeverityIcon(finding.severity);

                return (
                  <tr key={finding.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      {showNumbers ? `F-${(index + 1).toString().padStart(3, '0')}` : '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div>
                        <div className="font-medium">{finding.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{finding.description}</div>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge className={`${severityConfig.bg} ${severityConfig.text} border ${severityConfig.border} flex items-center gap-1 w-fit mx-auto`}>
                        <SeverityIcon className="w-3 h-3" />
                        {finding.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline">{finding.category}</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge className={getStatusColor(finding.status)}>
                        {finding.status}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="text-xs text-gray-600">
                        {finding.audit_title || 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => {
        const severityConfig = getSeverityColor(finding.severity);
        const SeverityIcon = getSeverityIcon(finding.severity);

        return (
          <Card key={finding.id} className={`border-l-4 ${severityConfig.border} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {showNumbers && (
                    <div className="flex items-center justify-center w-10 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm border-2 border-gray-300">
                      F-{(index + 1).toString().padStart(3, '0')}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{finding.title}</h4>
                    <p className="text-sm text-gray-600">{finding.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${severityConfig.bg} ${severityConfig.text} border ${severityConfig.border} flex items-center gap-1`}>
                    <SeverityIcon className="w-4 h-4" />
                    {finding.severity.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(finding.status)}>
                    {finding.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Şiddet Skoru</div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={getSeverityScore(finding.severity)}
                      className="flex-1 h-3"
                    />
                    <span className="text-sm font-medium">{getSeverityScore(finding.severity)}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Kategori</div>
                  <Badge variant="outline" className="mt-1">
                    {finding.category}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  {finding.audit_title && (
                    <div>
                      <span className="text-gray-500">Denetim:</span>
                      <span className="ml-2 font-medium">{finding.audit_title}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Bulgu #{(index + 1).toString().padStart(3, '0')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export { FindingVisualization };