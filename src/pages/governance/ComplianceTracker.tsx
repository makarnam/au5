import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Users,
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  AlertTriangle,
  Clock,
  BarChart3,
  Link,
  Target,
  Zap
} from 'lucide-react';
import { GovernanceService, RegulatoryChange, ComplianceMapping, RegulatoryChangeFormData } from '../../services/governanceService';
import toast from 'react-hot-toast';

type ComplianceAnalytics = {
  totalRegulations: number;
  criticalRegulations: number;
  completedMappings: number;
  totalMappings: number;
  gapMappings: number;
  frameworksCount: number;
  complianceScore: number;
};

export default function ComplianceTracker() {
  const { t } = useTranslation();
  const [regulatoryChanges, setRegulatoryChanges] = useState<RegulatoryChange[]>([]);
  const [complianceMappings, setComplianceMappings] = useState<ComplianceMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChange, setSelectedChange] = useState<RegulatoryChange | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<ComplianceMapping | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateMappingForm, setShowCreateMappingForm] = useState(false);
  const [showEditMappingForm, setShowEditMappingForm] = useState(false);
  const [deletingChange, setDeletingChange] = useState<string | null>(null);
  const [deletingMapping, setDeletingMapping] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [complianceAnalytics, setComplianceAnalytics] = useState<ComplianceAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'regulations' | 'mappings' | 'analytics'>('regulations');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadRegulatoryChanges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getRegulatoryChanges();
      setRegulatoryChanges(data);
    } catch (error) {
      console.error('Error loading regulatory changes:', error);
      setRegulatoryChanges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComplianceMappings = useCallback(async () => {
    try {
      const data = await GovernanceService.getComplianceMappings();
      setComplianceMappings(data);
    } catch (error) {
      console.error('Error loading compliance mappings:', error);
    }
  }, []);

  const loadComplianceAnalytics = useCallback(async () => {
    try {
      const analytics = await GovernanceService.getComplianceAnalytics();
      setComplianceAnalytics(analytics);
    } catch (error) {
      console.error('Error loading compliance analytics:', error);
    }
  }, []);

  // CRUD Operations
  const handleCreateChange = () => {
    setSelectedChange(null);
    setShowCreateForm(true);
  };

  const handleEditChange = (change: RegulatoryChange) => {
    setSelectedChange(change);
    setShowEditForm(true);
  };

  const handleDeleteChange = async (changeId: string) => {
    if (confirm('Are you sure you want to delete this regulatory change? This action cannot be undone.')) {
      setDeletingChange(changeId);
      try {
        await GovernanceService.deleteRegulatoryChange(changeId);
        toast.success('Regulatory change deleted successfully!');
        loadRegulatoryChanges();
        loadComplianceAnalytics();
      } catch (error) {
        console.error('Error deleting regulatory change:', error);
        toast.error('Failed to delete regulatory change. Please try again.');
      } finally {
        setDeletingChange(null);
      }
    }
  };

  const handleCreateMapping = () => {
    setSelectedMapping(null);
    setShowCreateMappingForm(true);
  };

  const handleEditMapping = (mapping: ComplianceMapping) => {
    setSelectedMapping(mapping);
    setShowEditMappingForm(true);
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (confirm('Are you sure you want to delete this compliance mapping? This action cannot be undone.')) {
      setDeletingMapping(mappingId);
      try {
        await GovernanceService.deleteComplianceMapping(mappingId);
        toast.success('Compliance mapping deleted successfully!');
        loadComplianceMappings();
        loadComplianceAnalytics();
      } catch (error) {
        console.error('Error deleting compliance mapping:', error);
        toast.error('Failed to delete compliance mapping. Please try again.');
      } finally {
        setDeletingMapping(null);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setShowCreateMappingForm(false);
    setShowEditMappingForm(false);
    setSelectedChange(null);
    setSelectedMapping(null);
    loadRegulatoryChanges();
    loadComplianceMappings();
    loadComplianceAnalytics();
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setShowCreateMappingForm(false);
    setShowEditMappingForm(false);
    setSelectedChange(null);
    setSelectedMapping(null);
  };

  useEffect(() => {
    loadRegulatoryChanges();
    loadComplianceMappings();
    loadComplianceAnalytics();
  }, [loadRegulatoryChanges, loadComplianceMappings, loadComplianceAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'implemented':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
      case 'monitoring':
        return 'text-blue-600 bg-blue-100';
      case 'identified':
      case 'assessing':
        return 'text-yellow-600 bg-yellow-100';
      case 'implementing':
        return 'text-purple-600 bg-purple-100';
      case 'gap_identified':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'implemented':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
      case 'monitoring':
        return <Clock className="w-4 h-4" />;
      case 'identified':
      case 'assessing':
        return <AlertCircle className="w-4 h-4" />;
      case 'implementing':
        return <Zap className="w-4 h-4" />;
      case 'gap_identified':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileCheck className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredChanges = regulatoryChanges.filter(change =>
    filterStatus === 'all' || change.status === filterStatus ||
    change.priority === filterStatus || change.risk_rating === filterStatus
  );

  const filteredMappings = complianceMappings.filter(mapping =>
    filterStatus === 'all' || mapping.status === filterStatus ||
    mapping.mapping_type === filterStatus
  );

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
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Compliance Tracker
          </h1>
          <p className="text-gray-600 mt-2">
            Track regulatory changes and ensure compliance across organizational frameworks
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadComplianceAnalytics}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {complianceAnalytics && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Regulations</p>
                <p className="text-2xl font-bold text-blue-600">{complianceAnalytics.totalRegulations}</p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Regulations</p>
                <p className="text-2xl font-bold text-red-600">{complianceAnalytics.criticalRegulations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{complianceAnalytics.complianceScore.toFixed(0)}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mappings</p>
                <p className="text-2xl font-bold text-purple-600">{complianceAnalytics.totalMappings}</p>
              </div>
              <Link className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Implemented</p>
                <p className="text-2xl font-bold text-blue-600">{complianceAnalytics.completedMappings}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gaps Identified</p>
                <p className="text-2xl font-bold text-orange-600">{complianceAnalytics.gapMappings}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Frameworks</p>
                <p className="text-2xl font-bold text-indigo-600">{complianceAnalytics.frameworksCount}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'regulations', label: 'Regulatory Changes', icon: FileCheck },
              { id: 'mappings', label: 'Compliance Mappings', icon: Link },
              { id: 'analytics', label: 'Compliance Analytics', icon: BarChart3 }
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
          {/* Regulations Tab */}
          {activeTab === 'regulations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Regulatory Changes</h3>
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="identified">Identified</option>
                    <option value="assessing">Assessing</option>
                    <option value="implementing">Implementing</option>
                    <option value="completed">Completed</option>
                    <option value="critical">Critical Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <Button onClick={handleCreateChange}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Regulation
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredChanges.map((change, index) => (
                  <motion.div
                    key={change.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{change.title}</h4>
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(change.status)}`}>
                            {getStatusIcon(change.status)}
                            <span className="ml-1">{change.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(change.priority)}`}>
                            {change.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${change.risk_rating === 'critical' ? 'bg-red-100 text-red-800' : change.risk_rating === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {change.risk_rating} risk
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{change.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Author className="w-4 h-4 mr-1" />
                            {change.regulatory_body} • {change.regulation_name}
                          </div>
                          {change.effective_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Effective: {new Date(change.effective_date).toLocaleDateString()}
                            </div>
                          )}
                          {change.compliance_deadline && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Deadline: {new Date(change.compliance_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChange(change)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChange(change)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteChange(change.id)}
                          disabled={deletingChange === change.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mappings Tab */}
          {activeTab === 'mappings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Mappings</h3>
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="mapped">Mapped</option>
                    <option value="gap_identified">Gap Identified</option>
                    <option value="remediation_planned">Remediation Planned</option>
                    <option value="implemented">Implemented</option>
                    <option value="direct">Direct Mapping</option>
                    <option value="partial">Partial Mapping</option>
                  </select>
                  <Button onClick={handleCreateMapping}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Mapping
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredMappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {(mapping as any).regulatory_changes?.title || 'Unknown Regulation'}
                          </h4>
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mapping.status)}`}>
                            {getStatusIcon(mapping.status)}
                            <span className="ml-1">{mapping.status.replace('_', ' ')}</span>
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {mapping.mapping_type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Framework: {(mapping as any).compliance_frameworks?.name || 'Unknown'} |
                          Status: {mapping.status.replace('_', ' ')} |
                          Created: {new Date(mapping.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMapping(mapping)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMapping(mapping.id)}
                          disabled={deletingMapping === mapping.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && complianceAnalytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Regulation Status Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Identified</span>
                      <span className="font-medium">{regulatoryChanges.filter(r => r.status === 'identified').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Assessing</span>
                      <span className="font-medium">{regulatoryChanges.filter(r => r.status === 'assessing').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Implementing</span>
                      <span className="font-medium">{regulatoryChanges.filter(r => r.status === 'implementing').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-medium">{regulatoryChanges.filter(r => r.status === 'completed').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Mapping Effectiveness</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Direct Mappings</span>
                      <span className="font-medium">{complianceMappings.filter(m => m.mapping_type === 'direct').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Partial Mappings</span>
                      <span className="font-medium">{complianceMappings.filter(m => m.mapping_type === 'partial').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gap Identified</span>
                      <span className="font-medium">{complianceMappings.filter(m => m.status === 'gap_identified').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Implemented</span>
                      <span className="font-medium">{complianceMappings.filter(m => m.status === 'implemented').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Placeholder forms - will be created in next step */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Regulatory Change</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Regulatory Change Form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Regulatory Change</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Regulatory Change Form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateMappingForm} onOpenChange={setShowCreateMappingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Compliance Mapping</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Compliance Mapping Form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditMappingForm} onOpenChange={setShowEditMappingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Compliance Mapping</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Compliance Mapping Form will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}