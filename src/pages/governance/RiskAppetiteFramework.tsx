import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Target,
  Edit,
  Plus,
  Eye,
  BarChart3,
  Activity,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  Bell,
  Layers,
  Thermometer,
  Gauge,
  Trash2,
  RefreshCw,
  Save
} from 'lucide-react';
import { GovernanceService } from '../../services/governanceService';
import type {
  RiskAppetiteFramework,
  RiskMeasurement,
  RiskScenario,
  RiskAppetiteFormData
} from '../../services/governanceService';
import RiskAppetiteForm from '../../components/governance/RiskAppetiteForm';
import RiskScenarioForm from '../../components/governance/RiskScenarioForm';
import { toast } from 'react-hot-toast';

type RiskAppetiteAnalytics = {
  totalCategories: number;
  categoriesWithinAppetite: number;
  categoriesApproachingLimit: number;
  categoriesBreached: number;
  overallAppetiteStatus: 'healthy' | 'warning' | 'critical';
  averageThresholdUtilization: number;
  recentBreaches: number;
  upcomingReviews: number;
};

export default function RiskAppetiteFramework() {
    const { t } = useTranslation();
    const [frameworks, setFrameworks] = useState<RiskAppetiteFramework[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFramework, setSelectedFramework] = useState<RiskAppetiteFramework | null>(null);

    // Enhanced GRC state
    const [riskMeasurements, setRiskMeasurements] = useState<RiskMeasurement[]>([]);
    const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'frameworks' | 'monitoring' | 'scenarios' | 'analytics'>('frameworks');
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // CRUD state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingFramework, setEditingFramework] = useState<RiskAppetiteFramework | null>(null);
    const [showScenarioForm, setShowScenarioForm] = useState(false);
    const [editingScenario, setEditingScenario] = useState<RiskScenario | null>(null);
    const [saving, setSaving] = useState(false);

   const loadFrameworks = useCallback(async () => {
     setLoading(true);
     try {
       const data = await GovernanceService.getRiskAppetiteFrameworks();
       setFrameworks(data);
     } catch (error) {
       console.error('Error loading frameworks:', error);
       setFrameworks([]);
       toast.error('Failed to load risk appetite frameworks');
     } finally {
       setLoading(false);
     }
   }, []);

  // Load risk measurements for monitoring
  const loadRiskMeasurements = useCallback(async () => {
    if (!selectedFramework) return;

    try {
      // In a real implementation, this would load from a risk measurements table
      // For now, we'll simulate measurements based on the framework thresholds
      const measurements: RiskMeasurement[] = [];
      const categories = selectedFramework.risk_categories.categories;
      const thresholds = selectedFramework.tolerance_thresholds.thresholds;

      categories.forEach((category, index) => {
        const threshold = thresholds[category.toLowerCase().replace(' ', '_')];
        if (threshold) {
          // Simulate current values (in real implementation, this would come from risk assessments)
          const currentValue = Math.floor(Math.random() * (threshold.max - threshold.min + 1)) + threshold.min;
          const utilization = (currentValue - threshold.min) / (threshold.max - threshold.min);

          let status: 'within_appetite' | 'approaching_limit' | 'breached' = 'within_appetite';
          if (utilization > 0.8) status = 'breached';
          else if (utilization > 0.6) status = 'approaching_limit';

          measurements.push({
             id: `measurement_${index}`,
             framework_id: selectedFramework.id,
             category,
             current_value: currentValue,
             threshold_min: threshold.min,
             threshold_max: threshold.max,
             unit: threshold.unit,
             status,
             last_updated: new Date().toISOString(),
             created_by: selectedFramework.created_by
           });
        }
      });

      setRiskMeasurements(measurements);
    } catch (error) {
      console.error('Error loading risk measurements:', error);
    }
  }, [selectedFramework]);

  // Load risk scenarios
  const loadRiskScenarios = useCallback(async () => {
    try {
      // In a real implementation, this would load from a risk scenarios table
      const scenarios: RiskScenario[] = [
         {
           id: 'scenario_1',
           framework_id: selectedFramework?.id || '',
           title: 'Cybersecurity Breach Scenario',
           description: 'Potential data breach due to phishing attack',
           impact_level: 'high',
           probability: 25,
           potential_loss: 500000,
           mitigation_plan: 'Enhanced security training, multi-factor authentication, regular security audits',
           status: 'mitigated',
           created_by: selectedFramework?.created_by || '',
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         },
         {
           id: 'scenario_2',
           framework_id: selectedFramework?.id || '',
           title: 'Supply Chain Disruption',
           description: 'Major supplier bankruptcy affecting operations',
           impact_level: 'critical',
           probability: 15,
           potential_loss: 2000000,
           mitigation_plan: 'Diversify suppliers, maintain buffer inventory, dual sourcing strategy',
           status: 'assessed',
           created_by: selectedFramework?.created_by || '',
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         },
         {
           id: 'scenario_3',
           framework_id: selectedFramework?.id || '',
           title: 'Regulatory Change Impact',
           description: 'New compliance requirements increasing operational costs',
           impact_level: 'medium',
           probability: 60,
           potential_loss: 150000,
           mitigation_plan: 'Regular regulatory monitoring, compliance automation, legal consultation',
           status: 'identified',
           created_by: selectedFramework?.created_by || '',
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         }
       ];

      setRiskScenarios(scenarios);
    } catch (error) {
      console.error('Error loading risk scenarios:', error);
    }
  }, []);

  // Load risk appetite analytics
  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const totalCategories = riskMeasurements.length;
      const categoriesWithinAppetite = riskMeasurements.filter(m => m.status === 'within_appetite').length;
      const categoriesApproachingLimit = riskMeasurements.filter(m => m.status === 'approaching_limit').length;
      const categoriesBreached = riskMeasurements.filter(m => m.status === 'breached').length;

      let overallAppetiteStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (categoriesBreached > 0) overallAppetiteStatus = 'critical';
      else if (categoriesApproachingLimit > 0) overallAppetiteStatus = 'warning';

      const averageThresholdUtilization = riskMeasurements.length > 0
        ? riskMeasurements.reduce((sum, m) => {
            const utilization = (m.current_value - m.threshold_min) / (m.threshold_max - m.threshold_min);
            return sum + utilization;
          }, 0) / riskMeasurements.length
        : 0;

      setAnalytics({
        totalCategories,
        categoriesWithinAppetite,
        categoriesApproachingLimit,
        categoriesBreached,
        overallAppetiteStatus,
        averageThresholdUtilization: averageThresholdUtilization * 100,
        recentBreaches: categoriesBreached,
        upcomingReviews: 2 // This would be calculated from framework review dates
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [riskMeasurements]);

  useEffect(() => {
    loadFrameworks();
    loadRiskScenarios();
  }, [loadFrameworks, loadRiskScenarios]);

  useEffect(() => {
    if (selectedFramework) {
      loadRiskMeasurements();
    }
  }, [selectedFramework, loadRiskMeasurements]);

  useEffect(() => {
    if (riskMeasurements.length > 0) {
      loadAnalytics();
    }
  }, [riskMeasurements, loadAnalytics]);

  // CRUD Handlers
  const handleCreateFramework = async (data: RiskAppetiteFormData) => {
    setSaving(true);
    try {
      const newFramework = await GovernanceService.createRiskAppetiteFramework(data);
      setFrameworks(prev => [newFramework, ...prev]);
      setShowCreateForm(false);
      toast.success('Risk appetite framework created successfully');
    } catch (error) {
      console.error('Error creating framework:', error);
      toast.error('Failed to create risk appetite framework');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFramework = async (data: RiskAppetiteFormData) => {
    if (!editingFramework) return;

    setSaving(true);
    try {
      const updatedFramework = await GovernanceService.updateRiskAppetiteFramework(editingFramework.id, data);
      setFrameworks(prev => prev.map(f => f.id === editingFramework.id ? updatedFramework : f));
      setEditingFramework(null);
      toast.success('Risk appetite framework updated successfully');
    } catch (error) {
      console.error('Error updating framework:', error);
      toast.error('Failed to update risk appetite framework');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFramework = async (framework: RiskAppetiteFramework) => {
    if (!confirm(`Are you sure you want to delete "${framework.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await GovernanceService.deleteRiskAppetiteFramework(framework.id);
      setFrameworks(prev => prev.filter(f => f.id !== framework.id));
      if (selectedFramework?.id === framework.id) {
        setSelectedFramework(null);
      }
      toast.success('Risk appetite framework deleted successfully');
    } catch (error) {
      console.error('Error deleting framework:', error);
      toast.error('Failed to delete risk appetite framework');
    }
  };

  const handleCreateScenario = async (data: Omit<RiskScenario, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      const newScenario = await GovernanceService.createRiskScenario(data);
      setRiskScenarios(prev => [newScenario, ...prev]);
      setShowScenarioForm(false);
      toast.success('Risk scenario created successfully');
    } catch (error) {
      console.error('Error creating scenario:', error);
      toast.error('Failed to create risk scenario');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateScenario = async (data: Omit<RiskScenario, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingScenario) return;

    setSaving(true);
    try {
      const updatedScenario = await GovernanceService.updateRiskScenario(editingScenario.id, data);
      setRiskScenarios(prev => prev.map(s => s.id === editingScenario.id ? updatedScenario : s));
      setEditingScenario(null);
      toast.success('Risk scenario updated successfully');
    } catch (error) {
      console.error('Error updating scenario:', error);
      toast.error('Failed to update risk scenario');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScenario = async (scenario: RiskScenario) => {
    if (!confirm(`Are you sure you want to delete "${scenario.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await GovernanceService.deleteRiskScenario(scenario.id);
      setRiskScenarios(prev => prev.filter(s => s.id !== scenario.id));
      toast.success('Risk scenario deleted successfully');
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast.error('Failed to delete risk scenario');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Shield className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatThreshold = (threshold: { min: number; max: number; unit: string }) => {
    const unitLabels = {
      probability_percentage: '%',
      impact_score: 'pts',
      currency_usd: '$',
      violations_per_quarter: '/quarter',
      breach_probability: '%',
      negative_sentiment_score: 'pts'
    };

    const unit = unitLabels[threshold.unit as keyof typeof unitLabels] || threshold.unit;
    return `${threshold.min}-${threshold.max}${unit}`;
  };

  return (
    <motion.div
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Create Framework Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Risk Appetite Framework</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={saving}
                >
                  ✕
                </Button>
              </div>
              <RiskAppetiteForm
                onSubmit={handleCreateFramework}
                onCancel={() => setShowCreateForm(false)}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Framework Form Modal */}
      {editingFramework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Risk Appetite Framework</h2>
                <Button
                  variant="outline"
                  onClick={() => setEditingFramework(null)}
                  disabled={saving}
                >
                  ✕
                </Button>
              </div>
              <RiskAppetiteForm
                initialData={{
                  name: editingFramework.name,
                  description: editingFramework.description,
                  risk_categories: editingFramework.risk_categories.categories,
                  appetite_levels: editingFramework.appetite_levels.levels,
                  tolerance_thresholds: editingFramework.tolerance_thresholds.thresholds,
                  review_frequency: editingFramework.review_frequency,
                  next_review_date: editingFramework.next_review_date || '',
                  status: editingFramework.status
                }}
                onSubmit={handleUpdateFramework}
                onCancel={() => setEditingFramework(null)}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Form Modal */}
      {showScenarioForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Risk Scenario</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowScenarioForm(false)}
                  disabled={saving}
                >
                  ✕
                </Button>
              </div>
              <RiskScenarioForm
                initialData={{
                  framework_id: selectedFramework?.id || '',
                  title: '',
                  description: '',
                  impact_level: 'medium',
                  probability: 25,
                  potential_loss: 0,
                  mitigation_plan: '',
                  status: 'identified'
                }}
                onSubmit={handleCreateScenario}
                onCancel={() => setShowScenarioForm(false)}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Scenario Form Modal */}
      {editingScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Risk Scenario</h2>
                <Button
                  variant="outline"
                  onClick={() => setEditingScenario(null)}
                  disabled={saving}
                >
                  ✕
                </Button>
              </div>
              <RiskScenarioForm
                initialData={{
                  framework_id: editingScenario.framework_id,
                  title: editingScenario.title,
                  description: editingScenario.description,
                  impact_level: editingScenario.impact_level,
                  probability: editingScenario.probability,
                  potential_loss: editingScenario.potential_loss,
                  mitigation_plan: editingScenario.mitigation_plan,
                  status: editingScenario.status
                }}
                onSubmit={handleUpdateScenario}
                onCancel={() => setEditingScenario(null)}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Risk Appetite Management
          </h1>
          <p className="text-gray-600 mt-2">
            Define, monitor, and manage organizational risk tolerance with advanced analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => loadAnalytics()}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Framework
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Categories</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalCategories}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Within Appetite</p>
                <p className="text-2xl font-bold text-green-600">{analytics.categoriesWithinAppetite}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approaching Limit</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.categoriesApproachingLimit}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Breached</p>
                <p className="text-2xl font-bold text-red-600">{analytics.categoriesBreached}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageThresholdUtilization.toFixed(0)}%</p>
              </div>
              <Gauge className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Appetite Status</p>
                <p className={`text-lg font-bold capitalize ${
                  analytics.overallAppetiteStatus === 'healthy' ? 'text-green-600' :
                  analytics.overallAppetiteStatus === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analytics.overallAppetiteStatus}
                </p>
              </div>
              <Thermometer className={`w-8 h-8 ${
                analytics.overallAppetiteStatus === 'healthy' ? 'text-green-600' :
                analytics.overallAppetiteStatus === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'frameworks', label: 'Risk Frameworks', icon: Shield },
              { id: 'monitoring', label: 'Tolerance Monitoring', icon: Activity },
              { id: 'scenarios', label: 'Risk Scenarios', icon: Zap },
              { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 }
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

        <div className="p-6">
          {/* Frameworks Tab */}
          {activeTab === 'frameworks' && (
            <div className="space-y-6">
              {/* Framework Cards */}
              <div className="grid grid-cols-1 gap-6">
        {frameworks.map((framework, index) => (
          <motion.div
            key={framework.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {framework.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {framework.description}
                  </p>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(framework.status)}`}>
                  {getStatusIcon(framework.status)}
                  <span className="ml-1 capitalize">{framework.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Categories */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    {t("riskCategories", "Risk Categories")}
                  </h4>
                  <div className="space-y-2">
                    {framework.risk_categories.categories.map((category, idx) => (
                      <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-900 font-medium">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Appetite Levels */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                    {t("appetiteLevels", "Appetite Levels")}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(framework.appetite_levels.levels).map(([level, description]) => (
                      <div key={level} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{level}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(level)}`}>
                            {level.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tolerance Thresholds */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                  {t("toleranceThresholds", "Tolerance Thresholds")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(framework.tolerance_thresholds.thresholds).map(([category, threshold]) => (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1 capitalize">
                        {category.replace('_', ' ')}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatThreshold(threshold)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Framework Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {t("reviewFrequency", "Review Frequency")}
                  </div>
                  <div className="text-lg font-bold text-blue-700 capitalize">
                    {framework.review_frequency}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium mb-1">
                    {t("nextReview", "Next Review")}
                  </div>
                  <div className="text-lg font-bold text-green-700">
                    {framework.next_review_date ? new Date(framework.next_review_date).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-1">
                    {t("lastUpdated", "Last Updated")}
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {new Date(framework.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFramework(framework)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t("viewDetails", "View Details")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFramework(framework)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t("editFramework", "Edit Framework")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFramework(framework)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  {t("created", "Created")}: {new Date(framework.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
              </div>

              {/* Empty State */}
              {frameworks.length === 0 && !loading && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Risk Appetite Frameworks</h3>
                  <p className="text-gray-600 mb-6">
                    Create a risk appetite framework to define your organization's risk tolerance levels
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Framework
                  </Button>
                </motion.div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading frameworks...</span>
                </div>
              )}
            </div>
          )}

          {/* Tolerance Monitoring Tab */}
          {activeTab === 'monitoring' && selectedFramework && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Tolerance Threshold Monitoring</h3>
                <Button onClick={() => loadRiskMeasurements()}>
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh Monitoring
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskMeasurements.map((measurement) => {
                  const utilization = (measurement.current_value - measurement.threshold_min) /
                    (measurement.threshold_max - measurement.threshold_min);
                  const utilizationPercent = Math.min(utilization * 100, 100);

                  return (
                    <div key={measurement.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">{measurement.category}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          measurement.status === 'within_appetite' ? 'bg-green-100 text-green-800' :
                          measurement.status === 'approaching_limit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {measurement.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {measurement.current_value}
                          <span className="text-sm text-gray-500 ml-1">{measurement.unit}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Threshold: {measurement.threshold_min}-{measurement.threshold_max}
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full ${
                            measurement.status === 'breached' ? 'bg-red-500' :
                            measurement.status === 'approaching_limit' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${utilizationPercent}%` }}
                        ></div>
                      </div>

                      <div className="text-xs text-gray-500 text-right">
                        {utilizationPercent.toFixed(1)}% utilization
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Risk Scenario Planning</h3>
                <Button onClick={() => setShowScenarioForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Scenario
                </Button>
              </div>

              <div className="space-y-4">
                {riskScenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scenario.impact_level === 'critical' ? 'bg-red-100 text-red-800' :
                            scenario.impact_level === 'high' ? 'bg-orange-100 text-orange-800' :
                            scenario.impact_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {scenario.impact_level}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scenario.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                            scenario.status === 'assessed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {scenario.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Probability:</span>
                            <span className="ml-2 font-medium">{scenario.probability}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Potential Loss:</span>
                            <span className="ml-2 font-medium">${scenario.potential_loss.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingScenario(scenario)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Mitigation Plan</h5>
                      <p className="text-sm text-gray-600">{scenario.mitigation_plan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Risk Appetite Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Appetite Status Distribution</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Within Appetite</span>
                      <span className="font-medium text-green-600">{analytics.categoriesWithinAppetite}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approaching Limit</span>
                      <span className="font-medium text-yellow-600">{analytics.categoriesApproachingLimit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Breached</span>
                      <span className="font-medium text-red-600">{analytics.categoriesBreached}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Threshold Utilization</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Utilization</span>
                      <span className="font-medium text-blue-600">{analytics.averageThresholdUtilization.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Status</span>
                      <span className={`font-medium capitalize ${
                        analytics.overallAppetiteStatus === 'healthy' ? 'text-green-600' :
                        analytics.overallAppetiteStatus === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {analytics.overallAppetiteStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recent Breaches</span>
                      <span className="font-medium text-red-600">{analytics.recentBreaches}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}