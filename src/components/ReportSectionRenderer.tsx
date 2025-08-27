import React from "react";
import { RiskVisualization } from "./visualizations/RiskVisualization";
import { FindingVisualization } from "./visualizations/FindingVisualization";
import { ReportSection } from "../services/reportAIService";

interface Finding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  description: string;
  category: string;
  audit_title?: string;
}

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
  business_unit_id?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface ReportSectionRendererProps {
  section: ReportSection;
}

const ReportSectionRenderer: React.FC<ReportSectionRendererProps> = ({ section }) => {
  // Check if this section has enhanced visualization configuration
  const hasEnhancedVisualization = section.configuration?.visualization === 'enhanced';
  const showTable = section.configuration?.showTable === true;
  const showNumbers = section.configuration?.showNumbers === true;

  if (hasEnhancedVisualization && section.type === 'risk' && section.configuration?.data) {
    // Type-safe casting for risk data
    const riskData = section.configuration.data as Risk[];
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.name}</h2>
        <RiskVisualization
          risks={riskData}
          showTable={showTable}
          showNumbers={showNumbers}
        />
      </div>
    );
  }

  if (hasEnhancedVisualization && section.type === 'finding' && section.configuration?.data) {
    // Type-safe casting for finding data
    const findingData = section.configuration.data as Finding[];
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.name}</h2>
        <FindingVisualization
          findings={findingData}
          showTable={showTable}
          showNumbers={showNumbers}
        />
      </div>
    );
  }

  // Default rendering for other section types
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.name}</h2>
      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {section.content || 'İçerik henüz oluşturulmadı'}
        </div>
      </div>
    </div>
  );
};

export { ReportSectionRenderer };