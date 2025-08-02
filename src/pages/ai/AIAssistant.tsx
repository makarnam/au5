import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  Settings,
  FileText,
  Shield,
  AlertTriangle,
  Search,
  Zap,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  ChevronDown,
  RefreshCw,
  Plus,
  Target,
  BarChart3,
  ClipboardList,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { aiService, AIConfiguration } from "../../services/aiService";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
}

interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ElementType;
  category:
    | "greeting"
    | "audit"
    | "control"
    | "risk"
    | "compliance"
    | "analysis";
}

const AIAssistant: React.FC = () => {
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<AIConfiguration | null>(
    null,
  );
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick prompts for audit-related tasks
  const quickPrompts: QuickPrompt[] = [
    {
      id: "greeting",
      title: "Hi! What can you help me with today?",
      description: "Get started with AI assistance",
      prompt:
        "Hi! What can you help me create today? I can assist you with audits, controls, risk assessments, compliance documentation, and much more. What would you like to work on?",
      icon: MessageSquare,
      category: "greeting",
    },
    {
      id: "audit_plan",
      title: "Create an Audit Plan",
      description: "Generate comprehensive audit planning documents",
      prompt:
        "I need help creating a comprehensive audit plan. Can you help me develop audit objectives, scope, methodology, timeline, and key risk areas for my audit?",
      icon: FileText,
      category: "audit",
    },
    {
      id: "control_matrix",
      title: "Generate Control Matrix",
      description: "Create detailed control frameworks",
      prompt:
        "I want to create a control matrix for my organization. Can you help me identify key controls, their types, frequencies, testing procedures, and evidence requirements?",
      icon: Shield,
      category: "control",
    },
    {
      id: "risk_assessment",
      title: "Risk Assessment",
      description: "Perform comprehensive risk analysis",
      prompt:
        "I need to conduct a risk assessment. Can you guide me through identifying risks, evaluating their probability and impact, and developing mitigation strategies?",
      icon: AlertTriangle,
      category: "risk",
    },
    {
      id: "compliance_gap",
      title: "Compliance Gap Analysis",
      description: "Identify compliance requirements and gaps",
      prompt:
        "I need to perform a compliance gap analysis. Can you help me identify regulatory requirements, assess current state, and recommend improvements?",
      icon: Search,
      category: "compliance",
    },
    {
      id: "audit_findings",
      title: "Analyze Audit Findings",
      description: "Review and provide recommendations for findings",
      prompt:
        "I have audit findings that need analysis. Can you help me understand root causes, assess business impact, and develop remediation recommendations?",
      icon: TrendingUp,
      category: "analysis",
    },
    {
      id: "sox_compliance",
      title: "SOX Compliance Guide",
      description: "Sarbanes-Oxley compliance assistance",
      prompt:
        "I need guidance on SOX compliance requirements. Can you help me understand key controls, documentation requirements, and testing procedures for SOX compliance?",
      icon: BookOpen,
      category: "compliance",
    },
    {
      id: "control_testing",
      title: "Design Control Tests",
      description: "Create effective control testing procedures",
      prompt:
        "I need to design control testing procedures. Can you help me create test steps, define sample sizes, and establish evidence requirements for control testing?",
      icon: ClipboardList,
      category: "control",
    },
    {
      id: "team_training",
      title: "Audit Team Training",
      description: "Develop training materials for audit teams",
      prompt:
        "I want to create training materials for my audit team. Can you help me develop content on audit methodologies, best practices, and industry standards?",
      icon: Users,
      category: "audit",
    },
    {
      id: "kpi_dashboard",
      title: "Audit KPIs & Metrics",
      description: "Define key performance indicators",
      prompt:
        "I need to establish audit KPIs and metrics. Can you help me identify relevant metrics, define targets, and create a monitoring framework?",
      icon: BarChart3,
      category: "analysis",
    },
  ];

  // Load configurations on component mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowConfigDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      setConfigurations(configs);

      // Select the first active configuration
      const activeConfig = configs.find((config) => config.is_active);
      if (activeConfig) {
        setSelectedConfig(activeConfig);
      }
    } catch (error) {
      console.error("Error loading AI configurations:", error);
      toast.error("Failed to load AI configurations");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (
    type: "user" | "assistant",
    content: string,
    model?: string,
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      model,
    };
    setChatMessages((prev) => [...prev, newMessage]);
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    setCurrentMessage(prompt.prompt);
    setShowQuickPrompts(false);
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage(prompt.prompt);
    }, 100);
  };

  const handleSendMessage = async (messageToSend?: string) => {
    const message = messageToSend || currentMessage.trim();
    if (!message || isGenerating) return;

    if (!selectedConfig) {
      toast.error("Please select an AI configuration first");
      return;
    }

    // Add user message
    addMessage("user", message);
    setCurrentMessage("");
    setIsGenerating(true);

    try {
      // Generate response using AI service
      const response = await aiService.generateContent({
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "",
        context: `You are a professional AI assistant specializing in audit, governance, risk, and compliance (GRC). You have extensive knowledge of audit methodologies, control frameworks, risk management, and regulatory compliance.

Current conversation context: ${chatMessages.map((m) => `${m.type}: ${m.content}`).join("\n")}

User message: ${message}

Please provide a helpful, professional, and detailed response. If the user is asking about creating audits, controls, or compliance documentation, offer specific guidance and actionable steps.`,
        fieldType: "description",
        auditData: { title: "AI Assistant Chat" },
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      });

      if (response.success) {
        addMessage(
          "assistant",
          response.content as string,
          selectedConfig.model_name,
        );
      } else {
        throw new Error(response.error || "Failed to generate response");
      }
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Provide a helpful fallback response
      let fallbackResponse =
        "I apologize, but I'm having trouble connecting to the AI service at the moment. ";

      if (
        message.toLowerCase().includes("hi") ||
        message.toLowerCase().includes("hello")
      ) {
        fallbackResponse +=
          "Hello! I'm here to help you with audit planning, control design, risk assessment, and compliance matters. What would you like to work on today?";
      } else if (message.toLowerCase().includes("audit")) {
        fallbackResponse +=
          "I can help you with audit planning, risk assessment, control testing, and findings analysis. Please let me know what specific aspect of auditing you'd like assistance with.";
      } else if (message.toLowerCase().includes("control")) {
        fallbackResponse +=
          "I can assist you with designing controls, creating control matrices, defining testing procedures, and establishing monitoring frameworks. What type of controls are you working on?";
      } else {
        fallbackResponse +=
          "I'm designed to help with audit, risk, and compliance matters. Please try asking about audit planning, control design, risk assessment, or compliance requirements.";
      }

      addMessage("assistant", fallbackResponse);
      toast.error(`AI generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const clearChat = () => {
    setChatMessages([]);
    setShowQuickPrompts(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">
                Your professional audit & compliance companion
              </p>
            </div>
          </div>

          {/* AI Configuration Selector */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowConfigDropdown(!showConfigDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedConfig ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm font-medium">
                    {selectedConfig
                      ? `${selectedConfig.provider} - ${selectedConfig.model_name}`
                      : "No Configuration"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showConfigDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        AI Configuration
                      </h3>
                      <button
                        onClick={loadConfigurations}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Refresh configurations"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select your preferred AI model
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {configurations.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No AI configurations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Configure AI settings first
                        </p>
                      </div>
                    ) : (
                      configurations.map((config) => (
                        <button
                          key={config.id}
                          onClick={() => {
                            setSelectedConfig(config);
                            setShowConfigDropdown(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                            selectedConfig?.id === config.id
                              ? "bg-blue-50 border-r-2 border-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${config.is_active ? "bg-green-500" : "bg-gray-400"}`}
                              />
                              <span className="font-medium text-sm capitalize">
                                {config.provider}
                              </span>
                            </div>
                            {selectedConfig?.id === config.id && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {config.model_name}
                          </p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            <span>Temp: {config.temperature}</span>
                            <span>Max: {config.max_tokens}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={clearChat}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {chatMessages.length === 0 && showQuickPrompts ? (
            <div className="max-w-4xl mx-auto">
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Your AI Audit Assistant
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  I'm here to help you with audit planning, control design, risk
                  assessment, compliance documentation, and more. Choose a quick
                  start option below or ask me anything!
                </p>
              </div>

              {/* Quick Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickPrompts.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <motion.button
                      key={prompt.id}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                            {prompt.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {prompt.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex space-x-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === "user"
                          ? "bg-blue-500"
                          : "bg-gradient-to-br from-purple-600 to-pink-600"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* Message Footer */}
                      <div
                        className={`flex items-center justify-between mt-2 pt-2 border-t ${
                          message.type === "user"
                            ? "border-blue-400"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2 text-xs">
                          <Clock className="w-3 h-3" />
                          <span
                            className={
                              message.type === "user"
                                ? "text-blue-100"
                                : "text-gray-500"
                            }
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {message.model && message.type === "assistant" && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500">
                                {message.model}
                              </span>
                            </>
                          )}
                        </div>

                        {message.type === "assistant" && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex space-x-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    selectedConfig
                      ? "Ask me about audits, controls, risk management, compliance..."
                      : "Please select an AI configuration first..."
                  }
                  disabled={!selectedConfig || isGenerating}
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={
                  !currentMessage.trim() || !selectedConfig || isGenerating
                }
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Quick Actions */}
            {!showQuickPrompts && chatMessages.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-xs text-gray-500">Quick actions:</span>
                {[
                  "Create audit plan",
                  "Design controls",
                  "Assess risks",
                  "Analyze findings",
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() =>
                      setCurrentMessage(`Help me ${action.toLowerCase()}`)
                    }
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-full transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
