import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Download,
  FileText,
  Settings,
  Sparkles,
  Zap,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

import { ReportSection, ReportSectionData } from "./ReportSections";
import { reportAIService, ReportGenerationRequest } from "../services/reportAIService";
import { useAuthStore } from "../store/authStore";

export interface ReportPreviewProps {
  title: string;
  description?: string;
  sections: ReportSectionData[];
  entityType?: 'audit' | 'risk' | 'finding' | 'general';
  entityId?: string;
  onUpdateSection?: (sectionId: string, updatedSection: ReportSectionData) => void;
  onDeleteSection?: (sectionId: string) => void;
  isGenerating?: boolean;
  onGenerateReport?: () => void;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  title,
  description,
  sections,
  entityType = 'general',
  entityId,
  onUpdateSection,
  onDeleteSection,
  isGenerating = false,
  onGenerateReport,
}) => {
  const { user } = useAuthStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [showGeneratedContent, setShowGeneratedContent] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  // Generate mock data for preview
  const mockData = useMemo(() => ({
    audit: {
      totalAudits: 24,
      completedAudits: 18,
      openFindings: 8,
      complianceScore: 87,
      recentActivity: [
        { action: 'Audit completed', date: '2024-01-15', auditor: 'John Smith' },
        { action: 'Finding resolved', date: '2024-01-14', auditor: 'Sarah Johnson' },
        { action: 'New audit started', date: '2024-01-13', auditor: 'Mike Davis' },
      ]
    },
    risk: {
      totalRisks: 15,
      highRisks: 3,
      mediumRisks: 7,
      lowRisks: 5,
      riskTrend: '+5%',
      topRisks: [
        { name: 'Cybersecurity', level: 'High', score: 8.5 },
        { name: 'Compliance', level: 'Medium', score: 6.2 },
        { name: 'Operational', level: 'Medium', score: 5.8 },
      ]
    },
    finding: {
      totalFindings: 32,
      openFindings: 12,
      closedFindings: 20,
      overdueFindings: 3,
      avgResolutionTime: '15 days',
      severityBreakdown: { high: 4, medium: 6, low: 2 }
    }
  }), []);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call to refresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dataKey = entityType === 'general' ? 'audit' : entityType;
      setLiveData(mockData[dataKey as keyof typeof mockData] || mockData.audit);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateSectionContent = async (section: ReportSectionData) => {
    if (!onUpdateSection) return;

    // Placeholder for AI generation - would integrate with actual AI service
    console.log("Generating content for section:", section.title);

    // Simulate AI generation
    const generatedContent = `AI-generated content for ${section.title} section. This is a placeholder that would be replaced with actual AI-generated content.`;

    onUpdateSection(section.id, {
      ...section,
      content: generatedContent,
      ai_generated: true,
    });
  };

  const exportReport = (format: 'pdf' | 'word' | 'excel') => {
    // Placeholder for export functionality
    console.log(`Exporting report as ${format.toUpperCase()}...`);
    // This would integrate with export services
  };

  const getPreviewContainerClasses = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const filteredSections = showGeneratedContent
    ? sections
    : sections.filter(section => !section.ai_generated);

  return (
    <div className={`bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Preview Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Report Preview
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="showGenerated">Show AI Content</Label>
                  <Switch
                    id="showGenerated"
                    checked={showGeneratedContent}
                    onCheckedChange={setShowGeneratedContent}
                  />
                </div>

                <Select value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reportTitle">Report Title</Label>
                <Input
                  id="reportTitle"
                  value={title}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="entityType">Entity Type</Label>
                <Input
                  id="entityType"
                  value={entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="sectionCount">Sections</Label>
                <Input
                  id="sectionCount"
                  value={`${sections.length} sections`}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            {description && (
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  readOnly
                  className="bg-gray-100"
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Content Preview */}
        <div className={getPreviewContainerClasses()}>
          <Card className="shadow-lg">
            <CardHeader className="bg-white border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  {description && (
                    <p className="text-gray-600 mt-2">{description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>Generated: {new Date().toLocaleDateString()}</span>
                    <span>Entity: {entityType}</span>
                    <Badge variant="secondary">
                      {sections.length} Sections
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGenerateReport}
                    disabled={isGenerating || sections.length === 0}
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate All
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportReport('pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 bg-white">
              <AnimatePresence>
                {filteredSections.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No sections to preview
                    </h3>
                    <p className="text-gray-600">
                      Add sections to the report builder to see the preview
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {filteredSections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        {onUpdateSection && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateSectionContent(section)}
                              disabled={section.configuration?.ai_enabled === false}
                            >
                              <Sparkles className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <ReportSection
                          data={section}
                          onUpdate={onUpdateSection ? (data) => onUpdateSection(section.id, data) : undefined}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Live Data Panel (if available) */}
        {liveData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Live Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(liveData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};