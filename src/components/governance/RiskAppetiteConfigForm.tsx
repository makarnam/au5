import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Gauge,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RiskAppetiteConfig {
  frameworkId: string;
  alertThresholds: {
    breach: number;
    approaching: number;
  };
  monitoringSettings: {
    refreshInterval: number;
    autoRefresh: boolean;
    notifications: {
      email: boolean;
      dashboard: boolean;
      sound: boolean;
    };
  };
  categories: Array<{
    id: string;
    name: string;
    thresholdMin: number;
    thresholdMax: number;
    unit: string;
    enabled: boolean;
  }>;
}

interface RiskAppetiteConfigFormProps {
  initialData?: Partial<RiskAppetiteConfig>;
  onSubmit: (data: RiskAppetiteConfig) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RiskAppetiteConfigForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: RiskAppetiteConfigFormProps) {
  const { t } = useTranslation();

  const [config, setConfig] = useState<RiskAppetiteConfig>({
    frameworkId: initialData?.frameworkId || '',
    alertThresholds: initialData?.alertThresholds || { breach: 90, approaching: 75 },
    monitoringSettings: initialData?.monitoringSettings || {
      refreshInterval: 30,
      autoRefresh: true,
      notifications: { email: true, dashboard: true, sound: false }
    },
    categories: initialData?.categories || [
      { id: '1', name: 'Operational Risk', thresholdMin: 0, thresholdMax: 100, unit: 'percentage', enabled: true },
      { id: '2', name: 'Financial Risk', thresholdMin: 0, thresholdMax: 5000000, unit: 'currency_usd', enabled: true },
      { id: '3', name: 'Compliance Risk', thresholdMin: 0, thresholdMax: 50, unit: 'violations_per_quarter', enabled: true },
      { id: '4', name: 'Strategic Risk', thresholdMin: 0, thresholdMax: 10, unit: 'probability_percentage', enabled: true }
    ]
  });

  const [activeTab, setActiveTab] = useState<'thresholds' | 'monitoring' | 'categories'>('thresholds');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSubmit(config);
      toast.success('Risk appetite configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const updateAlertThreshold = (type: 'breach' | 'approaching', value: number) => {
    setConfig(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [type]: Math.max(0, Math.min(100, value))
      }
    }));
  };

  const updateMonitoringSetting = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      monitoringSettings: {
        ...prev.monitoringSettings,
        [key]: value
      }
    }));
  };

  const updateNotificationSetting = (type: 'email' | 'dashboard' | 'sound', enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      monitoringSettings: {
        ...prev.monitoringSettings,
        notifications: {
          ...prev.monitoringSettings.notifications,
          [type]: enabled
        }
      }
    }));
  };

  const updateCategory = (id: string, updates: Partial<RiskAppetiteConfig['categories'][0]>) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      )
    }));
  };

  const addCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: 'New Category',
      thresholdMin: 0,
      thresholdMax: 100,
      unit: 'percentage',
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  const removeCategory = (id: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id)
    }));
  };

  const formatUnit = (unit: string) => {
    const unitLabels = {
      percentage: '%',
      currency_usd: '$',
      violations_per_quarter: '/quarter',
      probability_percentage: '%',
      impact_score: 'pts',
      negative_sentiment_score: 'pts'
    };
    return unitLabels[unit as keyof typeof unitLabels] || unit;
  };

  return (
    <motion.div
      className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-600" />
              Risk Appetite Configuration
            </h2>
            <p className="text-gray-600 mt-1">
              Configure thresholds, monitoring settings, and alert preferences
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex">
            {[
              { id: 'thresholds', label: 'Alert Thresholds', icon: AlertTriangle },
              { id: 'monitoring', label: 'Monitoring Settings', icon: Gauge },
              { id: 'categories', label: 'Risk Categories', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert Thresholds Tab */}
          {activeTab === 'thresholds' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Threshold Configuration</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Set the percentage thresholds for triggering alerts when risk utilization approaches or breaches limits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Breach Alert Threshold
                    </span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={config.alertThresholds.breach}
                        onChange={(e) => updateAlertThreshold('breach', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-red-600 min-w-[3rem]">
                        {config.alertThresholds.breach}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Triggers critical alerts when utilization exceeds this threshold
                    </p>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Approaching Alert Threshold
                    </span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="30"
                        max="80"
                        value={config.alertThresholds.approaching}
                        onChange={(e) => updateAlertThreshold('approaching', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-yellow-600 min-w-[3rem]">
                        {config.alertThresholds.approaching}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Triggers warning alerts when utilization approaches limits
                    </p>
                  </label>
                </div>
              </div>

              {/* Threshold Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Threshold Preview</h4>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-4 rounded-full"
                    style={{ width: '100%' }}
                  ></div>
                  <div
                    className="bg-yellow-600 w-1 h-4 -mt-4 rounded-full relative"
                    style={{ marginLeft: `${config.alertThresholds.approaching}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-yellow-600">
                      {config.alertThresholds.approaching}%
                    </span>
                  </div>
                  <div
                    className="bg-red-600 w-1 h-4 -mt-4 rounded-full relative"
                    style={{ marginLeft: `${config.alertThresholds.breach}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600">
                      {config.alertThresholds.breach}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Settings Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monitoring Configuration</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure how the system monitors risk tolerance levels and handles notifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Refresh Interval
                    </span>
                    <select
                      value={config.monitoringSettings.refreshInterval}
                      onChange={(e) => updateMonitoringSetting('refreshInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="900">15 minutes</option>
                    </select>
                  </label>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoRefresh"
                      checked={config.monitoringSettings.autoRefresh}
                      onChange={(e) => updateMonitoringSetting('autoRefresh', e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="autoRefresh" className="text-sm font-medium text-gray-700">
                      Enable Auto-Refresh
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-sm font-medium text-gray-700 block mb-3">
                    Notification Preferences
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotif"
                        checked={config.monitoringSettings.notifications.email}
                        onChange={(e) => updateNotificationSetting('email', e.target.checked)}
                        className="mr-3"
                      />
                      <label htmlFor="emailNotif" className="text-sm text-gray-700 flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="dashboardNotif"
                        checked={config.monitoringSettings.notifications.dashboard}
                        onChange={(e) => updateNotificationSetting('dashboard', e.target.checked)}
                        className="mr-3"
                      />
                      <label htmlFor="dashboardNotif" className="text-sm text-gray-700 flex items-center">
                        <Gauge className="w-4 h-4 mr-2" />
                        Dashboard Alerts
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="soundNotif"
                        checked={config.monitoringSettings.notifications.sound}
                        onChange={(e) => updateNotificationSetting('sound', e.target.checked)}
                        className="mr-3"
                      />
                      <label htmlFor="soundNotif" className="text-sm text-gray-700 flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sound Alerts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Risk Categories Configuration</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure risk categories and their tolerance thresholds.
                  </p>
                </div>
                <Button type="button" onClick={addCategory}>
                  <Settings className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-4">
                {config.categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <select
                          value={category.unit}
                          onChange={(e) => updateCategory(category.id, { unit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="currency_usd">Currency ($)</option>
                          <option value="violations_per_quarter">Violations/Quarter</option>
                          <option value="probability_percentage">Probability (%)</option>
                          <option value="impact_score">Impact Score</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Threshold
                        </label>
                        <input
                          type="number"
                          value={category.thresholdMin}
                          onChange={(e) => updateCategory(category.id, { thresholdMin: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Threshold
                        </label>
                        <input
                          type="number"
                          value={category.thresholdMax}
                          onChange={(e) => updateCategory(category.id, { thresholdMax: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`enabled-${category.id}`}
                          checked={category.enabled}
                          onChange={(e) => updateCategory(category.id, { enabled: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor={`enabled-${category.id}`} className="text-sm text-gray-700">
                          Enable monitoring for this category
                        </label>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Threshold Preview */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Threshold Range: {category.thresholdMin} - {category.thresholdMax} {formatUnit(category.unit)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${((category.thresholdMax - category.thresholdMin) / (category.thresholdMax + category.thresholdMin)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}