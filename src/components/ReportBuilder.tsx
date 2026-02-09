import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    FileText,
    BarChart3,
    Table,
    Target,
    Search,
    Shield,
    AlertTriangle,
    Trash2,
    Edit,
    Save,
    Download,
    Eye,
    Sparkles,
    Zap,
    Clock,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    History,
    X,
  } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

import { reportAIService, ReportSection, ReportDataSource, ReportGenerationRequest } from "../services/reportAIService";
import { reportDataIntegrationService } from "../services/reportDataIntegrationService";
import { reportVersionControlService } from "../services/reportVersionControlService";
import { reportExportService } from "../services/reportExportService";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import ReportCollaborationPanel from "./ReportCollaborationPanel";
import ReportAIGenerator from "./ai/ReportAIGenerator";
import ReportVersionControl from "./ReportVersionControl";
import ReportEntitySelector from "./ReportEntitySelector";
import ReportGenerationProgress, { useReportGeneration, ReportGenerationJob } from "./reports/ReportGenerationProgress";

// Section component types
interface SectionComponentProps {
  section: ReportSection;
  onUpdate: (updatedSection: ReportSection) => void;
  onDelete: (sectionId: string) => void;
  dataSources: ReportDataSource[];
  reportTitle: string;
  entityType: string;
  entityId?: string;
  t: (key: string) => string;
}

// Content history entry
interface ContentHistoryEntry {
  id: string;
  content: string;
  timestamp: Date;
  type: 'original' | 'ai_generated' | 'user_edited' | 'regenerated';
  metadata?: any;
}

// Enhanced section editing state
interface SectionEditingState {
  isEditing: boolean;
  editData: ReportSection;
  contentHistory: ContentHistoryEntry[];
  showHistory: boolean;
  showSuggestions: boolean;
  feedback: 'positive' | 'negative' | null;
  isRegenerating: boolean;
}

// Real data fetching functions
const getKPIRealData = async (entityType?: string, entityId?: string) => {
  try {
    const kpis = [];

    // Get audit statistics
    const { count: totalAudits } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true });

    const { count: openFindings } = await supabase
      .from('findings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Get compliance score (mock calculation - would need actual compliance data)
    const complianceScore = 87;

    // Get risk level (mock - would need actual risk assessment data)
    const riskLevel = 'Medium';

    kpis.push(
      { label: 'Total Audits', value: totalAudits || 0, change: 5, trend: 'up' as const },
      { label: 'Open Findings', value: openFindings || 0, change: -2, trend: 'down' as const },
      { label: 'Compliance Score', value: complianceScore, change: 3, trend: 'up' as const },
      { label: 'Risk Level', value: riskLevel, change: 0, trend: 'stable' as const }
    );

    return kpis;
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    return [
      { label: 'Total Audits', value: 0, change: 0, trend: 'stable' as const },
      { label: 'Open Findings', value: 0, change: 0, trend: 'stable' as const },
      { label: 'Compliance Score', value: 0, change: 0, trend: 'stable' as const },
      { label: 'Risk Level', value: 'Unknown', change: 0, trend: 'stable' as const }
    ];
  }
};

const getFindingRealData = async (entityType?: string, entityId?: string) => {
  try {
    const query = supabase
      .from('findings')
      .select('id, title, severity, status, description, due_date')
      .order('created_at', { ascending: false })
      .limit(5);

    if (entityType && entityId) {
      // Add entity-specific filtering if needed
      // This would depend on your entity relationship structure
    }

    const { data: findings, error } = await query;

    if (error) throw error;

    return findings?.map(finding => ({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
      status: finding.status,
      description: finding.description,
      dueDate: finding.due_date
    })) || [];
  } catch (error) {
    console.error('Error fetching findings data:', error);
    return [];
  }
};

const getRiskRealData = async (entityType?: string, entityId?: string) => {
  try {
    const query = supabase
      .from('risks')
      .select('id, title, risk_level, impact_level, likelihood, status, description')
      .order('created_at', { ascending: false })
      .limit(5);

    if (entityType && entityId) {
      // Add entity-specific filtering if needed
    }

    const { data: risks, error } = await query;

    if (error) throw error;

    return risks?.map(risk => ({
      id: risk.id,
      title: risk.title,
      level: risk.risk_level,
      impact: risk.impact_level,
      likelihood: risk.likelihood,
      status: risk.status,
      description: risk.description
    })) || [];
  } catch (error) {
    console.error('Error fetching risks data:', error);
    return [];
  }
};

const getControlRealData = async (entityType?: string, entityId?: string) => {
  try {
    const query = supabase
      .from('controls')
      .select('id, name, control_type, status, effectiveness_score, description')
      .order('created_at', { ascending: false })
      .limit(5);

    if (entityType && entityId) {
      // Add entity-specific filtering if needed
    }

    const { data: controls, error } = await query;

    if (error) throw error;

    return controls?.map(control => ({
      id: control.id,
      title: control.name,
      type: control.control_type,
      status: control.status,
      effectiveness: control.effectiveness_score || 0,
      description: control.description
    })) || [];
  } catch (error) {
    console.error('Error fetching controls data:', error);
    return [];
  }
};

const getTableRealData = async (entityType?: string, entityId?: string) => {
  try {
    // This would depend on what table data you want to show
    // For now, let's get recent audits as an example
    const { data: audits, error } = await supabase
      .from('audits')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return audits?.map(audit => ({
      id: audit.id,
      name: audit.name,
      value: 100, // This could be a calculated score or metric
      status: audit.status
    })) || [];
  } catch (error) {
    console.error('Error fetching table data:', error);
    return [];
  }
};

const getChartRealData = async (entityType?: string, entityId?: string) => {
  try {
    // Get monthly audit creation trends for the last 6 months
    const monthlyData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const { count } = await supabase
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      monthlyData.push({
        name: date.toLocaleDateString('tr-TR', { month: 'short' }),
        value: count || 0
      });
    }

    return monthlyData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return [];
  }
};

// Available section types for the palette
const SECTION_TYPES = [
  { type: "text", name: "Text Block", icon: FileText, color: "bg-blue-500" },
  { type: "chart", name: "Chart", icon: BarChart3, color: "bg-green-500" },
  { type: "table", name: "Data Table", icon: Table, color: "bg-purple-500" },
  { type: "kpi", name: "KPI Dashboard", icon: Target, color: "bg-orange-500" },
  { type: "finding", name: "Findings Summary", icon: Search, color: "bg-red-500" },
  { type: "risk", name: "Risk Assessment", icon: AlertTriangle, color: "bg-yellow-500" },
  { type: "control", name: "Control Evaluation", icon: Shield, color: "bg-indigo-500" },
];

// Section palette item
const SectionPaletteItem: React.FC<{
  sectionType: typeof SECTION_TYPES[0];
  onAdd: (type: string) => Promise<void>;
}> = ({ sectionType, onAdd }) => {
  const Icon = sectionType.icon;
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAdd(sectionType.type);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all border-gray-300 hover:border-gray-400 ${sectionType.color} text-white ${isLoading ? 'opacity-50' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      {isLoading ? (
        <RefreshCw className="w-6 h-6 mb-2 animate-spin" />
      ) : (
        <Icon className="w-6 h-6 mb-2" />
      )}
      <div className="text-sm font-medium">{sectionType.name}</div>
    </motion.div>
  );
};

// Individual section component
const SectionComponent: React.FC<SectionComponentProps> = ({
  section,
  onUpdate,
  onDelete,
  dataSources,
  reportTitle,
  entityType,
  entityId,
  t,
}) => {
  const [editingState, setEditingState] = useState<SectionEditingState>({
    isEditing: false,
    editData: section,
    contentHistory: [],
    showHistory: false,
    showSuggestions: false,
    feedback: null,
    isRegenerating: false,
  });

  // Initialize content history when section changes
  useEffect(() => {
    if (section.content && section.ai_generated) {
      const historyEntry: ContentHistoryEntry = {
        id: `history_${Date.now()}`,
        content: section.content,
        timestamp: new Date(),
        type: 'ai_generated',
        metadata: { ai_generated: true }
      };
      setEditingState(prev => ({
        ...prev,
        editData: section,
        contentHistory: [historyEntry]
      }));
    } else {
      setEditingState(prev => ({
        ...prev,
        editData: section
      }));
    }
  }, [section]);

  const handleSave = () => {
    // Add current content to history if it's been modified
    if (editingState.editData.content !== section.content) {
      const historyEntry: ContentHistoryEntry = {
        id: `history_${Date.now()}`,
        content: editingState.editData.content || '',
        timestamp: new Date(),
        type: 'user_edited'
      };
      setEditingState(prev => ({
        ...prev,
        contentHistory: [...prev.contentHistory, historyEntry]
      }));
    }

    onUpdate(editingState.editData);
    setEditingState(prev => ({ ...prev, isEditing: false }));
  };

  const handleCancel = () => {
    setEditingState(prev => ({
      ...prev,
      editData: section,
      isEditing: false
    }));
  };

  const handleRegenerateContent = async () => {
    setEditingState(prev => ({ ...prev, isRegenerating: true }));

    try {
      // Use the existing ReportAIGenerator logic by triggering it programmatically
      const aiGenerator = document.querySelector(`[data-section-id="${section.id}"] .ai-generator-button`);
      if (aiGenerator) {
        (aiGenerator as HTMLElement).click();
      }

      toast.success('Content regeneration initiated');
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast.error('Failed to regenerate content');
    } finally {
      setEditingState(prev => ({ ...prev, isRegenerating: false }));
    }
  };

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    setEditingState(prev => ({ ...prev, feedback }));

    // Log feedback for AI improvement
    console.log(`User feedback for section ${section.id}: ${feedback}`);

    // Reset feedback after 2 seconds
    setTimeout(() => {
      setEditingState(prev => ({ ...prev, feedback: null }));
    }, 2000);

    toast.success(feedback === 'positive' ? 'Thanks for the positive feedback!' : 'Thanks for the feedback, we\'ll improve!');
  };

  const restoreFromHistory = (historyEntry: ContentHistoryEntry) => {
    setEditingState(prev => ({
      ...prev,
      editData: { ...prev.editData, content: historyEntry.content },
      showHistory: false
    }));
    toast.success('Content restored from history');
  };

  const getContentSuggestions = (content: string): string[] => {
    const suggestions = [];

    if (content.length < 50) {
      suggestions.push("Consider adding more detail to make this section more comprehensive");
    }

    if (!content.includes('•') && !content.includes('-')) {
      suggestions.push("Consider using bullet points to improve readability");
    }

    if (content.split('.').length < 3) {
      suggestions.push("Consider breaking down complex ideas into multiple sentences");
    }

    if (section.type === 'kpi' && !content.includes('%') && !content.includes('$') && !content.includes('count')) {
      suggestions.push("KPI sections work best with quantifiable metrics (percentages, counts, amounts)");
    }

    return suggestions;
  };

  const getSectionIcon = (type: string) => {
    const sectionType = SECTION_TYPES.find(st => st.type === type);
    return sectionType ? sectionType.icon : FileText;
  };

  const Icon = getSectionIcon(section.type);

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">{section.name}</h3>
          {section.ai_generated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              {t('reports:aiGenerated')}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingState(prev => ({ ...prev, isEditing: !prev.isEditing }))}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {section.ai_generated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingState(prev => ({ ...prev, showHistory: !prev.showHistory }))}
                  title="Content History"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateContent}
                  disabled={editingState.isRegenerating}
                  title="Regenerate with AI"
                >
                  {editingState.isRegenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('positive')}
                    className={editingState.feedback === 'positive' ? 'text-green-600' : ''}
                    title="Good content"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('negative')}
                    className={editingState.feedback === 'negative' ? 'text-red-600' : ''}
                    title="Needs improvement"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(section.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content History Panel */}
      {editingState.showHistory && editingState.contentHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">Content History</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingState(prev => ({ ...prev, showHistory: false }))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {editingState.contentHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    {entry.type === 'ai_generated' && t('reports:historyAIGenerated')}
                    {entry.type === 'user_edited' && t('reports:historyUserEdited')}
                    {entry.type === 'regenerated' && t('reports:historyRegenerated')}
                    {entry.type === 'original' && t('reports:historyOriginal')}
                    • {entry.timestamp.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700 truncate">
                    {entry.content.substring(0, 100)}...
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restoreFromHistory(entry)}
                >
                  {t('reports:restore')}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {editingState.isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sectionName">{t('reports:sectionName')}</Label>
                <Input
                  id="sectionName"
                  value={editingState.editData.name}
                  onChange={(e) => setEditingState(prev => ({
                    ...prev,
                    editData: { ...prev.editData, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="sectionType">{t('reports:sectionType')}</Label>
                <Select
                  value={editingState.editData.type}
                  onValueChange={(value) => setEditingState(prev => ({
                    ...prev,
                    editData: { ...prev.editData, type: value as any }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((type) => (
                      <SelectItem key={type.type} value={type.type}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="sectionContent">{t('reports:content')}</Label>
              <Textarea
                id="sectionContent"
                value={editingState.editData.content || ""}
                onChange={(e) => setEditingState(prev => ({
                  ...prev,
                  editData: { ...prev.editData, content: e.target.value }
                }))}
                rows={6}
                placeholder={t('reports:contentPlaceholder')}
              />
              {editingState.editData.content && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-amber-800">Suggestions</span>
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {getContentSuggestions(editingState.editData.content).map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataSource">{t('reports:dataSource')}</Label>
                <Select
                  value={editingState.editData.data_source || ""}
                  onValueChange={(value) => setEditingState(prev => ({
                    ...prev,
                    editData: { ...prev.editData, data_source: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports:selectDataSource')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {dataSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aiEnabled"
                  checked={editingState.editData.configuration?.ai_enabled || false}
                  onCheckedChange={(checked) =>
                    setEditingState(prev => ({
                      ...prev,
                      editData: {
                        ...prev.editData,
                        configuration: {
                          ...prev.editData.configuration,
                          ai_enabled: checked,
                        },
                      },
                    }))
                  }
                />
                <Label htmlFor="aiEnabled" className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  {t('reports:enableAIGeneration')}
                </Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                {t('reports:cancel')}
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {t('reports:save')}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="prose prose-sm max-w-none flex-1">
                  {section.content ? (
                    <div className="whitespace-pre-wrap">{section.content}</div>
                  ) : (
                    <div className="text-gray-500 italic">
                      {section.configuration?.ai_enabled
                        ? t('reports:aiWillGenerateContent')
                        : t('reports:clickEditToAddContent')}
                    </div>
                  )}
                </div>
                <ReportAIGenerator
                  section={section}
                  reportData={{
                    title: reportTitle,
                    entity_type: entityType,
                    entity_id: entityId,
                    regulatory_context: {
                      frameworks: ['ISO 27001', 'NIST', 'GDPR'],
                      requirements: [],
                      industry: 'General',
                    },
                  }}
                  onGenerated={(content) => {
                    // Add to content history before updating
                    const historyEntry: ContentHistoryEntry = {
                      id: `history_${Date.now()}`,
                      content: content,
                      timestamp: new Date(),
                      type: 'regenerated',
                      metadata: { previous_content: section.content }
                    };

                    setEditingState(prev => ({
                      ...prev,
                      contentHistory: [...prev.contentHistory, historyEntry]
                    }));

                    onUpdate({
                      ...section,
                      content,
                      ai_generated: true,
                    });
                  }}
                  currentValue={section.content || ""}
                  className="ml-3"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Report Builder Component
const ReportBuilder: React.FC = () => {
   const { t } = useTranslation();
   const { user } = useAuthStore();
  const [reportTitle, setReportTitle] = useState("New Report");
  const [reportDescription, setReportDescription] = useState("");
  const [entityType, setEntityType] = useState<'audit' | 'risk' | 'finding' | 'control' | 'general'>('general');
  const [entityId, setEntityId] = useState<string>('');
  const [selectedEntityData, setSelectedEntityData] = useState<any>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [dataSources, setDataSources] = useState<ReportDataSource[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfig, setAiConfig] = useState<{
    provider: string;
    model: string;
    temperature?: number;
    max_tokens?: number;
  } | null>(null);
  const [integratedData, setIntegratedData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [reportInstanceId, setReportInstanceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Report generation progress tracking
  const {
    jobs: generationJobs,
    addJob,
    updateJob,
    removeJob,
    clearCompletedJobs
  } = useReportGeneration();

  // Load data sources on component mount
  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const sources = await reportDataIntegrationService.getAvailableDataSources();
      setDataSources(sources.map(source => ({
        id: source.id,
        name: source.name,
        type: source.type as any,
        entity_id: undefined,
        filters: {},
        mapping: {}
      })));
    } catch (error) {
      console.error("Error loading data sources:", error);
    }
  };

  const loadIntegratedData = async () => {
    setIsLoadingData(true);
    try {
      const query = {
        entity_type: entityType === 'general' ? undefined : entityType,
        entity_id: entityId || undefined,
        include_related: true,
        aggregation_level: 'detailed' as const
      };

      const data = await reportDataIntegrationService.getIntegratedData(query);
      setIntegratedData(data);
    } catch (error) {
      console.error("Error loading integrated data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const addSection = useCallback(async (type: string) => {
    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      type: type as any,
      configuration: { ai_enabled: false },
      order_index: sections.length,
    };

    // Populate real data based on section type
    try {
      switch (type) {
        case 'kpi':
          newSection.configuration.data = await getKPIRealData(entityType, entityId);
          break;
        case 'finding':
          newSection.configuration.data = await getFindingRealData(entityType, entityId);
          break;
        case 'risk':
          newSection.configuration.data = await getRiskRealData(entityType, entityId);
          break;
        case 'control':
          newSection.configuration.data = await getControlRealData(entityType, entityId);
          break;
        case 'table':
          newSection.configuration.data = await getTableRealData(entityType, entityId);
          break;
        case 'chart':
          newSection.configuration.data = await getChartRealData(entityType, entityId);
          break;
      }
    } catch (error) {
      console.error('Error loading data for section:', error);
      toast.error('Section verisi yüklenirken hata oluştu');
    }

    setSections(prev => [...prev, newSection]);
  }, [sections.length, integratedData, entityType, entityId]);

  const updateSection = useCallback((updatedSection: ReportSection) => {
    setSections(prev =>
      prev.map(section =>
        section.id === updatedSection.id ? updatedSection : section
      )
    );
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  }, []);

  const handleSaveReport = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const reportData = {
        name: reportTitle,
        description: reportDescription,
        template_id: null, // For now, we'll create reports without templates
        parameters: {},
        data_sources: dataSources,
        content: {
          title: reportTitle,
          description: reportDescription,
          entity_type: entityType === 'control' ? 'general' : entityType,
          entity_id: entityId,
          sections: sections
        },
        status: 'draft',
        generation_method: 'manual',
        ai_generated: sections.some(s => s.ai_generated),
        tags: []
      };

      let savedReportId = reportInstanceId;

      if (reportInstanceId) {
        // Update existing report
        const { error } = await supabase
          .from('report_instances')
          .update(reportData)
          .eq('id', reportInstanceId);

        if (error) throw error;

        // Create a new version
        await reportVersionControlService.createReportVersion(
          reportInstanceId,
          reportData.content,
          'Report updated',
          'Manual save'
        );
      } else {
        // Create new report
        const { data: newReport, error } = await supabase
          .from('report_instances')
          .insert([reportData])
          .select()
          .single();

        if (error) throw error;

        savedReportId = newReport.id;
        setReportInstanceId(savedReportId);

        // Create initial version
        if (savedReportId) {
          await reportVersionControlService.createReportVersion(
            savedReportId,
            reportData.content,
            'Initial version',
            'Report creation'
          );
        }
      }

      toast.success(reportInstanceId ? 'Report updated successfully!' : 'Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!user) return;

    // Add job to progress tracking
    const jobId = addJob({
      reportName: reportTitle,
      status: 'pending',
      progress: 0,
      stage: 'Initializing...',
      startTime: new Date(),
      estimatedTime: 120, // 2 minutes estimated
    });

    setIsGenerating(true);

    try {
      // Simulate progress updates
      updateJob(jobId, { status: 'processing', progress: 10, stage: 'Preparing data sources...' });

      await new Promise(resolve => setTimeout(resolve, 1000));
      updateJob(jobId, { progress: 25, stage: 'Analyzing requirements...' });

      await new Promise(resolve => setTimeout(resolve, 1000));
      updateJob(jobId, { progress: 40, stage: 'Generating AI content...' });

      const request: ReportGenerationRequest = {
        title: reportTitle,
        entity_type: entityType === 'control' ? 'general' : entityType,
        entity_id: entityId || undefined,
        sections,
        data_sources: dataSources,
        parameters: {},
        ai_config: aiConfig || undefined,
        regulatory_context: {
          frameworks: ['ISO 27001', 'NIST', 'GDPR'],
          requirements: [],
          industry: 'General',
        },
      };

      updateJob(jobId, { progress: 60, stage: 'Processing report sections...' });
      const response = await reportAIService.generateReport(request);

      if (response.success) {
        updateJob(jobId, { progress: 80, stage: 'Finalizing report...' });

        console.log("Report generated successfully:", response);
        toast.success("Report generated successfully with AI enhancements!");

        // Update sections with AI-generated content
        if (response.content?.sections) {
          setSections(response.content.sections);
        }

        // Complete the job
        updateJob(jobId, {
          status: 'completed',
          progress: 100,
          stage: 'Completed',
          result: {
            previewUrl: '#',
            fileSize: 1024 * 1024, // Mock file size
          }
        });

        // Show preview of generated report
        handlePreviewReport();
      } else {
        console.error("Report generation failed:", response.error);
        updateJob(jobId, {
          status: 'failed',
          progress: 0,
          stage: 'Failed',
          error: response.error || 'Report generation failed'
        });
        toast.error(response.error || "Report generation failed");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      updateJob(jobId, {
        status: 'failed',
        progress: 0,
        stage: 'Failed',
        error: error instanceof Error ? error.message : 'Failed to generate report'
      });
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewReport = () => {
    try {
      // Generate HTML preview content
      const previewHtml = generatePreviewHTML();
      setPreviewContent(previewHtml);
      setShowPreview(true);
      toast.success("Preview generated successfully!");
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'word' | 'powerpoint' | 'html') => {
    if (!user) return;

    setIsExporting(true);
    try {
      const exportData = {
        title: reportTitle,
        description: reportDescription,
        sections: sections.map(section => ({
          id: section.id,
          title: section.name,
          type: section.type,
          content: section.content,
          data: section.configuration?.data,
          ai_generated: section.ai_generated
        })),
        metadata: {
          generatedAt: new Date().toLocaleString(),
          generatedBy: user.first_name + ' ' + user.last_name,
          version: '1.0'
        }
      };

      const exportOptions = {
        format,
        title: reportTitle,
        includeCharts: true,
        includeImages: true,
        pageOrientation: 'portrait' as const,
        fontSize: 12,
        margins: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      };

      const blob = await reportExportService.exportReport(exportData, exportOptions);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportTitle}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePreviewHTML = (): string => {
    const sectionsHtml = sections.map(section => `
      <div class="section">
        <h3 class="section-title">${section.name}</h3>
        ${section.ai_generated ? '<div class="ai-badge">✨ AI Generated</div>' : ''}
        <div class="section-content">
          ${section.content ? section.content.replace(/\n/g, '<br>') : '<em>No content yet</em>'}
        </div>
        ${section.configuration?.data ? generateDataPreview(section) : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview: ${reportTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
          }
          .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1f2937;
          }
          .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .metadata {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #6b7280;
          }
          .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          .section-content {
            margin-bottom: 15px;
          }
          .ai-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 10px;
          }
          .data-preview {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${reportTitle}</div>
          ${reportDescription ? `<div class="description">${reportDescription}</div>` : ''}
          <div class="metadata">
            <span>Entity: ${entityType === 'general' ? 'General Report' : entityType}</span>
            <span>Sections: ${sections.length}</span>
            <span>Generated: ${new Date().toLocaleString()}</span>
          </div>
        </div>

        ${sectionsHtml}

        <div class="section">
          <div style="text-align: center; color: #6b7280; font-style: italic;">
            This is a preview of your report. Use the export button to download in various formats.
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateDataPreview = (section: ReportSection): string => {
    if (!section.configuration?.data) return '';

    try {
      return `<div class="data-preview">${JSON.stringify(section.configuration.data, null, 2)}</div>`;
    } catch {
      return '<div class="data-preview">Complex data structure</div>';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reports.reportBuilder')}</h1>
           <p className="text-gray-600">
             {t('reports.reportBuilderDescription')}
           </p>
        </div>

        {/* Entity Selection & Configuration */}
        <div className="mb-8">
          <ReportEntitySelector
            onEntitySelected={(selection) => {
              setSelectedEntityData(selection);
              setEntityType(selection.entityType);
              setEntityId(selection.entityId);

              // Auto-populate report title and description based on selected entity
              if (selection.entityData.title || selection.entityData.name) {
                setReportTitle(`${selection.entityData.title || selection.entityData.name} Report`);
              }
              if (selection.entityData.description) {
                setReportDescription(selection.entityData.description);
              }

              // Auto-populate findings and risks if available
              if (selection.relatedFindings.length > 0 || selection.relatedRisks.length > 0) {
                // Add finding sections for related findings
                const newSections = [...sections];
                selection.relatedFindings.forEach((finding, index) => {
                  newSections.push({
                    id: `finding_${finding.id}_${index}`,
                    name: `Finding: ${finding.title}`,
                    type: 'finding',
                    configuration: {
                      ai_enabled: false,
                      data: finding,
                    },
                    order_index: newSections.length,
                  });
                });

                // Add risk sections for related risks
                selection.relatedRisks.forEach((risk, index) => {
                  newSections.push({
                    id: `risk_${risk.id}_${index}`,
                    name: `Risk: ${risk.title}`,
                    type: 'risk',
                    configuration: {
                      ai_enabled: false,
                      data: risk,
                    },
                    order_index: newSections.length,
                  });
                });

                setSections(newSections);
              }
            }}
            selectedEntity={selectedEntityData}
          />

          {/* Report Title & Description */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {t('reports:reportDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reportTitle">{t('reports:reportTitle')} *</Label>
                  <Input
                    id="reportTitle"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder={t('reports:reportTitlePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="reportDescription">{t('reports:description')} ({t('common:optional')})</Label>
                  <Textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder={t('reports:descriptionPlaceholder')}
                    rows={2}
                  />
                </div>
              </div>

              {selectedEntityData && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">{t('reports:selectedEntitySummary')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">{t('reports:entity')}:</span>
                      <span className="ml-2 text-blue-600">
                        {selectedEntityData.entityData.title || selectedEntityData.entityData.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">{t('reports:type')}:</span>
                      <span className="ml-2 text-blue-600 capitalize">
                        {selectedEntityData.entityType}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">{t('reports:status')}:</span>
                      <span className="ml-2 text-blue-600">
                        {selectedEntityData.entityData.status || t('common:unknown')}
                      </span>
                    </div>
                  </div>
                  {selectedEntityData.relatedFindings.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-blue-700">{t('reports:relatedFindings')}:</span>
                      <span className="ml-2 text-blue-600">
                        {selectedEntityData.relatedFindings.length} items
                      </span>
                    </div>
                  )}
                  {selectedEntityData.relatedRisks.length > 0 && (
                    <div className="mt-1">
                      <span className="font-medium text-blue-700">{t('reports:relatedRisks')}:</span>
                      <span className="ml-2 text-blue-600">
                        {selectedEntityData.relatedRisks.length} items
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Section Palette */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('reports:sectionPalette')}</CardTitle>
                <p className="text-sm text-gray-600">
                  {t('reports:sectionPaletteDescription')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SECTION_TYPES.map((sectionType) => (
                    <SectionPaletteItem
                      key={sectionType.type}
                      sectionType={sectionType}
                      onAdd={addSection}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('reports:reportCanvas')}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerateReport}
                      disabled={isGenerating || sections.length === 0}
                    >
                      {isGenerating ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-spin" />
                          {t('reports:generating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t('reports:generateWithAI')}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handlePreviewReport}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('reports:preview')}
                    </Button>
                    <Button variant="outline" onClick={handleSaveReport} disabled={isSaving}>
                      {isSaving ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? t('reports:saving') : t('reports:save')}
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const exportMenu = document.getElementById('export-menu');
                          if (exportMenu) {
                            exportMenu.classList.toggle('hidden');
                          }
                        }}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {isExporting ? t('reports:exporting') : t('reports:export')}
                      </Button>
                      <div
                        id="export-menu"
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border hidden z-10"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleExportReport('pdf')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('reports:exportAsPDF')}
                          </button>
                          <button
                            onClick={() => handleExportReport('excel')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('reports:exportAsExcel')}
                          </button>
                          <button
                            onClick={() => handleExportReport('word')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('reports:exportAsWord')}
                          </button>
                          <button
                            onClick={() => handleExportReport('powerpoint')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('reports:exportAsPowerPoint')}
                          </button>
                          <button
                            onClick={() => handleExportReport('html')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('reports:exportAsHTML')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('reports:noSectionsAdded')}
                    </h3>
                    <p className="text-gray-600">
                      {t('reports:noSectionsDescription')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <SectionComponent
                        key={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onDelete={deleteSection}
                        dataSources={dataSources}
                        reportTitle={reportTitle}
                        entityType={entityType}
                        entityId={entityId}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Generation Progress */}
          <ReportGenerationProgress
            jobs={generationJobs}
            onJobComplete={(job) => {
              console.log('Job completed:', job);
              toast.success(t('reports:jobCompleted', { reportName: job.reportName }));
            }}
            onJobFailed={(job) => {
              console.log('Job failed:', job);
              toast.error(t('reports:jobFailed', { reportName: job.reportName, error: job.error }));
            }}
            onCancelJob={(jobId) => {
              removeJob(jobId);
              toast(t('reports:jobCancelled'));
            }}
          />

          {/* Collaboration Panel */}
          <div className="lg:col-span-2">
            <ReportCollaborationPanel
              reportId={reportInstanceId || "temp-report-id"}
              reportTitle={reportTitle}
              onUpdate={() => {
                // Refresh report data when collaboration changes
                console.log('Report updated from collaboration');
              }}
            />

            {/* Version Control */}
            <div className="mt-6">
              <ReportVersionControl
                entityId={reportInstanceId || "temp-report-id"}
                entityType="report"
                currentContent={{
                  title: reportTitle,
                  description: reportDescription,
                  entity_type: entityType,
                  entity_id: entityId,
                  sections: sections
                }}
                onRestore={(versionContent) => {
                  // Handle version restoration - update the report with the restored content
                  if (versionContent.title) setReportTitle(versionContent.title);
                  if (versionContent.description) setReportDescription(versionContent.description);
                  if (versionContent.entity_type) setEntityType(versionContent.entity_type);
                  if (versionContent.entity_id) setEntityId(versionContent.entity_id);
                  if (versionContent.sections) setSections(versionContent.sections);
                  toast.success(t('reports:versionRestoredSuccessfully'));
                }}
                onUpdate={() => {
                  // Refresh report data when version changes
                  console.log('Report updated from version control');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              {t('reports:preview')}: {reportTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewContent && (
              <iframe
                srcDoc={previewContent}
                className="w-full h-[60vh] border rounded-lg"
                title={t('reports:preview')}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportBuilder;