import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Bot,
  Globe,
  Key,
  TestTube,
  Trash2,
  Plus,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AIConfiguration, AIProvider } from "../../types";
import { aiService } from "../../services/aiService";
import LoadingSpinner from "../LoadingSpinner";

interface AIConfigModalProps {
  onClose: () => void;
}

interface ConfigFormData {
  provider: AIProvider;
  model_name: string;
  api_endpoint?: string;
  api_key?: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfiguration | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ConfigFormData>({
    provider: "ollama",
    model_name: "",
    api_endpoint: "",
    api_key: "",
    max_tokens: 2000,
    temperature: 0.7,
    is_active: true,
  });

  const providers = aiService.getProviders();

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const configs = await aiService.getConfigurations();
      setConfigurations(configs);
    } catch (error) {
      console.error("Error loading configurations:", error);
      toast.error("Failed to load AI configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      if (editingConfig) {
        await aiService.saveConfiguration({
          ...formData,
          id: editingConfig.id,
        });
        toast.success("Configuration updated successfully");
      } else {
        await aiService.saveConfiguration(formData);
        toast.success("Configuration saved successfully");
      }

      await loadConfigurations();
      resetForm();
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    }
  };

  const handleTestConnection = async (config: AIConfiguration) => {
    try {
      setTesting(config.id);
      const result = await aiService.testConnection(config);

      if (result.success) {
        toast.success("Connection test successful!");
      } else {
        toast.error(`Connection test failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Connection test failed");
    } finally {
      setTesting(null);
    }
  };

  const handleDeleteConfiguration = async (configId: string) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      // Note: You'll need to implement this in the aiService
      await aiService.deleteConfiguration?.(configId);
      setConfigurations(prev => prev.filter(c => c.id !== configId));
      toast.success("Configuration deleted successfully");
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast.error("Failed to delete configuration");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.model_name.trim()) {
      newErrors.model_name = "Model name is required";
    }

    if (formData.provider === "ollama" && !formData.api_endpoint?.trim()) {
      newErrors.api_endpoint = "API endpoint is required for Ollama";
    }

    if (["openai", "claude", "gemini"].includes(formData.provider) && !formData.api_key?.trim()) {
      newErrors.api_key = "API key is required for cloud providers";
    }

    if (formData.max_tokens < 100 || formData.max_tokens > 10000) {
      newErrors.max_tokens = "Max tokens must be between 100 and 10000";
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = "Temperature must be between 0 and 2";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      provider: "ollama",
      model_name: "",
      api_endpoint: "",
      api_key: "",
      max_tokens: 2000,
      temperature: 0.7,
      is_active: true,
    });
    setEditingConfig(null);
    setShowForm(false);
    setErrors({});
  };

  const startEdit = (config: AIConfiguration) => {
    setFormData({
      provider: config.provider,
      model_name: config.model_name,
      api_endpoint: config.api_endpoint || "",
      api_key: config.api_key || "",
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      is_active: config.is_active,
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case "ollama": return "🦙";
      case "openai": return "🤖";
      case "claude": return "🧠";
      case "gemini": return "💎";
      default: return "🤖";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI Configuration
              </h2>
              <p className="text-sm text-gray-600">
                Manage AI providers and their settings for control generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading configurations..." />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add New Configuration Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  AI Provider Configurations
                </h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Configuration
                </button>
              </div>

              {/* Configuration Form */}
              {showForm && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {editingConfig ? "Edit Configuration" : "Add New Configuration"}
                  </h4>

                  <form onSubmit={handleSaveConfiguration} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Provider */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider *
                      </label>
                      <select
                        value={formData.provider}
                        onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as AIProvider }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(providers).map(([key, provider]) => (
                          <option key={key} value={key}>
                            {getProviderIcon(key as AIProvider)} {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        value={formData.model_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                        placeholder="e.g., llama2, gpt-4, claude-3"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.model_name ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.model_name && (
                        <p className="text-sm text-red-600 mt-1">{errors.model_name}</p>
                      )}
                    </div>

                    {/* API Endpoint (for Ollama) */}
                    {formData.provider === "ollama" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Endpoint *
                        </label>
                        <input
                          type="url"
                          value={formData.api_endpoint}
                          onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
                          placeholder="http://localhost:11434"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.api_endpoint ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.api_endpoint && (
                          <p className="text-sm text-red-600 mt-1">{errors.api_endpoint}</p>
                        )}
                      </div>
                    )}

                    {/* API Key (for cloud providers) */}
                    {["openai", "claude", "gemini"].includes(formData.provider) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key *
                        </label>
                        <input
                          type="password"
                          value={formData.api_key}
                          onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                          placeholder="Enter your API key"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.api_key ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.api_key && (
                          <p className="text-sm text-red-600 mt-1">{errors.api_key}</p>
                        )}
                      </div>
                    )}

                    {/* Max Tokens */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={formData.max_tokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                        min="100"
                        max="10000"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.max_tokens ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.max_tokens && (
                        <p className="text-sm text-red-600 mt-1">{errors.max_tokens}</p>
                      )}
                    </div>

                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature
                      </label>
                      <input
                        type="number"
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        min="0"
                        max="2"
                        step="0.1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.temperature ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.temperature && (
                        <p className="text-sm text-red-600 mt-1">{errors.temperature}</p>
                      )}
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Active configuration
                        </span>
                      </label>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {editingConfig ? "Update" : "Save"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Existing Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configurations.map((config) => (
                  <div
                    key={config.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getProviderIcon(config.provider)}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {providers[config.provider]?.name || config.provider}
                          </h4>
                          <p className="text-sm text-gray-600">{config.model_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEdit(config)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfiguration(config.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Max Tokens:</span>
                        <span>{config.max_tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temperature:</span>
                        <span>{config.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          config.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {config.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTestConnection(config)}
                      disabled={testing === config.id}
                      className="w-full mt-3 flex items-center justify-center px-3 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {testing === config.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {configurations.length === 0 && !showForm && (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No AI configurations found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your first AI provider configuration to start generating controls
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Configuration
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIConfigModal;
