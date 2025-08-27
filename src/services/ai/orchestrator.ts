import type {
  AIProvider,
  AIConfiguration,
  AITemplate,
  TemplateSelectionCriteria,
  AIGenerationRequest,
  AIGenerationResponse,
  AIChatRequest,
  OllamaStatus
} from "./types";
import { aiProvidersService } from "./providers";
import { aiTemplatesService } from "./templates";
import { aiContentGenerationService } from "./generation";
import { aiChatService } from "./chat";
import { aiLoggingService } from "./logging";
import { aiUtilsService } from "./utils";
import { aiReportingService } from "./reporting";

class AIOrchestratorService {
  private static instance: AIOrchestratorService;

  static getInstance(): AIOrchestratorService {
    if (!AIOrchestratorService.instance) {
      AIOrchestratorService.instance = new AIOrchestratorService();
    }
    return AIOrchestratorService.instance;
  }

  // Provider management methods
  getProviders(): AIProvider[] {
    return aiProvidersService.getProviders();
  }

  async getProviderWithLiveModels(
    providerId: string,
    baseUrl?: string,
  ): Promise<AIProvider | null> {
    return aiProvidersService.getProviderWithLiveModels(providerId, baseUrl);
  }

  getProvider(id: string): AIProvider | undefined {
    return aiProvidersService.getProvider(id);
  }

  async saveConfiguration(
    config: Omit<AIConfiguration, "id" | "created_at" | "updated_at">,
  ): Promise<AIConfiguration> {
    return aiProvidersService.saveConfiguration(config);
  }

  async getConfigurations(): Promise<AIConfiguration[]> {
    return aiProvidersService.getConfigurations();
  }

  async testConnection(
    provider: string,
    model: string,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<boolean> {
    return aiProvidersService.testConnection(provider, model, apiKey, baseUrl);
  }

  async deleteConfiguration(configId: string): Promise<void> {
    return aiProvidersService.deleteConfiguration(configId);
  }

  async checkOllamaStatus(baseUrl: string = "http://localhost:11434"): Promise<OllamaStatus> {
    return aiProvidersService.checkOllamaStatus(baseUrl);
  }

  // Template management methods
  async getTemplates(criteria?: TemplateSelectionCriteria): Promise<AITemplate[]> {
    return aiTemplatesService.getTemplates(criteria);
  }

  async createTemplate(template: Omit<AITemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AITemplate | null> {
    return aiTemplatesService.createTemplate(template);
  }

  async updateTemplate(id: string, updates: Partial<AITemplate>): Promise<AITemplate | null> {
    return aiTemplatesService.updateTemplate(id, updates);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return aiTemplatesService.deleteTemplate(id);
  }

  // Content generation methods
  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Validate request parameters
      if (!request.provider || request.provider === 'undefined' || request.provider === undefined) {
        console.error("Invalid AI request - provider is undefined:", request);
        return {
          success: false,
          content: "",
          error: "AI provider is not configured. Please set up your AI configuration.",
        };
      }

      if (!request.model) {
        console.error("Invalid AI request - model is missing:", request);
        return {
          success: false,
          content: "",
          error: "AI model is not configured. Please set up your AI configuration.",
        };
      }

      const prompt = await aiContentGenerationService.buildEnhancedPrompt(request);
      console.log('Generated prompt:', prompt);
      console.log('Prompt length:', prompt.length);

      // Special handling for risk control matrix to ensure adequate tokens
      if (request.fieldType === "risk_control_matrix") {
        // Ensure minimum tokens for complex JSON generation
        if (!request.maxTokens || request.maxTokens < 4000) {
          request.maxTokens = 4000;
        }

        // Add JSON formatting instruction to the prompt
        const jsonPrompt = `${prompt}\n\nCRITICAL: You must respond with ONLY valid JSON. Follow these rules strictly:
1. Use ONLY double quotes (") for strings, never single quotes (')
2. Escape any quotes within strings using backslash (\\")
3. Do not include any explanatory text before or after the JSON
4. Ensure all strings are properly closed
5. Do not include trailing commas
6. Use the exact format specified below

JSON FORMAT:
{
  "matrix": {
    "name": "string",
    "description": "string",
    "matrix_type": "string",
    "risk_levels": ["string"],
    "control_effectiveness_levels": ["string"]
  },
  "cells": [
    {
      "risk_level": "string",
      "control_effectiveness": "string",
      "position_x": number,
      "position_y": number,
      "color_code": "string",
      "description": "string",
      "action_required": "string"
    }
  ]
}`;

        request.prompt = jsonPrompt;
      }

      let response: AIGenerationResponse;

      switch (request.provider) {
        case "ollama":
          response = await this.generateWithOllama(prompt, request);
          break;
        case "openai":
          response = await this.generateWithOpenAI(prompt, request);
          break;
        case "claude":
          response = await this.generateWithClaude(prompt, request);
          break;
        case "gemini":
          response = await this.generateWithGemini(prompt, request);
          break;
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }

      // Log the generation
      await aiLoggingService.logGeneration(request, response);

      return response;
    } catch (error) {
      console.error("Error generating content:", error);
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Chat methods
  async generateChat(request: AIChatRequest): Promise<AIGenerationResponse> {
    return aiChatService.generateChat(request);
  }

  // Reporting methods
  buildChartDataPrompt(request: AIGenerationRequest): string {
    return aiReportingService.buildChartDataPrompt(request);
  }

  buildTableDataPrompt(request: AIGenerationRequest): string {
    return aiReportingService.buildTableDataPrompt(request);
  }

  buildControlEvaluationPrompt(request: AIGenerationRequest): string {
    return aiReportingService.buildControlEvaluationPrompt(request);
  }

  generateReportStructure(title: string, sections: string[]): string {
    return aiReportingService.generateReportStructure(title, sections);
  }

  generateExecutiveSummary(keyFindings: string[], recommendations: string[]): string {
    return aiReportingService.generateExecutiveSummary(keyFindings, recommendations);
  }

  generateMetricsDashboard(metrics: Array<{ name: string; value: number; target?: number; status: 'good' | 'warning' | 'critical' }>): string {
    return aiReportingService.generateMetricsDashboard(metrics);
  }

  generateComplianceMatrix(requirements: Array<{ control: string; status: 'compliant' | 'non-compliant' | 'partial'; evidence: string }>): string {
    return aiReportingService.generateComplianceMatrix(requirements);
  }

  generateRiskHeatmap(risks: Array<{ category: string; likelihood: number; impact: number; level: 'low' | 'medium' | 'high' | 'critical' }>): string {
    return aiReportingService.generateRiskHeatmap(risks);
  }

  // Logging methods
  async getGenerationLogs(userId: string, limit: number = 50): Promise<any[]> {
    return aiLoggingService.getGenerationLogs(userId, limit);
  }

  async getGenerationStats(userId: string): Promise<{
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageTokensUsed: number;
    mostUsedProvider: string;
    mostUsedFieldType: string;
  }> {
    return aiLoggingService.getGenerationStats(userId);
  }

  async logGeneration(request: AIGenerationRequest, response: AIGenerationResponse): Promise<void> {
    return aiLoggingService.logGeneration(request, response);
  }

  // Utility methods
  async getOllamaModels(baseUrl: string = "http://localhost:11434"): Promise<string[]> {
    return aiProvidersService.getOllamaModels(baseUrl);
  }

  // Provider-specific generation methods
  private async generateWithOllama(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      const baseUrl = request.baseUrl || "http://localhost:11434";

      // First check if Ollama is running
      try {
        const healthCheck = await fetch(`${baseUrl}/api/tags`, {
          method: "GET",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!healthCheck.ok) {
          throw new Error("Ollama service is not responding");
        }
      } catch (healthError) {
        throw new Error(
          `Ollama is not running or not accessible at ${baseUrl}. Please ensure Ollama is installed and running. Visit https://ollama.ai for installation instructions.`,
        );
      }

      // Check if the model exists
      try {
        const modelsResponse = await fetch(`${baseUrl}/api/tags`);
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          const availableModels =
            modelsData.models?.map((m: any) => m.name) || [];
          if (
            !availableModels.some((name: string) =>
              name.startsWith(request.model),
            )
          ) {
            throw new Error(
              `Model "${request.model}" not found. Available models: ${availableModels.join(", ")}. Run "ollama pull ${request.model}" to download it.`,
            );
          }
        }
      } catch (modelError) {
        if (
          modelError instanceof Error &&
          modelError.message.includes("not found")
        ) {
          throw modelError;
        }
        // Continue if we can't check models - maybe the model exists
      }

      const ollamaRequest = {
        model: request.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 500,
        },
      };

      console.log('Ollama API Request:', JSON.stringify(ollamaRequest, null, 2));
      console.log('Ollama Base URL:', baseUrl);

      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ollamaRequest),
      });

      console.log('Ollama HTTP Response Status:', response.status);
      console.log('Ollama HTTP Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Model "${request.model}" not found in Ollama. Run "ollama pull ${request.model}" to download it.`,
          );
        }
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      let content = data.response;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        model: request.model,
        provider: "ollama",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Ollama generation failed",
      };
    }
  }

  private async generateWithOpenAI(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      if (!request.apiKey) {
        throw new Error("OpenAI API key is required");
      }

      const baseUrl = request.baseUrl || "https://api.openai.com/v1";
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: [{ role: "user", content: prompt }],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `OpenAI API error: ${response.status} ${errorData?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      let content = data.choices[0].message.content;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        tokensUsed: data.usage?.total_tokens,
        model: request.model,
        provider: "openai",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "OpenAI generation failed",
      };
    }
  }

  private async generateWithClaude(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      if (!request.apiKey) {
        throw new Error("Claude API key is required");
      }

      const baseUrl = request.baseUrl || "https://api.anthropic.com/v1";
      const response = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": request.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens || 500,
          temperature: request.temperature || 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Claude API error: ${response.status} ${errorData?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      let content = data.content[0].text;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        model: request.model,
        provider: "claude",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Claude generation failed",
      };
    }
  }

  private async generateWithGemini(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      if (!request.apiKey) {
        throw new Error("Gemini API key is required");
      }

      const baseUrl =
        request.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const response = await fetch(
        `${baseUrl}/models/${request.model}:generateContent?key=${request.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 500,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Gemini API error: ${response.status} ${errorData?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      let content = data.candidates[0].content.parts[0].text;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        model: request.model,
        provider: "gemini",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Gemini generation failed",
      };
    }
  }
}

export const aiOrchestratorService = AIOrchestratorService.getInstance();
export default aiOrchestratorService;