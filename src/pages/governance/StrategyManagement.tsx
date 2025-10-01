import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Link,
  Shield,
  Zap,
  ArrowRight,
  Activity,
  Award,
  AlertTriangle,
  Trash2,
  Eye
} from 'lucide-react';
import { GovernanceService, GovernanceStrategy, StrategicInitiative, GovernanceKPI } from '../../services/governanceService';
import StrategyForm from '../../components/governance/StrategyForm';
import InitiativeForm from '../../components/governance/InitiativeForm';
import KPIForm from '../../components/governance/KPIForm';
import toast from 'react-hot-toast';


type StrategyAnalytics = {
  totalStrategies: number;
  activeStrategies: number;
  completedObjectives: number;
  totalObjectives: number;
  averageKPIPerformance: number;
  initiativesOnTrack: number;
  totalInitiatives: number;
};

export default function StrategyManagement() {
    const { t } = useTranslation();
    const [strategies, setStrategies] = useState<GovernanceStrategy[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<GovernanceStrategy | null>(null);
    const [selectedInitiative, setSelectedInitiative] = useState<StrategicInitiative | null>(null);
    const [selectedKPI, setSelectedKPI] = useState<GovernanceKPI | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showCreateInitiativeForm, setShowCreateInitiativeForm] = useState(false);
    const [showEditInitiativeForm, setShowEditInitiativeForm] = useState(false);
    const [showCreateKPIForm, setShowCreateKPIForm] = useState(false);
    const [showEditKPIForm, setShowEditKPIForm] = useState(false);
    const [deletingStrategy, setDeletingStrategy] = useState<string | null>(null);
    const [deletingInitiative, setDeletingInitiative] = useState<string | null>(null);
    const [deletingKPI, setDeletingKPI] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

   // Enhanced GRC state
   const [strategicInitiatives, setStrategicInitiatives] = useState<StrategicInitiative[]>([]);
   const [governanceKPIs, setGovernanceKPIs] = useState<GovernanceKPI[]>([]);
   const [strategyAnalytics, setStrategyAnalytics] = useState<StrategyAnalytics | null>(null);
   const [activeTab, setActiveTab] = useState<'strategies' | 'initiatives' | 'analytics' | 'alignment'>('strategies');
   const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const loadStrategies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getStrategies();
      setStrategies(data);
    } catch (error) {
      console.error('Error loading strategies:', error);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load strategic initiatives linked to strategies
  const loadStrategicInitiatives = useCallback(async () => {
    try {
      const data = await GovernanceService.getInitiatives();
      setStrategicInitiatives(data);
    } catch (error) {
      console.error('Error loading strategic initiatives:', error);
    }
  }, []);

  // Load governance KPIs for strategy alignment
  const loadGovernanceKPIs = useCallback(async () => {
    try {
      const data = await GovernanceService.getKPIs();
      setGovernanceKPIs(data);
    } catch (error) {
      console.error('Error loading governance KPIs:', error);
    }
  }, []);

  // Load strategy analytics
  const loadStrategyAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const analytics = await GovernanceService.getStrategyAnalytics();
      setStrategyAnalytics(analytics);
    } catch (error) {
      console.error('Error loading strategy analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // CRUD Operations
  const handleCreateStrategy = () => {
    setSelectedStrategy(null);
    setShowCreateForm(true);
  };

  const handleEditStrategy = (strategy: GovernanceStrategy) => {
    setSelectedStrategy(strategy);
    setShowEditForm(true);
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
      setDeletingStrategy(strategyId);
      try {
        await GovernanceService.deleteStrategy(strategyId);
        toast.success('Strategy deleted successfully!');
        loadStrategies();
        loadStrategyAnalytics();
      } catch (error) {
        console.error('Error deleting strategy:', error);
        toast.error('Failed to delete strategy. Please try again.');
      } finally {
        setDeletingStrategy(null);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedStrategy(null);
    loadStrategies();
    loadStrategyAnalytics();
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedStrategy(null);
  };

  // Initiative CRUD handlers
  const handleCreateInitiative = () => {
    setSelectedInitiative(null);
    setShowCreateInitiativeForm(true);
  };

  const handleEditInitiative = (initiative: StrategicInitiative) => {
    setSelectedInitiative(initiative);
    setShowEditInitiativeForm(true);
  };

  const handleDeleteInitiative = async (initiativeId: string) => {
    if (confirm('Are you sure you want to delete this initiative? This action cannot be undone.')) {
      setDeletingInitiative(initiativeId);
      try {
        await GovernanceService.deleteInitiative(initiativeId);
        toast.success('Initiative deleted successfully!');
        loadStrategicInitiatives();
        loadStrategyAnalytics();
      } catch (error) {
        console.error('Error deleting initiative:', error);
        toast.error('Failed to delete initiative. Please try again.');
      } finally {
        setDeletingInitiative(null);
      }
    }
  };

  const handleInitiativeFormSuccess = () => {
    setShowCreateInitiativeForm(false);
    setShowEditInitiativeForm(false);
    setSelectedInitiative(null);
    loadStrategicInitiatives();
    loadStrategyAnalytics();
  };

  const handleInitiativeFormCancel = () => {
    setShowCreateInitiativeForm(false);
    setShowEditInitiativeForm(false);
    setSelectedInitiative(null);
  };

  // KPI CRUD handlers
  const handleCreateKPI = () => {
    setSelectedKPI(null);
    setShowCreateKPIForm(true);
  };

  const handleEditKPI = (kpi: GovernanceKPI) => {
    setSelectedKPI(kpi);
    setShowEditKPIForm(true);
  };

  const handleDeleteKPI = async (kpiId: string) => {
    if (confirm('Are you sure you want to delete this KPI? This action cannot be undone.')) {
      setDeletingKPI(kpiId);
      try {
        await GovernanceService.deleteKPI(kpiId);
        toast.success('KPI deleted successfully!');
        loadGovernanceKPIs();
        loadStrategyAnalytics();
      } catch (error) {
        console.error('Error deleting KPI:', error);
        toast.error('Failed to delete KPI. Please try again.');
      } finally {
        setDeletingKPI(null);
      }
    }
  };

  const handleKPIFormSuccess = () => {
    setShowCreateKPIForm(false);
    setShowEditKPIForm(false);
    setSelectedKPI(null);
    loadGovernanceKPIs();
    loadStrategyAnalytics();
  };

  const handleKPIFormCancel = () => {
    setShowCreateKPIForm(false);
    setShowEditKPIForm(false);
    setSelectedKPI(null);
  };

  useEffect(() => {
    loadStrategies();
    loadStrategicInitiatives();
    loadGovernanceKPIs();
    loadStrategyAnalytics();
  }, [loadStrategies, loadStrategicInitiatives, loadGovernanceKPIs, loadStrategyAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'archived': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      className="p-4 space-y-6 bg-gray-50  min-h-screen transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Target className="w-8 h-8 mr-3 text-blue-600" />
            Strategic Governance Management
          </h1>
          <p className="text-gray-600 mt-2">
            Align organizational strategy with governance objectives, risk management, and compliance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => loadStrategyAnalytics()}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
          <Button
            onClick={handleCreateStrategy}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Strategy
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {strategyAnalytics && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Strategies</p>
                <p className="text-2xl font-bold text-blue-600">{strategyAnalytics.totalStrategies}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Strategies</p>
                <p className="text-2xl font-bold text-green-600">{strategyAnalytics.activeStrategies}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Strategic Objectives</p>
                <p className="text-2xl font-bold text-purple-600">{strategyAnalytics.totalObjectives}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KPI Performance</p>
                <p className="text-2xl font-bold text-indigo-600">{strategyAnalytics.averageKPIPerformance.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Initiatives</p>
                <p className="text-2xl font-bold text-orange-600">{strategyAnalytics.totalInitiatives}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-teal-600">{strategyAnalytics.initiativesOnTrack}</p>
              </div>
              <Activity className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'strategies', label: 'Governance Strategies', icon: Target },
              { id: 'initiatives', label: 'Strategic Initiatives', icon: Zap },
              { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
              { id: 'alignment', label: 'GRC Alignment', icon: Link }
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
          {/* Strategies Tab */}
          {activeTab === 'strategies' && (
            <div className="space-y-6">
              {/* Strategy Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {strategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {strategy.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {strategy.description}
                          </p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(strategy.status)}`}>
                          {getStatusIcon(strategy.status)}
                          <span className="ml-1 capitalize">{strategy.status}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Version</div>
                            <div className="text-lg font-bold text-blue-700">v{strategy.version}</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm text-green-600 font-medium">Objectives</div>
                            <div className="text-lg font-bold text-green-700">{strategy.objectives.length}</div>
                          </div>
                        </div>

                        {/* Strategic Goals Preview */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Strategic Goals
                          </h4>
                          <div className="space-y-1">
                            {strategy.strategic_goals.goals.slice(0, 2).map((goal, idx) => (
                              <div key={idx} className="text-sm text-gray-600">
                                • {goal.name}
                              </div>
                            ))}
                            {strategy.strategic_goals.goals.length > 2 && (
                              <div className="text-sm text-blue-600">
                                +{strategy.strategic_goals.goals.length - 2} more goals
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Effective: {strategy.effective_date ? new Date(strategy.effective_date).toLocaleDateString() : 'TBD'}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Review: {strategy.review_date ? new Date(strategy.review_date).toLocaleDateString() : 'TBD'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStrategy(strategy)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStrategy(strategy)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStrategy(strategy.id)}
                              disabled={deletingStrategy === strategy.id}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {deletingStrategy === strategy.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            Updated: {new Date(strategy.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {strategies.length === 0 && !loading && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Strategies Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first governance strategy to align your organization with strategic objectives
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Strategy
                  </Button>
                </motion.div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading strategies...</span>
                </div>
              )}
            </div>
          )}

          {/* Strategic Initiatives Tab */}
          {activeTab === 'initiatives' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Strategic Initiatives</h3>
                <Button onClick={handleCreateInitiative}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Initiative
                </Button>
              </div>

              <div className="space-y-3">
                {strategicInitiatives.map((initiative) => (
                  <div key={initiative.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{initiative.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            initiative.status === 'completed' ? 'bg-green-100 text-green-800' :
                            initiative.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            initiative.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {initiative.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            initiative.priority === 'high' ? 'bg-red-100 text-red-800' :
                            initiative.priority === 'critical' ? 'bg-red-200 text-red-900' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {initiative.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{initiative.objective}</p>
                        {initiative.start_date && initiative.target_completion_date && (
                          <p className="text-sm text-gray-600">
                            {new Date(initiative.start_date).toLocaleDateString()} - {new Date(initiative.target_completion_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {initiative.budget_allocated && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="text-sm font-medium">${initiative.budget_allocated.toLocaleString()}</p>
                          </div>
                        )}
                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInitiative(initiative)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInitiative(initiative.id)}
                            disabled={deletingInitiative === initiative.id}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && strategyAnalytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Strategic Performance Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Strategy Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Strategies</span>
                      <span className="font-medium text-blue-600">{strategyAnalytics.activeStrategies}/{strategyAnalytics.totalStrategies}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Strategic Objectives</span>
                      <span className="font-medium text-purple-600">{strategyAnalytics.totalObjectives}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average KPI Performance</span>
                      <span className="font-medium text-green-600">{strategyAnalytics.averageKPIPerformance.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Initiative Tracking</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Initiatives</span>
                      <span className="font-medium text-orange-600">{strategyAnalytics.totalInitiatives}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On Track</span>
                      <span className="font-medium text-teal-600">{strategyAnalytics.initiativesOnTrack}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium text-indigo-600">
                        {strategyAnalytics.totalInitiatives > 0
                          ? ((strategyAnalytics.initiativesOnTrack / strategyAnalytics.totalInitiatives) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRC Alignment Tab */}
          {activeTab === 'alignment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">GRC Alignment Matrix</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Link className="w-5 h-5 mr-2 text-blue-600" />
                    Strategy-KPI Alignment
                  </h4>
                  <div className="space-y-3">
                    {governanceKPIs.slice(0, 5).map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{kpi.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{kpi.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">{kpi.current_value || 0}/{kpi.target_value || 0}</p>
                          <p className="text-xs text-gray-600">{kpi.unit || 'units'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      Governance KPIs
                    </h4>
                    <Button onClick={handleCreateKPI} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add KPI
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {governanceKPIs.slice(0, 3).map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{kpi.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{kpi.category} • {kpi.frequency}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-medium text-blue-600">{kpi.current_value || 0}/{kpi.target_value || 0}</p>
                            <p className="text-xs text-gray-600">{kpi.unit || 'units'}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditKPI(kpi)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteKPI(kpi.id)}
                              disabled={deletingKPI === kpi.id}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {governanceKPIs.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No KPIs defined yet. Create your first KPI to start tracking performance.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Risk-Strategy Alignment
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-gray-900">Strategic Risk Mitigation</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Strategies aligned with organizational risk appetite and mitigation plans
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-gray-900">Compliance Integration</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Governance strategies incorporate regulatory compliance requirements
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-gray-900">Stakeholder Alignment</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Strategic objectives aligned with stakeholder expectations and requirements
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Strategy Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="create-strategy-description"
        >
          <DialogHeader>
            <DialogTitle>Create Governance Strategy</DialogTitle>
            <div id="create-strategy-description" className="sr-only">
              Create a new governance strategy with objectives, goals, and KPIs
            </div>
          </DialogHeader>
          <StrategyForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Strategy Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="edit-strategy-description"
        >
          <DialogHeader>
            <DialogTitle>Edit Governance Strategy</DialogTitle>
            <div id="edit-strategy-description" className="sr-only">
              Edit an existing governance strategy with objectives, goals, and KPIs
            </div>
          </DialogHeader>
          <StrategyForm
            strategy={selectedStrategy}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Create Initiative Dialog */}
      <Dialog open={showCreateInitiativeForm} onOpenChange={setShowCreateInitiativeForm}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="create-initiative-description"
        >
          <DialogHeader>
            <DialogTitle>Create Strategic Initiative</DialogTitle>
            <div id="create-initiative-description" className="sr-only">
              Create a new strategic initiative with objectives, budget, and stakeholders
            </div>
          </DialogHeader>
          <InitiativeForm
            onSuccess={handleInitiativeFormSuccess}
            onCancel={handleInitiativeFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Initiative Dialog */}
      <Dialog open={showEditInitiativeForm} onOpenChange={setShowEditInitiativeForm}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="edit-initiative-description"
        >
          <DialogHeader>
            <DialogTitle>Edit Strategic Initiative</DialogTitle>
            <div id="edit-initiative-description" className="sr-only">
              Edit an existing strategic initiative with objectives, budget, and stakeholders
            </div>
          </DialogHeader>
          <InitiativeForm
            initiative={selectedInitiative}
            onSuccess={handleInitiativeFormSuccess}
            onCancel={handleInitiativeFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Create KPI Dialog */}
      <Dialog open={showCreateKPIForm} onOpenChange={setShowCreateKPIForm}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="create-kpi-description"
        >
          <DialogHeader>
            <DialogTitle>Create Governance KPI</DialogTitle>
            <div id="create-kpi-description" className="sr-only">
              Create a new governance KPI with targets, metrics, and responsible person
            </div>
          </DialogHeader>
          <KPIForm
            onSuccess={handleKPIFormSuccess}
            onCancel={handleKPIFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit KPI Dialog */}
      <Dialog open={showEditKPIForm} onOpenChange={setShowEditKPIForm}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="edit-kpi-description"
        >
          <DialogHeader>
            <DialogTitle>Edit Governance KPI</DialogTitle>
            <div id="edit-kpi-description" className="sr-only">
              Edit an existing governance KPI with targets, metrics, and responsible person
            </div>
          </DialogHeader>
          <KPIForm
            kpi={selectedKPI}
            onSuccess={handleKPIFormSuccess}
            onCancel={handleKPIFormCancel}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}