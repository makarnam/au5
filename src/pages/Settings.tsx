import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { languageService } from "../services/languageService";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Globe,
  Database,
  Bot,
  Mail,
  Smartphone,
  Monitor,
  Save,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  TestTube,
  Edit,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { AIProvider } from "../types";
import { aiService, AIConfiguration } from "../services/aiService";
import { toast } from "react-hot-toast";
import LanguageSelector from "../components/LanguageSelector";

const OllamaStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    modelCount: number;
    models: string[];
    loading: boolean;
  }>({
    connected: false,
    modelCount: 0,
    models: [],
    loading: true,
  });

  const checkOllamaStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }));
      const models = await aiService.getOllamaModels();
      setStatus({
        connected: true,
        modelCount: models.length,
        models: models.slice(0, 3), // Show first 3 models
        loading: false,
      });
    } catch (error) {
      setStatus({
        connected: false,
        modelCount: 0,
        models: [],
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  return (
    <div className="text-sm">
      <div className="flex items-center space-x-2 mb-2">
        {status.loading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        ) : status.connected ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        <span className={status.connected ? "text-green-800" : "text-red-800"}>
          {status.loading
            ? "Checking..."
            : status.connected
              ? "Connected"
              : "Disconnected"}
        </span>
        <button
          onClick={checkOllamaStatus}
          className="text-blue-600 hover:text-blue-800"
          title="Refresh Status"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {status.connected && (
        <div className="text-blue-800">
          <p className="mb-1">{status.modelCount} models available</p>
          {status.models.length > 0 && (
            <div className="text-xs text-blue-700">
              {status.models.join(", ")}
              {status.modelCount > 3 && ` +${status.modelCount - 3} more`}
            </div>
          )}
        </div>
      )}

      {!status.connected && !status.loading && (
        <div className="text-red-800 text-xs">
          <p>Ollama not running or not accessible</p>
          <p>
            Start Ollama:{" "}
            <code className="bg-red-100 px-1 rounded">ollama serve</code>
          </p>
        </div>
      )}
    </div>
  );
};

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { checkPermission } = useAuthStore();
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(false);

  // AI Configuration state
  const [aiConfigurations, setAiConfigurations] = useState<AIConfiguration[]>(
    [],
  );
  const [loadingAiConfigs, setLoadingAiConfigs] = useState(false);
  const [showAiForm, setShowAiForm] = useState(false);
  const [editingAiConfig, setEditingAiConfig] =
    useState<AIConfiguration | null>(null);
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    provider: "ollama",
    model_name: "",
    api_endpoint: "http://localhost:11434",
    api_key: "",
    max_tokens: 2000,
    temperature: 0.7,
    is_active: true,
  });
  const [settings, setSettings] = useState({
    // General Settings
    language: languageService.getCurrentLanguage(),
    timezone: "UTC",
    dateFormat: "MM/dd/yyyy",
    theme: "light",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    auditReminders: true,
    findingAlerts: true,
    reportNotifications: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiry: 90,

    // AI Settings (legacy - now using database)
    aiProvider: "ollama" as AIProvider,
    aiModel: "llama2",
    aiApiKey: "",
    aiEndpoint: "http://localhost:11434",
    maxTokens: 2000,
    temperature: 0.7,

    // System Settings
    auditRetention: 7,
    logLevel: "info",
    backupFrequency: "daily",
    maintenanceMode: false,
  });

  const settingsSections: SettingsSection[] = [
    {
      id: "general",
      title: t("pages.settings.general"),
      description: "Basic application preferences and display settings",
      icon: SettingsIcon,
    },
    {
      id: "notifications",
      title: t("pages.settings.notifications"),
      description: "Configure how and when you receive notifications",
      icon: Bell,
    },
    {
      id: "security",
      title: t("pages.settings.security"),
      description: "Security preferences and authentication settings",
      icon: Shield,
    },
    {
      id: "ai",
      title: t("pages.settings.ai"),
      description: "Configure AI models and API settings",
      icon: Bot,
    },
  ];

  // Add system settings for admins
  if (checkPermission(["super_admin", "admin"])) {
    settingsSections.push({
      id: "system",
      title: t("pages.settings.system"),
      description: "System-wide configuration and maintenance",
      icon: Database,
    });
  }

  useEffect(() => {
    if (activeSection === "ai") {
      loadAiConfigurations();
      loadAiProviders();
    }
  }, [activeSection]);

  const loadAiConfigurations = async () => {
    try {
      setLoadingAiConfigs(true);
      const configs = await aiService.getConfigurations();
      setAiConfigurations(configs);
    } catch (error) {
      console.error("Error loading AI configurations:", error);
      toast.error("Failed to load AI configurations");
    } finally {
      setLoadingAiConfigs(false);
    }
  };

  const loadAiProviders = async () => {
    try {
      const providers = aiService.getProviders();
      setAiProviders(providers);

      // Set default model for current provider if not set
      if (aiFormData.provider && !aiFormData.model_name) {
        await loadModelsForProvider(aiFormData.provider);
      }
    } catch (error) {
      console.error("Error loading AI providers:", error);
    }
  };

  const loadModelsForProvider = async (providerId: string) => {
    try {
      setLoadingModels(true);
      const provider = await aiService.getProviderWithLiveModels(
        providerId,
        aiFormData.api_endpoint || undefined,
      );

      if (provider) {
        // Update the providers list with live models
        setAiProviders((prev) =>
          prev.map((p) => (p.id === providerId ? provider : p)),
        );

        // Auto-select first model if none selected
        if (!aiFormData.model_name && provider.models.length > 0) {
          setAiFormData((prev) => ({
            ...prev,
            model_name: provider.models[0],
          }));
        }
      }
    } catch (error) {
      console.error("Error loading models for provider:", error);
      toast.error("Failed to load models from provider");
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!aiFormData.model_name || aiFormData.model_name.trim() === "") {
      toast.error("Please select a model");
      return;
    }

    if (!aiFormData.provider) {
      toast.error("Please select a provider");
      return;
    }

    try {
      setLoading(true);

      const configData = {
        ...aiFormData,
        model_name: aiFormData.model_name.trim(), // Ensure no whitespace
        created_by: "", // Will be set by the service
      };

      // Debug logging
      console.log("Saving AI configuration:", {
        provider: configData.provider,
        model_name: configData.model_name,
        model_name_length: configData.model_name.length,
        api_endpoint: configData.api_endpoint,
        max_tokens: configData.max_tokens,
        temperature: configData.temperature,
        is_active: configData.is_active,
      });

      await aiService.saveConfiguration(configData);
      toast.success("AI configuration saved successfully!");

      await loadAiConfigurations();
      setShowAiForm(false);
      setEditingAiConfig(null);
      resetAiForm();
    } catch (error) {
      console.error("Error saving AI configuration:", error);
      if (error && typeof error === "object" && "message" in error) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        toast.error("Failed to save AI configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditAiConfig = (config: AIConfiguration) => {
    setEditingAiConfig(config);
    setAiFormData({
      provider: config.provider,
      model_name: config.model_name,
      api_endpoint: config.api_endpoint || "",
      api_key: config.api_key || "",
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      is_active: config.is_active,
    });
    setShowAiForm(true);
  };

  const handleDeleteAiConfig = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this AI configuration?")) {
      return;
    }

    try {
      await aiService.deleteConfiguration(configId);
      toast.success("AI configuration deleted successfully!");
      await loadAiConfigurations();
    } catch (error) {
      console.error("Error deleting AI configuration:", error);
      toast.error("Failed to delete AI configuration");
    }
  };

  const handleTestAiConfig = async (config: AIConfiguration) => {
    try {
      const result = await aiService.testConnection(
        config.provider,
        config.model_name,
        config.api_key,
        config.api_endpoint,
      );
      if (result) {
        toast.success("Connection test successful!");
      } else {
        toast.error("Connection test failed");
      }
    } catch (error) {
      console.error("Error testing AI configuration:", error);
      toast.error("Connection test failed");
    }
  };

  const resetAiForm = async () => {
    const initialFormData = {
      provider: "ollama",
      model_name: "",
      api_endpoint: "http://localhost:11434",
      api_key: "",
      max_tokens: 2000,
      temperature: 0.7,
      is_active: true,
    };

    setAiFormData(initialFormData);

    // Load models for Ollama and set default
    try {
      const ollamaProvider = await aiService.getProviderWithLiveModels(
        "ollama",
        "http://localhost:11434",
      );
      if (ollamaProvider && ollamaProvider.models.length > 0) {
        setAiFormData((prev) => ({
          ...prev,
          model_name: ollamaProvider.models[0],
        }));

        // Update providers list
        setAiProviders((prev) =>
          prev.map((p) => (p.id === "ollama" ? ollamaProvider : p)),
        );
      }
    } catch (error) {
      console.error("Error loading Ollama models:", error);
    }
  };

  const getProviderModels = (providerId: string) => {
    const provider = aiProviders.find((p) => p.id === providerId);
    return provider?.models || [];
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call for other settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real app, save settings to backend
      console.log("Settings saved:", settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("settings.displayPreferences")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              {t("settings.language")}
            </label>
            <div className="mt-1">
              <LanguageSelector />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleInputChange("dateFormat", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              <option value="dd/MM/yyyy">dd/MM/yyyy</option>
              <option value="yyyy-MM-dd">yyyy-MM-dd</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Monitor className="w-4 h-4 inline mr-2" />
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleInputChange("theme", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleInputChange("emailNotifications", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive push notifications in browser
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) =>
                  handleInputChange("pushNotifications", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Audit Reminders</p>
                <p className="text-sm text-gray-500">
                  Get reminders for upcoming audits
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auditReminders}
                onChange={(e) =>
                  handleInputChange("auditReminders", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Finding Alerts</p>
                <p className="text-sm text-gray-500">
                  Alerts for high-priority findings
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.findingAlerts}
                onChange={(e) =>
                  handleInputChange("findingAlerts", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Security Settings
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) =>
                  handleInputChange("twoFactorAuth", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleInputChange("sessionTimeout", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) =>
                  handleInputChange("passwordExpiry", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="30"
                max="365"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            AI Configurations
          </h3>
          <p className="text-sm text-gray-600">
            Manage your AI providers and models
          </p>
        </div>
        <button
          onClick={async () => {
            await resetAiForm();
            setEditingAiConfig(null);
            setShowAiForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Configuration
        </button>
      </div>

      {/* AI Configurations List */}
      <div className="space-y-4">
        {loadingAiConfigs ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading configurations...
          </div>
        ) : aiConfigurations.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No AI Configurations
            </h4>
            <p className="text-gray-600 mb-4">
              Get started by adding your first AI provider configuration.
            </p>
            <button
              onClick={async () => {
                await resetAiForm();
                setEditingAiConfig(null);
                setShowAiForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Configuration
            </button>
          </div>
        ) : (
          aiConfigurations.map((config) => (
            <div
              key={config.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${
                      config.provider === "ollama"
                        ? "bg-green-100 text-green-600"
                        : config.provider === "openai"
                          ? "bg-blue-100 text-blue-600"
                          : config.provider === "claude"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {config.provider}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Model: {config.model_name} | Tokens: {config.max_tokens} |
                      Temp: {config.temperature}
                    </p>
                    {config.api_endpoint && (
                      <p className="text-xs text-gray-500">
                        Endpoint: {config.api_endpoint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      config.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {config.is_active ? "Active" : "Inactive"}
                  </span>

                  <button
                    onClick={() => handleTestAiConfig(config)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Test Connection"
                  >
                    <TestTube className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditAiConfig(config)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Configuration"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteAiConfig(config.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Configuration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Configuration Form */}
      {showAiForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {editingAiConfig ? "Edit" : "Add"} AI Configuration
            </h4>
            <button
              onClick={async () => {
                setShowAiForm(false);
                setEditingAiConfig(null);
                await resetAiForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveAiConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  value={aiFormData.provider}
                  onChange={async (e) => {
                    const newProvider = e.target.value;
                    setAiFormData({
                      ...aiFormData,
                      provider: newProvider,
                      model_name: "",
                      api_endpoint:
                        newProvider === "ollama"
                          ? "http://localhost:11434"
                          : "",
                    });

                    // Load live models for the selected provider
                    await loadModelsForProvider(newProvider);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {aiProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model{" "}
                  {loadingModels && (
                    <span className="text-xs text-gray-500">(Loading...)</span>
                  )}
                </label>
                <div className="flex space-x-2">
                  <select
                    value={aiFormData.model_name}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        model_name: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loadingModels}
                  >
                    {loadingModels ? (
                      <option value="">Loading models...</option>
                    ) : getProviderModels(aiFormData.provider).length === 0 ? (
                      <option value="">
                        No models found for {aiFormData.provider}
                        {aiFormData.provider === "ollama"
                          ? " - Try refreshing or check if Ollama is running"
                          : ""}
                      </option>
                    ) : (
                      <>
                        <option value="">Select a model</option>
                        {getProviderModels(aiFormData.provider).map(
                          (model: string) => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ),
                        )}
                      </>
                    )}
                  </select>
                  {aiFormData.provider === "ollama" && (
                    <button
                      type="button"
                      onClick={() => loadModelsForProvider(aiFormData.provider)}
                      disabled={loadingModels}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      title="Refresh models from Ollama"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loadingModels ? "animate-spin" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {aiFormData.provider === "ollama" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Models are fetched from your local Ollama installation. Make
                    sure Ollama is running and models are installed.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={aiFormData.api_endpoint}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      api_endpoint: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="http://localhost:11434"
                />
                {aiFormData.provider === "ollama" && (
                  <button
                    type="button"
                    onClick={() => loadModelsForProvider(aiFormData.provider)}
                    disabled={loadingModels}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    title="Refresh models from Ollama"
                  >
                    {loadingModels ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for default endpoints. For Ollama, use
                http://localhost:11434
              </p>
            </div>

            {aiProviders.find((p) => p.id === aiFormData.provider)
              ?.requiresApiKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={aiFormData.api_key}
                  onChange={(e) =>
                    setAiFormData({ ...aiFormData, api_key: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your API key"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={aiFormData.max_tokens}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      max_tokens: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                  max="10000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={aiFormData.temperature}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={aiFormData.is_active}
                onChange={(e) =>
                  setAiFormData({ ...aiFormData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active configuration
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={async () => {
                  setShowAiForm(false);
                  setEditingAiConfig(null);
                  await resetAiForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingAiConfig ? "Update" : "Save"} Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-900 mb-1">
              Setup Instructions
            </h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Ollama:</strong> Install locally and pull models
                (e.g., `ollama pull llama3.2`)
              </li>
              <li>
                • <strong>OpenAI:</strong> Get API key from platform.openai.com
              </li>
              <li>
                • <strong>Claude:</strong> Get API key from
                console.anthropic.com
              </li>
              <li>
                • <strong>Gemini:</strong> Get API key from aistudio.google.com
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-900 mb-1">Ollama Status</h5>
            <OllamaStatus />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Configuration
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-500">
                  Enable maintenance mode for system updates
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  handleInputChange("maintenanceMode", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Retention (years)
              </label>
              <input
                type="number"
                value={settings.auditRetention}
                onChange={(e) =>
                  handleInputChange("auditRetention", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => handleInputChange("logLevel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) =>
                  handleInputChange("backupFrequency", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>

          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-500">
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl"
          >
            {activeSection === "general" && renderGeneralSettings()}
            {activeSection === "notifications" && renderNotificationSettings()}
            {activeSection === "security" && renderSecuritySettings()}
            {activeSection === "ai" && renderAISettings()}
            {activeSection === "system" && renderSystemSettings()}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Changes are saved automatically when you modify settings.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
