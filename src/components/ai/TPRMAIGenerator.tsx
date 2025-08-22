import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Wand2,
  Loader2,
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
  X,
  AlertTriangle,
  Wrench,
  BookOpen,
  Shield,
  Users,
  Target,
  FileCheck,
  Clock,
  AlertCircle,
  Building,
  Zap,
  Activity,
  Briefcase,
  Scale,
  TrendingUp,
  Eye,
  ShieldCheck,
  BarChart3,
  FileSearch,
  Handshake,
  DollarSign,
  Lock,
  Settings2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  aiService,
  AIProvider,
  AIConfiguration,
  AIGenerationRequest,
} from "../../services/aiService";
import AIConfigurationComponent from "./AIConfiguration";
import OllamaDiagnostic from "./OllamaDiagnostic";

interface TPRMAIGeneratorProps {
  fieldType: 
    | "vendor_assessment"
    | "vendor_due_diligence_report"
    | "vendor_contract_risk_analysis"
    | "vendor_risk_scoring"
    | "vendor_assessment_criteria"
    | "vendor_monitoring_plan"
    | "vendor_incident_response"
    | "vendor_performance_evaluation"
    | "vendor_compliance_assessment"
    | "vendor_financial_analysis"
    | "vendor_security_assessment"
    | "vendor_operational_assessment";
  tprmData: {
    name?: string;
    vendor_type?: string;
    industry?: string;
    business_unit?: string;
    risk_classification?: string;
    status?: string;
    contact_person?: string;
    contact_email?: string;
    annual_revenue?: number;
    employee_count?: number;
    certifications?: string[];
    compliance_frameworks?: string[];
    critical_services?: string[];
    contract_start_date?: string;
    contract_end_date?: string;
    contract_value?: number;
    currency?: string;
    sla_requirements?: string;
    insurance_coverage?: string;
    financial_stability_rating?: string;
    credit_rating?: string;
    risk_score?: number;
    assessment_type?: string;
    assessment_date?: string;
    overall_risk_score?: number;
    financial_risk_score?: number;
    operational_risk_score?: number;
    compliance_risk_score?: number;
    security_risk_score?: number;
    reputational_risk_score?: number;
    strategic_risk_score?: number;
    findings_summary?: string;
    recommendations?: string;
    mitigation_actions?: string;
    engagement_type?: string;
    title?: string;
    description?: string;
    priority?: string;
    deliverables?: string[];
    key_performance_indicators?: string[];
    service_level_agreements?: string;
    termination_clauses?: string;
    renewal_terms?: string;
    risk_mitigation_measures?: string;
  };
  onGenerated: (content: string | string[]) => void;
  currentValue?: string | string[];
  className?: string;
  disabled?: boolean;
}

const tprmFieldTypes = [
  { value: "vendor_assessment", label: "Vendor Assessment", icon: "📋" },
  { value: "vendor_due_diligence_report", label: "Due Diligence Report", icon: "🔍" },
  { value: "vendor_contract_risk_analysis", label: "Contract Risk Analysis", icon: "📄" },
  { value: "vendor_risk_scoring", label: "Risk Scoring", icon: "📊" },
  { value: "vendor_assessment_criteria", label: "Assessment Criteria", icon: "✅" },
  { value: "vendor_monitoring_plan", label: "Monitoring Plan", icon: "👁️" },
  { value: "vendor_incident_response", label: "Incident Response", icon: "🚨" },
  { value: "vendor_performance_evaluation", label: "Performance Evaluation", icon: "📈" },
  { value: "vendor_compliance_assessment", label: "Compliance Assessment", icon: "⚖️" },
  { value: "vendor_financial_analysis", label: "Financial Analysis", icon: "💰" },
  { value: "vendor_security_assessment", label: "Security Assessment", icon: "🔒" },
  { value: "vendor_operational_assessment", label: "Operational Assessment", icon: "⚙️" },
];

const vendorTypes = [
  "Technology Provider",
  "Cloud Services",
  "Financial Services",
  "Legal Services",
  "Consulting Services",
  "Manufacturing",
  "Logistics",
  "Marketing",
  "Human Resources",
  "Facilities Management",
  "Security Services",
  "Healthcare Services",
  "Other",
];

const industries = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Energy",
  "Transportation",
  "Telecommunications",
  "Consulting",
  "Legal",
  "Education",
  "Government",
  "Other",
];

const riskClassifications = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const assessmentTypes = [
  "Initial",
  "Periodic",
  "Incident Based",
  "Contract Renewal",
  "Performance Review",
  "Compliance Review",
];

const engagementTypes = [
  "Contract",
  "Project",
  "Service",
  "Partnership",
  "Consulting",
  "Outsourcing",
];

const complianceFrameworks = [
  "ISO 27001",
  "SOC 2",
  "PCI DSS",
  "HIPAA",
  "GDPR",
  "SOX",
  "NIST",
  "COBIT",
  "ITIL",
  "Custom",
];

export default function TPRMAIGenerator({
  fieldType,
  tprmData,
  onGenerated,
  currentValue,
  className = "",
  disabled = false,
}: TPRMAIGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [selectedFieldType, setSelectedFieldType] = useState(fieldType);
  const [context, setContext] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load providers and configurations on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providersData = await aiService.getProviders();
        setProviders(providersData);
        
        if (providersData.length > 0) {
          setSelectedProvider(providersData[0].id);
          setSelectedModel(providersData[0].defaultModel);
        }
      } catch (err) {
        console.error("Failed to load providers:", err);
      }
    };

    const loadConfigurations = async () => {
      try {
        const configs = await aiService.getConfigurations();
        setConfigurations(configs);
        
        const activeConfig = configs.find(config => config.is_active);
        if (activeConfig) {
          setSelectedProvider(activeConfig.provider);
          setSelectedModel(activeConfig.model_name);
          setTemperature(activeConfig.temperature);
          setMaxTokens(activeConfig.max_tokens);
        }
      } catch (err) {
        console.error("Failed to load configurations:", err);
      }
    };

    loadProviders();
    loadConfigurations();
  }, []);

  const generateContent = useCallback(async () => {
    if (!selectedProvider || !selectedModel) {
      toast.error("Please select an AI provider and model");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build context from TPRM data
      const contextParts = [];
      if (tprmData.name) contextParts.push(`Vendor Name: ${tprmData.name}`);
      if (tprmData.vendor_type) contextParts.push(`Vendor Type: ${tprmData.vendor_type}`);
      if (tprmData.industry) contextParts.push(`Industry: ${tprmData.industry}`);
      if (tprmData.business_unit) contextParts.push(`Business Unit: ${tprmData.business_unit}`);
      if (tprmData.risk_classification) contextParts.push(`Risk Classification: ${tprmData.risk_classification}`);
      if (tprmData.status) contextParts.push(`Status: ${tprmData.status}`);
      if (tprmData.contact_person) contextParts.push(`Contact Person: ${tprmData.contact_person}`);
      if (tprmData.contact_email) contextParts.push(`Contact Email: ${tprmData.contact_email}`);
      if (tprmData.annual_revenue) contextParts.push(`Annual Revenue: $${tprmData.annual_revenue.toLocaleString()}`);
      if (tprmData.employee_count) contextParts.push(`Employee Count: ${tprmData.employee_count}`);
      if (tprmData.certifications?.length) contextParts.push(`Certifications: ${tprmData.certifications.join(", ")}`);
      if (tprmData.compliance_frameworks?.length) contextParts.push(`Compliance Frameworks: ${tprmData.compliance_frameworks.join(", ")}`);
      if (tprmData.critical_services?.length) contextParts.push(`Critical Services: ${tprmData.critical_services.join(", ")}`);
      if (tprmData.contract_start_date) contextParts.push(`Contract Start: ${tprmData.contract_start_date}`);
      if (tprmData.contract_end_date) contextParts.push(`Contract End: ${tprmData.contract_end_date}`);
      if (tprmData.contract_value) contextParts.push(`Contract Value: $${tprmData.contract_value.toLocaleString()}`);
      if (tprmData.currency) contextParts.push(`Currency: ${tprmData.currency}`);
      if (tprmData.sla_requirements) contextParts.push(`SLA Requirements: ${tprmData.sla_requirements}`);
      if (tprmData.insurance_coverage) contextParts.push(`Insurance Coverage: ${tprmData.insurance_coverage}`);
      if (tprmData.financial_stability_rating) contextParts.push(`Financial Stability: ${tprmData.financial_stability_rating}`);
      if (tprmData.credit_rating) contextParts.push(`Credit Rating: ${tprmData.credit_rating}`);
      if (tprmData.risk_score) contextParts.push(`Risk Score: ${tprmData.risk_score}`);
      if (tprmData.assessment_type) contextParts.push(`Assessment Type: ${tprmData.assessment_type}`);
      if (tprmData.assessment_date) contextParts.push(`Assessment Date: ${tprmData.assessment_date}`);
      if (tprmData.overall_risk_score) contextParts.push(`Overall Risk Score: ${tprmData.overall_risk_score}`);
      if (tprmData.financial_risk_score) contextParts.push(`Financial Risk Score: ${tprmData.financial_risk_score}`);
      if (tprmData.operational_risk_score) contextParts.push(`Operational Risk Score: ${tprmData.operational_risk_score}`);
      if (tprmData.compliance_risk_score) contextParts.push(`Compliance Risk Score: ${tprmData.compliance_risk_score}`);
      if (tprmData.security_risk_score) contextParts.push(`Security Risk Score: ${tprmData.security_risk_score}`);
      if (tprmData.reputational_risk_score) contextParts.push(`Reputational Risk Score: ${tprmData.reputational_risk_score}`);
      if (tprmData.strategic_risk_score) contextParts.push(`Strategic Risk Score: ${tprmData.strategic_risk_score}`);
      if (tprmData.findings_summary) contextParts.push(`Findings Summary: ${tprmData.findings_summary}`);
      if (tprmData.recommendations) contextParts.push(`Recommendations: ${tprmData.recommendations}`);
      if (tprmData.mitigation_actions) contextParts.push(`Mitigation Actions: ${tprmData.mitigation_actions}`);
      if (tprmData.engagement_type) contextParts.push(`Engagement Type: ${tprmData.engagement_type}`);
      if (tprmData.title) contextParts.push(`Engagement Title: ${tprmData.title}`);
      if (tprmData.description) contextParts.push(`Engagement Description: ${tprmData.description}`);
      if (tprmData.priority) contextParts.push(`Priority: ${tprmData.priority}`);
      if (tprmData.deliverables?.length) contextParts.push(`Deliverables: ${tprmData.deliverables.join(", ")}`);
      if (tprmData.key_performance_indicators?.length) contextParts.push(`KPIs: ${tprmData.key_performance_indicators.join(", ")}`);
      if (tprmData.service_level_agreements) contextParts.push(`SLAs: ${tprmData.service_level_agreements}`);
      if (tprmData.termination_clauses) contextParts.push(`Termination Clauses: ${tprmData.termination_clauses}`);
      if (tprmData.renewal_terms) contextParts.push(`Renewal Terms: ${tprmData.renewal_terms}`);
      if (tprmData.risk_mitigation_measures) contextParts.push(`Risk Mitigation: ${tprmData.risk_mitigation_measures}`);
      if (context) contextParts.push(`Additional Context: ${context}`);

      const fullContext = contextParts.join("\n");

      const request: AIGenerationRequest = {
        provider: selectedProvider,
        model: selectedModel,
        prompt: "",
        context: fullContext,
        fieldType: selectedFieldType as any,
        auditData: {
          title: tprmData.name || "Third-Party Vendor",
          audit_type: tprmData.vendor_type || "vendor_assessment",
          business_unit: tprmData.business_unit || "General",
          scope: tprmData.industry || "Vendor Management",
        },
      };

      const result = await aiService.generateContent(request);
      
      if (typeof result === "string") {
        setGeneratedContent(result);
        setGenerationHistory(prev => [result, ...prev.slice(0, 4)]);
        toast.success("TPRM content generated successfully!");
      } else {
        setGeneratedContent(result.join("\n\n"));
        setGenerationHistory(prev => [result.join("\n\n"), ...prev.slice(0, 4)]);
        toast.success("TPRM content generated successfully!");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate content");
      toast.error("Failed to generate TPRM content");
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedProvider,
    selectedModel,
    selectedFieldType,
    tprmData,
    context,
    temperature,
    maxTokens,
  ]);

  const handleApply = () => {
    if (generatedContent) {
      onGenerated(generatedContent);
      setIsOpen(false);
      toast.success("TPRM content applied successfully!");
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    generateContent();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success("Content copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy content");
    }
  };

  const getFieldIcon = (fieldType: string) => {
    const field = tprmFieldTypes.find(f => f.value === fieldType);
    return field?.icon || "📋";
  };

  const getFieldLabel = (fieldType: string) => {
    const field = tprmFieldTypes.find(f => f.value === fieldType);
    return field?.label || "TPRM Content";
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Wand2 className="w-4 h-4" />
        Generate TPRM Content
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      TPRM AI Generator
                    </h2>
                    <p className="text-sm text-gray-600">
                      Generate comprehensive third-party risk management content
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex h-[calc(90vh-120px)]">
                {/* Left Panel - Configuration */}
                <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Field Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={selectedFieldType}
                        onChange={(e) => setSelectedFieldType(e.target.value as any)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {tprmFieldTypes.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.icon} {field.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Context Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Context
                      </label>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={4}
                        placeholder="Provide additional context or specific requirements for the TPRM content..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* TPRM Data Summary */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor Information
                      </label>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                        {tprmData.name && (
                          <div><strong>Name:</strong> {tprmData.name}</div>
                        )}
                        {tprmData.vendor_type && (
                          <div><strong>Type:</strong> {tprmData.vendor_type}</div>
                        )}
                        {tprmData.industry && (
                          <div><strong>Industry:</strong> {tprmData.industry}</div>
                        )}
                        {tprmData.business_unit && (
                          <div><strong>Business Unit:</strong> {tprmData.business_unit}</div>
                        )}
                        {tprmData.risk_classification && (
                          <div><strong>Risk Classification:</strong> {tprmData.risk_classification}</div>
                        )}
                        {tprmData.status && (
                          <div><strong>Status:</strong> {tprmData.status}</div>
                        )}
                        {tprmData.contract_value && (
                          <div><strong>Contract Value:</strong> ${tprmData.contract_value.toLocaleString()}</div>
                        )}
                        {tprmData.risk_score && (
                          <div><strong>Risk Score:</strong> {tprmData.risk_score}</div>
                        )}
                        {tprmData.compliance_frameworks?.length && (
                          <div><strong>Compliance:</strong> {tprmData.compliance_frameworks.length} frameworks</div>
                        )}
                        {!tprmData.name && !tprmData.vendor_type && (
                          <div className="text-gray-500 italic">No vendor data provided</div>
                        )}
                      </div>
                    </div>

                    {/* AI Configuration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          AI Configuration
                        </label>
                        <button
                          onClick={() => setShowConfig(!showConfig)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {showConfig ? "Hide" : "Configure"}
                        </button>
                      </div>
                      
                      {showConfig && (
                        <AIConfigurationComponent
                          providers={providers}
                          configurations={configurations}
                          selectedProvider={selectedProvider}
                          selectedModel={selectedModel}
                          temperature={temperature}
                          maxTokens={maxTokens}
                          onProviderChange={setSelectedProvider}
                          onModelChange={setSelectedModel}
                          onTemperatureChange={setTemperature}
                          onMaxTokensChange={setMaxTokens}
                        />
                      )}
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={generateContent}
                      disabled={isGenerating || !selectedProvider || !selectedModel}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate TPRM Content
                        </>
                      )}
                    </button>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Error</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Generated Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Content Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFieldIcon(selectedFieldType)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getFieldLabel(selectedFieldType)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {generatedContent && (
                          <>
                            <button
                              onClick={copyToClipboard}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleRegenerate}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="Regenerate content"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Generated Content */}
                    {generatedContent ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                              {generatedContent}
                            </pre>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleApply}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Apply to Form
                          </button>
                          <button
                            onClick={handleRegenerate}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="p-4 bg-blue-100 rounded-full mb-4">
                          <Wand2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Ready to Generate TPRM Content
                        </h3>
                        <p className="text-sm text-gray-600 max-w-md">
                          Configure your settings and click "Generate TPRM Content" to create comprehensive third-party risk management content.
                        </p>
                      </div>
                    )}

                    {/* Generation History */}
                    {generationHistory.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Recent Generations
                          </h4>
                          <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            {showHistory ? "Hide" : "Show"}
                          </button>
                        </div>
                        
                        {showHistory && (
                          <div className="space-y-2">
                            {generationHistory.map((content, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setGeneratedContent(content)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">
                                    Generation {index + 1}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {content.length} characters
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {content.substring(0, 100)}...
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
