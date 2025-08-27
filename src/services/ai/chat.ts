import type { AIChatRequest, AIGenerationResponse } from "./types";

export class AIChatService {
  // General chat support: accepts a free-form messages array and optional system prompt.
  // Streams are handled by the caller using web APIs where supported; here we provide non-streaming convenience.
  async generateChat(request: AIChatRequest): Promise<AIGenerationResponse> {
    const { provider, model, messages, apiKey, baseUrl, temperature, maxTokens } = request;

    // Fallback: if only a user message exists, re-route through generateContent using a generic prompt
    const systemPrefix = messages.find(m => m.role === "system")?.content ||
      "You are a helpful AI assistant for governance, risk, audit, and any general topic. Respond clearly and provide actionable steps when relevant.";

    const unifiedPrompt = `${systemPrefix}\n\nConversation so far:\n${messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n")}\n\nPlease reply to the last USER message.`;

    try {
      switch (provider) {
        case "ollama":
          // For Ollama, emulate chat using a single prompt; many models don't support chat natively
          return await this.generateWithOllamaChat(unifiedPrompt, {
            provider,
            model,
            prompt: unifiedPrompt,
            context: "",
            fieldType: "description" as const,
            auditData: { title: "AI Chat" },
            apiKey,
            baseUrl,
            temperature,
            maxTokens
          });
        case "openai": {
          if (!apiKey) throw new Error("OpenAI API key is required");
          const url = (baseUrl || "https://api.openai.com/v1") + "/chat/completions";
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: temperature ?? 0.7,
              max_tokens: maxTokens ?? 500,
            }),
          });
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => null);
            throw new Error(`OpenAI API error: ${resp.status} ${errorData?.error?.message || resp.statusText}`);
          }
          const data = await resp.json();
          return {
            success: true,
            content: data.choices?.[0]?.message?.content || "",
            tokensUsed: data.usage?.total_tokens,
            model,
            provider: "openai",
          };
        }
        case "claude": {
          if (!apiKey) throw new Error("Claude API key is required");
          const url = (baseUrl || "https://api.anthropic.com/v1") + "/messages";
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model,
              max_tokens: maxTokens ?? 500,
              temperature: temperature ?? 0.7,
              messages,
            }),
          });
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => null);
            throw new Error(`Claude API error: ${resp.status} ${errorData?.error?.message || resp.statusText}`);
          }
          const data = await resp.json();
          return {
            success: true,
            content: data.content?.[0]?.text || "",
            model,
            provider: "claude",
          };
        }
        case "gemini": {
          if (!apiKey) throw new Error("Gemini API key is required");
          const url =
            (baseUrl || "https://generativelanguage.googleapis.com/v1beta") +
            `/models/${model}:generateContent?key=${apiKey}`;
          const geminiContents = [
            {
               parts: [{ text: systemPrefix }],
               role: "user",
            },
            ...messages.map(m => ({ parts: [{ text: m.content }], role: m.role })),
          ];
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: geminiContents,
              generationConfig: {
                temperature: temperature ?? 0.7,
                maxOutputTokens: maxTokens ?? 500,
              },
            }),
          });
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => null);
            throw new Error(`Gemini API error: ${resp.status} ${errorData?.error?.message || resp.statusText}`);
          }
          const data = await resp.json();
          return {
            success: true,
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
            model,
            provider: "gemini",
          };
        }
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        content: "",
        error: error instanceof Error ? error.message : "Chat generation failed",
      };
    }
  }

  private async generateWithOllamaChat(
    prompt: string,
    request: {
      provider: string;
      model: string;
      prompt: string;
      context: string;
      fieldType: "description";
      auditData: { title: string };
      apiKey?: string;
      baseUrl?: string;
      temperature?: number;
      maxTokens?: number;
    },
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

      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: request.temperature || 0.7,
            num_predict: request.maxTokens || 500,
          },
        }),
      });

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
      return {
        success: true,
        content: data.response,
        model: request.model,
        provider: "ollama",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Ollama chat generation failed",
      };
    }
  }
}

export const aiChatService = new AIChatService();