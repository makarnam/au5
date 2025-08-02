import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Brain,
  Key,
  Globe,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Save,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  aiService,
  AIProvider,
  AIConfiguration,
} from "../../services/aiService";

interface AIConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIConfigurationComponent({
  isOpen,
  onClose,
}: AIConfigurationProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(
    null,
  );
  const [editingConfig, setEditingConfig] =
    useState<Partial<AIConfiguration> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    model_name: "",
    api_key: "",
    api_endpoint: "",
    temperature: 0.7,
    max_tokens: 500,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [providersData, configurationsData] = await Promise.all([
        Promise.resolve(aiService.getProviders()),
        aiService.getConfigurations(),
      ]);
      setProviders(providersData);
      setConfigurations(configurationsData);
    } catch (error) {
      console.error("Error loading AI data:", error);
      toast.error("Failed to load AI configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const existingConfig = configurations.find(
      (c) => c.provider === provider.id,
    );

    if (existingConfig) {
      setEditingConfig(existingConfig);
      setFormData({
        model_name: existingConfig.model_name,
        api_key: existingConfig.api_key || "",
        api_endpoint: existingConfig.api_endpoint || "",
        temperature: existingConfig.temperature,
        max_tokens: existingConfig.max_tokens,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        model_name: provider.defaultModel,
        api_key: "",
        api_endpoint:
          provider.type === "ollama" ? "http://localhost:11434" : "",
        temperature: 0.7,
        max_tokens: 500,
      });
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedProvider) return;

    try {
      setIsLoading(true);

      const configData = {
        provider: selectedProvider.id,
        model_name: formData.model_name,
        api_key: selectedProvider.requiresApiKey ? formData.api_key : undefined,
        api_endpoint: formData.api_endpoint || undefined,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        created_by: "", // Will be set by the service
        is_active: true,
      };

      await aiService.saveConfiguration(configData);
      await loadData();
      toast.success("AI configuration saved successfully!");
      setSelectedProvider(null);
      setEditingConfig(null);
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (config: AIConfiguration) => {
    try {
      setIsTesting(true);
      const provider = providers.find((p) => p.id === config.provider);
      if (!provider) return;

      const isConnected = await aiService.testConnection(
        config.provider,
        config.model,
        config.apiKey,
        config.baseUrl,
      );

      setTestResults((prev) => ({
        ...prev,
        [config.id!]: isConnected,
      }));

      if (isConnected) {
        toast.success(`${provider.name} connection successful!`);
      } else {
        toast.error(`${provider.name} connection failed`);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "ollama":
        return <Brain className="w-5 h-5 text-blue-500" />;
      case "openai":
        return <Globe className="w-5 h-5 text-green-500" />;
      case "claude":
        return <Settings className="w-5 h-5 text-purple-500" />;
      case "gemini":
        return <Brain className="w-5 h-5 text-orange-500" />;
      default:
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Brain className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              AI Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Provider Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Providers
            </h3>
            <div className="space-y-3">
              {providers.map((provider) => {
                const hasConfig = configurations.some(
                  (c) => c.provider === provider.id,
                );
                const config = configurations.find(
                  (c) => c.provider === provider.id,
                );

                return (
                  <div
                    key={provider.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProvider?.id === provider.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleProviderSelect(provider)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getProviderIcon(provider.type)}
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">
                            {provider.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {provider.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasConfig && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (config) handleTestConnection(config);
                              }}
                              disabled={isTesting}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <TestTube className="w-4 h-4" />
                            </button>
                            {testResults[config?.id!] !== undefined && (
                              <>
                                {testResults[config?.id!] ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </>
                            )}
                          </>
                        )}
                        {hasConfig ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Configuration Form */}
          <div>
            {selectedProvider ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configure {selectedProvider.name}
                </h3>
                <div className="space-y-4">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <select
                      value={formData.model_name}
                      onChange={(e) =>
                        setFormData({ ...formData, model_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {selectedProvider.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key (if required) */}
                  {selectedProvider.requiresApiKey && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={formData.api_key}
                        onChange={(e) =>
                          setFormData({ ...formData, api_key: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your API key"
                      />
                    </div>
                  )}

                  {/* Base URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Endpoint (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.api_endpoint}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          api_endpoint: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        selectedProvider.type === "ollama"
                          ? "http://localhost:11434"
                          : "Leave empty for default"
                      }
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature: {formData.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative (0)</span>
                      <span>Creative (1)</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={formData.max_tokens}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_tokens: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="100"
                      max="10000"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSaveConfiguration}
                      disabled={
                        isLoading ||
                        (selectedProvider.requiresApiKey && !formData.apiKey)
                      }
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingConfig ? "Update" : "Save"} Configuration
                    </button>
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Provider
                </h3>
                <p className="text-gray-600">
                  Choose an AI provider from the list to configure it for audit
                  generation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current Configurations */}
        {configurations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Configurations
            </h3>
            <div className="space-y-3">
              {configurations.map((config) => {
                const provider = providers.find(
                  (p) => p.id === config.provider,
                );
                if (!provider) return null;

                return (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      {getProviderIcon(provider.type)}
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Model: {config.model_name} | Temperature:{" "}
                          {config.temperature}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestConnection(config)}
                        disabled={isTesting}
                        className="text-gray-400 hover:text-blue-600"
                        title="Test Connection"
                      >
                        <TestTube className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleProviderSelect(provider)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit Configuration"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Getting Started with AI Generation
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Ollama:</strong> Install Ollama locally and pull models
              (e.g., `ollama pull llama3.2`)
            </li>
            <li>
              • <strong>OpenAI:</strong> Get API key from platform.openai.com
            </li>
            <li>
              • <strong>Claude:</strong> Get API key from console.anthropic.com
            </li>
            <li>
              • <strong>Gemini:</strong> Get API key from aistudio.google.com
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
