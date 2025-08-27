import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Risk {
  id: string;
  title: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  risk_level: string;
  impact?: string;
  likelihood?: string;
  status: string;
  description: string;
  business_unit?: string;
  owner?: string;
}

interface RiskVisualizationProps {
  risks: Risk[];
  showTable?: boolean;
  showNumbers?: boolean;
}

const RiskVisualization: React.FC<RiskVisualizationProps> = ({
  risks,
  showTable = false,
  showNumbers = true
}) => {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-500',
          progress: 95
        };
      case 'high':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-500',
          progress: 75
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-500',
          progress: 50
        };
      case 'low':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-500',
          progress: 25
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-500',
          progress: 0
        };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
      case 'high':
        return TrendingUp;
      case 'medium':
        return Minus;
      case 'low':
        return TrendingDown;
      default:
        return AlertTriangle;
    }
  };

  const getImpactScore = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 90;
      case 'medium':
        return 60;
      case 'low':
        return 30;
      default:
        return 50;
    }
  };

  const getLikelihoodScore = (likelihood: string) => {
    switch (likelihood?.toLowerCase()) {
      case 'very high':
      case 'high':
        return 90;
      case 'medium':
        return 60;
      case 'low':
        return 30;
      default:
        return 50;
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
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Risk</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Seviye</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Etki</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Olasılık</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Durum</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Sahibi</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, index) => {
                const colors = getRiskColor(risk.level);
                const RiskIcon = getRiskIcon(risk.level);

                return (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      {showNumbers ? `${index + 1}` : '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div>
                        <div className="font-medium">{risk.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{risk.description}</div>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge className={`${colors.bg} ${colors.text} border ${colors.border} flex items-center gap-1 w-fit mx-auto`}>
                        <RiskIcon className="w-3 h-3" />
                        {risk.level.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{risk.impact || 'N/A'}</span>
                        <Progress
                          value={getImpactScore(risk.impact || '')}
                          className="w-12 h-2"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{risk.likelihood || 'N/A'}</span>
                        <Progress
                          value={getLikelihoodScore(risk.likelihood || '')}
                          className="w-12 h-2"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge variant="outline">{risk.status}</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="text-xs">
                        {risk.owner && <div>{risk.owner}</div>}
                        {risk.business_unit && <div className="text-gray-500">{risk.business_unit}</div>}
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
      {risks.map((risk, index) => {
        const colors = getRiskColor(risk.level);
        const RiskIcon = getRiskIcon(risk.level);

        return (
          <Card key={risk.id} className={`border-l-4 ${colors.border} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {showNumbers && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{risk.title}</h4>
                    <p className="text-sm text-gray-600">{risk.description}</p>
                  </div>
                </div>
                <Badge className={`${colors.bg} ${colors.text} border ${colors.border} flex items-center gap-1`}>
                  <RiskIcon className="w-4 h-4" />
                  {risk.level.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Risk Seviyesi</div>
                  <div className="flex items-center gap-2">
                    <Progress value={colors.progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{colors.progress}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Etki</div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={getImpactScore(risk.impact || '')}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium">{getImpactScore(risk.impact || '')}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Olasılık</div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={getLikelihoodScore(risk.likelihood || '')}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium">{getLikelihoodScore(risk.likelihood || '')}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-500">Durum:</span>
                    <Badge variant="outline" className="ml-2">{risk.status}</Badge>
                  </div>
                  {risk.business_unit && (
                    <div>
                      <span className="text-gray-500">Birim:</span>
                      <span className="ml-2 font-medium">{risk.business_unit}</span>
                    </div>
                  )}
                </div>
                {risk.owner && (
                  <div>
                    <span className="text-gray-500">Sahibi:</span>
                    <span className="ml-2 font-medium">{risk.owner}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export { RiskVisualization };