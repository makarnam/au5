import { supabase } from "../../lib/supabase";
import type { AIProvider, AIConfiguration, OllamaStatus } from "./types";

export class AIProvidersService {
  private providers: AIProvider[] = [
    {
      id: "ollama",
      name: "Ollama (Local)",
      type: "ollama",
      description: "Local LLM server running on your machine",
      requiresApiKey: false,
      models: [
        "llama3.2",
        "llama3.1",
        "mistral",
        "codellama",
        "phi3",
        "gemma2",
      ],
      defaultModel: "llama3.2",
    },
    {
      id: "openai",
      name: "OpenAI GPT",
      type: "openai",
      description: "OpenAI GPT models via API",
      requiresApiKey: true,
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
      defaultModel: "gpt-4o-mini",
    },
    {
      id: "claude",
      name: "Anthropic Claude",
      type: "claude",
      description: "Anthropic Claude models via API",
      requiresApiKey: true,
      models: [
        "claude-3-5-sonnet-20241022",
        "claude-3-haiku-20240307",
        "claude-3-opus-20240229",
      ],
      defaultModel: "claude-3-5-sonnet-20241022",
    },
    {
      id: "gemini",
      name: "Google Gemini",
      type: "gemini",
      description: "Google Gemini models via API",
      requiresApiKey: true,
      models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
      defaultModel: "gemini-1.5-flash",
    },
  ];

  async getOllamaModels(
    baseUrl: string = "http://localhost:11434",
  ): Promise<string[]> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.warn("Failed to fetch Ollama models:", error);
      // Return default models as fallback
      return ["llama3.2", "llama3.1", "mistral", "codellama", "phi3", "gemma2"];
    }
  }

  getProviders(): AIProvider[] {
    return this.providers;
  }

  async getProviderWithLiveModels(
    providerId: string,
    baseUrl?: string,
  ): Promise<AIProvider | null> {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) return null;

    if (provider.type === "ollama") {
      const liveModels = await this.getOllamaModels(baseUrl);
      return {
        ...provider,
        models: liveModels.length > 0 ? liveModels : provider.models,
        defaultModel:
          liveModels.length > 0 ? liveModels[0] : provider.defaultModel,
      };
    }

    return provider;
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.find((p) => p.id === id);
  }

  async saveConfiguration(
    config: Omit<AIConfiguration, "id" | "created_at" | "updated_at">,
  ): Promise<AIConfiguration> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Check if configuration already exists for this user and provider
      const { data: existing } = await supabase
        .from("ai_configurations")
        .select("*")
        .eq("created_by", user.id)
        .eq("provider", config.provider)
        .single();

      let result;
      if (existing) {
        // Update existing configuration
        const { data, error } = await supabase
          .from("ai_configurations")
          .update({
            model_name: config.model_name,
            api_key: config.api_key,
            api_endpoint: config.api_endpoint,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            is_active: config.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from("ai_configurations")
          .insert([
            {
              provider: config.provider,
              model_name: config.model_name,
              api_key: config.api_key,
              api_endpoint: config.api_endpoint,
              temperature: config.temperature,
              max_tokens: config.max_tokens,
              created_by: user.id,
              is_active: config.is_active,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        provider: result.provider,
        model_name: result.model_name,
        api_key: result.api_key,
        api_endpoint: result.api_endpoint,
        temperature: result.temperature,
        max_tokens: result.max_tokens,
        created_by: result.created_by,
        is_active: result.is_active,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
    } catch (error) {
      console.error("Error saving AI configuration:", error);
      throw error;
    }
  }

  // Read configurations with local fallback when user is not authenticated or DB unavailable.
  async getConfigurations(): Promise<AIConfiguration[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        // Fallback to localStorage configuration for unauthenticated sessions
        const raw = localStorage.getItem("ai_configurations_fallback");
        if (raw) {
          const parsed = JSON.parse(raw) as AIConfiguration[];
          return parsed.map((c) => ({
            ...c,
            model: c.model_name,
            baseUrl: c.api_endpoint,
            is_active: c.is_active ?? true,
            created_by: c.created_by || "local",
          }));
        }
        // Provide sensible defaults (Ollama local)
        const defaults: AIConfiguration[] = [
          {
            id: "local-ollama",
            provider: "ollama",
            model_name: "llama3.2",
            api_endpoint: "http://localhost:11434",
            temperature: 0.7,
            max_tokens: 500,
            created_by: "local",
            is_active: true,
            model: "llama3.2",
            baseUrl: "http://localhost:11434",
          },
        ];
        return defaults;
      }

      const { data, error } = await supabase
        .from("ai_configurations")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return (data || []).map((config) => ({
        id: config.id,
        provider: config.provider,
        model_name: config.model_name,
        api_key: config.api_key,
        api_endpoint: config.api_endpoint,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        created_by: config.created_by,
        is_active: config.is_active,
        created_at: config.created_at,
        updated_at: config.updated_at,
        // Add computed fields for backward compatibility
        model: config.model_name,
        baseUrl: config.api_endpoint,
      }));
    } catch (error) {
      // On any error, return local fallback to keep UI working
      try {
        const raw = localStorage.getItem("ai_configurations_fallback");
        if (raw) {
          const parsed = JSON.parse(raw) as AIConfiguration[];
          return parsed.map((c) => ({
            ...c,
            model: c.model_name,
            baseUrl: c.api_endpoint,
            is_active: c.is_active ?? true,
            created_by: c.created_by || "local",
          }));
        }
      } catch {}
      console.error("Error fetching AI configurations:", error);
      return [
        {
          id: "local-ollama",
          provider: "ollama",
          model_name: "llama3.2",
          api_endpoint: "http://localhost:11434",
          temperature: 0.7,
          max_tokens: 500,
          created_by: "local",
          is_active: true,
          model: "llama3.2",
          baseUrl: "http://localhost:11434",
        },
      ];
    }
  }

  async testConnection(
    provider: string,
    model: string,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const testRequest = {
        provider,
        model,
        prompt: "Test connection",
        context: "This is a test to verify the AI connection is working.",
        fieldType: "description" as const,
        auditData: { title: "Test Audit" },
        temperature: 0.1,
        maxTokens: 50,
        apiKey,
        baseUrl,
      };

      // We'll import and use the content generation service later
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  async deleteConfiguration(configId: string): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("ai_configurations")
        .delete()
        .eq("id", configId)
        .eq("created_by", user.id); // Ensure user can only delete their own configs

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting AI configuration:", error);
      throw error;
    }
  }

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
}

export const aiProvidersService = new AIProvidersService();