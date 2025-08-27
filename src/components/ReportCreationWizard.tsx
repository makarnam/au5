import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   ChevronLeft,
   ChevronRight,
   FileText,
   Shield,
   AlertTriangle,
   Search,
   CheckCircle,
   Sparkles,
   Save,
   Eye,
   Target,
   X,
   Filter,
   XCircle,
 } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ReportSectionRenderer } from "./ReportSectionRenderer";

import { reportAIService, ReportSection } from "../services/reportAIService";
import { aiService } from "../services/aiService";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

// Wizard step types
type WizardStep = 'audit-selection' | 'executive-summary' | 'control-sets' | 'risk-assessment' | 'findings-selection' | 'final-report';

// Data interfaces
interface Audit {
  id: string;
  title: string;
  description: string;
  status: string;
  business_unit: string;
  audit_type: string;
  start_date: string;
  end_date: string;
}

interface ControlSet {
  id: string;
  name: string;
  description: string;
  controls: Control[];
}

interface Control {
  id: string;
  title: string;
  description: string;
  control_type: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  type?: string; // Optional for compatibility
  effectiveness?: number; // Optional for compatibility
  control_code?: string;
}

interface Risk {
  id: string;
  title: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  risk_level: string;
  impact?: string; // Optional since it may not exist in database
  likelihood?: string; // Optional since it may not exist in database
  status: string;
  description: string;
  business_unit?: string; // Enriched field
  owner?: string; // Enriched field
  business_unit_id?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface Finding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  description: string;
  category: string;
  audit_title?: string;
}

interface WizardData {
  selectedAudit: Audit | null;
  executiveSummary: string;
  selectedControlSets: ControlSet[];
  selectedRisks: Risk[];
  selectedFindings: Finding[];
  finalReport: ReportSection[];
  reportTitle: string;
  reportDescription: string;
}

const ReportCreationWizard: React.FC = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<WizardStep>('audit-selection');
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedAudit: null,
    executiveSummary: '',
    selectedControlSets: [],
    selectedRisks: [],
    selectedFindings: [],
    finalReport: [],
    reportTitle: '',
    reportDescription: ''
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Data states
  const [audits, setAudits] = useState<Audit[]>([]);
  const [controlSets, setControlSets] = useState<ControlSet[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);

  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Search and filter states
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');

  const [controlSetSearch, setControlSetSearch] = useState('');
  const [controlSetTypeFilter, setControlSetTypeFilter] = useState<string>('all');

  const [riskSearch, setRiskSearch] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');

  const [findingSearch, setFindingSearch] = useState('');
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<string>('all');

  // Wizard steps configuration
  const steps = [
    { id: 'audit-selection', title: 'Denetim Seçimi', icon: Search },
    { id: 'executive-summary', title: 'Yönetim Özeti', icon: FileText },
    { id: 'control-sets', title: 'Kontrol Setleri', icon: Shield },
    { id: 'risk-assessment', title: 'Risk Değerlendirmesi', icon: AlertTriangle },
    { id: 'findings-selection', title: 'Bulgular', icon: Target },
    { id: 'final-report', title: 'Final Rapor', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Load initial data
  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error('Error loading audits:', error);
      toast.error('Denetimler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedData = async (auditId: string) => {
    setIsLoading(true);
    try {
      // First, check if control sets are already defined for this audit
      const { data: auditControlSets, error: auditControlSetsError } = await supabase
        .from('control_sets')
        .select(`
          id,
          name,
          description,
          framework,
          controls_count,
          ai_generated,
          created_at,
          controls (
            id,
            control_code,
            title,
            description,
            control_type,
            effectiveness,
            created_at
          )
        `)
        .eq('audit_id', auditId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (auditControlSetsError) {
        console.error('Error loading audit control sets:', auditControlSetsError);
      } else if (auditControlSets && auditControlSets.length > 0) {
        // If control sets exist for this audit, use them
        const formattedControlSets: ControlSet[] = auditControlSets.map(cs => ({
          id: cs.id,
          name: cs.name,
          description: cs.description,
          controls: (cs.controls || []).map(control => ({
            id: control.id,
            title: control.title,
            description: control.description,
            control_type: control.control_type,
            type: control.control_type,
            effectiveness: control.effectiveness || 85,
            status: 'effective',
            created_at: control.created_at
          }))
        }));
        setControlSets(formattedControlSets);
        console.log('Loaded audit-specific control sets:', formattedControlSets.length);
      } else {
        // If no control sets exist for this audit, load available control sets from pool
        console.log('No audit-specific control sets found, loading from pool...');
        await loadAvailableControlSets();
      }

      // Load risks (handle missing related tables gracefully)
      let riskQuery = supabase
        .from('risks')
        .select('id, title, description, status, risk_level, business_unit_id, owner_id, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(20);

      // If audit has a business unit, try to filter risks by it
      const audit = wizardData.selectedAudit;
      if (audit && (audit as any).business_unit_id) {
        try {
          riskQuery = riskQuery.eq('business_unit_id', (audit as any).business_unit_id);
        } catch (error) {
          // business_unit_id column might not exist, continue without filter
          console.log('business_unit_id column not available in risks table');
        }
      }

      const { data: riskData, error: riskError } = await riskQuery;

      if (riskError) {
        console.error('Error loading risks:', riskError);
        setRisks([]); // Set empty array if risks don't exist
      } else {
        // Enrich risk data with business unit and owner info (with error handling)
        const enrichedRisks = await Promise.all(
          (riskData || []).map(async (risk) => {
            let businessUnitName = 'Unknown';
            let ownerName = 'Unknown';

            // Try to get business unit info
            try {
              if (risk.business_unit_id) {
                const { data: businessUnit } = await supabase
                  .from('business_units')
                  .select('name')
                  .eq('id', risk.business_unit_id)
                  .single();
                businessUnitName = businessUnit?.name || 'Unknown';
              }
            } catch (error) {
              // business_units table might not exist or be accessible
              console.log('business_units table not available');
            }

            // Try to get owner info
            try {
              if (risk.owner_id) {
                const { data: owner } = await supabase
                  .from('users')
                  .select('first_name, last_name')
                  .eq('id', risk.owner_id)
                  .single();
                ownerName = owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown';
              }
            } catch (error) {
              // users table might not exist or be accessible
              console.log('users table not available');
            }

            return {
              ...risk,
              business_unit: businessUnitName,
              owner: ownerName,
              level: (risk.risk_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
              risk_level: risk.risk_level || 'medium',
              impact: 'Medium', // Default value since column may not exist
              likelihood: 'Medium', // Default value since column may not exist
            };
          })
        );
        setRisks(enrichedRisks);
      }

      // Load findings related to audit (handle missing tables gracefully)
      const { data: findingData, error: findingError } = await supabase
        .from('findings')
        .select('id, title, description, status, severity, audit_id, created_at, updated_at')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (findingError) {
        console.error('Error loading findings:', findingError);
        setFindings([]); // Set empty array if findings don't exist
      } else {
        // Enrich finding data with audit title (handle missing audits table)
        const enrichedFindings = await Promise.all(
          (findingData || []).map(async (finding) => {
            let auditTitle = 'Unknown Audit';

            try {
              const { data: audit } = await supabase
                .from('audits')
                .select('title')
                .eq('id', finding.audit_id)
                .single();
              auditTitle = audit?.title || 'Unknown Audit';
            } catch (error) {
              // audits table might not exist or be accessible
              console.log('audits table not available for findings enrichment');
            }

            return {
              ...finding,
              audit_title: auditTitle,
              category: finding.severity || 'General', // Use severity as category if no category field
              severity: finding.severity || 'medium'
            };
          })
        );
        setFindings(enrichedFindings);
      }

    } catch (error) {
      console.error('Error loading related data:', error);
      toast.error('İlgili veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableControlSets = async () => {
    try {
      // Load control sets from pool (those not assigned to any audit)
      const { data: availableControlSets, error: controlSetsError } = await supabase
        .from('control_sets')
        .select(`
          id,
          name,
          description,
          framework,
          controls_count,
          ai_generated,
          created_at,
          controls (
            id,
            control_code,
            title,
            description,
            control_type,
            effectiveness,
            created_at
          )
        `)
        .is('audit_id', null)
        .eq('is_deleted', false)
        .order('name');

      if (controlSetsError) {
        console.error('Error loading available control sets:', controlSetsError);
        toast.error('Kontrol setleri yüklenirken hata oluştu');
        return;
      }

      if (availableControlSets && availableControlSets.length > 0) {
        const formattedControlSets: ControlSet[] = availableControlSets.map(cs => ({
          id: cs.id,
          name: cs.name,
          description: cs.description,
          controls: (cs.controls || []).map(control => ({
            id: control.id,
            title: control.title,
            description: control.description,
            control_type: control.control_type,
            type: control.control_type,
            effectiveness: control.effectiveness || 85,
            status: 'effective',
            created_at: control.created_at,
            control_code: control.control_code
          }))
        }));
        setControlSets(formattedControlSets);
        console.log('Loaded available control sets from pool:', formattedControlSets.length);
      } else {
        // If no control sets in pool, create a general one with all controls
        await loadGeneralControls();
      }
    } catch (error) {
      console.error('Error loading available control sets:', error);
      toast.error('Kontrol setleri yüklenirken hata oluştu');
    }
  };

  const loadGeneralControls = async () => {
    try {
      const { data: controlData, error: controlError } = await supabase
        .from('controls')
        .select('id, control_code, title, description, control_type, effectiveness, created_at')
        .eq('is_deleted', false)
        .order('control_code')
        .limit(50);

      if (controlError) {
        console.error('Error loading controls:', controlError);
        setControlSets([]);
        return;
      }

      const generalControlSet: ControlSet = {
        id: 'general-controls',
        name: 'Genel Kontroller',
        description: 'Mevcut tüm kontroller',
        controls: (controlData || []).map(control => ({
          id: control.id,
          title: control.title,
          description: control.description,
          control_type: control.control_type,
          type: control.control_type,
          effectiveness: control.effectiveness || 85,
          status: 'effective',
          created_at: control.created_at,
          control_code: control.control_code
        }))
      };

      setControlSets([generalControlSet]);
      console.log('Loaded general controls:', generalControlSet.controls.length);
    } catch (error) {
      console.error('Error loading general controls:', error);
      setControlSets([]);
    }
  };

  const handleAuditSelection = (audit: Audit) => {
    setWizardData(prev => ({
      ...prev,
      selectedAudit: audit,
      reportTitle: `${audit.title} - Denetim Raporu`,
      reportDescription: audit.description
    }));
    loadRelatedData(audit.id);
    setCurrentStep('executive-summary');
  };

  const generateExecutiveSummary = async () => {
    if (!wizardData.selectedAudit) return;

    setIsGenerating(true);
    try {
      // Get available AI configurations
      console.log('Loading AI configurations...');
      const configurations = await aiService.getConfigurations();
      console.log('Available configurations:', configurations);

      const activeConfig = configurations.find(config => config.is_active) || configurations[0];
      console.log('Selected configuration:', activeConfig);

      if (!activeConfig) {
        throw new Error('No AI configuration found. Please configure AI settings first.');
      }

      // Check if this provider requires an API key
      const providers = aiService.getProviders();
      const providerInfo = providers.find(p => p.id === activeConfig.provider);
      console.log('Provider info:', providerInfo);

      if (providerInfo?.requiresApiKey && !activeConfig.api_key) {
        throw new Error(`${providerInfo.name} için API anahtarı gerekli. Lütfen AI ayarlarını kontrol edin.`);
      }

      if (!providerInfo?.requiresApiKey) {
        // For providers that don't require API keys (like Ollama), set a dummy value
        activeConfig.api_key = 'ollama-local';
        console.log('Set dummy API key for local provider:', activeConfig.provider);
      }

      const request = {
        provider: activeConfig.provider,
        model: activeConfig.model_name,
        prompt: '',
        context: `Generate an executive summary for the audit: ${wizardData.selectedAudit.title}. Description: ${wizardData.selectedAudit.description}`,
        fieldType: 'executive_summary' as any,
        auditData: {
          title: wizardData.selectedAudit.title,
          audit_type: wizardData.selectedAudit.audit_type,
          business_unit: wizardData.selectedAudit.business_unit,
          scope: wizardData.selectedAudit.description,
        },
        temperature: activeConfig.temperature,
        maxTokens: activeConfig.max_tokens,
        apiKey: activeConfig.api_key,
        baseUrl: activeConfig.api_endpoint,
      };

      console.log('AI Generation Request:', request);

      // For Ollama, check server status first
      if (activeConfig.provider === 'ollama') {
        console.log('Checking Ollama status...');
        try {
          const ollamaStatus = await aiService.checkOllamaStatus(activeConfig.api_endpoint || 'http://localhost:11434');
          console.log('Ollama status:', ollamaStatus);

          if (!ollamaStatus.isRunning) {
            throw new Error(`Ollama sunucusu çalışmıyor. Lütfen "ollama serve" komutunu çalıştırın.`);
          }

          if (!ollamaStatus.availableModels.includes(activeConfig.model_name)) {
            throw new Error(`Model "${activeConfig.model_name}" mevcut değil. Lütfen "ollama pull ${activeConfig.model_name}" komutunu çalıştırın.`);
          }
        } catch (statusError) {
          console.error('Ollama status check error:', statusError);
          const errorMessage = statusError instanceof Error ? statusError.message : 'Unknown error';
          throw new Error(`Ollama bağlantı hatası: ${errorMessage}`);
        }
      }

      const response = await aiService.generateContent(request);
      console.log('AI Generation Response:', response);
      console.log('Response success:', response.success);
      console.log('Response error:', response.error);
      console.log('Raw response content:', JSON.stringify(response.content));

      if (response.success) {
        const content = Array.isArray(response.content)
          ? response.content.join('\n')
          : response.content;

        console.log('Processed content:', content);
        console.log('Content length:', content.length);
        console.log('Content type:', typeof content);

        if (!content || content.trim() === '') {
          console.error('Empty content detected. Full response:', response);
          throw new Error('AI servisi boş içerik döndürdü. Lütfen Ollama yapılandırmasını ve model kullanılabilirliğini kontrol edin.');
        }

        setWizardData(prev => ({
          ...prev,
          executiveSummary: content
        }));

        // Force re-render by updating the state again after a short delay
        setTimeout(() => {
          setWizardData(prev => ({
            ...prev,
            executiveSummary: content
          }));
        }, 100);

        toast.success('Yönetim özeti başarıyla oluşturuldu!');
      } else {
        console.error('AI service returned error:', response.error);
        throw new Error(response.error || 'AI generation failed');
      }
    } catch (error) {
      console.error('Error generating executive summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Yönetim özeti oluşturulurken hata oluştu: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleControlSet = (controlSet: ControlSet, checked: boolean) => {
    setWizardData(prev => ({
      ...prev,
      selectedControlSets: checked
        ? [...prev.selectedControlSets, controlSet]
        : prev.selectedControlSets.filter(cs => cs.id !== controlSet.id)
    }));
  };

  const toggleRisk = (risk: Risk, checked: boolean) => {
    setWizardData(prev => ({
      ...prev,
      selectedRisks: checked
        ? [...prev.selectedRisks, risk]
        : prev.selectedRisks.filter(r => r.id !== risk.id)
    }));
  };

  const toggleFinding = (finding: Finding, checked: boolean) => {
    setWizardData(prev => ({
      ...prev,
      selectedFindings: checked
        ? [...prev.selectedFindings, finding]
        : prev.selectedFindings.filter(f => f.id !== finding.id)
    }));
  };

  const generateFinalReport = async () => {
    setIsGenerating(true);
    try {
      const sections: ReportSection[] = [];

      // Executive Summary Section
      if (wizardData.executiveSummary) {
        sections.push({
          id: 'executive-summary',
          name: 'Yönetim Özeti',
          type: 'text',
          content: wizardData.executiveSummary,
          ai_generated: true,
          configuration: { ai_enabled: false },
          order_index: 0
        });
      }

      // Control Sets Section
      if (wizardData.selectedControlSets.length > 0) {
        const controlContent = wizardData.selectedControlSets
          .map(cs => `## ${cs.name}\n${cs.description}\n\n${cs.controls.map(c => `- **${c.title}**: ${c.description}`).join('\n')}`)
          .join('\n\n---\n\n');

        sections.push({
          id: 'control-sets',
          name: 'Kontrol Setleri ve Kontroller',
          type: 'text',
          content: controlContent,
          ai_generated: false,
          configuration: { ai_enabled: false },
          order_index: 1
        });
      }

      // Risk Assessment Section
      if (wizardData.selectedRisks.length > 0) {
        // Create enhanced risk visualization content
        const riskContent = `# Risk Değerlendirmesi

Bu bölümde denetim süreci boyunca tespit edilen riskler detaylı bir şekilde sunulmuştur.

## Risk Özeti
Toplam ${wizardData.selectedRisks.length} risk tespit edilmiştir.

${wizardData.selectedRisks.map((risk, index) => {
  const severity = risk.level.toUpperCase();
  const impact = risk.impact || 'Orta';
  const likelihood = risk.likelihood || 'Orta';

  return `### Risk ${index + 1}: ${risk.title}
- **Risk Seviyesi**: ${severity}
- **Etki**: ${impact}
- **Olasılık**: ${likelihood}
- **Durum**: ${risk.status}
- **Açıklama**: ${risk.description}
- **İş Birimi**: ${risk.business_unit || 'N/A'}
- **Sahibi**: ${risk.owner || 'N/A'}`;
}).join('\n\n')}

## Risk Seviyesi Dağılımı
${wizardData.selectedRisks.reduce((acc: any, risk) => {
  acc[risk.level] = (acc[risk.level] || 0) + 1;
  return acc;
}, {})}

## Öneriler
Risklerin etkili yönetimi için aşağıdaki önlemler önerilir:
1. Yüksek seviyeli risklerin öncelikli olarak ele alınması
2. Risk azaltma planlarının hazırlanması
3. Düzenli risk gözden geçirme toplantılarının yapılması
4. Risk göstergelerinin takibi ve raporlanması`;

        sections.push({
          id: 'risk-assessment',
          name: 'Risk Değerlendirmesi',
          type: 'risk',
          content: riskContent,
          ai_generated: false,
          configuration: {
            ai_enabled: false,
            data: wizardData.selectedRisks,
            visualization: 'enhanced',
            showTable: true,
            showNumbers: true
          },
          order_index: 2
        });
      }

      // Findings Section
      if (wizardData.selectedFindings.length > 0) {
        // Create enhanced findings visualization content
        const findingsContent = `# Bulgular

Bu bölümde denetim süreci boyunca tespit edilen bulgular detaylı bir şekilde sunulmuştur.

## Bulgu Özeti
Toplam ${wizardData.selectedFindings.length} bulgu tespit edilmiştir.

${wizardData.selectedFindings.map((finding, index) => {
  const severity = finding.severity.toUpperCase();
  const findingNumber = `F-${(index + 1).toString().padStart(3, '0')}`;

  return `### ${findingNumber}: ${finding.title}
- **Şiddet**: ${severity}
- **Kategori**: ${finding.category}
- **Durum**: ${finding.status}
- **Açıklama**: ${finding.description}
- **İlgili Denetim**: ${finding.audit_title || 'N/A'}`;
}).join('\n\n')}

## Bulgulara Göre Aksiyon Planı

### Kritik Bulgular
${wizardData.selectedFindings
  .filter(f => f.severity === 'critical')
  .map(f => `- ${f.title} (Hemen müdahale gerekli)`)
  .join('\n') || 'Kritik bulgu bulunmamaktadır.'}

### Yüksek Şiddet Bulgular
${wizardData.selectedFindings
  .filter(f => f.severity === 'high')
  .map(f => `- ${f.title} (Bir hafta içinde müdahale)`)
  .join('\n') || 'Yüksek şiddet bulgu bulunmamaktadır.'}

### Orta Şiddet Bulgular
${wizardData.selectedFindings
  .filter(f => f.severity === 'medium')
  .map(f => `- ${f.title} (Bir ay içinde müdahale)`)
  .join('\n') || 'Orta şiddet bulgu bulunmamaktadır.'}

### Düşük Şiddet Bulgular
${wizardData.selectedFindings
  .filter(f => f.severity === 'low')
  .map(f => `- ${f.title} (Planlanan iyileştirmeler)`)
  .join('\n') || 'Düşük şiddet bulgu bulunmamaktadır.'}

## Genel Değerlendirme
Bulgu sayısı ve şiddet seviyesi göz önüne alındığında, organizasyonun risk yönetimi ve kontrol ortamı ${wizardData.selectedFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length > 0 ? 'iyileştirme gerektirmektedir' : 'genel olarak tatmin edicidir'}.`;

        sections.push({
          id: 'findings',
          name: 'Bulgular',
          type: 'finding',
          content: findingsContent,
          ai_generated: false,
          configuration: {
            ai_enabled: false,
            data: wizardData.selectedFindings,
            visualization: 'enhanced',
            showTable: true,
            showNumbers: true
          },
          order_index: 3
        });
      }

      setWizardData(prev => ({
        ...prev,
        finalReport: sections
      }));

      setCurrentStep('final-report');
      toast.success('Final rapor başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error generating final report:', error);
      toast.error('Final rapor oluşturulurken hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReport = async () => {
    if (!user || !wizardData.selectedAudit) return;

    setIsSaving(true);
    try {
      const reportData = {
        name: wizardData.reportTitle,
        description: wizardData.reportDescription,
        template_id: null,
        parameters: {},
        data_sources: [],
        content: {
          title: wizardData.reportTitle,
          description: wizardData.reportDescription,
          entity_type: 'audit',
          entity_id: wizardData.selectedAudit.id,
          sections: wizardData.finalReport
        },
        status: 'draft',
        generation_method: 'wizard',
        ai_generated: wizardData.finalReport.some(s => s.ai_generated),
        tags: ['wizard-generated', 'audit-report']
      };

      const { error } = await supabase
        .from('report_instances')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Rapor başarıyla kaydedildi!');
      // Redirect to report builder or show success message
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Rapor kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as WizardStep);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as WizardStep);
    }
  };

  // Filtering functions
  const getFilteredAudits = () => {
    return audits.filter(audit => {
      const matchesSearch = audit.title?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                           audit.description?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                           (audit.business_unit || '').toLowerCase().includes(auditSearch.toLowerCase());

      const matchesStatus = auditStatusFilter === 'all' || audit.status === auditStatusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredControlSets = () => {
    return controlSets.filter(controlSet => {
      const matchesSearch = controlSet.name.toLowerCase().includes(controlSetSearch.toLowerCase()) ||
                           controlSet.description.toLowerCase().includes(controlSetSearch.toLowerCase());

      const matchesType = controlSetTypeFilter === 'all' ||
                         (controlSetTypeFilter === 'audit-specific' && controlSet.id !== 'general-controls') ||
                         (controlSetTypeFilter === 'general' && controlSet.id === 'general-controls');

      return matchesSearch && matchesType;
    });
  };

  const getFilteredRisks = () => {
    return risks.filter(risk => {
      const matchesSearch = risk.title?.toLowerCase().includes(riskSearch.toLowerCase()) ||
                           risk.description?.toLowerCase().includes(riskSearch.toLowerCase()) ||
                           (risk.business_unit || '').toLowerCase().includes(riskSearch.toLowerCase());

      const matchesLevel = riskLevelFilter === 'all' || risk.level === riskLevelFilter;

      return matchesSearch && matchesLevel;
    });
  };

  const getFilteredFindings = () => {
    return findings.filter(finding => {
      const matchesSearch = finding.title?.toLowerCase().includes(findingSearch.toLowerCase()) ||
                           finding.description?.toLowerCase().includes(findingSearch.toLowerCase()) ||
                           (finding.audit_title || '').toLowerCase().includes(findingSearch.toLowerCase());

      const matchesSeverity = findingSeverityFilter === 'all' || finding.severity === findingSeverityFilter;

      return matchesSearch && matchesSeverity;
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'audit-selection':
        return wizardData.selectedAudit !== null;
      case 'executive-summary':
        return wizardData.executiveSummary.trim() !== '';
      case 'control-sets':
        return true; // Optional step
      case 'risk-assessment':
        return true; // Optional step
      case 'findings-selection':
        return true; // Optional step
      case 'final-report':
        return wizardData.finalReport.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full mr-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Denetim Raporu Oluşturma Sihirbazı</h1>
          </motion.div>
          <p className="text-gray-600 text-lg">
            Adım adım profesyonel denetim raporları oluşturun
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Adım {currentStepIndex + 1} / {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {steps[currentStepIndex].title}
              </span>
            </div>
            <Progress value={progress} className="w-full" />

            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${
                      isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'audit-selection' && (
              <AuditSelectionStep
                audits={audits}
                selectedAudit={wizardData.selectedAudit}
                onSelectAudit={handleAuditSelection}
                isLoading={isLoading}
                searchTerm={auditSearch}
                onSearchChange={setAuditSearch}
                statusFilter={auditStatusFilter}
                onStatusFilterChange={setAuditStatusFilter}
              />
            )}

            {currentStep === 'executive-summary' && (
              <ExecutiveSummaryStep
                audit={wizardData.selectedAudit!}
                executiveSummary={wizardData.executiveSummary}
                onSummaryChange={(summary) => setWizardData(prev => ({ ...prev, executiveSummary: summary }))}
                onGenerate={generateExecutiveSummary}
                isGenerating={isGenerating}
              />
            )}

            {currentStep === 'control-sets' && (
              <ControlSetsStep
                controlSets={controlSets}
                selectedControlSets={wizardData.selectedControlSets}
                onToggleControlSet={toggleControlSet}
                isLoading={isLoading}
                selectedAudit={wizardData.selectedAudit}
                searchTerm={controlSetSearch}
                onSearchChange={setControlSetSearch}
                typeFilter={controlSetTypeFilter}
                onTypeFilterChange={setControlSetTypeFilter}
              />
            )}

            {currentStep === 'risk-assessment' && (
              <RiskAssessmentStep
                risks={risks}
                selectedRisks={wizardData.selectedRisks}
                onToggleRisk={toggleRisk}
                isLoading={isLoading}
                searchTerm={riskSearch}
                onSearchChange={setRiskSearch}
                levelFilter={riskLevelFilter}
                onLevelFilterChange={setRiskLevelFilter}
              />
            )}

            {currentStep === 'findings-selection' && (
              <FindingsSelectionStep
                findings={findings}
                selectedFindings={wizardData.selectedFindings}
                onToggleFinding={toggleFinding}
                isLoading={isLoading}
                searchTerm={findingSearch}
                onSearchChange={setFindingSearch}
                severityFilter={findingSeverityFilter}
                onSeverityFilterChange={setFindingSeverityFilter}
              />
            )}

            {currentStep === 'final-report' && (
              <FinalReportStep
                reportTitle={wizardData.reportTitle}
                reportDescription={wizardData.reportDescription}
                sections={wizardData.finalReport}
                onTitleChange={(title) => setWizardData(prev => ({ ...prev, reportTitle: title }))}
                onDescriptionChange={(desc) => setWizardData(prev => ({ ...prev, reportDescription: desc }))}
                onGenerateReport={generateFinalReport}
                isGenerating={isGenerating}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Önceki
          </Button>

          <div className="flex space-x-3">
            {currentStep === 'final-report' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Önizleme
                </Button>
                <Button
                  onClick={saveReport}
                  disabled={isSaving}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    'Kaydediliyor...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Raporu Kaydet
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center"
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Rapor Önizlemesi: {wizardData.reportTitle}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-white p-6 rounded-lg border max-h-[60vh] overflow-y-auto">
              <h1 className="text-2xl font-bold mb-4">{wizardData.reportTitle}</h1>
              {wizardData.reportDescription && (
                <p className="text-gray-600 mb-6">{wizardData.reportDescription}</p>
              )}

              {wizardData.finalReport.map((section) => (
                <ReportSectionRenderer key={section.id} section={section} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Step Components
const AuditSelectionStep: React.FC<{
  audits: Audit[];
  selectedAudit: Audit | null;
  onSelectAudit: (audit: Audit) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}> = ({ audits, selectedAudit, onSelectAudit, isLoading, searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => {
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (audit.business_unit || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2 text-blue-600" />
          Denetim Seçimi
        </CardTitle>
        <p className="text-gray-600">
          Rapor oluşturmak istediğiniz denetimi seçin
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Denetim ara... (başlık, açıklama, birim)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="planned">Planlandı</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {searchTerm && (
                  <span>Ara: "{searchTerm}"</span>
                )}
                {statusFilter !== 'all' && (
                  <span>Durum: {statusFilter}</span>
                )}
                <span className="text-gray-500">
                  ({filteredAudits.length} / {audits.length} denetim)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onStatusFilterChange('all');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Denetimler yükleniyor...</p>
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {audits.length === 0 ? 'Henüz hiç denetim bulunmuyor.' : 'Arama kriterlerinize uygun denetim bulunamadı.'}
            </p>
            {audits.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  onSearchChange('');
                  onStatusFilterChange('all');
                }}
                className="mt-3"
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAudits.map((audit) => (
              <motion.div
                key={audit.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedAudit?.id === audit.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => onSelectAudit(audit)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{audit.title}</h3>
                      <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                        {audit.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{audit.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{audit.business_unit}</span>
                      <span>{audit.audit_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{new Date(audit.start_date).toLocaleDateString('tr-TR')}</span>
                      <span>{new Date(audit.end_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExecutiveSummaryStep: React.FC<{
  audit: Audit;
  executiveSummary: string;
  onSummaryChange: (summary: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}> = ({ audit, executiveSummary, onSummaryChange, onGenerate, isGenerating }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Yönetim Özeti
          </CardTitle>
          <p className="text-gray-600">
            Seçilen denetim için otomatik yönetim özeti oluşturun
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Seçilen Denetim</h4>
            <p className="text-blue-800 font-medium">{audit.title}</p>
            <p className="text-blue-700 text-sm">{audit.description}</p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Label htmlFor="executiveSummary">Yönetim Özeti</Label>
            <div className="flex space-x-2">
              <Button
                onClick={() => onSummaryChange('Bu bir test içeriğidir. AI özeti burada görünecektir.')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Test İçerik
              </Button>
              <Button
                onClick={async () => {
                  try {
                    console.log('Testing Ollama connectivity...');
                    const status = await aiService.checkOllamaStatus('http://localhost:11434');
                    console.log('Ollama status result:', status);

                    if (status.isRunning) {
                      toast.success(`Ollama çalışıyor! Kullanılabilir modeller: ${status.availableModels.join(', ')}`);
                    } else {
                      toast.error('Ollama çalışmıyor. Lütfen "ollama serve" komutunu çalıştırın.');
                    }
                  } catch (error) {
                    console.error('Ollama test error:', error);
                    toast.error(`Ollama bağlantı hatası: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isGenerating}
              >
                {isGenerating ? 'Test Ediliyor...' : 'Ollama Test'}
              </Button>
              <Button
                onClick={onGenerate}
                disabled={isGenerating}
                className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI ile Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>

          <Textarea
            id="executiveSummary"
            value={executiveSummary}
            onChange={(e) => onSummaryChange(e.target.value)}
            rows={8}
            placeholder="Denetimin yönetim özeti burada görünecek..."
            className="w-full"
          />
          {executiveSummary && (
            <div className="mt-2 text-sm text-green-600">
              ✅ İçerik yüklendi ({executiveSummary.length} karakter)
            </div>
          )}
          {!executiveSummary && (
            <div className="mt-2 text-sm text-gray-500">
              ℹ️ Henüz içerik oluşturulmadı
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ControlSetsStep: React.FC<{
  controlSets: ControlSet[];
  selectedControlSets: ControlSet[];
  onToggleControlSet: (controlSet: ControlSet, checked: boolean) => void;
  isLoading: boolean;
  selectedAudit: Audit | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}> = ({ controlSets, selectedControlSets, onToggleControlSet, isLoading, selectedAudit, searchTerm, onSearchChange, typeFilter, onTypeFilterChange }) => {
  const associateControlSetWithAudit = async (controlSet: ControlSet) => {
    if (!selectedAudit) return;

    try {
      const { error } = await supabase
        .from('control_sets')
        .update({
          audit_id: selectedAudit.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', controlSet.id);

      if (error) throw error;

      toast.success(`"${controlSet.name}" kontrol seti denetime bağlandı`);
    } catch (error) {
      console.error('Error associating control set with audit:', error);
      toast.error('Kontrol seti denetime bağlanırken hata oluştu');
    }
  };

  const isAuditSpecificControlSet = (controlSetId: string) => {
    // Check if this control set is already associated with the current audit
    return controlSetId !== 'general-controls'; // General controls are not audit-specific
  };

  const filteredControlSets = controlSets.filter(controlSet => {
    const matchesSearch = controlSet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         controlSet.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' ||
                       (typeFilter === 'audit-specific' && isAuditSpecificControlSet(controlSet.id)) ||
                       (typeFilter === 'general' && !isAuditSpecificControlSet(controlSet.id));

    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Kontrol Setleri ve Kontroller
        </CardTitle>
        <p className="text-gray-600">
          {selectedAudit ? (
            <>
              <strong>{selectedAudit.title}</strong> denetimi için kontrol setlerini seçin.
              {controlSets.length > 0 && controlSets[0].id === 'general-controls' && (
                <span className="block mt-1 text-amber-600">
                  ℹ️ Bu denetim için özel kontrol seti tanımlanmamış. Havuzdan seçim yapabilirsiniz.
                </span>
              )}
            </>
          ) : (
            'Denetime ilgili kontrol setlerini ve kontrolleri raporunuza ekleyin'
          )}
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Kontrol seti ara... (isim, açıklama)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tip filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value="audit-specific">Denetime Özel</SelectItem>
                <SelectItem value="general">Genel Havuz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || typeFilter !== 'all') && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {searchTerm && (
                  <span>Ara: "{searchTerm}"</span>
                )}
                {typeFilter !== 'all' && (
                  <span>Tip: {typeFilter === 'audit-specific' ? 'Denetime Özel' : 'Genel Havuz'}</span>
                )}
                <span className="text-gray-500">
                  ({filteredControlSets.length} / {controlSets.length} kontrol seti)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onTypeFilterChange('all');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Kontrol setleri yükleniyor...</p>
          </div>
        ) : filteredControlSets.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {controlSets.length === 0 ? 'Bu denetim için kontrol seti bulunmuyor.' : 'Arama kriterlerinize uygun kontrol seti bulunamadı.'}
            </p>
            {controlSets.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  onSearchChange('');
                  onTypeFilterChange('all');
                }}
                className="mt-3"
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredControlSets.map((controlSet) => {
              const isAuditSpecific = isAuditSpecificControlSet(controlSet.id);
              const isSelected = selectedControlSets.some(cs => cs.id === controlSet.id);

              return (
                <Card key={controlSet.id} className={`border-l-4 ${isAuditSpecific ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`controlset-${controlSet.id}`}
                        checked={isSelected}
                        onChange={(e) => onToggleControlSet(controlSet, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{controlSet.name}</h4>
                            {isAuditSpecific ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Denetime Özel
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Havuz
                              </Badge>
                            )}
                          </div>
                          {!isAuditSpecific && selectedAudit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => associateControlSetWithAudit(controlSet)}
                              disabled={isSelected}
                            >
                              Denetime Bağla
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{controlSet.description}</p>

                        {controlSet.controls && controlSet.controls.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              İlgili Kontroller ({controlSet.controls.length}):
                            </p>
                            {controlSet.controls.slice(0, 5).map((control) => (
                              <div key={control.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{control.control_code}</span>
                                  <span className="text-sm text-gray-600 ml-2">{control.title}</span>
                                </div>
                                <Badge variant={control.effectiveness && control.effectiveness > 70 ? 'default' : 'secondary'}>
                                  {control.effectiveness || 0}%
                                </Badge>
                              </div>
                            ))}
                            {controlSet.controls.length > 5 && (
                              <p className="text-xs text-gray-500">
                                +{controlSet.controls.length - 5} daha fazla kontrol
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedControlSets.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Seçilen Kontrol Setleri:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedControlSets.map((cs) => (
                <Badge key={cs.id} className="bg-blue-100 text-blue-800">
                  {cs.name} ({cs.controls?.length || 0} kontrol)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RiskAssessmentStep: React.FC<{
  risks: Risk[];
  selectedRisks: Risk[];
  onToggleRisk: (risk: Risk, checked: boolean) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  levelFilter: string;
  onLevelFilterChange: (value: string) => void;
}> = ({ risks, selectedRisks, onToggleRisk, isLoading, searchTerm, onSearchChange, levelFilter, onLevelFilterChange }) => {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (risk.business_unit || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'all' || risk.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
          Risk Değerlendirmesi
        </CardTitle>
        <p className="text-gray-600">
          Denetime ilgili riskleri raporunuza dahil edin
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Risk ara... (başlık, açıklama, birim)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={onLevelFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Risk seviyesi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Seviyeler</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || levelFilter !== 'all') && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {searchTerm && (
                  <span>Ara: "{searchTerm}"</span>
                )}
                {levelFilter !== 'all' && (
                  <span>Seviye: {levelFilter === 'critical' ? 'Kritik' :
                                levelFilter === 'high' ? 'Yüksek' :
                                levelFilter === 'medium' ? 'Orta' : 'Düşük'}</span>
                )}
                <span className="text-gray-500">
                  ({filteredRisks.length} / {risks.length} risk)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onLevelFilterChange('all');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Riskler yükleniyor...</p>
          </div>
        ) : filteredRisks.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {risks.length === 0 ? 'Bu denetim için risk bulunmuyor.' : 'Arama kriterlerinize uygun risk bulunamadı.'}
            </p>
            {risks.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  onSearchChange('');
                  onLevelFilterChange('all');
                }}
                className="mt-3"
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRisks.map((risk) => (
              <Card key={risk.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`risk-${risk.id}`}
                      checked={selectedRisks.some(r => r.id === risk.id)}
                      onChange={(e) => onToggleRisk(risk, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{risk.title}</h4>
                        <Badge className={getRiskColor(risk.level)}>
                          {risk.level.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Etki:</span> {risk.impact}
                        </div>
                        <div>
                          <span className="font-medium">Olasılık:</span> {risk.likelihood}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FindingsSelectionStep: React.FC<{
  findings: Finding[];
  selectedFindings: Finding[];
  onToggleFinding: (finding: Finding, checked: boolean) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
}> = ({ findings, selectedFindings, onToggleFinding, isLoading, searchTerm, onSearchChange, severityFilter, onSeverityFilterChange }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredFindings = findings.filter(finding => {
    const matchesSearch = finding.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         finding.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (finding.audit_title || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || finding.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Bulgular
        </CardTitle>
        <p className="text-gray-600">
          Denetim sırasında tespit edilen bulgulardan raporunuza dahil etmek istediklerinizi seçin
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Bulgu ara... (başlık, açıklama, denetim)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={onSeverityFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Şiddet seviyesi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Seviyeler</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || severityFilter !== 'all') && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {searchTerm && (
                  <span>Ara: "{searchTerm}"</span>
                )}
                {severityFilter !== 'all' && (
                  <span>Şiddet: {severityFilter === 'critical' ? 'Kritik' :
                                severityFilter === 'high' ? 'Yüksek' :
                                severityFilter === 'medium' ? 'Orta' : 'Düşük'}</span>
                )}
                <span className="text-gray-500">
                  ({filteredFindings.length} / {findings.length} bulgu)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onSeverityFilterChange('all');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Bulgular yükleniyor...</p>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {findings.length === 0 ? 'Bu denetim için bulgu bulunmuyor.' : 'Arama kriterlerinize uygun bulgu bulunamadı.'}
            </p>
            {findings.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  onSearchChange('');
                  onSeverityFilterChange('all');
                }}
                className="mt-3"
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFindings.map((finding) => (
              <Card key={finding.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`finding-${finding.id}`}
                      checked={selectedFindings.some(f => f.id === finding.id)}
                      onChange={(e) => onToggleFinding(finding, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{finding.title}</h4>
                        <Badge className={getSeverityColor(finding.severity)}>
                          {finding.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Kategori: {finding.category}</span>
                        <span>Durum: {finding.status}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FinalReportStep: React.FC<{
  reportTitle: string;
  reportDescription: string;
  sections: ReportSection[];
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onGenerateReport: () => void;
  isGenerating: boolean;
}> = ({
  reportTitle,
  reportDescription,
  sections,
  onTitleChange,
  onDescriptionChange,
  onGenerateReport,
  isGenerating
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Final Rapor
          </CardTitle>
          <p className="text-gray-600">
            Raporunuzun son halini gözden geçirin ve kaydedin
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="reportTitle">Rapor Başlığı</Label>
              <Input
                id="reportTitle"
                value={reportTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Rapor başlığını girin"
              />
            </div>
            <div>
              <Label htmlFor="reportDescription">Açıklama</Label>
              <Input
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Rapor açıklaması"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {sections.length} bölüm oluşturuldu
            </div>
            <Button
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Raporu Oluştur
                </>
              )}
            </Button>
          </div>

          {sections.length > 0 && (
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      <div className="flex items-center space-x-2">
                        {section.ai_generated && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge variant="outline">{section.type}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {section.content || 'İçerik henüz oluşturulmadı'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCreationWizard;