import type { OllamaStatus } from "./types";

export class AIUtilsService {
  async checkOllamaStatus(baseUrl: string = "http://localhost:11434"): Promise<OllamaStatus> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return {
          isRunning: false,
          availableModels: [],
          error: `Ollama API returned ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const models = data.models?.map((m: any) => m.name) || [];

      return {
        isRunning: true,
        availableModels: models,
      };
    } catch (error) {
      return {
        isRunning: false,
        availableModels: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Utility method to parse objectives response
  parseObjectivesResponse(content: string): any {
    if (content.trim().startsWith("[")) {
      try {
        const objectives = JSON.parse(content);
        if (Array.isArray(objectives)) {
          return objectives;
        }
      } catch {
        // If parsing fails, keep original content
      }
    }
    return content;
  }

  // Utility method to validate API keys
  validateApiKey(provider: string, apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === "") {
      return false;
    }

    switch (provider) {
      case "openai":
        // OpenAI keys start with "sk-"
        return apiKey.startsWith("sk-");
      case "claude":
        // Claude keys start with "sk-ant-"
        return apiKey.startsWith("sk-ant-");
      case "gemini":
        // Gemini keys are typically 39 characters long
        return apiKey.length === 39;
      default:
        return true; // For other providers, just check if not empty
    }
  }

  // Utility method to get default models for providers
  getDefaultModel(provider: string): string {
    const defaults = {
      ollama: "llama3.2",
      openai: "gpt-4o-mini",
      claude: "claude-3-5-sonnet-20241022",
      gemini: "gemini-1.5-flash",
    };
    return defaults[provider as keyof typeof defaults] || "llama3.2";
  }

  // Utility method to format tokens used
  formatTokens(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }

  // Utility method to estimate cost based on provider and tokens
  estimateCost(provider: string, model: string, tokens: number): number {
    const rates: Record<string, Record<string, number>> = {
      openai: {
        "gpt-4o": 0.00003, // $0.03 per 1K tokens
        "gpt-4o-mini": 0.0000015, // $0.0015 per 1K tokens
        "gpt-4-turbo": 0.00003,
        "gpt-3.5-turbo": 0.000002,
      },
      claude: {
        "claude-3-5-sonnet-20241022": 0.000015, // $0.015 per 1K tokens
        "claude-3-haiku-20240307": 0.0000025,
        "claude-3-opus-20240229": 0.000075,
      },
      gemini: {
        "gemini-1.5-pro": 0.0000125, // $0.0125 per 1K tokens
        "gemini-1.5-flash": 0.0000005,
        "gemini-pro": 0.000005,
      },
    };

    const providerRates = rates[provider];
    if (!providerRates) return 0;

    const rate = providerRates[model] || 0;
    return (tokens / 1000) * rate;
  }

  // Utility method to sanitize user input
  sanitizeInput(input: string): string {
    if (!input) return "";

    // Remove potentially harmful characters and limit length
    return input
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .trim()
      .substring(0, 10000); // Limit length
  }

  // Utility method to generate unique request IDs
  generateRequestId(): string {
    return `ai_req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Utility method to check if response contains JSON
  isJsonResponse(content: string): boolean {
    if (!content) return false;
    const trimmed = content.trim();
    return (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
           (trimmed.startsWith("[") && trimmed.endsWith("]"));
  }

  // Utility method to safely parse JSON
  safeJsonParse(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }

  // Utility method to get model capabilities
  getModelCapabilities(provider: string, model: string): {
    supportsStreaming: boolean;
    supportsFunctionCalling: boolean;
    maxTokens: number;
    contextWindow: number;
  } {
    const capabilities: Record<string, Record<string, any>> = {
      openai: {
        "gpt-4o": {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          maxTokens: 4096,
          contextWindow: 128000,
        },
        "gpt-4o-mini": {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          maxTokens: 16384,
          contextWindow: 128000,
        },
      },
      claude: {
        "claude-3-5-sonnet-20241022": {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          maxTokens: 8192,
          contextWindow: 200000,
        },
        "claude-3-haiku-20240307": {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          maxTokens: 4096,
          contextWindow: 200000,
        },
      },
      gemini: {
        "gemini-1.5-pro": {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          maxTokens: 8192,
          contextWindow: 1048576,
        },
        "gemini-1.5-flash": {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          maxTokens: 8192,
          contextWindow: 1048576,
        },
      },
      ollama: {
        default: {
          supportsStreaming: false,
          supportsFunctionCalling: false,
          maxTokens: 4096,
          contextWindow: 8000,
        },
      },
    };

    return capabilities[provider]?.[model] || capabilities[provider]?.default || {
      supportsStreaming: false,
      supportsFunctionCalling: false,
      maxTokens: 4096,
      contextWindow: 8000,
    };
  }
}

export const aiUtilsService = new AIUtilsService();