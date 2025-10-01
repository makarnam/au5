import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  ArrowRight,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  BarChart3,
  Link,
  Eye,
  RefreshCw,
  Database,
  Settings,
  TrendingUp
} from 'lucide-react';

type IntegrationLink = {
  id: string;
  from_module: string;
  to_module: string;
  link_type: string;
  description: string;
  data_flow: string;
  frequency: string;
  status: 'active' | 'inactive' | 'planned';
  last_sync: string | null;
};

type ModuleMetric = {
  module: string;
  records_count: number;
  active_integrations: number;
  data_quality_score: number;
  last_update: string;
};

export default function GovernanceIntegration() {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<IntegrationLink[]>([]);
  const [moduleMetrics, setModuleMetrics] = useState<ModuleMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationLink | null>(null);

  const loadIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      // Create sample integration data since this is a demo
      const sampleIntegrations: IntegrationLink[] = [
        {
          id: '1',
          from_module: 'Governance',
          to_module: 'Risk Management',
          link_type: 'Strategic Risk Alignment',
          description: 'Links governance strategy objectives with risk management activities',
          data_flow: 'Strategy objectives → Risk appetite → Risk assessments',
          frequency: 'Quarterly',
          status: 'active',
          last_sync: '2024-12-15T10:30:00Z'
        },
        {
          id: '2',
          from_module: 'Governance',
          to_module: 'Compliance',
          link_type: 'Regulatory Alignment',
          description: 'Maps governance policies to compliance requirements',
          data_flow: 'Policies → Compliance frameworks → Requirements mapping',
          frequency: 'Monthly',
          status: 'active',
          last_sync: '2024-12-14T15:45:00Z'
        },
        {
          id: '3',
          from_module: 'Governance',
          to_module: 'Audit',
          link_type: 'Audit Planning Integration',
          description: 'Aligns governance priorities with audit planning and execution',
          data_flow: 'Strategic objectives → Audit universe → Audit plans',
          frequency: 'Bi-annually',
          status: 'active',
          last_sync: '2024-11-30T09:15:00Z'
        },
        {
          id: '4',
          from_module: 'Risk Management',
          to_module: 'Governance',
          link_type: 'Risk Appetite Monitoring',
          description: 'Monitors risk metrics against governance-defined appetite',
          data_flow: 'Risk incidents → Risk appetite thresholds → Governance KPIs',
          frequency: 'Weekly',
          status: 'active',
          last_sync: '2024-12-16T08:00:00Z'
        },
        {
          id: '5',
          from_module: 'Compliance',
          to_module: 'Governance',
          link_type: 'Compliance Reporting',
          description: 'Feeds compliance status into governance reporting',
          data_flow: 'Compliance scores → Board reports → Governance metrics',
          frequency: 'Monthly',
          status: 'active',
          last_sync: '2024-12-01T12:00:00Z'
        },
        {
          id: '6',
          from_module: 'Audit',
          to_module: 'Governance',
          link_type: 'Audit Findings Integration',
          description: 'Incorporates audit findings into governance improvement plans',
          data_flow: 'Audit findings → Governance initiatives → Strategic improvements',
          frequency: 'Quarterly',
          status: 'planned',
          last_sync: null
        }
      ];
      setIntegrations(sampleIntegrations);

      // Sample module metrics
      const sampleMetrics: ModuleMetric[] = [
        {
          module: 'Governance',
          records_count: 45,
          active_integrations: 5,
          data_quality_score: 96,
          last_update: '2024-12-16T10:30:00Z'
        },
        {
          module: 'Risk Management',
          records_count: 128,
          active_integrations: 3,
          data_quality_score: 92,
          last_update: '2024-12-16T08:00:00Z'
        },
        {
          module: 'Compliance',
          records_count: 89,
          active_integrations: 4,
          data_quality_score: 94,
          last_update: '2024-12-15T15:45:00Z'
        },
        {
          module: 'Audit',
          records_count: 67,
          active_integrations: 2,
          data_quality_score: 88,
          last_update: '2024-12-14T12:00:00Z'
        }
      ];
      setModuleMetrics(sampleMetrics);
    } catch (error) {
      console.error('Error loading integrations:', error);
      setIntegrations([]);
      setModuleMetrics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'governance': return <Shield className="w-5 h-5" />;
      case 'risk management': return <AlertTriangle className="w-5 h-5" />;
      case 'compliance': return <CheckCircle className="w-5 h-5" />;
      case 'audit': return <FileText className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module.toLowerCase()) {
      case 'governance': return 'bg-blue-100 text-blue-800';
      case 'risk management': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-green-100 text-green-800';
      case 'audit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const integrationStats = {
    total: integrations.length,
    active: integrations.filter(i => i.status === 'active').length,
    planned: integrations.filter(i => i.status === 'planned').length,
    modules: new Set([...integrations.map(i => i.from_module), ...integrations.map(i => i.to_module)]).size
  };

  return (
    <motion.div
      className="p-4 space-y-6 bg-gray-50 min-h-screen transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Network className="w-8 h-8 mr-3 text-blue-600" />
            {t("governanceIntegration", "Governance Integration")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("governanceIntegrationDesc", "Manage integration points between governance and other GRC modules")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => loadIntegrations()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t("refresh", "Refresh")}
          </Button>
          <Button
            onClick={() => {/* Configure integrations */}}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t("configureIntegrations", "Configure Integrations")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{integrationStats.total}</p>
            </div>
            <Network className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Links</p>
              <p className="text-2xl font-bold text-green-600">{integrationStats.active}</p>
            </div>
            <Link className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Modules Connected</p>
              <p className="text-2xl font-bold text-purple-600">{integrationStats.modules}</p>
            </div>
            <Database className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Planned Links</p>
              <p className="text-2xl font-bold text-yellow-600">{integrationStats.planned}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </motion.div>

      {/* Module Metrics */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Module Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleMetrics.map((metric, index) => (
              <motion.div
                key={metric.module}
                className="p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {getModuleIcon(metric.module)}
                  <span className="font-medium text-gray-900">{metric.module}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Records:</span>
                    <span className="font-medium">{metric.records_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Integrations:</span>
                    <span className="font-medium">{metric.active_integrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Quality:</span>
                    <span className="font-medium">{metric.data_quality_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium text-xs">
                      {new Date(metric.last_update).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Integration Links */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Link className="w-5 h-5 mr-2" />
            Integration Links
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading integrations...</span>
            </div>
          ) : integrations.length > 0 ? (
            <div className="space-y-4">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(integration.from_module)}`}>
                            {getModuleIcon(integration.from_module)}
                            <span className="ml-1">{integration.from_module}</span>
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(integration.to_module)}`}>
                            {getModuleIcon(integration.to_module)}
                            <span className="ml-1">{integration.to_module}</span>
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{integration.link_type}</h4>
                      <p className="text-gray-600 mb-3">{integration.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Data Flow:</span> {integration.data_flow}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {integration.frequency}
                        </div>
                        {integration.last_sync && (
                          <div>
                            <span className="font-medium">Last Sync:</span> {new Date(integration.last_sync).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {integration.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sync Now
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Network className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Integration Links</h3>
              <p className="text-gray-600 mb-6">Set up integration links between governance and other modules</p>
              <Button onClick={() => {/* Setup integrations */}}>
                <Link className="w-4 h-4 mr-2" />
                Setup Integration
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}