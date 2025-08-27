import { supabase } from "../../lib/supabase";
import type { AIGenerationRequest, AIGenerationResponse } from "./types";

export class AILoggingService {
  async logGeneration(
    request: AIGenerationRequest,
    response: AIGenerationResponse,
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      await supabase.from("ai_generation_logs").insert([
        {
          user_id: user.id,
          provider: request.provider,
          model_name: request.model,
          prompt: request.prompt,
          response: response.content,
          tokens_used: response.tokensUsed || 0,
          request_type: request.fieldType,
          success: response.success,
          error_message: response.error,
        },
      ]);
    } catch (error) {
      console.error("Error logging AI generation:", error);
    }
  }

  async getGenerationLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("ai_generation_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching AI generation logs:", error);
      return [];
    }
  }

  async getGenerationStats(userId: string): Promise<{
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageTokensUsed: number;
    mostUsedProvider: string;
    mostUsedFieldType: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("ai_generation_logs")
        .select("success, tokens_used, provider, request_type")
        .eq("user_id", userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalGenerations: 0,
          successfulGenerations: 0,
          failedGenerations: 0,
          averageTokensUsed: 0,
          mostUsedProvider: "",
          mostUsedFieldType: "",
        };
      }

      const totalGenerations = data.length;
      const successfulGenerations = data.filter(log => log.success).length;
      const failedGenerations = totalGenerations - successfulGenerations;
      const totalTokens = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const averageTokensUsed = totalTokens / totalGenerations;

      // Find most used provider
      const providerCount: Record<string, number> = {};
      data.forEach(log => {
        providerCount[log.provider] = (providerCount[log.provider] || 0) + 1;
      });
      const mostUsedProvider = Object.keys(providerCount).reduce((a, b) =>
        providerCount[a] > providerCount[b] ? a : b, "");

      // Find most used field type
      const fieldTypeCount: Record<string, number> = {};
      data.forEach(log => {
        fieldTypeCount[log.request_type] = (fieldTypeCount[log.request_type] || 0) + 1;
      });
      const mostUsedFieldType = Object.keys(fieldTypeCount).reduce((a, b) =>
        fieldTypeCount[a] > fieldTypeCount[b] ? a : b, "");

      return {
        totalGenerations,
        successfulGenerations,
        failedGenerations,
        averageTokensUsed,
        mostUsedProvider,
        mostUsedFieldType,
      };
    } catch (error) {
      console.error("Error fetching AI generation stats:", error);
      return {
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        averageTokensUsed: 0,
        mostUsedProvider: "",
        mostUsedFieldType: "",
      };
    }
  }

  async logChatInteraction(
    userId: string,
    provider: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    response: string,
    tokensUsed?: number,
  ): Promise<void> {
    try {
      await supabase.from("ai_chat_logs").insert([
        {
          user_id: userId,
          provider,
          model_name: model,
          messages,
          response,
          tokens_used: tokensUsed || 0,
        },
      ]);
    } catch (error) {
      console.error("Error logging AI chat interaction:", error);
    }
  }

  async getChatLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("ai_chat_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching AI chat logs:", error);
      return [];
    }
  }

  async logError(
    userId: string,
    operation: string,
    error: string,
    context?: Record<string, any>,
  ): Promise<void> {
    try {
      await supabase.from("ai_error_logs").insert([
        {
          user_id: userId,
          operation,
          error_message: error,
          context,
        },
      ]);
    } catch (logError) {
      console.error("Error logging AI error:", logError);
    }
  }
}

export const aiLoggingService = new AILoggingService();