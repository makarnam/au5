import { aiOrchestratorService } from "./ai/orchestrator";
import type {
  AIProvider,
  AIConfiguration,
  AITemplate,
  TemplateSelectionCriteria,
  AIGenerationRequest,
  AIGenerationResponse,
  AIChatRequest,
  OllamaStatus
} from "./ai/types";

// Re-export all types from the modular services for backward compatibility
export type {
  AIProvider,
  AIConfiguration,
  AITemplate,
  TemplateSelectionCriteria,
  AIGenerationRequest,
  AIGenerationResponse,
  AIChatRequest,
  OllamaStatus
} from "./ai/types";

// Main service class that maintains backward compatibility
class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Provider management methods
  getProviders() {
    return aiOrchestratorService.getProviders();
  }

  async getProviderWithLiveModels(providerId: string, baseUrl?: string) {
    return aiOrchestratorService.getProviderWithLiveModels(providerId, baseUrl);
  }

  getProvider(id: string) {
    return aiOrchestratorService.getProvider(id);
  }

  async saveConfiguration(config: Omit<AIConfiguration, "id" | "created_at" | "updated_at">) {
    return aiOrchestratorService.saveConfiguration(config);
  }

  async getConfigurations() {
    return aiOrchestratorService.getConfigurations();
  }

  async testConnection(provider: string, model: string, apiKey?: string, baseUrl?: string) {
    return aiOrchestratorService.testConnection(provider, model, apiKey, baseUrl);
  }

  async deleteConfiguration(configId: string) {
    return aiOrchestratorService.deleteConfiguration(configId);
  }

  async checkOllamaStatus(baseUrl: string = "http://localhost:11434") {
    return aiOrchestratorService.checkOllamaStatus(baseUrl);
  }

  // Template management methods
  async getTemplates(criteria?: TemplateSelectionCriteria) {
    return aiOrchestratorService.getTemplates(criteria);
  }

  async createTemplate(template: Omit<AITemplate, 'id' | 'created_at' | 'updated_at'>) {
    return aiOrchestratorService.createTemplate(template);
  }

  async updateTemplate(id: string, updates: Partial<AITemplate>) {
    return aiOrchestratorService.updateTemplate(id, updates);
  }

  async deleteTemplate(id: string) {
    return aiOrchestratorService.deleteTemplate(id);
  }

  // Content generation methods
  async generateContent(request: AIGenerationRequest) {
    return aiOrchestratorService.generateContent(request);
  }

  // Chat methods
  async generateChat(request: AIChatRequest) {
    return aiOrchestratorService.generateChat(request);
  }

  // Reporting methods
  buildChartDataPrompt(request: AIGenerationRequest) {
    return aiOrchestratorService.buildChartDataPrompt(request);
  }

  buildTableDataPrompt(request: AIGenerationRequest) {
    return aiOrchestratorService.buildTableDataPrompt(request);
  }

  buildControlEvaluationPrompt(request: AIGenerationRequest) {
    return aiOrchestratorService.buildControlEvaluationPrompt(request);
  }

  generateReportStructure(title: string, sections: string[]) {
    return aiOrchestratorService.generateReportStructure(title, sections);
  }

  generateExecutiveSummary(keyFindings: string[], recommendations: string[]) {
    return aiOrchestratorService.generateExecutiveSummary(keyFindings, recommendations);
  }

  generateMetricsDashboard(metrics: Array<{ name: string; value: number; target?: number; status: 'good' | 'warning' | 'critical' }>) {
    return aiOrchestratorService.generateMetricsDashboard(metrics);
  }

  generateComplianceMatrix(requirements: Array<{ control: string; status: 'compliant' | 'non-compliant' | 'partial'; evidence: string }>) {
    return aiOrchestratorService.generateComplianceMatrix(requirements);
  }

  generateRiskHeatmap(risks: Array<{ category: string; likelihood: number; impact: number; level: 'low' | 'medium' | 'high' | 'critical' }>) {
    return aiOrchestratorService.generateRiskHeatmap(risks);
  }

  // Logging methods
  async getGenerationLogs(userId: string, limit: number = 50) {
    return aiOrchestratorService.getGenerationLogs(userId, limit);
  }

  async getGenerationStats(userId: string) {
    return aiOrchestratorService.getGenerationStats(userId);
  }

  // Utility methods
  async getOllamaModels(baseUrl: string = "http://localhost:11434") {
    return aiOrchestratorService.getOllamaModels(baseUrl);
  }

  // Logging methods
  async logGeneration(request: AIGenerationRequest, response: AIGenerationResponse) {
    return aiOrchestratorService.logGeneration(request, response);
  }
}

export const aiService = AIService.getInstance();
export default aiService;
